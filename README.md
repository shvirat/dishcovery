# Dishcovery

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)](https://github.com/)

A small, dependency-free static frontend for discovering dishes and recipes. Built with plain HTML, CSS and JavaScript — ideal for demos, prototypes, and static hosting (GitHub Pages).

## Demo

Open `frontend/index.html` locally in your browser, or serve the `frontend/` folder as described below.

## Quick start

1. Clone the repo:

    ```powershell
    git clone <your-repo-url>
    cd Dishcovery
    ```

2. Serve the frontend (recommended to avoid asset/path issues):

    ```powershell
    python -m http.server 3000 --directory frontend
    # or
    npx http-server frontend -p 3000
    ```

3. Open http://localhost:3000 in your browser.

## Deploy to GitHub Pages

Option A — Use `docs/` on `main` (recommended for static frontend):

- Copy the contents of `frontend/` into a `docs/` folder at the repository root and commit.
- In your repository Settings → Pages, set the source to the `main` branch and the `/docs` folder.

Option B — `gh-pages` branch:

- Use a deployment action or a tool (e.g. `gh-pages` npm package) to publish `frontend/` to a `gh-pages` branch.

## What’s included

- `frontend/index.html` — main static UI
- `frontend/css/` — styles (utility, layout sections)
- `frontend/js/` — `script.js` and `randRec.js` for UI behavior
- `frontend/assets/` — logos and SVGs
- `backend/` — optional placeholder for server/API code

## Tech

- Vanilla HTML, CSS, JavaScript
- No build tools required

## Integrating a backend (optional)

If you add a backend API, keep the frontend expecting simple JSON endpoints such as:

- GET /api/search?q=...  -> array of recipe objects
- GET /api/random       -> a single recipe or small array

Recipe object example:

```json
{
  "id": "string",
  "title": "string",
  "image": "url"
}
```

## Contributing

- Small, focused pull requests are preferred.
- Include screenshots or short notes for UI changes.

## License

MIT — add a `LICENSE` file if you haven't already.

---

If you want, I can also:
- Add a `docs/` copy of the frontend and commit it so GitHub Pages can be enabled with zero extra steps.
- Create a minimal `package.json` and an npm script to publish to `gh-pages` automatically.

Tell me which of these you'd like me to do next.



<!-- End of README -->
