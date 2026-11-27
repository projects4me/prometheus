# Visual baseline

Full-page screenshots of every page, taken before Prometheus moves off Bootstrap 3 and AdminLTE 2 onto its own CSS
foundation (aprom-4999).

The first phases of that migration must not change how the app looks: tokens, an icon component, removing the
Bootstrap/AdminLTE JS, and the new base CSS. The acceptance tests check behaviour and the DOM, not pixels, so each of
those PRs is compared against these images.

- `desktop/` is 1440 px wide and `phone/` is 390 px wide. Each holds 35 pages: the app shell pages, the project
  pages, settings, and every Component Library entry.
- `manifest.json` records when the screenshots were taken, the app URL, the project and issue used, the Prometheus
  branch and commit, and the viewports.

They were taken against the local stack (project `aprom`, issue 3980) with a throwaway Playwright tool kept outside
this repo:
- the viewports are fixed and the browser uses the user's profile timezone;
- animations and Chart.js animation are off;
- relative times ("… ago") are masked.

Two consecutive captures matched on every image.

Comparisons are only meaningful on the same data. Take a fresh "before" set on your own database, then the "after"
set, rather than comparing your run with these images directly.
