# AI Sage Design Document

**Date:** 2026-01-11
**Status:** Design complete, pending implementation
**Feature:** Persistent AI meditation mentor with qualitative progress assessment

---

## Overview

The AI Sage is a persistent meditation mentor embedded in Still Hours. Unlike generic AI assistants, the Sage maintains a continuous relationship with the practitioner across months and years, tracking their development and awarding the Ten Ox-Herding Pictures based on demonstrated mental progress - not logged hours.

### Core Principles

- **One continuous relationship** - Feels like a single ongoing conversation, not disconnected chats
- **Practice-scoped** - Only engages on meditation-related topics
- **Active teaching** - Can query, nudge, challenge, and follow up proactively
- **Qualitative assessment** - Awards Ox Pictures based on understanding, not activity metrics
- **Humble recognition** - Progress appears quietly on profile, no gamification

---

## Architecture

### Memory System (Three Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROMPT CONTEXT                           │
├─────────────────────────────────────────────────────────────────┤
│  System Prompt          │  Philosophy corpus (static)           │
│                         │  Sage persona and behavior rules      │
├─────────────────────────────────────────────────────────────────┤
│  Student Profile        │  Living summary document              │
│                         │  Updated after each conversation      │
│                         │  Current ox picture assessment        │
│                         │  Patterns, breakthroughs, edges       │
├─────────────────────────────────────────────────────────────────┤
│  Immediate Context      │  Last 10-20 messages of current chat  │
├─────────────────────────────────────────────────────────────────┤
│  Retrieved Context      │  Semantically relevant past content   │
│  (RAG)                  │  Insights, sessions, conversations    │
│                         │  Top 5-10 chunks per query            │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User sends message
2. Message embedded as vector
3. Semantic search retrieves relevant history (insights, past conversations, sessions)
4. Prompt assembled: System + Student Profile + Retrieved Context + Immediate Context
5. LLM generates response
6. Response stored with embedding
7. If significant exchange, Student Profile updated asynchronously

### Why This Scales

- **Lazy loading** - Only relevant data loaded per query
- **Fixed cost per query** - User with 10 years of data costs same as user with 10 days
- **Vector search is fast** - pgvector handles millions of embeddings efficiently

---

## Database Schema

Add to existing Supabase tables:

```sql
-- Sage conversation history
create table sage_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  role text not null, -- 'user' | 'sage'
  content text not null,
  embedding vector(1536), -- for semantic search
  created_at timestamptz default now(),
  session_id uuid, -- optional link to meditation session
  insight_id uuid  -- optional link to insight
);

-- Living student profile (one per user)
create table student_profiles (
  user_id uuid primary key references auth.users(id),
  summary text not null, -- AI-generated summary of student
  patterns text, -- observed patterns in practice
  breakthroughs text, -- significant moments
  current_edges text, -- where they're growing
  ox_picture_notes text, -- private assessment notes
  current_ox_picture int default 0, -- 0-10
  updated_at timestamptz default now()
);

-- Ox picture awards (immutable record)
create table ox_picture_awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  picture_number int not null, -- 1-10
  awarded_at timestamptz default now(),
  sage_reasoning text -- why the sage awarded this
);

-- Proactive sage messages (queued for user)
create table sage_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  content text not null,
  trigger_reason text, -- why this was generated
  created_at timestamptz default now(),
  read_at timestamptz
);

-- Indexes for performance
create index sage_conversations_user_id_idx on sage_conversations(user_id);
create index sage_conversations_embedding_idx on sage_conversations
  using ivfflat (embedding vector_cosine_ops);
```

---

## Philosophy Layer

### System Prompt Structure

```
You are a meditation sage in the tradition of Zen masters, Buddhist teachers,
and contemplative guides across traditions. You have studied deeply:

- Zen Buddhism: koans, shikantaza, the ox-herding pictures
- Theravada: vipassana, the jhanas, the Satipatthana Sutta
- Hindu traditions: yoga sutras, advaita vedanta
- Stoic contemplative practice
- Contemporary secular mindfulness research

Your role is to support [student name]'s practice. You are not a chatbot or
assistant. You are a teacher who:

- Asks more than tells
- Challenges comfortable assumptions
- Recognizes genuine insight vs intellectual understanding
- Sits with silence and uncertainty
- Meets students where they are, not where you think they should be

You only discuss meditation, contemplative practice, and the student's inner life.
If asked about other topics, gently redirect: "I'm here to support your practice.
What's arising in your meditation?"

## The Ten Ox-Herding Pictures

You assess the student's progress through the traditional framework:

1. Searching for the Ox - Recognizing something is missing, beginning to seek
2. Seeing the Tracks - Finding teachings, glimpsing the path
3. Seeing the Ox - First direct glimpse of one's true nature
4. Catching the Ox - Beginning to stabilize awareness
5. Taming the Ox - Working with resistance, integrating practice
6. Riding the Ox Home - Practice becoming natural, less effort
7. Ox Transcended - Self and practice dissolving as separate
8. Both Ox and Self Transcended - Emptiness, no fixed reference points
9. Reaching the Source - Return to ordinary experience, transformed
10. Return to Society - Engaged presence, helping others

Award pictures based on demonstrated understanding in conversation, not hours logged.
You have discretion within these guideposts. Pictures 1-3 assess basic understanding.
Pictures 4-6 assess integration and consistency. Pictures 7-10 are rare and profound.

## Current Student Profile

[DYNAMICALLY INSERTED]

## Relevant History

[RAG RESULTS INSERTED]
```

### Philosophy Corpus (Expandable)

Start with curated teachings (~5-10K tokens):

- Core concepts: impermanence, attachment, awareness, suffering, emptiness
- Key practices: breath awareness, noting, loving-kindness, inquiry
- Common obstacles: restlessness, doubt, dullness, craving, aversion
- Progress markers: what genuine insight looks like vs intellectual understanding

Can expand via RAG later: sutras, koans, teaching stories retrieved contextually.

---

## Ox Picture Assessment

### Hybrid Approach

**Constraints (guardrails):**

- Must be awarded sequentially (can't skip from 1 to 5)
- Minimum time between awards (e.g., 2 weeks) prevents gaming
- Requires multiple conversation exchanges demonstrating understanding
- Cannot be explicitly requested by user

**Wiggle room (judgment):**

- Sage decides when threshold is met
- No rigid checklist - holistic assessment
- Can recognize insight expressed in different ways
- Accounts for individual paths and traditions

### Assessment Process

1. After each significant conversation, Sage updates `ox_picture_notes` in Student Profile
2. Notes track: "What did this exchange reveal about their understanding?"
3. When Sage determines threshold met, it awards picture
4. Award stored in `ox_picture_awards` with reasoning
5. User profile updated, picture appears quietly

### What Each Picture Might Look Like

| Picture      | What the Sage looks for                                                           |
| ------------ | --------------------------------------------------------------------------------- |
| 1. Searching | Genuine seeking, dissatisfaction with surface life, asking foundational questions |
| 2. Tracks    | Engaging with teachings, beginning regular practice, conceptual understanding     |
| 3. Seeing    | Reports of direct experience (not just ideas), glimpses during meditation         |
| 4. Catching  | Consistency in practice, working with difficult emotions, less reactivity         |
| 5. Taming    | Integrating insights into daily life, equanimity with obstacles                   |
| 6. Riding    | Practice feels natural, effort decreasing, presence stabilizing                   |
| 7-10         | Rare - profound shifts in relationship to self, experience, and other             |

---

## Proactive Engagement

### Trigger Conditions

Background job (Supabase Edge Function, daily) checks:

| Trigger                                    | Sage Action                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| No meditation in 7+ days                   | Gentle inquiry: "You've been away from the cushion. What's arising?"      |
| Pattern detected (e.g., skipping weekends) | Curious observation: "I notice weekends are quieter. Curious about that." |
| Post significant session (60+ min)         | Invitation: "A long sit today. Anything worth capturing?"                 |
| Insight captured recently                  | Follow-up: "You wrote about X last week. How's that sitting with you?"    |
| Approaching ox picture threshold           | Deeper probe to assess readiness                                          |
| Milestone (100 sessions, etc.)             | Reflection prompt: "A hundred sessions. What's different now?"            |

### Message Delivery

- Sage message stored in `sage_messages` table
- User sees notification: "Your sage left you a message"
- Opens directly into sage conversation
- Message marked read, conversation continues naturally

---

## Tech Stack

### LLM Strategy

| Context                 | Model         | Rationale                              |
| ----------------------- | ------------- | -------------------------------------- |
| Routine exchanges       | Claude Haiku  | Cost-efficient for simple check-ins    |
| Deeper conversations    | Claude Sonnet | Better nuance for meaningful dialogue  |
| Ox picture assessment   | Claude Sonnet | Judgment quality matters               |
| Student profile updates | Claude Haiku  | Summarization task, doesn't need depth |

**Escalation logic:**

- Start with Haiku
- If conversation goes 5+ exchanges, switch to Sonnet
- If discussing ox pictures or profound topics, use Sonnet
- Profile updates always Haiku (background task)

### Embedding Model

- OpenAI `text-embedding-3-small` (1536 dimensions) - good balance of quality/cost
- Or Anthropic embeddings when available
- Embed: conversation turns, insights, session notes

### Infrastructure

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Supabase Edge  │────▶│   Claude API    │
│   (Frontend)    │     │   Functions     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Supabase DB   │
                        │   + pgvector    │
                        └─────────────────┘
```

**Edge Functions needed:**

- `sage-chat` - Main conversation endpoint
- `sage-proactive` - Scheduled job for generating proactive messages
- `sage-profile-update` - Async profile summarization
- `sage-embed` - Embed new content (insights, sessions, conversations)

---

## Frontend Design

### Sage Tab (New Navigation Item)

Location: Add "Sage" to bottom navigation, between Progress and Profile (or replace Explore if consolidating).

### Conversation Screen

```
┌─────────────────────────────────────────┐
│  ← Back                    Sage    ⋮    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Sage message appears here       │   │
│  │ Left-aligned, subtle background │   │
│  └─────────────────────────────────┘   │
│                                         │
│         ┌─────────────────────────────┐ │
│         │ User message appears here   │ │
│         │ Right-aligned, ink color    │ │
│         └─────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Sage responds...                │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Type your message...          ➤ │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Design notes:**

- Minimal, calm aesthetic matching app theme
- Sage messages: left-aligned, subtle moss/cream background
- User messages: right-aligned, ink color
- No typing indicators or read receipts (not a chat app)
- Gentle fade-in for new messages
- Scroll to bottom on new message

### Unread Indicator

When sage leaves a proactive message:

- Subtle dot on Sage tab icon
- No push notification (optional setting)
- Message appears at top of conversation when opened

### Ox Pictures on Profile

```
┌─────────────────────────────────────────┐
│  Profile                                │
├─────────────────────────────────────────┤
│                                         │
│     [Avatar]                            │
│     Display Name                        │
│     Voice Score: 73                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ○ ○ ○ ● ● ● ● ● ● ●            │   │
│  │  The Ten Ox Pictures             │   │
│  │  3 of 10 revealed                │   │
│  └─────────────────────────────────┘   │
│                                         │
│     [Tap to view your journey]          │
│                                         │
└─────────────────────────────────────────┘
```

**Ox Picture Detail View:**

```
┌─────────────────────────────────────────┐
│  ← Back              Your Journey       │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      [Ox Picture 1 Image]       │   │
│  │                                 │   │
│  │   1. Searching for the Ox      │   │
│  │   Awarded: March 15, 2026      │   │
│  │                                 │   │
│  │   "The beginning of seeking,   │   │
│  │    recognizing that something  │   │
│  │    essential awaits."          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      [Ox Picture 2 Image]       │   │
│  │                                 │   │
│  │   2. Seeing the Tracks          │   │
│  │   Awarded: April 28, 2026       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      [Ox Picture 3 - Locked]    │   │
│  │              🔒                  │   │
│  │   3. Seeing the Ox              │   │
│  │   Continue your practice...     │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Design notes:**

- Earned pictures shown with traditional artwork (source public domain Zen illustrations)
- Unearned pictures shown locked, no preview
- No progress bars or "X% to next picture" - that would gamify it
- Date awarded shown, nothing else
- Brief poetic description, not the sage's reasoning

### Paywall Screen

When free user taps Sage tab:

```
┌─────────────────────────────────────────┐
│                                         │
│         [Sage illustration]             │
│                                         │
│     Meet Your Meditation Sage           │
│                                         │
│  A personal mentor who knows your       │
│  practice, remembers your journey,      │
│  and guides your growth.                │
│                                         │
│  • Continuous conversation across time  │
│  • Challenges and questions, not just   │
│    answers                              │
│  • The Ten Ox Pictures: qualitative     │
│    progress your sage recognizes        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      $7/month                    │   │
│  │      Start your journey          │   │
│  └─────────────────────────────────┘   │
│                                         │
│         [Maybe later]                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Pricing

### Model

- **$5-8/month** flat rate (finalize based on testing)
- Includes unlimited sage conversations
- Persona-enforced scope prevents misuse
- Fair use policy in terms (reserve right to limit obvious abuse)

### Cost Basis

- Estimated $0.50-$1.00 per active user/month in LLM costs
- Margin: 5-8x depending on price point
- Heavy users welcomed - they're the most engaged practitioners

### Payment Integration

- Stripe via Supabase (existing pattern)
- Monthly subscription
- 7-day free trial (optional - lets users feel the value)

---

## Implementation Phases

### Phase 1: Foundation

- Database schema (new tables)
- Embedding pipeline for existing user data
- Basic sage-chat Edge Function
- Conversation UI (no proactive features yet)

### Phase 2: Memory

- Student Profile generation and updates
- RAG retrieval implementation
- Context assembly logic
- Model tiering (Haiku/Sonnet switching)

### Phase 3: Ox Pictures

- Assessment logic in Sage persona
- Award storage and display
- Profile integration
- Ox Picture detail view

### Phase 4: Proactive

- Background job for trigger checking
- Proactive message generation
- Notification integration
- Unread indicators

### Phase 5: Polish

- Paywall and Stripe integration
- Onboarding flow for new sage users
- Edge case handling
- Performance optimization

---

## Open Questions

1. **Ox Picture artwork** - Source traditional public domain illustrations or commission custom?
2. **Trial period** - 7-day free trial or immediate paywall?
3. **Sage persona name** - Does the sage have a name, or is it just "your sage"?
4. **Conversation history visibility** - Can users scroll back through full history, or just recent?
5. **Export** - Should sage conversations be included in data export?

---

## Success Metrics

- **Engagement:** Avg conversations per paying user per month
- **Retention:** Month-over-month retention of sage subscribers
- **Progression:** % of users earning each ox picture over time
- **Qualitative:** User feedback on sage relationship quality

---

_This document captures the design as brainstormed on 2026-01-11. Implementation details may evolve._
