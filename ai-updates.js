async function fetchUpdates() {
  try {
    const res = await fetch('updates.json', {cache: 'no-store'});
    if (!res.ok) return null;
    const data = await res.json();
    return data.updates || [];
  } catch (e) {
    console.error('Failed to load updates.json', e);
    return [];
  }
}

function renderWidget(updates) {
  const container = document.createElement('div');
  container.className = 'widget ai-updates-widget';

  const title = document.createElement('h3');
  title.textContent = 'AI Market Updates';
  container.appendChild(title);

  const info = document.createElement('p');
  info.style.fontSize = '13px';
  info.style.opacity = '0.9';
  info.textContent = 'Automated market summaries (daily / weekly).';
  container.appendChild(info);

  const select = document.createElement('select');
  select.innerHTML = '<option value="all">All</option><option value="daily">Daily</option><option value="weekly">Weekly</option>';
  select.style.marginBottom = '8px';
  container.appendChild(select);

  const list = document.createElement('div');
  list.style.maxHeight = '300px';
  list.style.overflow = 'auto';
  list.style.marginTop = '8px';
  container.appendChild(list);

  function updateList() {
    const freq = select.value;
    list.innerHTML = '';
    const filtered = freq === 'all' ? updates : updates.filter(u => u.frequency === freq);
    if (filtered.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No updates yet. Set up GitHub Actions or run the generator locally.';
      list.appendChild(p);
      return;
    }
    filtered.slice().reverse().forEach(u => {
      const d = document.createElement('div');
      d.style.marginBottom = '12px';
      const h = document.createElement('strong');
      h.textContent = `${u.frequency.toUpperCase()} — ${new Date(u.date).toLocaleString()}`;
      d.appendChild(h);
      const p = document.createElement('p');
      p.style.fontSize = '13px';
      p.style.margin = '6px 0 0 0';
      p.innerHTML = u.content.replace(/\n/g, '<br>');
      d.appendChild(p);
      list.appendChild(d);
    });
  }

  select.addEventListener('change', updateList);
  updateList();

  // Action buttons / instructions
  const btn = document.createElement('button');
  btn.textContent = 'How to enable updates';
  btn.style.marginTop = '10px';
  btn.onclick = () => {
    alert('To enable automated updates: push this repo to GitHub, add secret OPENAI_API_KEY in repository settings, and enable the provided GitHub Actions workflows. See README.md for full steps.');
  };
  container.appendChild(btn);

  // Insert widget into the sidebar area (fallback to body end)
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.prepend(container);
  else document.body.appendChild(container);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const updates = await fetchUpdates();
  renderWidget(updates);
});
