# "for:anya.v3"

import sys
import subprocess
import json
import re
import random

# Auto-install missing packages silently
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    import requests
    from bs4 import BeautifulSoup

def get_file_size_stalker(session, url):
    """Obtains video file size via HEAD request without downloading the file"""
    try:
        res = session.head(url, allow_redirects=True, timeout=5)
        content_length = res.headers.get('content-length') or res.headers.get('Content-Length')
        if content_length and content_length.isdigit():
            size_bytes = int(content_length)
            size_mb = size_bytes / (1024 * 1024)
            if size_mb >= 1024:
                return f"{size_mb / 1024:.2f} GB"
            return f"{size_mb:.2f} MB"
    except Exception:
        pass
    return "Unknown"

def scrape_tik_porn(page=None, limit=1):
    if not page or str(page).lower() == "random":
        page_num = random.randint(1, 50)
    else:
        try:
            page_num = int(page)
        except ValueError:
            page_num = random.randint(1, 50)

    base_url = "https://tik.porn"
    page_url = base_url if page_num <= 1 else f"{base_url}/page/{page_num}/"

    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    })

    try:
        res = session.get(page_url, timeout=30)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, 'html.parser')

        video_links = []
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            if href and '/video/' in href:
                full_url = href if href.startswith('http') else f"{base_url}{href}"
                if full_url not in video_links:
                    video_links.append(full_url)

        target_urls = video_links[:limit]
        results = []

        for v_url in target_urls:
            try:
                v_res = session.get(v_url, timeout=30)
                v_soup = BeautifulSoup(v_res.text, 'html.parser')

                raw_mp4_urls = []
                mp4_pattern = r'https?://[^\s"\']+\.mp4[^\s"\']*'
                raw_mp4_urls.extend(re.findall(mp4_pattern, v_res.text))

                for src_tag in v_soup.find_all('source'):
                    src = src_tag.get('src')
                    if src:
                        raw_mp4_urls.append(src)

                valid_mp4s = []
                for candidate in raw_mp4_urls:
                    full_mp4 = candidate if candidate.startswith('http') else f"{base_url}{candidate}"
                    clean_path = full_mp4.split('?')[0]
                    if clean_path.lower().endswith('.mp4') and full_mp4 not in valid_mp4s:
                        valid_mp4s.append(full_mp4)

                for mp4_url in valid_mp4s:
                    file_size = get_file_size_stalker(session, mp4_url)
                    results.append({
                        "size": file_size,
                        "url": mp4_url
                    })

            except Exception:
                pass

        # Write clean JSON array directly to stdout for Node.js
        sys.stdout.write(json.dumps(results, ensure_ascii=False))

    except Exception:
        sys.stdout.write("[]")

if __name__ == "__main__":
    raw_config = sys.argv[1] if len(sys.argv) > 1 else "{}"
    try:
        config = json.loads(raw_config)
    except Exception:
        config = {}

    scrape_tik_porn(
        page=config.get("page", None),
        limit=config.get("limit", 1)
    )
