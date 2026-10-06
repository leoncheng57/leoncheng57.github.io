import type { ReactElement } from 'react'
import MarkdownArticle from '../../../components/markdown/MarkdownArticle'
import designDocument from '../DESIGN.md?raw'
import styles from '../automatic-food-logger.module.css'

export default function DesignRoute(): ReactElement {
  return (
    <article className={styles.designArticle}>
      <MarkdownArticle content={designDocument} styles={styles} />
    </article>
  )
}
