import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { publicAssetUrl } from '../../utils/publicAssetUrl'
import type { ArticleStyles } from './types'

interface ArticleImageProps {
  alt: string
  src: string
  title?: string
  styles: ArticleStyles
}

export default function ArticleImage({ alt, src, title, styles }: ArticleImageProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  // A `#half` fragment on the markdown src shows the image at half width (and
  // so half height) in the article; the zoom view still shows it full size.
  const [path, sizeHint] = src.split('#')
  const resolvedSrc = publicAssetUrl(path)
  const inlineImageClass =
    sizeHint === 'half' && styles.halfImage
      ? `${styles.articleImage} ${styles.halfImage}`
      : styles.articleImage

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <figure className={styles.figure}>
        <button
          type="button"
          className={styles.imageButton}
          aria-label={`Zoom image: ${alt}`}
          onClick={() => setIsOpen(true)}
        >
          <img src={resolvedSrc} alt={alt} title={title} className={inlineImageClass} />
        </button>
        {alt ? <figcaption className={styles.figureCaption}>{alt}</figcaption> : null}
      </figure>

      {isOpen ? (
        <div
          className={styles.imageOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom viewer"
          onClick={() => setIsOpen(false)}
        >
          <div className={styles.imageOverlayInner} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.imageClose}
              aria-label="Close image zoom"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
            <img src={resolvedSrc} alt={alt} title={title} className={styles.zoomedImage} />
          </div>
        </div>
      ) : null}
    </>
  )
}
