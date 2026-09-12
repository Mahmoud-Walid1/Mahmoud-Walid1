# Project Architecture & Context Map

## Project Overview
- **Name**: Mahmoud Walid - Vibe Coder & AI-Native Portfolio
- **Owner**: Mahmoud Walid (`Mahmoud-Walid1`)
- **Theme**: Dark Cyberpunk / Tech Minimalist (Cyan `#00f2fe`, Violet `#8b5cf6`, Slate `#090d16`)
- **Design Standard**: Strict 4px modular grid, systematic design tokens, zero-emoji policy, Doherty-compliant performance (<400ms).
- **Deployment**: Static Plug-and-Play (GitHub Pages & Vercel compatible without build steps).

---

## Folder Structure & Responsibilities

```text
d:\downloads\MY portoflio/
│
├── project_architecture.md             # Continuous context index & file mapping
├── index.html                          # Semantic single-page application & canvas root
├── README.md                           # GitHub profile README with live telemetry & ventures
│
├── assets/                             # Visual Vector & Brand Assets (Zero-Emoji Standard)
│   ├── bot-cyber.svg                   # Vector Cyber-Bot graphic
│   ├── favicon.svg                     # Cyberpunk brand mark icon
│   └── ventures/                       # Founded Ventures Media
│       ├── akeel.png                   # Akeel food tech platform brand logo
│       └── tafra.png                   # Tafra technology acceleration platform logo
│
├── css/                                # Modular Styling System
│   ├── tokens.css                      # Design tokens (4px scale, 100-900 ramps, easing, fonts)
│   ├── layout.css                      # Grid container, developer profile card, terminal, projects grid & footer
│   └── components.css                  # Venture cards, repository cards, badges, buttons, skeletons
│
└── js/                                 # Modular Logic (Clean Architecture ES6)
    ├── config.js                       # Social links, profile metadata & terminal dictionary
    ├── particles.js                    # Interactive cyber grid canvas background (60fps)
    ├── github.js                       # GitHub REST API client with localStorage TTL caching
    ├── terminal.js                     # Interactive cyber terminal prompt emulator (For Devs Only)
    ├── ui.js                           # DOM renderer, search debouncing & filter chips
    └── main.js                         # Application bootstrap & lifecycle orchestrator
```

---

## File Responsibilities Matrix

| File | Primary Responsibility | Key Interfaces / Exports |
| :--- | :--- | :--- |
| `css/tokens.css` | Color ramps, spacing scale, typographic hierarchy, elevation | CSS variables (`:root`) |
| `css/layout.css` | Page layout, developer profile card, flex/grid alignment, responsive | Layout classes |
| `css/components.css` | Component styling (buttons, venture cards, terminal window, skeletons) | Component classes |
| `js/config.js` | User configuration, terminal command responses, links | `CONFIG` object |
| `js/particles.js` | Canvas initialization, 2D particle simulation, mouse interaction | `initParticlesCanvas()` |
| `js/github.js` | Fetching repos, caching with 45m TTL, parsing demo links | `fetchUserRepositories()` |
| `js/terminal.js` | Parsing terminal commands, auto-typing, terminal history | `initCyberTerminal()` |
| `js/ui.js` | Rendering repo cards, search debouncing (200ms), topic pills | `renderRepositories()`, `setupFilters()` |
| `js/main.js` | Initializing modules (particles, terminal, github sync) | DOMContentLoaded listener |
