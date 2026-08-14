# PRV Station Sizing & Budget Quote — static deploy

One file. No build step, no dependencies, no npm install.

Vercel: New Project, import this repo, **Deploy**. Leave every setting alone —
Framework Preset "Other", no build command, no output directory. Vercel serves
`index.html` directly.

This is the same application as the source project, pre-compiled with React
bundled in. To update it after a change to `src/App.jsx` in the main repo, run
`npm run standalone` there and copy the resulting `PRV-Quote-Tool.html` over
`index.html` here.

Keep this repository **private**: `index.html` contains PL2026 list pricing, the
distributor multiplier and the margin.
