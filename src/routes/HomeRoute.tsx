import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import Headline from '../components/headline/headline'
import Social from '../components/social/social'
import styles from '../App.module.css'

export default function HomeRoute(): ReactElement {
  return (
    <div className={styles.container}>
      <img src="/lc-logo.svg" alt="LC Logo" className={styles.logo} />
      <main className={styles.main}>
        <Headline />
        <hr />
        <p className={styles.homeLinkRow}>
          <Link to="/blog">Read the blog</Link>
        </p>
        <hr />
        <Social />
        <hr />
      </main>
    </div>
  )
}
