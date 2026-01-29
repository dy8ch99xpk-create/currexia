#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';

const freq = process.argv[2] || 'daily';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY environment variable is required.');
  process.exit(1);
}

const prompt = `Generate a concise ${freq} forex market update for a dashboard. Include a short 2-3 sentence summary and 3-6 bullet points with specific pair notes (EUR/USD, GBP/USD, USD/JPY, XAU/USD) and a brief risk note. Keep it under 300 words.`;

async function generate() {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful market research assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 700,
      temperature: 0.6
    })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${txt}`);
  }
  const body = await res.json();
  const content = body.choices?.[0]?.message?.content || body.choices?.[0]?.text || '';
  return content.trim();
}

(async () => {
  try {
    console.log('Generating update...', freq);
    const content = await generate();
    const now = new Date().toISOString();
    const raw = await fs.readFile('updates.json', 'utf8').catch(() => '{"updates":[]}');
    const data = JSON.parse(raw);
    data.updates = data.updates || [];
    data.updates.push({ frequency: freq, date: now, content });
    await fs.writeFile('updates.json', JSON.stringify(data, null, 2));
    console.log('Wrote updates.json');

    // Commit changes if running in CI with push permissions
    if (process.env.GITHUB_ACTIONS || process.env.GITHUB_TOKEN) {
      try {
        execSync('git config user.name "github-actions[bot]"');
        execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');
        execSync('git add updates.json');
        execSync(`git commit -m "Automated ${freq} update: ${now}" || true`);
        execSync('git push');
        console.log('Committed and pushed updates.json');
      } catch (e) {
        console.error('Git commit/push failed (CI may not have push permission):', e.message);
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
