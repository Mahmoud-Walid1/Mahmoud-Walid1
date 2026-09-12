/**
 * UI Renderer & Interaction Engine
 * Repository cards rendering, debounced instant search, filter chips, and skeletons.
 */

import { LANGUAGE_COLORS } from './github.js';

export function renderRepositories(repos, containerId = 'repos-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (repos.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; border-radius: var(--radius-lg); background: var(--slate-900); border: 1px solid var(--border-subtle);">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 12px; color: var(--slate-500);">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h4 style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">No repositories match your filter</h4>
        <p style="font-size: 0.8125rem; color: var(--text-muted);">Try adjusting your search query or selecting a different language filter chip.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = repos
    .map((repo) => {
      const langColor = LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.Other;

      return `
      <article class="repo-card">
        <div class="repo-header">
          <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="repo-name">
            ${escapeHtml(repo.name)}
          </a>
          <span class="repo-lang-badge">
            <span class="repo-lang-dot" style="background-color: ${langColor};"></span>
            ${escapeHtml(repo.language)}
          </span>
        </div>

        <p class="repo-desc">
          ${escapeHtml(repo.description)}
        </p>

        <div class="repo-meta">
          <div class="repo-stats">
            <span class="repo-stat" title="Stars">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${repo.stars}</span>
            </span>
            <span class="repo-stat" title="Forks">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="6" y1="3" x2="6" y2="15"></line>
                <circle cx="18" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <path d="M18 9a9 9 0 0 1-9 9"></path>
              </svg>
              <span>${repo.forks}</span>
            </span>
          </div>

          <div>
            <span style="color: var(--slate-500); font-family: var(--font-mono); font-size: 0.6875rem; display: inline-flex; align-items: center; gap: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Updated ${repo.updatedAt}</span>
            </span>
          </div>
        </div>
      </article>
    `;
    })
    .join('');
}

export function renderSkeletons(containerId = 'repos-container', count = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = Array(count)
    .fill(0)
    .map(
      () => `
      <div class="skeleton-card">
        <div class="skeleton-shimmer"></div>
        <div style="display: flex; justify-content: space-between; gap: 12px;">
          <div class="skeleton-line" style="width: 55%; height: 16px;"></div>
          <div class="skeleton-line" style="width: 25%; height: 14px;"></div>
        </div>
        <div style="space-y: 8px;">
          <div class="skeleton-line" style="width: 100%; margin-bottom: 8px;"></div>
          <div class="skeleton-line" style="width: 80%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
          <div class="skeleton-line" style="width: 30%;"></div>
          <div class="skeleton-line" style="width: 25%;"></div>
        </div>
      </div>
    `
    )
    .join('');
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
