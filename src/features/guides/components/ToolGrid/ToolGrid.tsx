import type { ReactElement } from 'react'
import { TOOLS } from './tools'
import styles from './ToolGrid.module.css'

interface ToolGridProps {
  /** Accessible name for the list; supplied by the markdown embed's alt text. */
  label?: string
}

/**
 * The tools catalogue as a card grid. Markdown cannot express a grid, so the
 * chapter embeds this through the same `component:` registry the walkthrough
 * and the screen recordings use.
 */
export default function ToolGrid({
  label = 'Tools built on top of the agent server',
}: ToolGridProps): ReactElement {
  return (
    <ul className={styles.grid} aria-label={label}>
      {TOOLS.map((tool) => (
        <li key={tool.id} className={styles.card}>
          <h3 className={styles.name}>{tool.name}</h3>
          <p className={styles.blurb}>{tool.blurb}</p>
          <pre className={styles.diagram} aria-hidden="true">
            {tool.diagram}
          </pre>
        </li>
      ))}
    </ul>
  )
}
