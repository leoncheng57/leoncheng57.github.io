import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import styles from '../blog.module.css'

interface ArticleImageProps {
  alt: string
  src: string
  title?: string
}

export default function ArticleImage({ alt, src, title }: ArticleImageProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false)

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
          <img src={src} alt={alt} title={title} className={styles.articleImage} />
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
            <img src={src} alt={alt} title={title} className={styles.zoomedImage} />
          </div>
        </div>
      ) : null}
    </>
  )
}
