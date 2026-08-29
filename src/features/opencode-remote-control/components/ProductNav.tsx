import type { ReactElement, ReactNode } from 'react'
import styles from '../opencode-remote-control.module.css'

export default function ProductNav({
  children,
}: {
  children: ReactNode
}): ReactElement {
  return (
    <header className={styles.productNav}>
      <a
        className={styles.brand}
        href="#top"
        aria-label="OpenCode Remote Control home"
      >
        <span className={styles.brandMark} aria-hidden="true">
          &gt;_
        </span>
        <span>OC REMOTE</span>
      </a>
      <nav
        className={styles.navLinks}
        aria-label="OpenCode Remote Control navigation"
      >
        {children}
      </nav>
    </header>
  )
}
