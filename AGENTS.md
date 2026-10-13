# Repository instructions

This repository is the canonical source for the AI Dungeon Continuity Kit.

- Pull the current default branch before starting a new release.
- Preserve existing AI Dungeon behavior and saved-state compatibility unless a breaking change is explicitly requested.
- Keep source modules, the generated `Library.js`, tests, documentation, changelog, and release ZIP synchronized.
- Run `python3 build.py` and every `tests/*.cjs` file with Node before publishing.
- Update the version in generated diagnostics, README, changelog, test results, and release guide.
- Put installable archives in `releases/` and retain older releases unless deletion is explicitly requested.
- Do not claim live AI Dungeon validation without testing in AI Dungeon.
- Do not assume access to undocumented AI Dungeon Auto Cards APIs.

