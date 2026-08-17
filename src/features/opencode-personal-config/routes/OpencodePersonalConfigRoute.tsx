import type { ReactElement } from 'react'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import shared from '../../../styles/setup-guide.module.css'
import local from '../opencode-personal-config.module.css'

const styles = { ...shared, ...local }

const configLines = [
  ['01', '"mcp": {'],
  ['02', '  "gitlab": {'],
  ['03', '    "type": "local",'],
  ['04', '    "command": ["npx", "-y", "@zereight/mcp-gitlab"],'],
  ['05', '    "environment": {'],
  ['06', '      "GITLAB_PERSONAL_ACCESS_TOKEN": "{env:GITLAB_PERSONAL_ACCESS_TOKEN}"'],
  ['07', '    }'],
  ['08', '  },'],
  ['09', '  "slack-mcp": { "type": "remote", "url": "…" }'],
  ['10', '}'],
]

const layoutNotes = [
  ['1', 'config/', 'Installed to ~/.config/opencode/: main config, plugin deps, agents, skills.'],
  ['2', 'profiles/', 'Alternative machine profiles. Copied manually, never by the installer.'],
  ['3', 'mcp-projects/', 'Local Node MCP servers installed to ~/Documents/Projects/.'],
  ['4', 'install.sh', 'Copies config and MCP projects, runs npm install where needed.'],
]

const mcpRows: Array<[string, string, string]> = [
  ['atlassian · backstage · slack-mcp', 'remote URL', 'none locally'],
  ['mermaid · excalidraw', 'local Node project', 'none'],
  ['notion-work · notion-personal', 'npx / uvx', 'env token'],
  ['figma · gitlab · grafana', 'npx / uvx', 'env token'],
  ['playwright-extension · playwright-isolated', 'npx / uvx', 'none'],
]

// Snapshot from the local OpenCode message store (opencode.db) as of
// 2026-08-17: 110,622 assistant messages, 76.9M input+output tokens,
// logged since 2026-04-05. Percentages are [message %, token %].
const modelUsage: Array<[string, number, number]> = [
  ['claude-opus-4-6', 33.8, 17.9],
  ['claude-fable-5', 21.4, 19.1],
  ['gpt-5.6-sol', 18.9, 28.6],
  ['claude-opus-4-7', 18.9, 13.8],
  ['claude-opus-5', 3.3, 3.4],
  ['gpt-5.4', 0.7, 12.0],
  ['36 others', 3.0, 5.2],
]

const skills: Array<[string, string]> = [
  ['code-flowchart', 'ASCII flowcharts for execution flows and message passing'],
  ['explain-file', 'Line-by-line file walkthroughs'],
  ['gitlab-mr-review', 'GitLab merge request review workflow'],
  ['repo-learning-guide', 'Generates learning docs for a repository'],
  ['diagram (agent)', 'Subagent rendering Mermaid diagrams as SVG or ASCII'],
]

export default function OpencodePersonalConfigRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="opencode personal config home">
          <span className={styles.brandMark} aria-hidden="true">o_</span>
          <span>opencode personal config</span>
        </a>
        <nav className={styles.nav} aria-label="Page navigation">
          <a href="#layout">Layout</a>
          <a href="#mcp">MCP</a>
          <a href="#skills">Skills</a>
          <a href="#models">Models</a>
          <a href="#config">Config</a>
        </nav>
      </header>

      <main id="top">
        <section className={styles.hero}>
          <div>
            <h1>opencode personal config</h1>
            <p className={styles.heroIntro}>
              A private repo with <code>opencode.json</code>, MCP server
              definitions, skills, agents, and machine profiles. One installer
              recreates the OpenCode               setup on a new laptop; secrets stay in
              environment variables.
            </p>
            <p className={styles.envLine}>
              <code>opencode 1.18.18</code>
              <code>plugins: ntfy-notify · cmux-question-notify · cmux-session</code>
            </p>
          </div>

          <div className={styles.heroVisual} aria-label="OpenCode sessions using MCP servers and skills">
            <div className={`${styles.terminal} ${styles.terminalBack}`} aria-hidden="true">
              <div className={styles.terminalBar}><i /><i /><i /><span>skills</span></div>
              <p><b>opencode</b> explain this file</p>
              <p className={styles.dim}>skill: explain-file</p>
            </div>
            <div className={`${styles.terminal} ${styles.terminalMiddle}`} aria-hidden="true">
              <div className={styles.terminalBar}><i /><i /><i /><span>mcp</span></div>
              <p><b>opencode</b> render the flow as a diagram</p>
              <p className={styles.success}>✓ mermaid-mcp → diagram.svg</p>
            </div>
            <div className={`${styles.terminal} ${styles.terminalFront}`} aria-hidden="true">
              <div className={styles.terminalBar}><i /><i /><i /><span>opencode.json</span></div>
              <p><span className={styles.prompt}>›</span> 12 MCP servers configured</p>
              <div className={styles.questionBox}>
                <span>ENV</span>
                <strong>{'{env:FIGMA_API_KEY}'}</strong>
              </div>
            </div>
            <div className={styles.speechBubble} aria-hidden="true">
              <span>installer</span>
              ./install.sh
            </div>
          </div>
        </section>

        <section className={styles.section} id="layout" aria-labelledby="layout-title">
          <h2 id="layout-title">Repo layout</h2>
          <div
            className={styles.tree}
            role="img"
            aria-label="opencode-personal repository tree: config, profiles, mcp-projects, and install script"
          >
            <div className={styles.treeHeader}>opencode-personal/</div>
            <div className={styles.treeBody}>
              <div className={styles.treeCol}>
                <span className={styles.regionTag}>1</span>
                <p className={styles.treeDir}>config/opencode/ <em>→ ~/.config/opencode/</em></p>
                <p>opencode.json</p>
                <p>package.json</p>
                <p>agents/diagram.md</p>
                <p>skills/code-flowchart/</p>
                <p>skills/explain-file/</p>
                <p>skills/gitlab-mr-review/</p>
                <p>skills/repo-learning-guide/</p>
              </div>
              <div className={styles.treeCol}>
                <span className={styles.regionTag}>2</span>
                <p className={styles.treeDir}>profiles/</p>
                <p>deepl/ <em>work laptop</em></p>
                <p>gemini/ <em>notifier + auth plugins</em></p>
                <span className={`${styles.regionTag} ${styles.regionTagLower}`}>3</span>
                <p className={`${styles.treeDir} ${styles.treeDirSpaced}`}>mcp-projects/ <em>→ ~/Documents/Projects/</em></p>
                <p>beautiful-mermaid-custom-mcp/</p>
                <p>excalidraw-mcp/</p>
              </div>
              <div className={styles.treeCol}>
                <span className={styles.regionTag}>4</span>
                <p className={styles.treeDir}>install.sh</p>
                <p>.env.example <em>token names only</em></p>
                <p className={styles.treeMuted}>README.md</p>
              </div>
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

        <section className={styles.section} id="mcp" aria-labelledby="mcp-title">
          <h2 id="mcp-title">MCP servers</h2>
          <p className={styles.note}>
            Twelve servers, three transports. Tokens are referenced as{' '}
            <code>{'{env:VAR}'}</code> in <code>opencode.json</code>; no
            credentials or private hostnames are committed.
          </p>
          <div className={`${styles.matrix} ${styles.mcpMatrix}`}>
            <div className={styles.matrixHeader}><span>Servers</span><span>Transport</span><span>Auth</span></div>
            {mcpRows.map(([servers, transport, auth]) => (
              <div key={servers}>
                <strong>{servers}</strong>
                <span>{transport}</span>
                <span className={auth === 'none' || auth === 'none locally' ? styles.off : styles.on}>{auth}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="skills" aria-labelledby="skills-title">
          <h2 id="skills-title">Skills &amp; agents</h2>
          <ul className={styles.skillList}>
            {skills.map(([name, description]) => (
              <li key={name}>
                <code>{name}</code>
                <p>{description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} id="models" aria-labelledby="models-title">
          <h2 id="models-title">Model usage</h2>
          <p className={styles.note}>
            Share of assistant messages and input+output tokens across 110,622
            messages logged locally by OpenCode between 2026-04-05 and
            2026-08-17. Manual snapshot, not auto-updated. Message share and
            token share diverge: <code>gpt-5.6-sol</code> and{' '}
            <code>gpt-5.4</code> produce far more tokens per message.
          </p>
          <div className={styles.modelChart}>
            {modelUsage.map(([name, msgPct, tokPct]) => (
              <div className={styles.modelRow} key={name}>
                <code>{name}</code>
                <div className={styles.modelBars} aria-hidden="true">
                  <i style={{ width: `${msgPct}%` }} />
                  <i className={styles.tokenBar} style={{ width: `${tokPct}%` }} />
                </div>
                <span className={styles.modelPct}>{msgPct.toFixed(1)}%</span>
                <span className={`${styles.modelPct} ${styles.tokenPct}`}>{tokPct.toFixed(1)}%</span>
              </div>
            ))}
            <div className={`${styles.modelRow} ${styles.modelLegend}`}>
              <code />
              <div />
              <span className={styles.modelPct}>msgs</span>
              <span className={`${styles.modelPct} ${styles.tokenPct}`}>tokens</span>
            </div>
          </div>
        </section>

        <section className={styles.section} id="config" aria-labelledby="config-title">
          <h2 id="config-title">Config</h2>
          <div className={styles.configGrid}>
            <div className={styles.codeWindow}>
              <div className={styles.codeHeader}>
                <span>opencode.json</span>
              </div>
              <ol>
                {configLines.map(([line, code]) => (
                  <li key={line} className={line === '06' ? styles.highlightLine : undefined}>
                    <span>{line}</span><code>{code}</code>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.configNotes}>
              <p>
                Secrets never enter the repo: <code>.env.example</code> lists
                required variable names, and the shell profile provides the
                values that <code>{'{env:VAR}'}</code> interpolation reads.
              </p>
              <div className={styles.installCommand}>
                <span>$</span>
                <code>./install.sh</code>
              </div>
              <ul>
                <li>Copies <code>config/opencode/</code> to <code>~/.config/opencode/</code></li>
                <li>Copies local MCP projects to <code>~/Documents/Projects/</code></li>
                <li>Runs <code>npm install</code> where needed</li>
                <li>Profiles are opt-in: copy <code>profiles/*</code> manually</li>
                <li>
                  Notification plugins load from the public{' '}
                  <code>opencode-remote-control-and-notifications</code> repo:{' '}
                  <code>ntfy-notify</code> (phone push) and{' '}
                  <code>cmux-question-notify</code> (local banner + speech)
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter className={styles.siteFooter}>
        <span>opencode personal config</span>
        <a href="/guides">/guides</a>
      </SiteFooter>
    </div>
  )
}
