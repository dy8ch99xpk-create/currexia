#!/usr/bin/env python3
"""
One-off Python generator that calls OpenAI and appends a daily/weekly update to updates.json.
Usage:
  export OPENAI_API_KEY="sk-..."
  python3 scripts/generate_update_py.py daily
"""
import os
import sys
import json
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import HTTPError

def call_openai(prompt, api_key):
    url = 'https://api.openai.com/v1/chat/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    body = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': [
            {'role': 'system', 'content': 'You are a helpful market research assistant.'},
            {'role': 'user', 'content': prompt}
        ],
        'max_tokens': 700,
        'temperature': 0.6
    }).encode('utf-8')
    req = Request(url, data=body, headers=headers, method='POST')
    try:
        with urlopen(req, timeout=60) as resp:
            return json.load(resp)
    except HTTPError as e:
        print('OpenAI API error:', e.read().decode(), file=sys.stderr)
        raise

def main():
    if len(sys.argv) > 1:
        freq = sys.argv[1]
    else:
        freq = 'daily'
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print('Please set OPENAI_API_KEY environment variable (do not paste key in chat).')
        sys.exit(1)

    prompt = f"Generate a concise {freq} forex market update for a dashboard. Include a short 2-3 sentence summary and 3-6 bullet points with specific pair notes (EUR/USD, GBP/USD, USD/JPY, XAU/USD) and a brief risk note. Keep it under 300 words."
    print('Calling OpenAI...')
    resp = call_openai(prompt, api_key)
    # Extract message
    content = ''
    try:
        content = resp.get('choices', [])[0].get('message', {}).get('content', '')
    except Exception:
        content = ''
    if not content:
        print('No content returned from OpenAI', file=sys.stderr)
        sys.exit(1)

    now = datetime.utcnow().isoformat() + 'Z'
    fname = 'updates.json'
    try:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        data = {'updates': []}
    data.setdefault('updates', []).append({'frequency': freq, 'date': now, 'content': content})
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print('Wrote update to', fname)

if __name__ == '__main__':
    main()
