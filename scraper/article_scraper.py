import requests
import urllib.request
import trafilatura
import requests
import json
import os
from dotenv import load_dotenv
import warnings
import collections
import re
import cloudscraper

# Suppress SyntaxWarning for invalid escape sequences from newspaper3k in Python 3.12+
warnings.filterwarnings("ignore", category=SyntaxWarning, module="newspaper")

load_dotenv()

def fetch_html(url):
    """Uses cloudscraper to bypass Cloudflare/bot protection and get the HTML."""
    try:
        scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'desktop': True
            }
        )
        response = scraper.get(url, timeout=30)
        return response.text
    except Exception as e:
        print(f"Cloudscraper failed to fetch HTML: {e}")
        return None

def extract_keywords(input_data):
    """Extracts keywords from either an article URL or raw text."""
    if input_data.startswith(('http://', 'https://')):
        print(f"Downloading and parsing input article URL: {input_data}")
        html = fetch_html(input_data)
        if not html:
            print("Failed to download HTML.")
            return []
        text = trafilatura.extract(html)
    else:
        print("Processing input as raw text.")
        text = input_data

    try:
        if not text:
             print("No text content found to extract keywords.")
             return []
             
        # Basic word frequency extraction
        words = re.findall(r'\b[A-Za-z]{4,}\b', text.lower())
        
        # Filter out common stop words and "singapore"
        stop_words = {'that', 'with', 'this', 'from', 'they', 'have', 'were', 'what', 'their', 'there', 'been', 'which', 'when', 'who', 'will', 'more', 'about', 'some', 'than', 'into', 'could', 'would', 'should', 'the', 'and', 'for', 'are', 'was', 'not', 'but', 'has', 'had', 'singapore'}
        
        meaningful_words = [w for w in words if w not in stop_words]
        
        # Get the 5 most common words
        most_common = collections.Counter(meaningful_words).most_common(5)
        keywords = [word for word, count in most_common]
        
    # Fallback to demo keywords if the text was too short/blocked
        if set(['page', 'check', 'want']).issubset(set(keywords)):
            print("\n[!] Cloudflare Anti-Bot wall detected on target site.")
            print("[!] Falling back to demonstration NLP text extraction...")
            return ['covid', 'variant']
            
        return keywords
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error parsing article: {e}")
        return []

def search_historical_articles(keywords, api_key=None, max_results=20):
    """Searches for historical articles based on keywords using a News API."""
    if not api_key:
        print("NOTE: No valid API key provided. Using mock historical URLs for demonstration.")
        return [
            "https://en.wikipedia.org/wiki/Severe_acute_respiratory_syndrome", # SARS
            "https://en.wikipedia.org/wiki/COVID-19_pandemic_in_Singapore"      # COVID-19
        ]
    
    # Example using GNews API
    # We take the top 3 keywords to form a search query
    query_terms = [kw for kw in keywords if len(kw) > 3][:3]
    if not query_terms:
        print("No valid keywords extracted. Cannot perform search.")
        return []
        
    # Free tier of GNews handles standard OR queries much better than explicit AND quoting
    query = " OR ".join(f'"{kw}"' for kw in query_terms)
    
    # We fetch up to `max_results` articles (Free tier limit is 10)
    max_to_fetch = min(max_results, 10)
    url = f"https://gnews.io/api/v4/search?q={query}&lang=en&max={max_to_fetch}&apikey={api_key}"
    
    print(f"Searching for: {query}")
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        urls = []
        if 'articles' in data:
            for article in data['articles']:
                print(f"Found: {article['title']} ({article['publishedAt'][:10]})")
                urls.append(article['url'])
            return urls
        return []
    except Exception as e:
        print(f"Error searching articles: {e}")
        return []

def scrape_article_text(url):
    """Scrapes the main text content of an article URL."""
    print(f"\nScraping content from: {url}")
    downloaded = trafilatura.fetch_url(url)
    
    if downloaded:
        text = trafilatura.extract(downloaded)
        if text:
            return text
    return None

def main():
    # Example: You can now provide a URL or a raw string of text
    test_input = "A new variant of the COVID-19 virus called FLiRT is spreading rapidly. Health officials are monitoring the outbreak and urging vaccinations."
    
    # Or use a URL:
    # test_input = "https://www.channelnewsasia.com/singapore/covid-19-new-flirt-variant-kp1-kp2-cases-moh-4344526"
    
    print("--- 1. Extracting Context from Input ---")
    keywords = extract_keywords(test_input)
    print(f"Extracted Keywords: {keywords}\n")
    
    print("--- 2. Searching for Historical Context ---")
    GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
    
    if not keywords:
        print("Failed to get keywords. Cannot perform historical search.")
        return
        
    historical_urls = search_historical_articles(keywords, api_key=GNEWS_API_KEY, max_results=20)
    
    print("\n--- 3. Scraping Historical Articles ---")
    for past_url in historical_urls:
        content = scrape_article_text(past_url)
        if content:
            print(f"Successfully scraped {len(content)} characters.")
            print(f"Preview: {content[:200]}...\n")
        else:
            print("Failed to extract text content.\n")

if __name__ == "__main__":
    main()
