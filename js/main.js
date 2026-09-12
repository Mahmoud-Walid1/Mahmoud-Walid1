/**
 * Application Bootstrap & Lifecycle Orchestrator
 * Connects particles, terminal, GitHub API, search, and filter mechanics.
 */

import { initParticlesCanvas } from './particles.js';
import { initCyberTerminal } from './terminal.js';
import { fetchUserRepositories } from './github.js';
import { renderRepositories, renderSkeletons, debounce } from './ui.js';
import { CONFIG } from './config.js';

let allRepositories = [];
let activeFilter = 'All';
let currentSearchTerm = '';

async function loadRepositories(forceRefresh = false) {
  const syncBtn = document.getElementById('sync-repos-btn');
  const syncIcon = syncBtn?.querySelector('.sync-icon');
  const cacheStatusEl = document.getElementById('cache-status');

  if (syncIcon) syncIcon.style.animation = 'spin 1s linear infinite';
  renderSkeletons('repos-container', 6);

  try {
    const result = await fetchUserRepositories('Mahmoud-Walid1', forceRefresh);
    allRepositories = result.data;

    // Filter and display
    applyFilters();

    if (cacheStatusEl) {
      if (result.fromCache) {
        const minsAgo = Math.floor((Date.now() - result.timestamp) / 60000);
        cacheStatusEl.textContent = `Cached ${minsAgo}m ago (Local TTL)`;
      } else {
        cacheStatusEl.textContent = `Synced live from GitHub API`;
      }
    }
  } catch (err) {
    console.error('Failed to load repos:', err);
    const container = document.getElementById('repos-container');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 32px; text-align: center; border-radius: var(--radius-lg); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">
          <p style="color: #f87171; font-weight: 600; margin-bottom: 8px;">Failed to reach GitHub API</p>
          <p style="font-size: 0.8125rem; color: var(--slate-400); margin-bottom: 16px;">Rate limit may be reached or network is unavailable.</p>
          <button id="retry-fetch-btn" class="btn btn-secondary" style="font-size: 0.75rem; height: 36px;">Retry Connection</button>
        </div>
      `;
      document.getElementById('retry-fetch-btn')?.addEventListener('click', () => loadRepositories(true));
    }
  } finally {
    if (syncIcon) syncIcon.style.animation = 'none';
  }
}

function applyFilters() {
  let filtered = [...allRepositories];

  // 1. Language / Category Filter
  if (activeFilter === 'Demos Only') {
    filtered = filtered.filter((r) => Boolean(r.homepage));
  } else if (activeFilter === 'HTML/CSS') {
    filtered = filtered.filter((r) => r.language === 'HTML' || r.language === 'CSS');
  } else if (activeFilter !== 'All') {
    filtered = filtered.filter((r) => r.language === activeFilter);
  }

  // 2. Search Term Filter
  if (currentSearchTerm.trim()) {
    const term = currentSearchTerm.toLowerCase();
    filtered = filtered.filter(
      (r) => r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term)
    );
  }

  renderRepositories(filtered, 'repos-container');

  // Update Count Badge
  const countEl = document.getElementById('repos-count');
  if (countEl) countEl.textContent = `${filtered.length} of ${allRepositories.length} repositories`;
}

function setupFilterEvents() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter') || 'All';
      applyFilters();
    });
  });

  const searchInput = document.getElementById('repo-search-input');
  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce((e) => {
        currentSearchTerm = e.target.value;
        applyFilters();
      }, 200)
    );
  }

  const syncBtn = document.getElementById('sync-repos-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      loadRepositories(true);
    });
  }
}

function renderSkillsMatrix() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  container.innerHTML = CONFIG.skills
    .map(
      (cat) => `
      <div style="background: var(--bg-surface-glass); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: var(--space-5); transition: border-color var(--duration-standard) var(--ease-enter);">
        <h4 style="font-size: 0.875rem; font-family: var(--font-mono); font-weight: 700; color: var(--cyan-400); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-3);">
          ${cat.category}
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
          ${cat.items
            .map(
              (item) => `
            <span style="padding: 4px 10px; background: var(--slate-800); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 500; color: var(--slate-200);">
              ${item}
            </span>
          `
            )
            .join('')}
        </div>
      </div>
    `
    )
    .join('');
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initParticlesCanvas('particle-canvas');
  initCyberTerminal('cyber-terminal');
  setupFilterEvents();
  renderSkillsMatrix();
  loadRepositories(false);
});
