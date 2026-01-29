# AI Market Updates — Setup

This site (Currexia) includes an AI-driven updates feature. The site will display generated daily and weekly market summaries from `updates.json`.

What I added
- `ai-updates.js` — client widget that reads `updates.json` and shows updates in the sidebar.
- `updates.json` — storage file where generated updates are appended.
- `scripts/generate-update.js` — Node script that calls OpenAI and appends to `updates.json`.
- GitHub Actions workflows in `.github/workflows/` to run the generator on a schedule.

Enable automated updates (recommended)
1. Push this repo to GitHub.
2. Add secret `OPENAI_API_KEY` in your repository Settings → Secrets.
3. Ensure Actions are enabled for your repo. The workflows `generate-daily.yml` and `generate-weekly.yml` will run on schedule and commit updates to `updates.json`.

Quick deploy options (minimal work):

- GitHub Pages (via web UI):
	1. Create a new GitHub repository, open it in the browser.
	2. Upload the `market-news-website.zip` contents (or drag & drop the extracted files) via "Add file → Upload files" and commit to `main`.
	3. In repo Settings → Pages set Source to `main` / root and save. The site will publish at the provided URL.

- Netlify (drag & drop):
	1. Open https://app.netlify.com/drop and drag the project folder (or the zip file) onto the page.
	2. Netlify will deploy the static site and give you a URL instantly.


Run locally (manual generation)
1. Install Node.js (v18+).
2. From the project root run:
```bash
export OPENAI_API_KEY="sk-..."
node scripts/generate-update.js daily
```
3. Open `index.html` (via Live Server or `python3 -m http.server`) and the new update will appear.

Python (no Node) — quick option
1. Ensure you have `python3` (macOS includes this).
2. Set your key without pasting it into chat:
```bash
export OPENAI_API_KEY="sk-..."
python3 scripts/generate_update_py.py daily
```
3. Open the site (e.g. `python3 -m http.server 5500`) to view the appended update.

Security
- Do not commit your OpenAI API key. Use GitHub Secrets for automation.

Notes
- The generator script uses `gpt-4o-mini` model name; you can change the model in `scripts/generate-update.js`.
