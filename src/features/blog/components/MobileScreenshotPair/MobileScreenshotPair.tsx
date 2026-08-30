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
        src="/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca/mobile-attention-home.png"
        styles={pairStyles}
      />
      <ArticleImage
        alt="Mobile conversation and composer"
        src="/blog/early-learnings-while-building-my-own-desktop-coding-agent-dca/mobile-conversation.png"
        styles={pairStyles}
      />
    </div>
  )
}
