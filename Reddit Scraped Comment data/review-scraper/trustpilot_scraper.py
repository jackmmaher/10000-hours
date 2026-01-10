"""
Trustpilot Review Scraper
Scrapes reviews from Trustpilot pages using embedded JSON data and exports to Excel.
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import json
from datetime import datetime


def get_headers():
    """Return headers to mimic a browser request."""
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    }


def extract_json_data(html_content):
    """Extract the __NEXT_DATA__ JSON from the page."""
    soup = BeautifulSoup(html_content, 'html.parser')
    next_data_script = soup.find('script', id='__NEXT_DATA__')
    if next_data_script:
        return json.loads(next_data_script.string)
    return None


def get_total_reviews_and_pages(data):
    """Get total review count and calculate total pages."""
    business_unit = data.get('props', {}).get('pageProps', {}).get('businessUnit', {})
    total_reviews = business_unit.get('numberOfReviews', 0)
    # Trustpilot shows 20 reviews per page
    total_pages = (total_reviews + 19) // 20
    return total_reviews, total_pages


def extract_reviews_from_json(data):
    """Extract reviews from the JSON data."""
    reviews = []
    page_props = data.get('props', {}).get('pageProps', {})
    raw_reviews = page_props.get('reviews', [])

    for review in raw_reviews:
        # Extract rating
        rating = review.get('rating')

        # Extract date - prefer publishedDate
        dates = review.get('dates', {})
        date = dates.get('publishedDate') or dates.get('experiencedDate')

        # Extract review text
        text = review.get('text', '')

        if rating is not None and text:
            reviews.append({
                'rating': rating,
                'date': date,
                'review_text': text
            })

    return reviews


def scrape_trustpilot(url, company_name):
    """Scrape all reviews from a Trustpilot company page."""
    print(f"\nScraping reviews for: {company_name}")
    print(f"URL: {url}")

    all_reviews = []
    page = 1
    total_pages = None
    total_reviews = None

    while True:
        page_url = f"{url}?page={page}"
        print(f"  Fetching page {page}...", end=" ")

        try:
            response = requests.get(page_url, headers=get_headers(), timeout=30)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Error: {e}")
            break

        # Extract JSON data from page
        data = extract_json_data(response.text)
        if not data:
            print("Failed to extract JSON data")
            break

        # Get total pages on first request
        if total_pages is None:
            total_reviews, total_pages = get_total_reviews_and_pages(data)
            print(f"(Total reviews: {total_reviews}, Pages: {total_pages})")
        else:
            print()

        # Extract reviews from JSON
        page_reviews = extract_reviews_from_json(data)

        if not page_reviews:
            # Check if redirected to login page
            page_props = data.get('props', {}).get('pageProps', {})
            if 'isSignup' in page_props or 'redirectUrl' in page_props:
                print(f"  Reached Trustpilot's login wall (max ~200 reviews without auth).")
            else:
                print(f"  No reviews found on page {page}.")
            break

        # Add company name to each review
        for review in page_reviews:
            review['company'] = company_name

        all_reviews.extend(page_reviews)
        print(f"  Found {len(page_reviews)} reviews (Total: {len(all_reviews)})")

        # Check if we've reached the last page
        if page >= total_pages:
            print("  Reached last page.")
            break

        page += 1
        # Be polite - add delay between requests
        time.sleep(1.0)

    return all_reviews


def save_to_excel(reviews, filename):
    """Save reviews to an Excel file."""
    if not reviews:
        print("No reviews to save!")
        return

    df = pd.DataFrame(reviews)

    # Reorder columns
    columns = ['company', 'rating', 'date', 'review_text']
    df = df[columns]

    # Remove duplicates based on company + review_text (shouldn't happen with JSON method but just in case)
    original_count = len(df)
    df = df.drop_duplicates(subset=['company', 'review_text'], keep='first')
    dedup_count = len(df)

    if original_count != dedup_count:
        print(f"\nRemoved {original_count - dedup_count} duplicate reviews")

    # Save to Excel
    df.to_excel(filename, index=False, engine='openpyxl')
    print(f"Saved {len(df)} reviews to {filename}")


def main():
    """Main function to scrape reviews and save to Excel."""
    # URLs to scrape
    urls = [
        ("https://ie.trustpilot.com/review/calm.com", "Calm"),
        ("https://ie.trustpilot.com/review/headspace.com", "Headspace"),
    ]

    all_reviews = []

    for url, company_name in urls:
        reviews = scrape_trustpilot(url, company_name)
        all_reviews.extend(reviews)

    # Save to Excel
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"trustpilot_reviews_{timestamp}.xlsx"
    save_to_excel(all_reviews, filename)

    # Print summary
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    df = pd.DataFrame(all_reviews)
    if not df.empty:
        for company in df['company'].unique():
            company_df = df[df['company'] == company]
            print(f"\n{company}:")
            print(f"  Total reviews: {len(company_df)}")
            print(f"  Average rating: {company_df['rating'].mean():.2f}")
            print(f"  Rating distribution:")
            for rating in sorted(company_df['rating'].unique(), reverse=True):
                count = len(company_df[company_df['rating'] == rating])
                print(f"    {rating} stars: {count}")


if __name__ == "__main__":
    main()
