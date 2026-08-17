import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { PICKER_ISSUE_URL, REPOSITORY_URL } from '../constants'
import styles from '../opencode-remote-control.module.css'

export default function ProductFooter(): ReactElement {
  return (
    <footer className={styles.footer}>
      <a href={REPOSITORY_URL}>View source on GitHub ↗</a>
      <a href={PICKER_ISSUE_URL}>OpenCode picker issue ↗</a>
      <Link to="/guides">Back to LeonCheng.dev ↗</Link>
    </footer>
  )
}
