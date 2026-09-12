/**
 * GitHub REST API Client
 * Dynamic repository fetcher with localStorage TTL caching and demo extraction.
 */

const CACHE_KEY = 'vibe_github_repos_cache';
const CACHE_TTL_MS = 45 * 60 * 1000; // 45 Minutes

export const LANGUAGE_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  C: '#555555',
  'C++': '#f34b7d',
  Other: '#00f2fe',
};

export async function fetchUserRepositories(username = 'Mahmoud-Walid1', forceRefresh = false) {
  // 1. Check LocalStorage Cache if not forcing refresh
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS && Array.isArray(data) && data.length > 0) {
          return { data, fromCache: true, timestamp };
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
  }

  // 2. Fetch from GitHub REST API
  const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const rawRepos = await response.json();

    // 3. Process & Clean Repositories
    const processed = rawRepos
      .filter((repo) => !repo.fork) // Exclude forks for clean portfolio showcase
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description || 'Modern software experiment & AI-accelerated repository.',
        language: repo.language || 'Other',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        url: repo.html_url,
        homepage: repo.homepage && repo.homepage.trim().length > 0 ? repo.homepage.trim() : null,
        updatedAt: new Date(repo.updated_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }));

    // 4. Save to Cache
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: processed,
        })
      );
    } catch (e) {
      console.warn('Cache write error:', e);
    }

    return { data: processed, fromCache: false, timestamp: Date.now() };
  } catch (err) {
    console.error('Failed to fetch from GitHub API, falling back to cache if available:', err);

    // Fallback: try cache even if expired
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        if (data && data.length > 0) return { data, fromCache: true, isStale: true };
      }
    } catch (_) {}

    throw err;
  }
}
