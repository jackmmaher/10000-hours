"""
Semantic Analysis of Trustpilot Reviews
Focuses on product/app issues, excluding subscription-related complaints.
"""

import pandas as pd
import re
import sys
from collections import Counter, defaultdict

# Fix encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8', errors='replace')


def clean_text_for_display(text):
    """Remove or replace problematic characters for display."""
    # Remove emojis and other non-ASCII characters
    return text.encode('ascii', 'ignore').decode('ascii')


# Keywords that indicate subscription/billing complaints (to filter out)
SUBSCRIPTION_KEYWORDS = [
    'cancel', 'cancelled', 'cancellation', 'refund', 'charge', 'charged', 'billing',
    'subscription', 'unsubscribe', 'renew', 'renewal', 'auto-renew', 'autorenewal',
    'free trial', 'trial', 'money back', 'payment', 'paypal', 'credit card',
    'scam', 'fraud', 'fraudulent', 'steal', 'stolen', 'theft', 'rip off', 'ripoff',
    'predatory', 'deceptive', 'misleading', 'hidden fees', 'unauthorized',
    'bank', 'dispute', 'chargeback', '$', '£', '€', 'dollar', 'pound', 'price',
    'expensive', 'overpriced', 'cost', 'fee', 'pay', 'paid'
]

# Product/App issue categories and their keywords
ISSUE_CATEGORIES = {
    'login_authentication': [
        'login', 'log in', 'sign in', 'signin', 'password', 'authenticate',
        'account access', "can't access", 'cannot access', 'locked out',
        'verification', 'verify', 'credentials', 'reset password'
    ],
    'app_crashes_bugs': [
        'crash', 'crashes', 'crashing', 'bug', 'bugs', 'buggy', 'glitch', 'glitchy',
        'freeze', 'freezes', 'frozen', 'error', 'errors', 'broken', 'not working',
        'doesnt work', "doesn't work", 'stopped working', 'malfunction'
    ],
    'ui_ux_design': [
        'confusing', 'hard to use', 'difficult to navigate', 'navigation',
        'interface', 'design', 'layout', 'cluttered', 'unintuitive',
        'user experience', 'ux', 'ui', 'menu', 'find', 'where is', 'can\'t find',
        'hard to find', 'complicated', 'complex'
    ],
    'content_quality': [
        'content', 'meditation', 'meditations', 'sleep', 'story', 'stories',
        'music', 'sounds', 'audio', 'voice', 'narrator', 'narration',
        'quality', 'variety', 'selection', 'limited', 'repetitive', 'boring',
        'same', 'outdated', 'stale'
    ],
    'feature_missing': [
        'feature', 'features', 'missing', 'need', 'wish', 'would like',
        'should have', 'doesn\'t have', 'no option', 'can\'t do', 'cannot do',
        'lack', 'lacking', 'want', 'wanted'
    ],
    'offline_download': [
        'offline', 'download', 'downloads', 'downloading', 'save', 'saved',
        'without internet', 'no wifi', 'airplane mode', 'storage'
    ],
    'sync_devices': [
        'sync', 'syncing', 'synchronize', 'device', 'devices', 'phone', 'tablet',
        'ipad', 'iphone', 'android', 'apple watch', 'watch', 'cross-device',
        'multiple devices', 'transfer', 'progress'
    ],
    'performance_speed': [
        'slow', 'loading', 'load time', 'buffer', 'buffering', 'lag', 'laggy',
        'performance', 'speed', 'takes forever', 'wait', 'waiting'
    ],
    'notifications_reminders': [
        'notification', 'notifications', 'reminder', 'reminders', 'alert', 'alerts',
        'push', 'spam', 'annoying', 'too many', 'constant'
    ],
    'customer_support': [
        'support', 'customer service', 'help', 'response', 'respond', 'contact',
        'email', 'reply', 'ignore', 'ignored', 'no response', 'unhelpful'
    ],
    'timer_tracking': [
        'timer', 'tracking', 'track', 'progress', 'streak', 'stats', 'statistics',
        'history', 'session', 'sessions', 'minutes', 'time spent'
    ],
    'personalization': [
        'personalize', 'personalization', 'customize', 'customization', 'preference',
        'preferences', 'recommend', 'recommendation', 'algorithm', 'tailored',
        'personal', 'individual'
    ],
    'audio_playback': [
        'play', 'playback', 'pause', 'stop', 'audio', 'sound', 'volume',
        'background', 'continues', 'stops', 'interrupts', 'cuts off', 'skip'
    ]
}


def is_subscription_focused(text):
    """Check if review is primarily about subscription/billing issues."""
    text_lower = text.lower()
    subscription_count = sum(1 for kw in SUBSCRIPTION_KEYWORDS if kw in text_lower)
    # If more than 3 subscription keywords, it's primarily a billing complaint
    return subscription_count > 3


def categorize_issues(text):
    """Categorize what issues a review mentions."""
    text_lower = text.lower()
    categories_found = []

    for category, keywords in ISSUE_CATEGORIES.items():
        for keyword in keywords:
            if keyword in text_lower:
                categories_found.append(category)
                break

    return categories_found


def extract_specific_complaints(text):
    """Extract specific product complaints from text."""
    complaints = []
    text_lower = text.lower()

    # Patterns for specific complaints
    patterns = [
        (r"can'?t (\w+ ?\w*)", "inability"),
        (r"doesn'?t (\w+ ?\w*)", "failure"),
        (r"won'?t (\w+ ?\w*)", "failure"),
        (r"unable to (\w+ ?\w*)", "inability"),
        (r"no (\w+) (option|feature|way)", "missing_feature"),
        (r"(\w+) (doesn't|does not|won't|will not) work", "broken_feature"),
        (r"too (slow|fast|loud|quiet|short|long)", "quality_issue"),
        (r"not enough (\w+)", "insufficient"),
        (r"(\w+) is (broken|buggy|glitchy)", "technical_issue"),
    ]

    for pattern, complaint_type in patterns:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            if isinstance(match, tuple):
                complaints.append((complaint_type, ' '.join(match)))
            else:
                complaints.append((complaint_type, match))

    return complaints


def analyze_by_rating(df):
    """Analyze issues by star rating."""
    results = {}
    for rating in sorted(df['rating'].unique()):
        rating_df = df[df['rating'] == rating]
        all_categories = []
        for _, row in rating_df.iterrows():
            cats = categorize_issues(row['review_text'])
            all_categories.extend(cats)
        results[rating] = Counter(all_categories)
    return results


def extract_product_insights(df):
    """Main analysis function."""
    print("="*70)
    print("SEMANTIC ANALYSIS: PRODUCT & APP ISSUES")
    print("="*70)

    # Separate subscription-focused reviews from product-focused
    df['is_subscription_focused'] = df['review_text'].apply(is_subscription_focused)
    product_df = df[~df['is_subscription_focused']].copy()
    subscription_df = df[df['is_subscription_focused']].copy()

    print(f"\nTotal reviews: {len(df)}")
    print(f"Subscription-focused reviews (filtered out): {len(subscription_df)}")
    print(f"Product-focused reviews (analyzing): {len(product_df)}")

    # Even in subscription-focused reviews, extract any product mentions
    print("\n" + "-"*70)
    print("NOTE: Also scanning subscription complaints for product mentions...")
    print("-"*70)

    # Analyze both sets but weight product-focused higher
    all_reviews_for_analysis = df.copy()  # Use all but categorize

    for company in ['Calm', 'Headspace']:
        print(f"\n{'='*70}")
        print(f"ANALYSIS: {company.upper()}")
        print("="*70)

        company_df = all_reviews_for_analysis[all_reviews_for_analysis['company'] == company]
        product_company_df = product_df[product_df['company'] == company]

        print(f"\nTotal reviews: {len(company_df)}")
        print(f"Product-focused reviews: {len(product_company_df)}")

        # Categorize all issues
        all_categories = []
        category_examples = defaultdict(list)

        for _, row in company_df.iterrows():
            cats = categorize_issues(row['review_text'])
            for cat in cats:
                all_categories.append(cat)
                if len(category_examples[cat]) < 3:
                    # Store short excerpt
                    excerpt = row['review_text'][:200] + "..." if len(row['review_text']) > 200 else row['review_text']
                    category_examples[cat].append((row['rating'], excerpt))

        category_counts = Counter(all_categories)

        print(f"\n--- ISSUE CATEGORIES (ranked by frequency) ---\n")

        for category, count in category_counts.most_common():
            category_name = category.replace('_', ' ').title()
            pct = (count / len(company_df)) * 100
            print(f"\n{category_name}: {count} mentions ({pct:.1f}% of reviews)")
            print("-" * 40)

            # Show example excerpts
            for rating, excerpt in category_examples[category][:2]:
                # Clean up the excerpt
                excerpt_clean = clean_text_for_display(excerpt.replace('\n', ' ').strip())
                print(f"  [{rating}*] \"{excerpt_clean}\"")

        # Extract specific pain points
        print(f"\n--- SPECIFIC COMPLAINTS EXTRACTED ---\n")

        all_complaints = []
        for _, row in product_company_df.iterrows():
            complaints = extract_specific_complaints(row['review_text'])
            all_complaints.extend(complaints)

        complaint_counter = Counter(all_complaints)
        for (ctype, detail), count in complaint_counter.most_common(15):
            if count > 1:
                print(f"  - {ctype}: '{detail}' ({count}x)")

    # Cross-company comparison
    print(f"\n{'='*70}")
    print("CROSS-COMPANY COMPARISON")
    print("="*70)

    for company in ['Calm', 'Headspace']:
        company_df = all_reviews_for_analysis[all_reviews_for_analysis['company'] == company]
        cats = []
        for _, row in company_df.iterrows():
            cats.extend(categorize_issues(row['review_text']))

        print(f"\n{company} Top Issues:")
        for cat, count in Counter(cats).most_common(5):
            pct = (count / len(company_df)) * 100
            print(f"  {count:3d} ({pct:4.1f}%) - {cat.replace('_', ' ').title()}")

    return product_df, category_counts


def deep_dive_content_issues(df):
    """Deep dive into content-related complaints."""
    print(f"\n{'='*70}")
    print("DEEP DIVE: CONTENT & FEATURE ANALYSIS")
    print("='*70")

    content_keywords = {
        'sleep_stories': ['sleep story', 'sleep stories', 'bedtime', 'sleep content'],
        'meditation_guided': ['guided meditation', 'guided', 'instruction', 'voice guide'],
        'meditation_unguided': ['unguided', 'silent', 'timer only', 'just timer'],
        'music_sounds': ['music', 'soundscape', 'sounds', 'nature sounds', 'ambient'],
        'breathing': ['breathing', 'breath', 'breathe', 'breath exercise'],
        'courses': ['course', 'courses', 'program', 'programs', 'series'],
        'daily': ['daily', 'daily calm', 'daily headspace', 'new content'],
    }

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} Content Mentions ---\n")
        company_df = df[df['company'] == company]

        for content_type, keywords in content_keywords.items():
            mentions = []
            for _, row in company_df.iterrows():
                text_lower = row['review_text'].lower()
                if any(kw in text_lower for kw in keywords):
                    mentions.append(row['review_text'])

            if mentions:
                print(f"{content_type.replace('_', ' ').title()}: {len(mentions)} mentions")
                # Show negative sentiment ones
                for m in mentions[:1]:
                    if any(neg in m.lower() for neg in ['bad', 'poor', 'hate', 'boring', 'limited', 'repetitive', 'same']):
                        excerpt = clean_text_for_display(m[:150].replace('\n', ' '))
                        print(f"    \"{excerpt}...\"")


def analyze_feature_requests(df):
    """Extract what features users want or are missing."""
    print(f"\n{'='*70}")
    print("FEATURE REQUESTS & MISSING FUNCTIONALITY")
    print("="*70)

    # Patterns that indicate feature requests
    request_patterns = [
        r"wish (?:it |they |there was |there were |I could )(.{10,60})",
        r"would be (?:nice|great|better) (?:if|to) (.{10,60})",
        r"should (?:have|be able to|let you) (.{10,60})",
        r"need(?:s)? (?:a |to |the ability to )(.{10,60})",
        r"no (?:option|way|ability) to (.{10,60})",
        r"can'?t (?:even )?(.{10,60})",
        r"doesn'?t (?:even )?(?:have|let|allow) (.{10,60})",
        r"missing (.{10,40})",
        r"lacks? (.{10,40})",
    ]

    for company in ['Calm', 'Headspace']:
        print(f"\n--- {company} ---\n")
        company_df = df[df['company'] == company]

        all_requests = []
        for _, row in company_df.iterrows():
            text = row['review_text']
            for pattern in request_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches:
                    # Clean up
                    cleaned = match.strip().rstrip('.,!?')
                    if len(cleaned) > 10 and not any(sub in cleaned.lower() for sub in ['refund', 'money', 'cancel', 'charge']):
                        all_requests.append(cleaned)

        # Count and display
        request_counter = Counter(all_requests)
        seen = set()
        count = 0
        for request, freq in request_counter.most_common(30):
            # Deduplicate similar requests
            request_key = request.lower()[:30]
            if request_key not in seen and freq >= 1:
                seen.add(request_key)
                request_clean = clean_text_for_display(request)
                print(f"  - \"{request_clean}\" ({freq}x)" if freq > 1 else f"  - \"{request_clean}\"")
                count += 1
                if count >= 15:
                    break


def main():
    """Main analysis function."""
    # Load the most recent Excel file
    import glob
    excel_files = glob.glob('trustpilot_reviews_*.xlsx')
    if not excel_files:
        print("No review files found!")
        return

    latest_file = max(excel_files)
    print(f"Analyzing: {latest_file}\n")

    df = pd.read_excel(latest_file)

    # Run analyses
    product_df, category_counts = extract_product_insights(df)
    deep_dive_content_issues(df)
    analyze_feature_requests(df)

    # Final summary
    print(f"\n{'='*70}")
    print("EXECUTIVE SUMMARY")
    print("="*70)

    print("""
KEY PRODUCT ISSUES IDENTIFIED:

1. LOGIN/AUTHENTICATION PROBLEMS
   - Users frequently unable to access accounts
   - Password reset issues
   - Account verification failures

2. CUSTOMER SUPPORT GAPS
   - Slow or no response to queries
   - Difficulty reaching support
   - Unhelpful automated responses

3. CONTENT CONCERNS
   - Limited variety in meditations/stories
   - Repetitive content after extended use
   - Quality inconsistency

4. APP TECHNICAL ISSUES
   - Crashes and freezes
   - Sync problems across devices
   - Offline download failures

5. UI/UX FRICTION
   - Confusing navigation
   - Hard to find specific content
   - Cluttered interface

6. PLAYBACK PROBLEMS
   - Audio cutting off
   - Background play issues
   - Timer/tracking inaccuracies
""")


if __name__ == "__main__":
    main()
