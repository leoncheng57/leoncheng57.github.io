import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactElement,
} from 'react'
import { Link } from 'react-router-dom'
import TuziPwa from '../components/TuziPwa'
import styles from '../tuzi.module.css'

type Book = {
  title: string
  author: string
  year: string
  color: string
  accent: string
  blurb: string
}

const books: Book[] = [
  {
    title: 'Pachinko',
    author: 'Min Jin Lee',
    year: '2017',
    color: '#ef604f',
    accent: '#f9d7a5',
    blurb: 'A family saga of love, sacrifice, and belonging across generations.',
  },
  {
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    year: '2022',
    color: '#4579c3',
    accent: '#f8e8b0',
    blurb: 'Two friends build worlds together through art, play, and heartbreak.',
  },
  {
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    year: '1969',
    color: '#1e5547',
    accent: '#dcf2dd',
    blurb: 'A lone envoy crosses an icy world and questions every assumption.',
  },
  {
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    year: '2013',
    color: '#aa6d3d',
    accent: '#e3efbd',
    blurb: 'Indigenous wisdom and botany meet in an invitation to reciprocity.',
  },
]

function BookCover({ book, position }: { book: Book; position: number }): ReactElement {
  return (
    <div
      className={styles.cover}
      style={{ '--cover': book.color, '--cover-accent': book.accent } as CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.coverIndex}>0{position}</span>
      <strong>{book.title}</strong>
      <small>{book.author}</small>
    </div>
  )
}

export default function TuziRoute(): ReactElement {
  const [round, setRound] = useState(0)
  const [ranked, setRanked] = useState(12)
  const [message, setMessage] = useState('Which would you rather recommend?')
  const [showNotice, setShowNotice] = useState(true)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef<number | null>(null)
  const suppressClick = useRef(false)

  const leftBook = books[round % books.length]
  const rightBook = books[(round + 1) % books.length]

  function choose(book: Book): void {
    setRanked((current) => current + 1)
    setMessage(`${book.title} moves up your shelf.`)
    setRound((current) => current + 1)
  }

  function skip(): void {
    setMessage('Skipped. Here is a fresh pair.')
    setRound((current) => current + 2)
  }

  function updateDrag(nextDragX: number): void {
    const clampedDragX = Math.max(-120, Math.min(120, nextDragX))
    setDragX(clampedDragX)
  }

  function startDrag(event: PointerEvent<HTMLDivElement>): void {
    dragStartX.current = event.clientX
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>): void {
    if (dragStartX.current === null) return
    updateDrag(event.clientX - dragStartX.current)
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>): void {
    if (dragStartX.current === null) return

    const distance = event.clientX - dragStartX.current
    dragStartX.current = null
    setIsDragging(false)
    updateDrag(0)

    if (Math.abs(distance) < 64) return

    suppressClick.current = true
    window.setTimeout(() => {
      suppressClick.current = false
    }, 0)
    choose(distance < 0 ? leftBook : rightBook)
  }

  function cancelDrag(): void {
    dragStartX.current = null
    setIsDragging(false)
    updateDrag(0)
  }

  function chooseByTap(book: Book): void {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    choose(book)
  }

  return (
    <div className={styles.page}>
      <TuziPwa />
      <header className={styles.nav}>
        <Link className={styles.brand} to="/tuzi/" aria-label="Tuzi home">
          <span className={styles.mark}>T</span>
          <span>tuzi</span>
        </Link>
        <nav aria-label="Tuzi navigation">
          <a href="#rank">Rank</a>
          <a href="#shelf">My shelf</a>
        </nav>
        <button className={styles.profileButton} type="button" aria-label="Open profile">
          LC
        </button>
      </header>

      {showNotice && (
        <aside className={styles.notice}>
          <strong>Early beta</strong>
          <span>Profiles and activity are public while privacy controls are being built.</span>
          <button type="button" onClick={() => setShowNotice(false)} aria-label="Dismiss public data notice">Got it</button>
        </aside>
      )}

      <main>
        <section className={styles.hero} id="rank">
          <div className={styles.heroCopy}>
            <span className={styles.betaLabel}>Beta</span>
            <p className={styles.eyebrow}>Rank books. Get better picks.</p>
            <h1>Pick your next.</h1>
            <div className={styles.progressRow}>
              <span><strong>{ranked}</strong> books ranked</span>
              <span><strong>8</strong> more to unlock picks</span>
            </div>
            <div className={styles.progressTrack} aria-label={`${ranked} of 20 books ranked`}>
              <span style={{ width: `${Math.min((ranked / 20) * 100, 100)}%` }} />
            </div>
          </div>

          <div className={styles.rankArea} aria-live="polite">
            <p className={styles.prompt}>{message}</p>
            <div className={styles.swipeLegend} aria-hidden="true">
              <span className={dragX < -20 ? styles.swipeActive : undefined}>← {leftBook.title}</span>
              <strong>Drag to pick</strong>
              <span className={dragX > 20 ? styles.swipeActive : undefined}>{rightBook.title} →</span>
            </div>
            <div
              className={`${styles.comparison} ${isDragging ? styles.dragging : ''}`}
              style={{ '--drag-x': `${dragX}px` } as CSSProperties}
              role="group"
              aria-label={`Swipe left for ${leftBook.title} or right for ${rightBook.title}`}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={finishDrag}
              onPointerCancel={cancelDrag}
            >
              {[leftBook, rightBook].map((book, index) => (
                <button className={styles.bookChoice} type="button" onClick={() => chooseByTap(book)} key={book.title}>
                  <BookCover book={book} position={index + 1} />
                  <span className={styles.bookMeta}>
                    <strong>{book.title}</strong>
                    <span>{book.author} · {book.year}</span>
                    <small>{book.blurb}</small>
                  </span>
                  <span className={styles.chooseLabel}>Pick this <span>→</span></span>
                </button>
              ))}
              <span className={styles.or}>or</span>
            </div>
            <button className={styles.skipButton} type="button" onClick={skip}>Haven&apos;t read either — skip</button>
          </div>
        </section>

        <section className={styles.lowerGrid}>
          <aside className={styles.shelfCard} id="shelf">
            <p className={styles.eyebrow}>Your shelf so far</p>
            <h2>A taste for sweeping stories.</h2>
            <div className={styles.miniCovers} aria-hidden="true">
              {books.slice(0, 3).map((book, index) => <BookCover book={book} position={index + 1} key={book.title} />)}
            </div>
            <p>Literary fiction · Family sagas · Speculative worlds</p>
            <button type="button">See my full ranking <span>→</span></button>
          </aside>
        </section>
      </main>

      <nav className={styles.mobileDock} aria-label="Tuzi mobile navigation">
        <a href="#rank"><span>↕</span>Rank</a>
        <a href="#shelf"><span>▤</span>Shelf</a>
        <Link to="/apps"><span>•••</span>Apps</Link>
      </nav>

      <footer>
        <span>Tuzi · an early experiment by Leon</span>
        <Link to="/apps">More apps</Link>
      </footer>
    </div>
  )
}
