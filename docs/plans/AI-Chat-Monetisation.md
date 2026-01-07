# AI Chat & Monetisation Strategy
## 10,000 Hours Meditation App

**Document Type:** Strategic Design & Business Case
**Created:** 2026-01-07
**Status:** Research Complete - Ready for Future Implementation

---

## Executive Summary

This document outlines the strategy for implementing "The Buddha in Your Pocket" - an AI meditation companion feature - and the monetisation model to sustain it. The core insight: **a domain-specific, self-hosted AI model combined with a practitioner directory/marketplace creates a sustainable, tasteful business model.**

### Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI Model Hosting | Self-hosted open-source (phased) | No vendor lock-in, cost control at scale |
| Model Selection | Llama 3 (8B → 70B) fine-tuned | Domain-specific, guardrails baked in |
| Revenue Model | Marketplace (10% commission) + Ads | Transaction-based, scales with value created |
| Marketplace Model | Curated Etsy-style via Stripe Connect | Quality control, Stripe handles payouts/compliance |
| Infrastructure | Together.ai → RunPod migration | Start managed, own it at scale |

### Financial Summary

| Scale | Monthly Revenue | Monthly Costs | Gross Margin |
|-------|-----------------|---------------|--------------|
| 50K MAU | $37K | $6-7K | 80-84% |
| 250K MAU | $199K | $36-44K | 78-82% |
| 1M MAU | $880K | $167-204K | 77-81% |

*At 1M MAU: ~$10.5M annual revenue, ~$8M gross profit*

---

## Part 1: The Vision

### What is "The Buddha in Your Pocket"?

A persistent AI meditation companion that:

1. **Remembers your entire journey** - Every insight, struggle, breakthrough
2. **Guides progressively** - "Fog of war" revelation of meditation traditions
3. **Speaks like a master** - Patient, wise, challenging when appropriate
4. **Creates actionable plans** - Session plans that appear in your calendar
5. **Follows up** - "How did yesterday's concentration practice go?"
6. **Contextualises insights** - "That's what Zen masters call 'beginner's mind'"

### Why This Doesn't Exist Yet

Current AI tools (ChatGPT, Claude) are:
- **Ephemeral** - New chat windows, no continuity
- **General purpose** - Not specialised in meditation
- **Disconnected** - Not integrated with your practice tracker
- **Desktop-bound** - Not available at 6am on your phone post-meditation

### The User Experience

```
[6:15 AM - Post meditation, phone in hand]

You: [Voice] "I had this moment where thoughts just... stopped.
     Not forced. Everything was still."

Buddha: "You've touched what the Zen tradition calls 'no-mind' -
        mushin. This is significant. In your February sessions,
        you mentioned struggling with 'the constant narrator.'
        Today, that narrator fell away.

        How long did this stillness last?"

You: [Voice] "Maybe 30 seconds? Then I got excited and lost it."

Buddha: "The excitement is natural - it's recognition. But as you
        noticed, recognition creates a subject observing an object,
        and the stillness requires neither.

        Shall I create a session plan for tomorrow that uses a
        technique for extending these moments without grasping?"

You: "Yes"

Buddha: "Done. I've added a 25-minute session to your morning plan
        using the 'noting and releasing' technique. The instruction
        is: when stillness arises, mentally whisper 'this' without
        elaboration, then return to the breath."
```

---

## Part 2: Technical Architecture

### Architecture Options Evaluated

#### Option A: Third-Party API (OpenAI/Anthropic)

```
User → App → OpenAI API → Response
              ↓
         $0.40-6/1M tokens
```

**Pros:**
- Fastest to implement
- No infrastructure management
- Best raw model quality

**Cons:**
- Vendor lock-in (can change pricing, terms, discontinue)
- Per-token costs scale linearly with usage
- Can't fine-tune for meditation domain
- Generic personality requires heavy prompt engineering

**Cost at 250K MAU:** $3,680/month (GPT-4o-mini) to $7,200/month (GPT-4o)

#### Option B: Managed Open-Source Inference

```
User → App → Together.ai/Replicate → Llama/Mistral → Response
                    ↓
              $0.20-0.90/1M tokens
              Your choice of model
```

**Pros:**
- No vendor lock-in (switch providers, self-host later)
- Can use fine-tuned models
- Lower cost than OpenAI
- Still zero infrastructure management

**Cons:**
- Still pay-per-token (scales with usage)
- Slightly more latency than OpenAI
- Need to manage model selection/updates

**Cost at 250K MAU:** $1,840/month (Llama 3 8B) to $8,280/month (Llama 3 70B)

#### Option C: Self-Hosted on Rented GPUs

```
User → App → Your Server (RunPod/Lambda) → Your Model → Response
                       ↓
                 $0.28/hour per GPU
                 Flat monthly cost
```

**Pros:**
- Complete control over model and infrastructure
- Flat cost regardless of usage (economics improve with scale)
- Can fine-tune extensively
- No external dependencies for core feature

**Cons:**
- Requires infrastructure management
- Need to handle scaling, failover, updates
- Upfront learning curve

**Cost at 250K MAU:** $3,000-5,000/month (15-20 GPUs)

#### Option D: On-Device (Edge AI)

```
User → App → Local Model on Phone → Response
                    ↓
              Zero server cost
              Works offline
```

**Pros:**
- Zero infrastructure cost
- Works without internet
- Maximum privacy

**Cons:**
- Limited model size (must fit on phone)
- Significantly less capable responses
- Battery/performance impact
- Can't access community data

**Verdict:** Not viable for the envisioned experience. Could be hybrid for simple responses.

### Recommended Architecture: Phased Migration

```
Phase 1          Phase 2              Phase 3
(0-50K MAU)      (50-100K MAU)        (100K+ MAU)
    ↓                 ↓                    ↓
Together.ai  →   Fine-tuned model  →   Self-hosted
(Llama 3 8B)     (Still managed)       (RunPod/Lambda)
    ↓                 ↓                    ↓
$50-500/mo       $500-2000/mo         $3000-5000/mo
                                      (flat, unlimited)
```

**Why this works:**

1. **Phase 1** - Validate the experience before investing in infrastructure
2. **Phase 2** - Fine-tune on real conversation data, meditation corpus
3. **Phase 3** - Own the infrastructure when economics demand it

The crossover point where self-hosting becomes cheaper: **~100K MAU**

---

## Part 3: The Fine-Tuning Strategy

### Why Fine-Tuning Matters

A fine-tuned model provides:

1. **Built-in guardrails** - Won't try to help with non-meditation tasks
2. **Consistent personality** - Speaks like a meditation master without prompting
3. **Domain expertise** - Deep knowledge of traditions, techniques, texts
4. **Reduced prompt costs** - Less context needed per request

### Training Data Sources

#### Meditation Knowledge Base

| Source | Content Type | Availability |
|--------|--------------|--------------|
| Upanishads | Hindu meditation philosophy | Public domain |
| Pali Canon | Buddhist suttas | Public domain |
| Zen koans & commentary | Zen tradition | Public domain |
| Yoga Sutras of Patanjali | Yogic meditation | Public domain |
| Tao Te Ching | Taoist meditation | Public domain |
| Modern meditation research | Scientific literature | Mixed |
| Guided meditation scripts | Practical instructions | Create/license |

#### Conversational Training Data

| Source | Purpose |
|--------|---------|
| Your own conversations (opt-in) | Real user interaction patterns |
| Synthetic dialogues | Generated examples of ideal conversations |
| Curated teacher Q&As | Authentic wisdom transmission style |

### Fine-Tuning Process

1. **Base Model Selection:** Llama 3 8B (efficient) or 70B (more nuanced)
2. **Data Preparation:** Clean, format, balance training corpus
3. **Fine-Tuning Method:** LoRA (Low-Rank Adaptation) - cost-effective
4. **Evaluation:** Test against held-out conversations, human review
5. **Deployment:** Push to inference provider or self-hosted

**Estimated Cost:** $500-2,000 for initial fine-tuning (one-time)

---

## Part 4: Guardrails & Safety

### The Guardrail Philosophy

The model should be **capable only within its domain**. This is achieved through:

1. **Fine-tuning** - Model trained only on meditation content
2. **System prompts** - Explicit boundaries in every request
3. **Input filtering** - Detect and redirect off-topic requests
4. **Output monitoring** - Flag responses that drift from domain

### Specific Guardrails

#### What Buddha WILL Do

- Discuss meditation techniques and traditions
- Reflect on user's insights and experiences
- Create session plans based on user's journey
- Reference appropriate teachings for user's level
- Challenge user's understanding constructively
- Recommend practitioners/studios from directory

#### What Buddha WILL NOT Do

| Off-Limits | Response Pattern |
|------------|------------------|
| Medical advice | "For health concerns, please consult a healthcare provider. I'm here to support your meditation practice." |
| Mental health crisis | "What you're describing sounds serious. Please reach out to [crisis resource]. I'm here when you're ready to discuss your practice." |
| General AI tasks | "I'm focused on supporting your meditation journey. What's on your mind from your practice?" |
| Relationship advice | "Relationships can certainly affect our practice. What aspects are showing up in your meditation?" |
| Homework/work help | [Gentle redirect to meditation topics] |

#### Liability Mitigation

1. **Clear disclaimers** - "I'm an AI meditation companion, not a therapist or medical professional"
2. **Crisis detection** - Keywords trigger safety resources
3. **Session limits** - Option to encourage breaks from intense sessions
4. **Human escalation** - Path to contact real teachers (directory integration)

### Edge Cases & Mitigations

| Edge Case | Mitigation |
|-----------|------------|
| **User trauma surfacing** | Detect distress signals, suggest pause, provide resources |
| **Spiritual bypassing** | Challenge avoidance patterns, ground in practice |
| **Dependency on AI** | Encourage in-person connection, limit daily interactions if needed |
| **Misinformation about traditions** | Ground in verified sources, admit uncertainty |
| **Jailbreak attempts** | Fine-tuned model naturally won't comply; log and learn |
| **Excessive usage** | Track patterns, gentle prompts about practice vs talking about practice |
| **User expects therapy** | Clear framing, redirect to professionals |

---

## Part 5: Voice-to-Text Strategy

### Current Implementation

- **Web Speech API** (browser-native) - FREE
- Works for basic transcription
- Quality varies by device/browser

### Options Evaluated

| Option | Cost | Quality | Control |
|--------|------|---------|---------|
| Web Speech API | Free | Variable | Low |
| OpenAI Whisper API | $0.006/min | High | Low |
| Self-hosted Whisper | Server cost only | High | High |
| Deepgram | $0.0043/min | High | Medium |
| AssemblyAI | $0.00025/sec | High | Medium |

### Recommendation

**Phase 1:** Continue with Web Speech API (free, good enough)

**Phase 2:** Evaluate self-hosted Whisper alongside the LLM infrastructure
- Run Whisper on same GPU cluster
- Near-zero marginal cost once infrastructure exists
- Full control, no per-minute charges

**Cost Impact at Scale:**
- 250K MAU × 5 voice messages/week × 30 seconds = 2.5M minutes/month
- Whisper API: $15,000/month
- Self-hosted: ~$500/month (one additional GPU)

---

## Part 6: Monetisation Strategy

### Revenue Model: Hybrid Directory + Advertising

#### Stream 1: Marketplace (Meditation-Focused Etsy)

A curated, transaction-based marketplace for meditation products, courses, and services. Think: **Uber-focused Etsy for meditation**.

**What Can Be Sold:**

| Category | Examples | Type |
|----------|----------|------|
| **Digital Courses** | Beginner meditation series, tradition deep-dives | Digital download/streaming |
| **Physical Products** | Cushions, malas, incense, singing bowls, journals | Shipped goods |
| **Retreats** | Weekend intensives, 10-day vipassana, destination retreats | Booking/deposit |
| **1:1 Sessions** | Private instruction, guided sessions | Calendar booking |
| **Guided Audio** | Meditation tracks, ambient soundscapes | Digital download |
| **Books/Ebooks** | Teacher's writings, practice guides | Physical/digital |

**Platform Revenue Model:**

| Component | Rate | Notes |
|-----------|------|-------|
| **Transaction Commission** | 10% | On all sales (your cut) |
| **Payment Processing** | ~2.9% + $0.30 | Stripe's fee (passed through) |
| **Seller Pays Total** | ~13% | Competitive with Etsy (~15%), Gumroad (~10%) |

**Stripe Connect Integration:**

```
Buyer → Stripe → 10% to Platform → 90% to Seller
                      ↓
              Stripe handles: payouts, 1099s, disputes
```

Using **Stripe Connect** (Express or Standard):
- Sellers onboard with Stripe directly (KYC handled by Stripe)
- Automatic split of funds at transaction time
- Sellers get their own Stripe dashboard
- Platform never touches seller funds (reduces liability)
- Handles international payouts, tax forms, disputes

**Seller Tiers:**

| Tier | Monthly Fee | Commission | Features |
|------|-------------|------------|----------|
| **Starter** | Free | 12% | Basic storefront, 5 listings, standard support |
| **Professional** | $19/month | 10% | Unlimited listings, analytics, priority support |
| **Featured** | $49/month | 8% | Reduced commission, AI recommendations, homepage featuring |

**Revenue Projection (Transaction-Based):**

| GMV (Monthly) | Commission (10%) | Subscription Revenue | Total |
|---------------|------------------|----------------------|-------|
| $50,000 | $5,000 | $2,000 | **$7,000** |
| $200,000 | $20,000 | $8,000 | **$28,000** |
| $1,000,000 | $100,000 | $25,000 | **$125,000** |

*GMV = Gross Merchandise Value (total sales through platform)*

**Curation & Quality Control:**

The marketplace should feel **curated, not chaotic**:

1. **Seller Approval** - Application process, not open registration
2. **Category Fit** - Must genuinely relate to meditation/mindfulness
3. **Quality Standards** - Reviews, ratings, quality thresholds
4. **AI Integration** - Buddha recommends products/courses contextually

**What's NOT Allowed:**

- Generic wellness (weight loss, supplements outside meditation context)
- Unverified claims (medical benefits, enlightenment guarantees)
- Low-quality imports (dollar-store meditation cushions)
- MLM/affiliate schemes
- Anything that feels grifty

**Tasteful Integration Examples:**

```
[After user discusses wanting to start a home practice]

Buddha: "A dedicated space can help establish your practice. Some
        practitioners find a quality cushion makes a difference -
        [Seller Name] makes hand-crafted zafus from organic buckwheat.
        Would you like to browse meditation seats?"

[User clicks → Marketplace category: Cushions & Seats]
```

```
[User has been practicing concentration for 3 months]

Buddha: "You've built a solid concentration foundation. [Teacher Name]
        offers a 4-week course on transitioning to insight practice -
        it aligns well with where you are in your journey."

[User clicks → Course detail page]
```

**Implementation Phases:**

1. **Phase 1**: Directory only (no transactions) - validate seller interest
2. **Phase 2**: Digital products (courses, audio) - easiest to fulfill
3. **Phase 3**: Physical products - requires shipping integration
4. **Phase 4**: Bookings (retreats, sessions) - calendar integration

#### Stream 2: Advertising (Free Tier)

Light, tasteful advertising for users who choose the free tier.

**Ad Placements:**
1. **Banner on Stats screen** - After viewing session stats
2. **Interstitial between tabs** - Occasional, skippable
3. **Native in Pearls feed** - "Sponsored Pearl" from retreat centers
4. **Post-session suggestion** - "Deepen your practice with..."

**Ad Categories (Allowlist Only):**
- Meditation retreats and workshops
- Wellness products (cushions, malas, incense)
- Mindfulness apps and courses
- Health/wellness brands (organic tea, supplements)
- Books on meditation and spirituality

**Blocked Categories:**
- Gambling
- Political
- Pharmaceutical
- Fast food
- Any aggressive/attention-hijacking creative

**Implementation Options:**

| Approach | Effort | Revenue Potential | Control |
|----------|--------|-------------------|---------|
| Google AdMob | Low | $2-8 CPM | Low |
| AdMob + Categories filter | Low | $5-12 CPM | Medium |
| Premium wellness network | Medium | $10-20 CPM | High |
| Self-serve (future) | High | $15-30 CPM | Full |

**Recommendation:** Start with AdMob with category restrictions. Move to premium wellness network at scale.

#### Stream 3: Premium Subscriptions (Optional)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | All features, ads shown |
| **Premium** | $4.99/month | Ad-free, priority AI response, extended history |

**Note:** Premium is optional. The directory + ad model should sustain the business without requiring subscriptions.

### AI Integration with Monetisation

The Buddha naturally integrates directory recommendations:

```
Buddha: "You've been exploring concentration practices for several
        weeks. If you'd like to deepen this with in-person guidance,
        [Teacher Name] at [Studio] offers a monthly concentration
        workshop. They specialise in the Samatha tradition you've
        been drawn to."
```

This is:
- Contextually relevant (not random)
- Helpful (user might genuinely want this)
- Disclosed (clearly marked as directory listing)
- Not pushy (once per conversation maximum)

---

## Part 7: Financial Projections

### Pro-Forma P&L (Monthly)

#### At 50K MAU

| Line Item | Amount |
|-----------|--------|
| **REVENUE** | |
| Marketplace Commission (10% of $100K GMV) | $10,000 |
| Seller Subscriptions (200 sellers × $25 avg) | $5,000 |
| Advertising (1.5M impressions × $8 CPM) | $12,000 |
| Premium User Subscriptions (2K × $5) | $10,000 |
| **Total Revenue** | **$37,000** |
| | |
| **COSTS** | |
| AI Infrastructure (Together.ai) | $800 |
| Supabase (Pro tier) | $25 |
| Stripe Connect fees (platform portion) | ~$0 (sellers pay) |
| Voice Transcription (Web Speech = free) | $0 |
| Ad Network Fees (30%) | $3,600 |
| App Store Fees (if premium, 15-30%) | $1,500-3,000 |
| **Total Costs** | **$5,925-7,425** |
| | |
| **Gross Profit** | **$29,575-31,075** |
| **Gross Margin** | **80-84%** |

#### At 250K MAU

| Line Item | Amount |
|-----------|--------|
| **REVENUE** | |
| Marketplace Commission (10% of $500K GMV) | $50,000 |
| Seller Subscriptions (800 sellers × $30 avg) | $24,000 |
| Advertising (7.5M impressions × $10 CPM) | $75,000 |
| Premium User Subscriptions (10K × $5) | $50,000 |
| **Total Revenue** | **$199,000** |
| | |
| **COSTS** | |
| AI Infrastructure (Self-hosted) | $5,000 |
| Server/Hosting | $500 |
| Supabase (Team tier) | $599 |
| Stripe Connect fees (platform portion) | ~$0 (sellers pay) |
| Ad Network Fees (30%) | $22,500 |
| App Store Fees | $7,500-15,000 |
| **Total Costs** | **$36,100-43,600** |
| | |
| **Gross Profit** | **$155,400-162,900** |
| **Gross Margin** | **78-82%** |

#### At 1M MAU (Upside Scenario)

| Line Item | Amount |
|-----------|--------|
| **REVENUE** | |
| Marketplace Commission (10% of $2M GMV) | $200,000 |
| Seller Subscriptions (2,000 sellers × $35 avg) | $70,000 |
| Advertising (30M impressions × $12 CPM) | $360,000 |
| Premium User Subscriptions (50K × $5) | $250,000 |
| **Total Revenue** | **$880,000** |
| | |
| **COSTS** | |
| AI Infrastructure (Self-hosted, scaled) | $15,000 |
| Server/Hosting | $2,000 |
| Supabase (Enterprise) | $2,000 |
| Ad Network Fees (25% at scale) | $90,000 |
| App Store Fees | $37,500-75,000 |
| Support/Ops Staff | $20,000 |
| **Total Costs** | **$166,500-204,000** |
| | |
| **Gross Profit** | **$676,000-713,500** |
| **Gross Margin** | **77-81%** |

*At 1M MAU, annual revenue approaches $10M with $8M+ gross profit.*

### Balance Sheet Considerations

**Assets Required:**
- None significant (infrastructure is rented)
- Fine-tuned model weights (digital asset)
- Meditation corpus (digital asset, mostly public domain)

**Liabilities:**
- Monthly infrastructure commitments (can scale down)
- Directory subscriber obligations (access to platform)

**Working Capital:**
- ~3 months runway recommended before launch
- ~$50K buffer for initial infrastructure + marketing

### Required Investment to Launch AI Feature

| Phase | Investment | Purpose |
|-------|------------|---------|
| **Phase 1: MVP** | $2,000-5,000 | Together.ai credits, initial development |
| **Phase 2: Fine-tuning** | $2,000-5,000 | Training compute, data preparation |
| **Phase 3: Scale prep** | $10,000-15,000 | Self-hosted infrastructure setup |
| **Buffer** | $5,000 | Unexpected costs, iteration |
| **Total** | **$19,000-30,000** | |

This can be bootstrapped if you're willing to accept slower initial development using free tiers and gradual scaling.

---

## Part 8: Technical Stack

### Current Stack (From Codebase)

```
Frontend:     React 18 + TypeScript + Vite
State:        Zustand
Local DB:     Dexie (IndexedDB)
Backend:      Supabase (Auth, PostgreSQL)
Voice:        Web Speech API
Styling:      Tailwind CSS
Testing:      Vitest
```

### Additions for AI Feature

```
AI Chat UI:
├── Chat component (scrollable history)
├── Voice input button (existing audio infra)
├── Message bubbles (user + Buddha)
└── Context indicators (typing, loading)

AI Backend:
├── Chat API endpoint (Supabase Edge Function or separate)
├── Conversation storage (Supabase table)
├── RAG retrieval (user insights, pearls, plans)
└── AI provider abstraction (swap providers easily)

AI Provider (Phased):
├── Phase 1: Together.ai SDK
├── Phase 2: Same, with fine-tuned model ID
└── Phase 3: Self-hosted (vLLM or similar)
```

### Database Schema Additions

```sql
-- Chat conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ
);

-- Individual messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- For RAG context tracking
  context_refs JSONB -- {"insights": [...], "pearls": [...], "plans": [...]}
);

-- Message embeddings for search (if using vector search)
CREATE TABLE message_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id),
  embedding vector(1536)
);
```

### Provider Abstraction

```typescript
// src/lib/ai/provider.ts

interface AIProvider {
  chat(messages: Message[], context: UserContext): Promise<string>;
  embed(text: string): Promise<number[]>;
}

// Phase 1
class TogetherAIProvider implements AIProvider { ... }

// Phase 3
class SelfHostedProvider implements AIProvider { ... }

// Factory
function getProvider(): AIProvider {
  if (config.selfHosted) return new SelfHostedProvider();
  return new TogetherAIProvider();
}
```

---

## Part 9: Implementation Roadmap

### Pre-requisite: Complete Current Build

The AI feature should be built AFTER:
- Planner calendar feature (AI creates plans → calendar)
- Guided meditation plans (AI recommends plans)
- Current UX enhancements in progress

### Phase 1: Foundation (After Current Build)

1. Chat UI component
2. Supabase tables for conversations
3. Together.ai integration with Llama 3 8B
4. Basic system prompt (meditation guide persona)
5. Integration with user's insights and pearls

**Milestone:** Users can chat with Buddha, basic context awareness

### Phase 2: Intelligence

1. RAG implementation (retrieve relevant user history)
2. Session plan generation → calendar integration
3. Fine-tuning data collection (opt-in)
4. Initial model fine-tuning
5. A/B test fine-tuned vs base model

**Milestone:** Buddha remembers and references past conversations

### Phase 3: Monetisation

1. Practitioner directory schema and UI
2. Directory listing submission flow
3. Stripe integration for subscriptions
4. AdMob integration (free tier)
5. AI → directory recommendations

**Milestone:** Revenue flowing, sustainable business model

### Phase 4: Scale

1. Self-hosted infrastructure setup
2. Provider migration (Together → RunPod)
3. Whisper self-hosting
4. Performance optimization
5. Cost monitoring and alerting

**Milestone:** Infrastructure costs decoupled from usage

---

## Part 10: Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI costs exceed revenue | Low | High | Phased rollout, usage limits, provider flexibility |
| Model gives harmful advice | Medium | High | Fine-tuning, guardrails, monitoring, disclaimers |
| Users prefer other AI tools | Medium | Medium | Deep integration with app, persistence, persona |
| Provider discontinues service | Low | High | Abstraction layer, backup providers ready |
| Directory doesn't attract practitioners | Medium | Medium | Seed with free listings, outreach, prove user base first |
| Ad revenue lower than projected | Medium | Medium | Conservative projections, subscription fallback |
| User data breach | Low | Critical | Encryption, Supabase RLS, minimal data collection |
| Competition copies feature | High | Low | First-mover advantage, community moat, fine-tuned model |

---

## Appendix A: Competitive Analysis

| Competitor | AI Feature | Differentiation |
|------------|------------|-----------------|
| Headspace | None currently | 10K Hours: AI-first design |
| Calm | Basic AI journaling | 10K Hours: True conversation, memory |
| Insight Timer | None | 10K Hours: AI + community integration |
| ChatGPT/Claude | General purpose | 10K Hours: Meditation-specific, integrated |
| Waking Up | None | 10K Hours: Personalized guidance |

### Our Moat

1. **Fine-tuned model** - Can't be replicated without our training data
2. **Integrated experience** - AI connected to timer, stats, plans, community
3. **Persistent relationship** - Years of conversation history
4. **Community data** - Pearls, crowd-sourced plans enrich AI context
5. **Practitioner network** - Directory creates switching costs

---

## Appendix B: Key Metrics to Track

| Category | Metric | Target |
|----------|--------|--------|
| **Engagement** | AI chats per MAU per month | 8-12 |
| **Retention** | D7 retention for AI users vs non-AI | +20% |
| **Quality** | Average conversation length | 8+ messages |
| **Revenue** | ARPU (all users) | $0.40/month |
| **Costs** | AI cost per MAU | <$0.03 |
| **Safety** | Off-topic/escalation rate | <2% |

---

## Appendix C: Key Decisions Log

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| AI Provider Strategy | OpenAI / Self-hosted / Hybrid | Phased migration to self-hosted | Cost control, no lock-in, fine-tuning |
| Model Size | 7B / 13B / 70B | Start 8B, move to 70B | Balance cost and capability |
| Revenue Model | Subscription / Ads / Marketplace | Marketplace + Ads | Transaction-based scales with value, not just eyeballs |
| Marketplace Model | Open / Curated / Invite-only | Curated with application | Quality control, prevents marketplace becoming chaotic |
| Commission Rate | 5% / 10% / 15% | 10% (tiered 8-12%) | Competitive with Etsy/Gumroad, sustainable |
| Payment Processing | Custom / Stripe Connect / PayPal | Stripe Connect (Express) | Handles compliance, payouts, disputes - reduces liability |
| Chat Persistence | Per-session / Per-topic / Eternal | Single eternal thread | True relationship model |
| Voice Output | Text only / Optional voice / Always voice | Text only | User preference, cost, simplicity |
| Guardrail Approach | Prompt-only / Fine-tuned / Hybrid | Fine-tuned with prompts | Baked-in safety |

---

## Related Documents

- `ROADMAP.md` - Overall app development phases
- `BUILD_LOG.md` - Development history
- `docs/plans/` - Other feature designs

---

*This document represents research and strategic planning completed 2026-01-07. Actual implementation may vary based on learnings from current build phase and market conditions.*
