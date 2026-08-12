import type { ReactElement } from 'react'
import TopNav from '../../../components/top-nav/TopNav'
import styles from '../../../App.module.css'

export default function GuidesRoute(): ReactElement {
  return (
    <div className={styles.container}>
      <TopNav />
      <main className={styles.main}>
        <h1>Guides</h1>
        <p>TBD</p>
      </main>
    </div>
  )
}
