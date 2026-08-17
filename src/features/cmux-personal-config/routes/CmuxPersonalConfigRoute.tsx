import type { ReactElement } from 'react'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import shared from '../../../styles/setup-guide.module.css'
import local from '../cmux-personal-config.module.css'

const styles = { ...shared, ...local }

const configLines = [
  ['01', '"terminal": {'],
  ['02', '  "autoResumeAgentSessions": true'],
  ['03', '},'],
  ['04', '"notifications": {'],
  ['05', '  "sound": "none",'],
  ['06', '  "command": "case … say \'Input for agent needed\' … esac",'],
  ['07', '  "dockBadge": true,'],
  ['08', '  "paneFlash": true,'],
  ['09', '  "unreadPaneRing": true'],
  ['10', '}'],
]

const layoutNotes = [
  ['1', 'Sidebar', 'Workspaces grouped per repo. Each keeps a restorable agent session.'],
  ['2', 'Agent terminal', 'OpenCode runs in a tab. Sessions auto-resume after a restart.'],
  ['3', 'Context pane', 'Token usage and MCP status for the active session.'],
  ['4', 'Browser pane', 'Embedded preview of the page under work.'],
]

export default function CmuxPersonalConfigRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="cmux personal config home">
          <span className={styles.brandMark} aria-hidden="true">c_</span>
          <span>cmux personal config</span>
        </a>
        <nav className={styles.nav} aria-label="Page navigation">
          <a href="#layout">Layout</a>
          <a href="#notifications">Notifications</a>
          <a href="#config">Config</a>
        </nav>
      </header>

      <main id="top">
        <section className={styles.hero}>
          <div>
            <h1>cmux personal config</h1>
            <p className={styles.heroIntro}>
              A private repo with <code>cmux.json</code>, an OpenCode notification
              plugin, and an installer. Synced across machines. Completed agent
              sessions stay silent; prompts that block on input speak.
            </p>
            <p className={styles.envLine}>
              <code>cmux 0.64.22 (102) · stock build</code>
              <code>opencode 1.18.18</code>
            </p>
          </div>

          <div className={styles.heroVisual} aria-label="Three OpenCode terminal sessions and a spoken notification">
            <div className={`${styles.terminal} ${styles.terminalBack}`} aria-hidden="true">
              <div className={styles.terminalBar}><i /><i /><i /><span>docs</span></div>
              <p><b>opencode</b> explain the release flow</p>
              <p className={styles.dim}>reading config...</p>
            </div>
            <div className={`${styles.terminal} ${styles.terminalMiddle}`} aria-hidden="true">
              <div className={styles.terminalBar}><i /><i /><i /><span>frontend</span></div>
              <p><b>opencode</b> refine the mobile layout</p>
              <p className={styles.success}>✓ tests passed</p>
            </div>
            <div className={`${styles.terminal} ${styles.terminalFront}`} aria-hidden="true">
              <div className={styles.terminalBar}><i /><i /><i /><span>cmux.json</span></div>
              <p><span className={styles.prompt}>›</span> agent needs permission</p>
              <div className={styles.questionBox}>
                <span>INPUT NEEDED</span>
                <strong>Approve this command?</strong>
              </div>
            </div>
            <div className={styles.speechBubble} aria-hidden="true">
              <span>say</span>
              Input for agent needed
            </div>
          </div>
        </section>

        <section className={styles.section} id="layout" aria-labelledby="layout-title">
          <h2 id="layout-title">Window layout</h2>
          <div
            className={styles.window}
            role="img"
            aria-label="cmux window with workspace sidebar, agent terminal, context pane, and browser preview"
          >
            <div className={styles.windowBar}>
              <i /><i /><i />
              <span>cmux — web</span>
            </div>
            <div className={styles.windowBody}>
              <aside className={styles.wsSidebar}>
                <span className={styles.regionTag}>1</span>
                <p className={styles.wsGroup}>web</p>
                <div className={`${styles.wsItem} ${styles.wsItemActive}`}>
                  <b>OC | Fix flaky router test</b>
                  <span>running · ~/code/web</span>
                </div>
                <div className={styles.wsItem}>
                  <b>OC | Bump dependencies</b>
                  <span>idle · ~/code/web</span>
                </div>
                <p className={styles.wsGroup}>api</p>
                <div className={styles.wsItem}>
                  <b>OC | Trace slow query</b>
                  <span className={styles.wsNeedsInput}>needs input · ~/code/api</span>
                </div>
                <p className={styles.wsGroup}>docs</p>
                <div className={styles.wsItem}>
                  <b>terminal</b>
                  <span>~/code/docs</span>
                </div>
              </aside>
              <section className={styles.wsTerminal}>
                <span className={styles.regionTag}>2</span>
                <div className={styles.wsTabs}>
                  <span className={styles.wsTabActive}>opencode</span>
                  <span>zsh</span>
                </div>
                <div className={styles.wsTermLines}>
                  <p><b>$</b> opencode</p>
                  <p><b>›</b> fix the flaky router test</p>
                  <p className={styles.dim}>read src/router.test.ts</p>
                  <p className={styles.dim}>edit src/router.test.ts · +6 −2</p>
                  <p className={styles.success}>✓ 34 tests passed</p>
                  <p className={styles.dim}>session idle — no sound</p>
                </div>
              </section>
              <aside className={styles.wsContext}>
                <span className={styles.regionTag}>3</span>
                <p className={styles.wsCtxTitle}>Context</p>
                <p>128k tokens · 24% used</p>
                <p className={styles.wsCtxTitle}>MCP</p>
                <p>github-mcp <em>connected</em></p>
                <p>grafana-mcp <em>connected</em></p>
                <p>slack-mcp <em>needs auth</em></p>
              </aside>
              <section className={styles.wsBrowser}>
                <span className={styles.regionTag}>4</span>
                <div className={styles.wsUrlBar}>127.0.0.1:4173/preview</div>
                <div className={styles.wsPageBlock} />
                <div className={styles.wsPageLine} />
                <div className={styles.wsPageLine} />
                <div className={`${styles.wsPageLine} ${styles.wsPageLineShort}`} />
              </section>
            </div>
          </div>
          <ol className={styles.layoutNotes}>
            {layoutNotes.map(([tag, title, body]) => (
              <li key={tag}>
                <span>{tag}</span>
                <b>{title}</b>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} id="notifications" aria-labelledby="notifications-title">
          <h2 id="notifications-title">Notifications</h2>
          <p className={styles.flowLine}>
            <span className={styles.flowLabel}>local</span>
            <code>question / permission</code>
            <span aria-hidden="true">→</span>
            <code>cmux-question-notify plugin</code>
            <span aria-hidden="true">→</span>
            <code>cmux notify</code>
            <span aria-hidden="true">→</span>
            <code>banner + say &quot;Input for agent needed&quot;</code>
          </p>
          <p className={styles.flowLine}>
            <span className={styles.flowLabel}>remote</span>
            <code>question / permission / session idle</code>
            <span aria-hidden="true">→</span>
            <code>ntfy-notify plugin</code>
            <span aria-hidden="true">→</span>
            <code>ntfy topic</code>
            <span aria-hidden="true">→</span>
            <code>phone push</code>
          </p>
          <p className={styles.note}>
            OpenCode fans the same events out twice: stock cmux handles the
            local banner and speech, and the ntfy plugin from the public{' '}
            <code>opencode-remote-control-and-notifications</code> repo pushes
            to the phone. <code>sound</code> is <code>none</code>; speech comes
            only from <code>notifications.command</code> and never reads prompt
            contents aloud.
          </p>
          <div className={`${styles.matrix} ${styles.matrix4}`}>
            <div className={styles.matrixHeader}><span>Event</span><span>Banner</span><span>Speech</span><span>Push</span></div>
            <div><strong>Turn complete</strong><span className={styles.on}>ON</span><span className={styles.off}>OFF</span><span className={styles.on}>ON</span></div>
            <div><strong>Permission</strong><span className={styles.on}>ON</span><span className={styles.on}>ON</span><span className={styles.on}>ON</span></div>
            <div><strong>Plan review</strong><span className={styles.on}>ON</span><span className={styles.on}>ON</span><span className={styles.on}>ON</span></div>
            <div><strong>Question</strong><span className={styles.on}>ON</span><span className={styles.on}>ON</span><span className={styles.on}>ON</span></div>
          </div>
        </section>

        <section className={styles.section} id="config" aria-labelledby="config-title">
          <h2 id="config-title">Config</h2>
          <div className={styles.configGrid}>
            <div className={styles.codeWindow}>
              <div className={styles.codeHeader}>
                <span>cmux.json</span>
              </div>
              <ol>
                {configLines.map(([line, code]) => (
                  <li key={line} className={line === '05' || line === '06' ? styles.highlightLine : undefined}>
                    <span>{line}</span><code>{code}</code>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.configNotes}>
              <p>
                The checked-in file excludes credentials, private service URLs,
                machine-specific paths, and workspace layouts.
              </p>
              <div className={styles.installCommand}>
                <span>$</span>
                <code>./install.sh</code>
              </div>
              <ul>
                <li>Backs up existing managed files with timestamps</li>
                <li>Copies <code>cmux.json</code> and the OpenCode plugin</li>
                <li>Validates the JSON against cmux settings support</li>
                <li>Reloads a running cmux; restart OpenCode once</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter className={styles.siteFooter}>
        <span>cmux personal config</span>
        <a href="/guides">/guides</a>
      </SiteFooter>
    </div>
  )
}
