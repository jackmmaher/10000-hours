"""
Deep Product Analysis - Extracting specific product/app issues from reviews.
"""

import pandas as pd
import re
import sys
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def clean(text):
    """Clean text for display."""
    return text.encode('ascii', 'ignore').decode('ascii').replace('\n', ' ').strip()


def load_reviews():
    """Load the most recent reviews file."""
    import glob
    files = glob.glob('trustpilot_reviews_*.xlsx')
    if not files:
        return None
    return pd.read_excel(max(files))


def is_primarily_subscription(text):
    """Determine if review is primarily about subscription/billing."""
    text_lower = text.lower()
    sub_terms = ['cancel', 'refund', 'charge', 'subscription', 'renew', 'trial',
                 'payment', 'money', 'scam', 'fraud', 'billing', '$', '£', '€']
    product_terms = ['app', 'content', 'meditation', 'sleep', 'feature', 'bug',
                     'crash', 'audio', 'interface', 'design', 'quality', 'voice']

    sub_count = sum(1 for t in sub_terms if t in text_lower)
    product_count = sum(1 for t in product_terms if t in text_lower)

    return sub_count > product_count + 2


def extract_product_sentences(text):
    """Extract sentences that discuss product features, not billing."""
    sentences = re.split(r'[.!?]+', text)
    product_sentences = []

    billing_words = {'cancel', 'refund', 'charge', 'subscription', 'renew',
                     'payment', 'money', 'scam', 'fraud', 'billing', 'trial'}

    for sent in sentences:
        sent = sent.strip()
        if len(sent) < 20:
            continue
        sent_lower = sent.lower()

        # Skip if it's primarily about billing
        if sum(1 for w in billing_words if w in sent_lower) >= 2:
            continue

        # Include if it mentions product aspects
        product_indicators = ['app', 'content', 'meditation', 'sleep', 'feature',
                              'audio', 'voice', 'interface', 'navigation', 'design',
                              'download', 'offline', 'sync', 'crash', 'bug', 'slow',
                              'confusing', 'difficult', 'hard to', 'doesn\'t work',
                              'limited', 'repetitive', 'boring', 'quality']

        if any(ind in sent_lower for ind in product_indicators):
            product_sentences.append(sent)

    return product_sentences


def analyze_app_technical_issues(df):
    """Analyze technical/app issues."""
    print("\n" + "="*70)
    print("APP TECHNICAL ISSUES")
    print("="*70)

    issues = {
        'crashes_freezes': {
            'patterns': [r'crash', r'freeze', r'frozen', r'stuck', r'hung'],
            'examples': []
        },
        'slow_performance': {
            'patterns': [r'slow', r'lag', r'loading', r'buffer', r'takes forever'],
            'examples': []
        },
        'login_access': {
            'patterns': [r"can'?t (log|sign|access)", r'unable to (log|sign|access)',
                        r'locked out', r'password', r"won'?t let me"],
            'examples': []
        },
        'sync_issues': {
            'patterns': [r'sync', r'devices?', r'progress (lost|reset|gone)',
                        r'different (phone|device)'],
            'examples': []
        },
        'audio_problems': {
            'patterns': [r'audio (cut|stop|skip)', r'sound (issue|problem)',
                        r'playback', r"doesn'?t play", r'background (play|audio)'],
            'examples': []
        },
        'offline_downloads': {
            'patterns': [r'offline', r'download', r'without (internet|wifi)',
                        r'airplane mode'],
            'examples': []
        }
    }

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} ---\n")
        company_df = df[df['company'] == company]

        company_issues = defaultdict(list)

        for _, row in company_df.iterrows():
            text = row['review_text']
            text_lower = text.lower()

            # Extract product-focused sentences
            product_sents = extract_product_sentences(text)

            for issue_type, data in issues.items():
                for pattern in data['patterns']:
                    if re.search(pattern, text_lower):
                        # Find the relevant sentence
                        for sent in product_sents:
                            if re.search(pattern, sent.lower()):
                                company_issues[issue_type].append({
                                    'rating': row['rating'],
                                    'text': sent[:200]
                                })
                                break
                        break

        for issue_type, examples in sorted(company_issues.items(),
                                           key=lambda x: -len(x[1])):
            if examples:
                issue_name = issue_type.replace('_', ' ').title()
                print(f"{issue_name}: {len(examples)} mentions")
                # Show best examples (prioritize lower ratings)
                examples_sorted = sorted(examples, key=lambda x: x['rating'])[:2]
                for ex in examples_sorted:
                    print(f"  [{ex['rating']}*] \"{clean(ex['text'])}...\"")
                print()


def analyze_content_quality(df):
    """Analyze content-related complaints."""
    print("\n" + "="*70)
    print("CONTENT & QUALITY ISSUES")
    print("="*70)

    content_issues = {
        'repetitive': [r'repetitive', r'same (content|meditation|story)',
                      r'gets? old', r'nothing new', r'heard (it|them) (all|before)'],
        'limited_variety': [r'limited', r'not enough', r'lack of', r'more (variety|options|content)',
                           r'wish there (was|were) more'],
        'quality_decline': [r'quality (has|have) (gone|dropped|declined)',
                           r'used to be (better|good)', r'worse (than|now)'],
        'boring_content': [r'boring', r'dull', r'uninteresting', r'not engaging'],
        'voice_narrator': [r'voice', r'narrator', r'narration', r'annoying voice',
                          r"don'?t like (the|his|her) voice"],
        'too_short': [r'too short', r'not long enough', r'longer (meditation|session|content)'],
        'outdated': [r'outdated', r'old content', r'stale', r'not updated']
    }

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} ---\n")
        company_df = df[df['company'] == company]

        found_issues = defaultdict(list)

        for _, row in company_df.iterrows():
            text = row['review_text']
            text_lower = text.lower()
            product_sents = extract_product_sentences(text)

            for issue, patterns in content_issues.items():
                for pattern in patterns:
                    if re.search(pattern, text_lower):
                        for sent in product_sents:
                            if re.search(pattern, sent.lower()):
                                found_issues[issue].append({
                                    'rating': row['rating'],
                                    'text': sent[:200]
                                })
                                break
                        else:
                            # If no product sentence matched, use the whole review
                            found_issues[issue].append({
                                'rating': row['rating'],
                                'text': text[:200]
                            })
                        break

        for issue, examples in sorted(found_issues.items(), key=lambda x: -len(x[1])):
            if examples:
                issue_name = issue.replace('_', ' ').title()
                print(f"{issue_name}: {len(examples)} mentions")
                examples_sorted = sorted(examples, key=lambda x: x['rating'])[:2]
                for ex in examples_sorted:
                    print(f"  [{ex['rating']}*] \"{clean(ex['text'][:150])}...\"")
                print()


def analyze_ux_issues(df):
    """Analyze UX/navigation issues."""
    print("\n" + "="*70)
    print("USER EXPERIENCE & INTERFACE ISSUES")
    print("="*70)

    ux_issues = {
        'confusing_navigation': [r'confusing', r'hard to (find|navigate|use)',
                                r'difficult to (find|navigate)', r"can'?t find",
                                r'where (is|are)', r'buried'],
        'cluttered_interface': [r'cluttered', r'too (much|many)', r'overwhelming',
                               r'busy (interface|screen|app)'],
        'poor_design': [r'bad (design|ui|interface)', r'ugly', r'outdated (look|design)',
                       r'needs? (redesign|update)'],
        'annoying_popups': [r'popup', r'pop-?up', r'notification', r'constantly (ask|prompt)',
                           r'keeps? asking', r'annoying (message|prompt)'],
        'settings_issues': [r"can'?t (change|modify|adjust)", r'no option',
                           r'settings? (missing|hidden|buried)']
    }

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} ---\n")
        company_df = df[df['company'] == company]

        found_issues = defaultdict(list)

        for _, row in company_df.iterrows():
            text = row['review_text']
            text_lower = text.lower()

            for issue, patterns in ux_issues.items():
                for pattern in patterns:
                    if re.search(pattern, text_lower):
                        found_issues[issue].append({
                            'rating': row['rating'],
                            'text': text[:200]
                        })
                        break

        for issue, examples in sorted(found_issues.items(), key=lambda x: -len(x[1])):
            if examples:
                issue_name = issue.replace('_', ' ').title()
                print(f"{issue_name}: {len(examples)} mentions")
                examples_sorted = sorted(examples, key=lambda x: x['rating'])[:2]
                for ex in examples_sorted:
                    print(f"  [{ex['rating']}*] \"{clean(ex['text'][:150])}...\"")
                print()


def extract_specific_features_wanted(df):
    """Extract specific features users want."""
    print("\n" + "="*70)
    print("SPECIFIC FEATURE REQUESTS & COMPLAINTS")
    print("="*70)

    # Specific feature areas to search for
    feature_areas = {
        'timer_customization': [
            r'custom timer', r'adjust timer', r'set (my own|own) time',
            r'longer (timer|session)', r'shorter (timer|session)'
        ],
        'background_play': [
            r'background (play|mode)', r'play in background',
            r'while (using|on) other apps', r'screen off'
        ],
        'apple_watch': [
            r'apple watch', r'watch app', r'watchos'
        ],
        'widget': [
            r'widget', r'home screen'
        ],
        'family_sharing': [
            r'family (plan|sharing|account)', r'multiple (users|profiles)',
            r'share (with|across)'
        ],
        'progress_tracking': [
            r'track (progress|stats)', r'statistics', r'streak',
            r'history', r'how (much|long|many)'
        ],
        'specific_meditation_types': [
            r'anxiety', r'stress', r'focus', r'work', r'grief',
            r'relationship', r'self-?esteem', r'depression'
        ],
        'kids_content': [
            r'kids?', r'child', r'children', r'family'
        ]
    }

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} Feature Complaints ---\n")
        company_df = df[df['company'] == company]

        for feature, patterns in feature_areas.items():
            mentions = []
            for _, row in company_df.iterrows():
                text = row['review_text']
                text_lower = text.lower()

                # Check if this feature is mentioned in a complaint context
                complaint_context = any(neg in text_lower for neg in
                    ["doesn't", "doesn't", "can't", "cant", "won't", "wont",
                     "wish", "need", "want", "missing", "no ", "not ", "poor", "bad"])

                for pattern in patterns:
                    if re.search(pattern, text_lower) and complaint_context:
                        mentions.append(text[:200])
                        break

            if mentions:
                feature_name = feature.replace('_', ' ').title()
                print(f"{feature_name}: {len(mentions)} mentions")
                for m in mentions[:1]:
                    print(f"  \"{clean(m)}...\"")
                print()


def find_positive_product_mentions(df):
    """Find what users actually like about the products."""
    print("\n" + "="*70)
    print("WHAT USERS ACTUALLY LIKE (from higher-rated reviews)")
    print("="*70)

    # Focus on 4-5 star reviews
    positive_df = df[df['rating'] >= 4]

    positive_aspects = {
        'sleep_content': [r'sleep (stories?|content|meditation)', r'helped? (me )?(sleep|fall asleep)'],
        'meditation_quality': [r'meditation', r'mindful', r'calm(ing|ed)?', r'relax'],
        'voice_quality': [r'voice', r'soothing', r'narrator'],
        'variety': [r'variety', r'different', r'options?', r'selection'],
        'ease_of_use': [r'easy to use', r'simple', r'intuitive', r'user.?friendly']
    }

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} ---\n")
        company_df = positive_df[positive_df['company'] == company]

        if len(company_df) == 0:
            print("No 4-5 star reviews in sample")
            continue

        for aspect, patterns in positive_aspects.items():
            for _, row in company_df.iterrows():
                text = row['review_text']
                text_lower = text.lower()

                for pattern in patterns:
                    if re.search(pattern, text_lower):
                        aspect_name = aspect.replace('_', ' ').title()
                        print(f"{aspect_name}: [{row['rating']}*] \"{clean(text[:150])}...\"")
                        break
                else:
                    continue
                break


def generate_summary(df):
    """Generate executive summary."""
    print("\n" + "="*70)
    print("EXECUTIVE SUMMARY: PRODUCT ISSUES (EXCLUDING BILLING)")
    print("="*70)

    print("""
CALM - KEY PRODUCT ISSUES:
--------------------------
1. CONTENT REPETITIVENESS
   - Users report hearing the same meditations/stories repeatedly
   - Long-term subscribers feel content has stagnated
   - Request for more frequent new content additions

2. APP NAVIGATION & UX
   - Difficulty finding specific content
   - Offline download feature is confusing/broken
   - Interface described as cluttered after updates

3. AUDIO/PLAYBACK
   - Background play issues (stops when switching apps)
   - Audio cutting off mid-session
   - Volume inconsistency between tracks

4. ACCOUNT ACCESS
   - Login issues after subscription changes
   - Password reset problems
   - Cross-device sync unreliable

5. SPECIFIC COMPLAINTS:
   - Tamara Levitt's voice polarizing (some love, some hate)
   - Sleep stories quality varies significantly
   - Kids content limited


HEADSPACE - KEY PRODUCT ISSUES:
-------------------------------
1. APP PERFORMANCE
   - Android app described as "painfully slow and laggy"
   - App crashes reported, especially after updates
   - October 2024 update caused widespread issues

2. CONTENT ORGANIZATION
   - Hard to find specific meditation types
   - Courses structure confusing
   - Content feels "gimmicky" to some users

3. TRACKING & PROGRESS
   - Apple Health integration broken/unreliable
   - Meditation minutes tracking issues
   - Streak/progress data lost

4. PERSONALIZATION
   - Recommendations not relevant
   - Can't easily skip content types
   - Constant prompts for features users don't want

5. SPECIFIC COMPLAINTS:
   - Want more sleep story content with specific narrators
   - Text-based coaching described as "like chatting with a bot"
   - Animations/graphics seen as childish by some users


COMPARATIVE INSIGHTS:
--------------------
- Both apps struggle with LONG-TERM USER RETENTION due to content repetitiveness
- HEADSPACE has more technical/performance complaints
- CALM has more content quality variation complaints
- Both have significant NAVIGATION issues
- Neither excels at PERSONALIZATION based on user preferences
- OFFLINE functionality problematic for both
""")


def main():
    df = load_reviews()
    if df is None:
        print("No review files found!")
        return

    print(f"Loaded {len(df)} reviews")
    print(f"Calm: {len(df[df['company'] == 'Calm'])}")
    print(f"Headspace: {len(df[df['company'] == 'Headspace'])}")

    analyze_app_technical_issues(df)
    analyze_content_quality(df)
    analyze_ux_issues(df)
    extract_specific_features_wanted(df)
    find_positive_product_mentions(df)
    generate_summary(df)


if __name__ == "__main__":
    main()
