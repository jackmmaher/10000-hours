"""
Comprehensive Analysis of All Review Sources
Combines Trustpilot, App Store, and Google Play reviews for product insights.
"""

import pandas as pd
import re
import sys
import glob
from collections import Counter, defaultdict
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8', errors='replace')


def clean(text):
    """Clean text for display."""
    if not isinstance(text, str):
        return str(text)
    return text.encode('ascii', 'ignore').decode('ascii').replace('\n', ' ').strip()


def load_all_reviews():
    """Load and combine all review sources."""
    all_dfs = []

    # Load Trustpilot reviews
    tp_files = glob.glob('trustpilot_reviews_*.xlsx')
    if tp_files:
        tp_df = pd.read_excel(max(tp_files))
        tp_df['source'] = 'Trustpilot'
        tp_df['title'] = ''
        all_dfs.append(tp_df)
        print(f"Loaded {len(tp_df)} Trustpilot reviews")

    # Load App Store reviews
    app_files = glob.glob('appstore_reviews_*.xlsx')
    if app_files:
        app_df = pd.read_excel(max(app_files))
        all_dfs.append(app_df)
        print(f"Loaded {len(app_df)} App Store/Play Store reviews")

    if not all_dfs:
        return None

    # Combine all
    combined = pd.concat(all_dfs, ignore_index=True)

    # Standardize columns
    combined['review_text'] = combined['review_text'].fillna('')
    combined['rating'] = pd.to_numeric(combined['rating'], errors='coerce')

    return combined


def is_subscription_complaint(text):
    """Check if review is primarily about subscription/billing."""
    text_lower = str(text).lower()
    sub_terms = ['cancel', 'refund', 'charge', 'subscription', 'renew', 'trial',
                 'payment', 'money', 'scam', 'fraud', 'billing', 'auto-renew']
    return sum(1 for t in sub_terms if t in text_lower) >= 3


def categorize_product_issue(text):
    """Categorize the product issue in a review."""
    text_lower = str(text).lower()

    categories = {
        'app_performance': ['slow', 'lag', 'crash', 'freeze', 'bug', 'glitch', 'loading'],
        'ui_navigation': ['confusing', 'hard to find', 'navigate', 'cluttered', 'interface', 'design'],
        'content_quality': ['repetitive', 'boring', 'limited', 'same content', 'variety', 'outdated'],
        'audio_playback': ['audio', 'sound', 'play', 'stop', 'skip', 'background', 'volume'],
        'voice_narrator': ['voice', 'narrator', 'annoying voice', 'tamara', 'andy'],
        'login_account': ['login', 'sign in', 'password', 'account', 'access'],
        'sync_devices': ['sync', 'device', 'phone', 'tablet', 'watch', 'transfer'],
        'offline_download': ['offline', 'download', 'without internet', 'wifi'],
        'notifications': ['notification', 'reminder', 'popup', 'push', 'spam'],
        'tracking_progress': ['track', 'streak', 'progress', 'stats', 'history'],
        'sleep_content': ['sleep', 'sleep story', 'stories', 'bedtime', 'insomnia'],
        'meditation_content': ['meditation', 'mindfulness', 'guided', 'breathing'],
        'customer_support': ['support', 'customer service', 'help', 'response', 'contact'],
    }

    found = []
    for cat, keywords in categories.items():
        if any(kw in text_lower for kw in keywords):
            found.append(cat)
    return found


def extract_specific_complaints(df, company):
    """Extract specific product complaints for a company."""
    company_df = df[df['company'] == company].copy()

    # Filter to non-subscription reviews for product focus
    company_df['is_subscription'] = company_df['review_text'].apply(is_subscription_complaint)
    product_df = company_df[~company_df['is_subscription']]

    print(f"\n{company}: {len(company_df)} total reviews, {len(product_df)} product-focused")

    # Categorize issues
    all_categories = []
    category_examples = defaultdict(list)

    for _, row in product_df.iterrows():
        cats = categorize_product_issue(row['review_text'])
        for cat in cats:
            all_categories.append(cat)
            if len(category_examples[cat]) < 5:
                category_examples[cat].append({
                    'rating': row['rating'],
                    'source': row['source'],
                    'text': str(row['review_text'])[:300]
                })

    return Counter(all_categories), category_examples


def analyze_by_source(df):
    """Analyze reviews by source platform."""
    print("\n" + "="*70)
    print("ANALYSIS BY PLATFORM")
    print("="*70)

    for source in df['source'].unique():
        source_df = df[df['source'] == source]
        print(f"\n--- {source} ---")
        for company in sorted(df['company'].unique()):
            comp_df = source_df[source_df['company'] == company]
            if len(comp_df) > 0:
                avg = comp_df['rating'].mean()
                print(f"  {company}: {len(comp_df)} reviews, avg {avg:.2f}")


def analyze_product_issues(df):
    """Main product issue analysis."""
    print("\n" + "="*70)
    print("PRODUCT ISSUES ANALYSIS (Excluding Subscription Complaints)")
    print("="*70)

    for company in ['Calm', 'Headspace']:
        counts, examples = extract_specific_complaints(df, company)

        print(f"\n{'='*50}")
        print(f"{company.upper()} - TOP PRODUCT ISSUES")
        print("="*50)

        for issue, count in counts.most_common(10):
            issue_name = issue.replace('_', ' ').title()
            print(f"\n{issue_name}: {count} mentions")
            print("-" * 40)

            # Show examples from different sources
            shown_sources = set()
            for ex in examples[issue]:
                if ex['source'] not in shown_sources and len(shown_sources) < 2:
                    shown_sources.add(ex['source'])
                    text = clean(ex['text'][:200])
                    print(f"  [{ex['source']}, {int(ex['rating']) if pd.notna(ex['rating']) else '?'}*] \"{text}...\"")


def compare_platforms(df):
    """Compare how issues differ by platform."""
    print("\n" + "="*70)
    print("PLATFORM-SPECIFIC INSIGHTS")
    print("="*70)

    platforms = {
        'App Store': 'iOS users',
        'Google Play': 'Android users',
        'Trustpilot': 'Website/billing complainers'
    }

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} ---\n")
        company_df = df[df['company'] == company]

        for source in ['App Store', 'Google Play', 'Trustpilot']:
            source_df = company_df[company_df['source'] == source]
            if len(source_df) == 0:
                continue

            # Get top issues for this platform
            all_cats = []
            for _, row in source_df.iterrows():
                if not is_subscription_complaint(row['review_text']):
                    all_cats.extend(categorize_product_issue(row['review_text']))

            top_issues = Counter(all_cats).most_common(3)
            issues_str = ", ".join([f"{i.replace('_',' ')}" for i, c in top_issues])
            print(f"  {source}: Top issues = {issues_str}")


def extract_feature_requests(df):
    """Extract specific feature requests and missing functionality."""
    print("\n" + "="*70)
    print("FEATURE REQUESTS & MISSING FUNCTIONALITY")
    print("="*70)

    feature_patterns = {
        'timer_customization': r'(custom|adjust|set|own).*(timer|time|duration)',
        'background_play': r'(background|lock|screen off).*(play|continue|audio)',
        'widget': r'widget|home screen',
        'apple_watch': r'apple watch|watchos|watch app',
        'offline': r'offline|download.*(listen|use)|without (wifi|internet)',
        'family_plan': r'family (plan|share|account)|multiple (user|profile)',
        'more_content': r'more (content|meditation|story|stories|variety)',
        'specific_topics': r'(anxiety|depression|grief|adhd|ptsd|stress|focus|sleep)',
        'shorter_sessions': r'shorter|quick|5 minute|brief',
        'longer_sessions': r'longer|extended|45 minute|hour',
        'skip_intro': r'skip (intro|introduction)|too much talk',
    }

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} ---\n")
        company_df = df[df['company'] == company]

        found_features = defaultdict(list)

        for _, row in company_df.iterrows():
            text = str(row['review_text']).lower()

            # Only look at reviews that express wants/needs
            if not any(w in text for w in ['wish', 'want', 'need', 'please', 'should', 'would be nice', 'missing', 'no option']):
                continue

            for feature, pattern in feature_patterns.items():
                if re.search(pattern, text, re.IGNORECASE):
                    found_features[feature].append({
                        'source': row['source'],
                        'text': str(row['review_text'])[:200]
                    })

        for feature, examples in sorted(found_features.items(), key=lambda x: -len(x[1])):
            feature_name = feature.replace('_', ' ').title()
            print(f"{feature_name}: {len(examples)} requests")
            if examples:
                ex = examples[0]
                print(f"  [{ex['source']}] \"{clean(ex['text'][:150])}...\"")
            print()


def extract_praised_features(df):
    """Extract what users actually like."""
    print("\n" + "="*70)
    print("PRAISED FEATURES (from 4-5 star reviews)")
    print("="*70)

    positive_df = df[df['rating'] >= 4]

    praise_patterns = {
        'sleep_stories': r'sleep (stories?|story)|bedtime|fall asleep',
        'calming_voices': r'(calm|sooth|relax).*(voice|narrat)|voice.*(calm|sooth|love)',
        'meditation_quality': r'meditation|mindful|breathing|relax',
        'variety_content': r'variety|lots of|many options|different',
        'ease_of_use': r'easy|simple|intuitive|user.?friendly',
        'daily_content': r'daily|every day|morning|night routine',
        'specific_narrator': r'(tamara|andy|stephen fry|matthew)',
        'helped_anxiety': r'help.*(anxiety|stress|calm|relax|sleep)',
    }

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} ---\n")
        company_df = positive_df[positive_df['company'] == company]

        found_praise = defaultdict(list)

        for _, row in company_df.iterrows():
            text = str(row['review_text']).lower()

            for feature, pattern in praise_patterns.items():
                if re.search(pattern, text, re.IGNORECASE):
                    found_praise[feature].append({
                        'source': row['source'],
                        'rating': row['rating'],
                        'text': str(row['review_text'])[:200]
                    })
                    break  # One praise per review

        for feature, examples in sorted(found_praise.items(), key=lambda x: -len(x[1])):
            if len(examples) >= 3:  # Only show common praise
                feature_name = feature.replace('_', ' ').title()
                print(f"{feature_name}: {len(examples)} mentions")
                if examples:
                    ex = examples[0]
                    print(f"  [{ex['source']}, {int(ex['rating'])}*] \"{clean(ex['text'][:150])}...\"")
                print()


def generate_executive_summary(df):
    """Generate executive summary."""
    print("\n" + "="*70)
    print("EXECUTIVE SUMMARY")
    print("="*70)

    total = len(df)
    tp_count = len(df[df['source'] == 'Trustpilot'])
    ios_count = len(df[df['source'] == 'App Store'])
    android_count = len(df[df['source'] == 'Google Play'])

    print(f"""
DATA OVERVIEW
-------------
Total Reviews Analyzed: {total}
- Trustpilot: {tp_count}
- iOS App Store: {ios_count}
- Google Play Store: {android_count}

OVERALL RATINGS
---------------""")

    for company in ['Calm', 'Headspace']:
        comp_df = df[df['company'] == company]
        print(f"\n{company}:")
        for source in ['App Store', 'Google Play', 'Trustpilot']:
            src_df = comp_df[comp_df['source'] == source]
            if len(src_df) > 0:
                avg = src_df['rating'].mean()
                print(f"  {source}: {avg:.2f} avg ({len(src_df)} reviews)")

    print("""

KEY PRODUCT FINDINGS
====================

CALM
----
STRENGTHS:
+ Sleep Stories highly valued - "Stephen Fry" mentioned as favorite narrator
+ Calming content helps users with anxiety and sleep
+ Good variety of meditation types

WEAKNESSES:
- Voice polarization: Tamara Levitt's voice is divisive (love/hate)
- Content becomes repetitive for long-term subscribers
- Offline download functionality is broken/confusing
- App navigation cluttered after recent updates
- Android performance issues reported

HEADSPACE
---------
STRENGTHS:
+ Andy Puddicombe's voice and style widely praised
+ Beginner-friendly approach to meditation
+ Good foundational meditation courses

WEAKNESSES:
- Severe Android app performance problems ("painfully slow and laggy")
- Interface is cluttered and confusing after updates
- Content feels "gimmicky" to some users
- Apple Health/fitness tracking integration broken
- Limited sleep content compared to Calm
- Animations seen as childish by adult users

COMPARATIVE INSIGHTS
====================
1. ANDROID USERS: Both apps have Android issues, but Headspace's are more severe
2. CONTENT FRESHNESS: Both struggle with long-term user retention due to repetitive content
3. UI COMPLEXITY: Both apps criticized for becoming too cluttered over time
4. PLATFORM DIFFERENCES:
   - Trustpilot: Dominated by billing complaints
   - App Stores: More balanced product feedback
   - iOS users generally more satisfied than Android users

ACTIONABLE RECOMMENDATIONS
==========================
For Calm:
1. Address narrator voice options - allow users to filter/choose preferred voices
2. Fix offline download functionality on Android
3. Increase content refresh rate for long-term subscribers
4. Simplify navigation to pre-update state

For Headspace:
1. URGENT: Fix Android app performance - major user exodus risk
2. Offer "mature" UI option without animations
3. Fix Apple Health integration
4. Expand sleep content library to compete with Calm
5. Simplify interface - too many features overwhelming users
""")


def main():
    """Main analysis function."""
    print("="*70)
    print("COMPREHENSIVE REVIEW ANALYSIS")
    print("Calm vs Headspace - All Platforms")
    print("="*70)

    df = load_all_reviews()
    if df is None:
        print("No review files found!")
        return

    print(f"\nTotal reviews loaded: {len(df)}")

    analyze_by_source(df)
    analyze_product_issues(df)
    compare_platforms(df)
    extract_feature_requests(df)
    extract_praised_features(df)
    generate_executive_summary(df)

    # Save combined data
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    df.to_excel(f"all_reviews_combined_{timestamp}.xlsx", index=False)
    print(f"\n\nCombined data saved to all_reviews_combined_{timestamp}.xlsx")


if __name__ == "__main__":
    main()
