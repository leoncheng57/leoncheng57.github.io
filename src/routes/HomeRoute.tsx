import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import Headline from '../components/headline/headline'
import Social from '../components/social/social'
import TopNav from '../components/top-nav/TopNav'
import styles from '../App.module.css'

export default function HomeRoute(): ReactElement {
  return (
    <div className={styles.container}>
      <TopNav />
      <main className={styles.main}>
        <Headline />
        <hr />
        <Social />
        <hr />
        <p className={styles.homeLinkRow}>
          <Link to="/blog">Read the blog</Link>
        </p>
        <hr />
      </main>
    </div>
  )
}
