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
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
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

  function updateDrag(nextDragX: number, nextDragY: number): void {
    const clampedDragX = Math.max(-120, Math.min(120, nextDragX))
    const clampedDragY = Math.max(-72, Math.min(72, nextDragY))
    setDragX(clampedDragX)
    setDragY(clampedDragY)
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, index: number): void {
    dragStart.current = { x: event.clientX, y: event.clientY }
    setDraggedIndex(index)
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>): void {
    if (dragStart.current === null) return
    updateDrag(
      event.clientX - dragStart.current.x,
      event.clientY - dragStart.current.y,
    )
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>, book: Book): void {
    if (dragStart.current === null) return

    const distance = event.clientX - dragStart.current.x
    dragStart.current = null
    setIsDragging(false)
    setDraggedIndex(null)
    updateDrag(0, 0)

    if (Math.abs(distance) < 64) return

    suppressClick.current = true
    window.setTimeout(() => {
      suppressClick.current = false
    }, 0)
    choose(book)
  }

  function cancelDrag(): void {
    dragStart.current = null
    setIsDragging(false)
    setDraggedIndex(null)
    updateDrag(0, 0)
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
          <a href="#catalog">Books</a>
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
              <span className={draggedIndex === 0 ? styles.swipeActive : undefined}>↔ {leftBook.title}</span>
              <strong>Drag a card</strong>
              <span className={draggedIndex === 1 ? styles.swipeActive : undefined}>{rightBook.title} ↔</span>
            </div>
            <div
              className={styles.comparison}
              role="group"
              aria-label={`Drag or tap ${leftBook.title} or ${rightBook.title}`}
            >
              {[leftBook, rightBook].map((book, index) => (
                <button
                  className={`${styles.bookChoice} ${isDragging && draggedIndex === index ? styles.dragging : ''}`}
                  style={
                    draggedIndex === index
                      ? {
                          '--card-x': `${dragX}px`,
                          '--card-y': `${dragY}px`,
                          '--card-rotate': `${dragX / 18}deg`,
                        } as CSSProperties
                      : undefined
                  }
                  type="button"
                  onClick={() => chooseByTap(book)}
                  onPointerDown={(event) => startDrag(event, index)}
                  onPointerMove={moveDrag}
                  onPointerUp={(event) => finishDrag(event, book)}
                  onPointerCancel={cancelDrag}
                  key={book.title}
                >
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

        <section className={styles.catalog} id="catalog">
          <header className={styles.catalogHeader}>
            <div>
              <p className={styles.eyebrow}>Tuzi catalog</p>
              <h2>All books</h2>
            </div>
            <strong>{books.length}</strong>
          </header>
          <div className={styles.catalogList} role="list">
            {books.map((book, index) => (
              <article role="listitem" key={book.title}>
                <BookCover book={book} position={index + 1} />
                <div>
                  <h3>{book.title}</h3>
                  <p>{book.author} · {book.year}</p>
                  <small>{book.blurb}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <nav className={styles.mobileDock} aria-label="Tuzi mobile navigation">
        <a href="#rank"><span>↕</span>Rank</a>
        <a href="#shelf"><span>▤</span>Shelf</a>
        <a href="#catalog"><span>▦</span>Books</a>
        <Link to="/apps"><span>•••</span>Apps</Link>
      </nav>

      <footer>
        <span>Tuzi · an early experiment by Leon</span>
        <Link to="/apps">More apps</Link>
      </footer>
    </div>
  )
}
