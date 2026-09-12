/**
 * Interactive Cyber Terminal Emulator
 * Command parser, history tracking, and Easter egg effects.
 */

import { CONFIG } from './config.js';

export function initCyberTerminal(terminalId = 'cyber-terminal') {
  const terminal = document.getElementById(terminalId);
  if (!terminal) return;

  const outputBody = terminal.querySelector('.terminal-body');
  const inputEl = terminal.querySelector('.terminal-input');

  let history = [];
  let historyIndex = -1;

  function printLine(htmlContent, className = 'terminal-line') {
    const line = document.createElement('div');
    line.className = className;
    line.innerHTML = htmlContent;
    outputBody.appendChild(line);
    outputBody.scrollTop = outputBody.scrollHeight;
  }

  function handleCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!cmd) return;

    history.push(cmdRaw);
    historyIndex = history.length;

    // Print Prompt Echo
    printLine(`<span class="terminal-prompt">user@mahmoud:~$</span> ${escapeHtml(cmdRaw)}`);

    switch (cmd) {
      case 'clear':
        outputBody.innerHTML = '';
        break;

      case 'help':
        printLine(CONFIG.terminalResponses.help);
        break;

      case 'vibe':
        printLine(CONFIG.terminalResponses.vibe);
        break;

      case 'skills':
        printLine(CONFIG.terminalResponses.skills);
        break;

      case 'contact':
        printLine(CONFIG.terminalResponses.contact);
        break;

      case 'bot':
        printLine(CONFIG.terminalResponses.bot);
        break;

      case 'projects':
        printLine(`<span class="terminal-system">> Repositories index available below. Scrolling to projects section...</span>`);
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        break;

      case 'matrix':
        printLine(`<span class="terminal-highlight">> INITIATING CYBERPUNK MATRIX SEQUENCE...</span>`);
        triggerMatrixPulse();
        break;

      default:
        printLine(
          `<span class="terminal-system">Command not recognized: "${escapeHtml(cmd)}". Type <span class="terminal-highlight">help</span> for commands.</span>`
        );
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function triggerMatrixPulse() {
    const body = document.body;
    body.style.transition = 'filter 0.5s ease-out';
    body.style.filter = 'hue-rotate(90deg) contrast(1.2)';
    setTimeout(() => {
      body.style.filter = 'none';
    }, 2500);
  }

  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = inputEl.value;
        inputEl.value = '';
        handleCommand(value);
      } else if (e.key === 'ArrowUp') {
        if (history.length > 0 && historyIndex > 0) {
          historyIndex--;
          inputEl.value = history[historyIndex];
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          inputEl.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          inputEl.value = '';
        }
        e.preventDefault();
      }
    });

    // Auto-focus on click anywhere in terminal
    terminal.addEventListener('click', () => {
      inputEl.focus();
    });
  }
}
