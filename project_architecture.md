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
│       ├── akeel.gif                   # Akeel food tech platform preview (animated)
│       └── tafra.png                   # Tafra technology acceleration platform logo
│
├── css/                                # Modular Styling System
│   ├── tokens.css                      # Design tokens (4px scale, 100-900 ramps, easing, fonts)
│   ├── layout.css                      # Grid container, hero console, terminal, projects grid & footer
│   └── components.css                  # Cards, buttons, badges, arcade container, ventures, skeletons
│
└── js/                                 # Modular Logic (Clean Architecture ES6)
    ├── config.js                       # Social links, profile metadata & terminal dictionary
    ├── particles.js                    # Interactive cyber grid canvas background (60fps)
    ├── tictactoe.js                    # Casual Tic-Tac-Toe (X-O) mini-game with AI and score tracking
    ├── snake.js                        # Classic Snake arcade mini-game with D-Pad & keyboard controls
    ├── game.js                         # Cyber Dash: Bug Dodger 2D canvas arcade engine & Web Audio
    ├── github.js                       # GitHub REST API client with localStorage TTL caching
    ├── terminal.js                     # Interactive cyber terminal prompt emulator
    ├── ui.js                           # DOM renderer, search debouncing & filter chips
    └── main.js                         # Application bootstrap & lifecycle orchestrator
```

---

## File Responsibilities Matrix

| File | Primary Responsibility | Key Interfaces / Exports |
| :--- | :--- | :--- |
| `css/tokens.css` | Color ramps, spacing scale, typographic hierarchy, elevation | CSS variables (`:root`) |
| `css/layout.css` | Page sections, hero telemetry console, flex/grid alignment, responsive | Layout classes |
| `css/components.css` | Component styling (buttons, venture cards, arcade container, XO, snake) | Component classes |
| `js/config.js` | User configuration, terminal command responses, links | `CONFIG` object |
| `js/particles.js` | Canvas initialization, 2D particle simulation, mouse interaction | `initParticlesCanvas()` |
| `js/tictactoe.js` | Universal Tic-Tac-Toe (X-O) casual mini-game with Smart AI & sound | `initTicTacToe()` |
| `js/snake.js` | Classic retro Snake arcade game, speed ramp, D-Pad touch controls | `initSnakeGame()` |
| `js/game.js` | 2D Canvas runner game engine, collision physics, synth sound, high scores | `initArcadeGame()` |
| `js/github.js` | Fetching repos, caching with 45m TTL, parsing demo links | `fetchUserRepositories()` |
| `js/terminal.js` | Parsing terminal commands, auto-typing, terminal history | `initCyberTerminal()` |
| `js/ui.js` | Rendering repo cards, search debouncing (200ms), topic pills | `renderRepositories()`, `setupFilters()` |
| `js/main.js` | Initializing modules (particles, terminal, casual games, github sync) | DOMContentLoaded listener |
