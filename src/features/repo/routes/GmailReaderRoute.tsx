import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../repo.module.css'

const REPO_URL = 'https://github.com/leoncheng57/gmail-reader'
const README_URL = 'https://github.com/leoncheng57/gmail-reader#readme'
const OAUTH_DESKTOP_DOCS_URL =
  'https://developers.google.com/identity/protocols/oauth2/native-app'
const GMAIL_API_DOCS_URL = 'https://developers.google.com/gmail/api/reference/rest'

const REQUEST_FLOW = `React UI :5173
     |
     v  /api/*
Fastify API :3001
     |
     +--> SQLite index
     |    (threads, bodies,
     |     drafts, audit)
     |
     v  readonly + modify
Gmail API`

export default function GmailReaderRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.content}>
        <p className={styles.backLink}>
          <Link to="/repo/alpha-projs">Back to alpha projs</Link>
        </p>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Repo / alpha projs / Gmail reader</p>
          <div className={styles.titleRow}>
            <h1>Gmail Reader</h1>
            <span className={styles.privateBadge}>(private-access-only)</span>
          </div>
        </header>

        <section className={styles.section} aria-labelledby="looks-heading">
          <h2 id="looks-heading">What it looks like</h2>
          <p>
            The inbox view running locally, with two accounts connected side by
            side:
          </p>
          <figure className={styles.screenshotFigure}>
            <img
              src="/alpha-projs/gmail-reader-inbox.png"
              alt="Two side-by-side demo mailbox columns, each with a search box, grouping filters, and a list of labelled threads showing sender, subject, snippet, message count, and date"
              loading="lazy"
              width="1600"
              height="648"
            />
            <figcaption>
              Two demo mailboxes seeded with generated threads - no real mail;
              the addresses are demo.alpha@example.com and
              demo.beta@example.com.
            </figcaption>
          </figure>
        </section>

        <section className={styles.section} aria-labelledby="how-heading">
          <h2 id="how-heading">How it works</h2>
          <p>
            A React + Vite client talks to a loopback-only Fastify API that owns
            the Gmail credentials, the sync loop, and a local SQLite index of the
            full inbox - thread metadata, text and HTML bodies, labels, and
            attachment metadata only.
          </p>
          <pre className={styles.pipeline} aria-label="Request flow">
            <code>{REQUEST_FLOW}</code>
          </pre>
          <p>
            Nothing is written to Gmail directly from a click. Selecting threads
            stages a draft; every affected thread is listed in a review step, and
            only an explicit apply reaches Gmail. The write allowlist is enforced
            in the API, not just the UI: archive means removing{' '}
            <code>INBOX</code>, plus adding or removing existing user labels.
            Nothing deletes, sends, or composes mail. Applies compare fresh Gmail
            labels against the reviewed snapshot, so a change made in Gmail after
            review surfaces as a conflict instead of a guess. Every batch lands
            in an immutable audit history with a conflict-aware undo that only
            touches the labels the original action touched.
          </p>
          <p>
            Message HTML is sanitized before render - remote resources, scripts,
            and unsafe URL schemes are stripped - so opening a message never
            phones home. The SQLite index is bound to the connected account
            email: connecting a different account requires an explicit local
            reset, and drafts cannot be applied under an account other than the
            one that created them.
          </p>
          <p>
            That local-first shape is also why there is no hosted version. A
            static host has nowhere to run the API, nowhere to keep an OAuth
            client secret, and no reason to hold a copy of someone else&apos;s
            mailbox.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="run-heading">
          <h2 id="run-heading">Run it yourself</h2>
          <p>
            Node 22 or newer. The app and its tests run without any Google
            credentials - the UI just starts disconnected and explains what is
            missing.
          </p>
          <div className={styles.command} aria-label="Local setup commands">
            <span>$ git clone git@github.com:leoncheng57/gmail-reader.git</span>
            <span>$ cd gmail-reader</span>
            <span>$ npm install</span>
            <span>$ npm run dev</span>
          </div>
          <p>
            Open <code>http://localhost:5173</code>; the API listens on{' '}
            <code>http://127.0.0.1:3001</code>. To connect a real mailbox you
            need your own Google Cloud project with the Gmail API enabled and an
            OAuth client of type <strong>Desktop app</strong>, scoped to{' '}
            <code>gmail.readonly</code> and <code>gmail.modify</code>. Its JSON
            goes in <code>secrets/google-oauth-client.json</code>; tokens, the
            database, and all local mail data are gitignored. The{' '}
            <a href={README_URL} target="_blank" rel="noreferrer">
              repository README
            </a>{' '}
            has the full setup walkthrough.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="status-heading">
          <h2 id="status-heading">Status</h2>
          <p>
            Private alpha, in a private repository, so the source is{' '}
            <span className={styles.privateBadge}>(private-access-only)</span>{' '}
            for now. Working today: resumable full-inbox sync and incremental
            sync from Gmail&apos;s <code>historyId</code>, sender / domain /
            label grouping, full-body search, grouped bulk archive and label with
            the review queue, audit history with undo, and a local analytics
            dashboard over the index. On deck: opening up the repo, and a local
            summarization service - the schema reserves room for it, and no model
            is involved today.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="links-heading">
          <h2 id="links-heading">Reference links</h2>
          <ul className={styles.steps}>
            <li>
              <a href={REPO_URL} target="_blank" rel="noreferrer">
                gmail-reader on GitHub
              </a>{' '}
              <span className={styles.privateBadge}>(private-access-only)</span>{' '}
              - the repository behind this page.
            </li>
            <li>
              <a href={README_URL} target="_blank" rel="noreferrer">
                README: setup and daily use
              </a>{' '}
              <span className={styles.privateBadge}>(private-access-only)</span>{' '}
              - OAuth setup, sync behavior, and the safety rules.
            </li>
            <li>
              <a href={OAUTH_DESKTOP_DOCS_URL} target="_blank" rel="noreferrer">
                Google OAuth for desktop apps
              </a>{' '}
              - the client type this needs, with a loopback redirect.
            </li>
            <li>
              <a href={GMAIL_API_DOCS_URL} target="_blank" rel="noreferrer">
                Gmail API reference
              </a>{' '}
              - the endpoints behind sync and every applied change.
            </li>
          </ul>
          <p>
            The repository is private while this is still an alpha; the GitHub
            links need an account with access, and everyone else sees a 404.
          </p>
        </section>
      </main>
    </div>
  )
}
