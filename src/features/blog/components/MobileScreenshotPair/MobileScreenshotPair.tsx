import type { ReactElement } from 'react'
import ArticleImage from '../../../../components/markdown/ArticleImage'
import articleStyles from '../../blog.module.css'
import styles from './MobileScreenshotPair.module.css'

interface MobileScreenshotPairProps {
  ariaLabel?: string
}

const pairStyles = { ...articleStyles, figure: styles.figure }

export default function MobileScreenshotPair({
  ariaLabel = 'Mobile DCA screens',
}: MobileScreenshotPairProps): ReactElement {
  return (
    <div className={styles.grid} role="region" aria-label={ariaLabel} data-testid="mobile-screenshot-pair">
      <ArticleImage
        alt="Mobile attention queue"
        src="/blog/practical-dca-workflows/mobile-attention-home.png"
        styles={pairStyles}
      />
      <ArticleImage
        alt="Mobile conversation and composer"
        src="/blog/practical-dca-workflows/mobile-conversation.png"
        styles={pairStyles}
      />
    </div>
  )
}
