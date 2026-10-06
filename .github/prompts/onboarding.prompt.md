---
mode: agent
description: Onboard a new QA or developer — install LatteQ, prove the setup, and learn to use the AI skills
---

Follow `.claude/skills/onboarding/SKILL.md` exactly:

1. Ask my role (QA or Dev), my AI tool (Claude Code, Copilot, or both) and my OS.
2. Check prerequisites (`node --version`, `npm --version`, `git --version`) and install only what's missing — ask before any global install.
3. Install: `npm ci`, `npx playwright install chromium`, and `npx playwright install chrome` if Chrome isn't installed.
4. Explain the optional `GH_USER` / `GH_PASS` variables (copy `.env.example` to `.env`, or set them in the shell). Never ask me for the values or write them for me.
5. Prove the setup: `npm run verify` and `npx playwright test tests/practice/01_tables_datatables.spec.ts`. Report the real output; stop and troubleshoot on failure.
6. Give me the tour for my tool (Track A Claude Code / Track B Copilot in the skill), then suggest a first task for my role.
7. Don't edit project files during setup. Finish with the skill's checklist report.
