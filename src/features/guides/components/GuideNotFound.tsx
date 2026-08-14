import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styles from '../guides.module.css'

interface GuideNotFoundProps {
  heading: string
  message: string
}

export default function GuideNotFound({ heading, message }: GuideNotFoundProps): ReactElement {
  return (
    <main className={styles.main}>
      <p className={styles.backLink}>
        <Link to="/guides">&larr; All guides</Link>
      </p>
      <header className={styles.pageHeader}>
        <h1>{heading}</h1>
        <p>{message}</p>
      </header>
    </main>
  )
}
