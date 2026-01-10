"""
App Store & Google Play Store Review Scraper
Uses iTunes RSS API and google-play-scraper library.
"""

import pandas as pd
from datetime import datetime
import time
import sys
import requests
import json

sys.stdout.reconfigure(encoding='utf-8', errors='replace')


def scrape_app_store_rss(app_id, app_name, country='us', max_pages=10):
    """
    Scrape reviews from Apple App Store using iTunes RSS API.
    The RSS feed provides up to 500 reviews (50 per page, 10 pages).
    """
    print(f"\n{'='*60}")
    print(f"Scraping App Store (RSS): {app_name}")
    print(f"{'='*60}")

    all_reviews = []

    for page in range(1, max_pages + 1):
        url = f"https://itunes.apple.com/{country}/rss/customerreviews/page={page}/id={app_id}/sortby=mostrecent/json"

        print(f"  Fetching page {page}...", end=" ")

        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()

            entries = data.get('feed', {}).get('entry', [])

            if not entries:
                print("No more reviews.")
                break

            # First entry is often app info, not a review
            reviews_on_page = 0
            for entry in entries:
                # Skip if it's app info (no rating)
                if 'im:rating' not in entry:
                    continue

                review = {
                    'source': 'App Store',
                    'company': app_name,
                    'rating': int(entry.get('im:rating', {}).get('label', 0)),
                    'date': entry.get('updated', {}).get('label', ''),
                    'title': entry.get('title', {}).get('label', ''),
                    'review_text': entry.get('content', {}).get('label', ''),
                    'username': entry.get('author', {}).get('name', {}).get('label', ''),
                    'version': entry.get('im:version', {}).get('label', ''),
                }
                all_reviews.append(review)
                reviews_on_page += 1

            print(f"{reviews_on_page} reviews")

            if reviews_on_page == 0:
                break

            time.sleep(0.5)  # Rate limiting

        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            break
        except json.JSONDecodeError:
            print("Invalid JSON response")
            break

    print(f"Total: {len(all_reviews)} reviews from App Store")
    return all_reviews


def scrape_play_store(app_id, app_name, max_reviews=500):
    """Scrape reviews from Google Play Store."""
    from google_play_scraper import Sort, reviews

    print(f"\n{'='*60}")
    print(f"Scraping Google Play: {app_name}")
    print(f"{'='*60}")

    try:
        print(f"Fetching up to {max_reviews} reviews...")

        result, _ = reviews(
            app_id,
            lang='en',
            country='us',
            sort=Sort.NEWEST,
            count=max_reviews,
        )

        reviews_list = []
        for r in result:
            reviews_list.append({
                'source': 'Google Play',
                'company': app_name,
                'rating': r.get('score'),
                'date': r.get('at'),
                'title': '',  # Play Store reviews don't have titles
                'review_text': r.get('content', ''),
                'username': r.get('userName', ''),
                'version': r.get('reviewCreatedVersion', ''),
            })

        print(f"Total: {len(reviews_list)} reviews from Google Play")
        return reviews_list

    except Exception as e:
        print(f"Error scraping Play Store: {e}")
        import traceback
        traceback.print_exc()
        return []


def main():
    """Main function to scrape all app stores."""

    # Apps to scrape
    apps = {
        'Calm': {
            'app_store_id': '571800810',
            'play_store_id': 'com.calm.android',
        },
        'Headspace': {
            'app_store_id': '493145008',
            'play_store_id': 'com.getsomeheadspace.android',
        }
    }

    all_reviews = []

    # Scrape each app from both stores
    for app_name, ids in apps.items():
        # App Store (iOS) - using RSS API
        app_store_reviews = scrape_app_store_rss(
            app_id=ids['app_store_id'],
            app_name=app_name,
            max_pages=10  # Up to 500 reviews
        )
        all_reviews.extend(app_store_reviews)

        time.sleep(2)

        # Play Store (Android)
        play_store_reviews = scrape_play_store(
            app_id=ids['play_store_id'],
            app_name=app_name,
            max_reviews=500
        )
        all_reviews.extend(play_store_reviews)

        time.sleep(2)

    # Convert to DataFrame
    df = pd.DataFrame(all_reviews)

    if df.empty:
        print("\nNo reviews collected!")
        return

    # Save to Excel
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"appstore_reviews_{timestamp}.xlsx"
    df.to_excel(filename, index=False, engine='openpyxl')
    print(f"\n{'='*60}")
    print(f"Saved {len(df)} reviews to {filename}")

    # Print summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")

    for source in df['source'].unique():
        source_df = df[df['source'] == source]
        print(f"\n{source}:")
        for company in source_df['company'].unique():
            company_df = source_df[source_df['company'] == company]
            avg_rating = company_df['rating'].mean()
            print(f"  {company}: {len(company_df)} reviews, avg rating: {avg_rating:.2f}")

            # Rating distribution
            print("    Rating distribution:")
            for rating in sorted(company_df['rating'].dropna().unique(), reverse=True):
                count = len(company_df[company_df['rating'] == rating])
                pct = (count / len(company_df)) * 100
                print(f"      {int(rating)} stars: {count} ({pct:.1f}%)")


if __name__ == "__main__":
    main()
