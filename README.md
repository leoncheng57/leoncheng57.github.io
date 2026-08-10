# Leon's Website

My personal site, live at [leoncheng.dev](https://leoncheng.dev).

A small home on the web for a short intro and the occasional blog post.

## Homepage

The homepage is an intentionally minimal landing page:

- A short intro and profile image
- Links to find me elsewhere:
  - GitHub: [leoncheng57](https://github.com/leoncheng57/)
  - Email: [leonc@alum.mit.edu](mailto:leonc@alum.mit.edu)
- A link into the blog

## Blog

The blog lives at [`/blog`](https://leoncheng.dev/blog) and is where I write up things I've been thinking about — usually around software, developer tools, and how the craft of building software is changing.

Posts are written in Markdown and kept in [`src/content/blog/`](./src/content/blog), one file per article.

## Development

The [`/repo`](https://leoncheng.dev/repo) section explains the CI, production
deployment, pull-request preview, and planning flows used by this repository.

Install dependencies and start Vite locally:

```bash
npm install
npm run dev
```

Run the same validation used by pull-request CI:

```bash
npm run lint
npm run test:run
npm run build
```

## Deployment

GitHub Actions owns production and preview deployments. The generated `docs/`
directory is deployment input; source changes belong in `src/` and `public/`.

- Pushes to `main` build the site at `/` and deploy it to the root of the
  `gh-pages` branch.
- Pull requests build with a PR-specific base path and deploy to
  `gh-pages:/previews/pr-<number>/`.
- The preview workflow posts `https://leoncheng.dev/previews/pr-<number>/` to
  the pull request and removes that directory when the pull request closes.
- Production deploys preserve the entire `previews/` subtree.

GitHub Pages must use **Deploy from a branch**, with `gh-pages` and `/(root)`
as its publishing source. Production and preview workflows share one
`gh-pages-deploy` concurrency group and use non-force pushes so their commits
cannot overwrite one another.

For the initial migration from `main:/docs`, run the production deployment
manually and verify `index.html`, `CNAME`, `.nojekyll`, and `assets/` exist on
`gh-pages` before changing the Pages publishing source.
