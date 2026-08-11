import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactElement,
} from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import TuziPwa from '../components/TuziPwa'
import { books, type Book } from '../data/books'
import { applyComparison, INITIAL_RATING, K_FACTOR, type Ratings } from '../elo'
import styles from '../tuzi.module.css'

function BookCover({ book, position }: { book: Book; position: number }): ReactElement {
  return (
    <div
      className={styles.cover}
      style={{ '--cover': book.color, '--cover-accent': book.accent } as CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.coverIndex}>{String(position).padStart(2, '0')}</span>
      <strong>{book.title}</strong>
      <small>{book.author}</small>
    </div>
  )
}

function PrivacyNotice(): ReactElement {
  const [expanded, setExpanded] = useState(true)

  return (
    <aside className={`${styles.notice} ${expanded ? '' : styles.noticeCollapsed}`}>
      <strong>Early beta</strong>
      {expanded && (
        <span>Profiles and activity are public while privacy controls are being built.</span>
      )}
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} public data notice`}
      >
        {expanded ? 'Collapse' : 'Public data · expand'}
      </button>
    </aside>
  )
}

function RankingHome(): ReactElement {
  const [round, setRound] = useState(0)
  const [comparisons, setComparisons] = useState(0)
  const [ratings, setRatings] = useState<Ratings>({})
  const [message, setMessage] = useState('Which would you rather recommend?')
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const suppressClick = useRef(false)

  const leftBook = books[(round * 2) % books.length]
  const rightBook = books[(round * 2 + 1) % books.length]
  const shelf = [...books].sort((a, b) => {
    const ratingDifference = (ratings[b.id] ?? INITIAL_RATING) - (ratings[a.id] ?? INITIAL_RATING)
    return ratingDifference || books.indexOf(a) - books.indexOf(b)
  })
  const comparisonsUntilPicks = Math.max(20 - comparisons, 0)

  function choose(winner: Book): void {
    const loser = winner.id === leftBook.id ? rightBook : leftBook
    setRatings((current) => applyComparison(current, winner.id, loser.id))
    setComparisons((current) => current + 1)
    setMessage(`${winner.title} moves up your shelf.`)
    setRound((current) => current + 1)
  }

  function skip(): void {
    setMessage('Skipped. Elo ratings stay unchanged.')
    setRound((current) => current + 1)
  }

  function updateDrag(nextDragX: number, nextDragY: number): void {
    setDragX(Math.max(-120, Math.min(120, nextDragX)))
    setDragY(Math.max(-72, Math.min(72, nextDragY)))
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, index: number): void {
    dragStart.current = { x: event.clientX, y: event.clientY }
    setDraggedIndex(index)
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>): void {
    if (dragStart.current === null) return
    updateDrag(event.clientX - dragStart.current.x, event.clientY - dragStart.current.y)
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
    <main>
      <section className={styles.hero} id="rank">
        <div className={styles.heroCopy}>
          <span className={styles.betaLabel}>Beta</span>
          <p className={styles.eyebrow}>Rank books. Get better picks.</p>
          <h1>Pick your next.</h1>
          <div className={styles.progressRow}>
            <span><strong>{comparisons}</strong> comparisons</span>
            <span><strong>{comparisonsUntilPicks}</strong> more to unlock picks</span>
          </div>
          <div className={styles.progressTrack} aria-label={`${comparisons} of 20 comparisons complete`}>
            <span style={{ width: `${Math.min((comparisons / 20) * 100, 100)}%` }} />
          </div>
          <Link className={styles.howLink} to="/tuzi/how-ranking-works">How Elo ranking works →</Link>
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
                style={draggedIndex === index ? {
                  '--card-x': `${dragX}px`,
                  '--card-y': `${dragY}px`,
                  '--card-rotate': `${dragX / 18}deg`,
                } as CSSProperties : undefined}
                type="button"
                onClick={() => chooseByTap(book)}
                onPointerDown={(event) => startDrag(event, index)}
                onPointerMove={moveDrag}
                onPointerUp={(event) => finishDrag(event, book)}
                onPointerCancel={cancelDrag}
                key={book.id}
              >
                <BookCover book={book} position={index + 1} />
                <span className={styles.bookMeta}>
                  <strong>{book.title}</strong>
                  <span>{book.author} · {book.year}</span>
                  <small>Elo {Math.round(ratings[book.id] ?? INITIAL_RATING)}</small>
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
          <p className={styles.eyebrow}>Your Elo shelf</p>
          <h2>Your favorites rise with every pick.</h2>
          <div className={styles.miniCovers} aria-label="Top three ranked books">
            {shelf.slice(0, 3).map((book, index) => (
              <BookCover book={book} position={index + 1} key={book.id} />
            ))}
          </div>
          <ol className={styles.shelfRanking}>
            {shelf.slice(0, 3).map((book) => (
              <li key={book.id}>
                <span>{book.title}</span>
                <strong>{Math.round(ratings[book.id] ?? INITIAL_RATING)}</strong>
              </li>
            ))}
          </ol>
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
            <article role="listitem" key={book.id}>
              <BookCover book={book} position={index + 1} />
              <div>
                <h3>{book.title}</h3>
                <p>{book.author} · {book.year}</p>
                <small>Starts at Elo {INITIAL_RATING}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function HowRankingWorks(): ReactElement {
  return (
    <main className={styles.explainer}>
      <Link className={styles.backLink} to="/tuzi/">← Back to ranking</Link>
      <span className={styles.betaLabel}>Behind the shelf</span>
      <p className={styles.eyebrow}>How Tuzi ranks books</p>
      <h1>Elo turns every pick into a better shelf.</h1>
      <p className={styles.explainerLead}>
        Elo is a rating system first used for chess. Tuzi applies the same idea to books:
        surprising picks move the shelf more than obvious ones.
      </p>

      <section>
        <span>01</span>
        <div>
          <h2>Every book starts equal.</h2>
          <p>Each book begins at {INITIAL_RATING}. Your shelf is simply every book sorted by its current rating.</p>
        </div>
      </section>
      <section>
        <span>02</span>
        <div>
          <h2>Tuzi predicts the pick.</h2>
          <p>Two equally rated books each have a 50% expected chance. A higher-rated book is expected to win more often.</p>
          <code>E(A) = 1 / (1 + 10^((R(B) - R(A)) / 400))</code>
        </div>
      </section>
      <section>
        <span>03</span>
        <div>
          <h2>Surprises count more.</h2>
          <p>
            Picking an underdog creates a large adjustment. Picking the expected favorite creates a small one.
            Tuzi currently uses a K-factor of {K_FACTOR} to control the maximum movement.
          </p>
          <code>new rating = old rating + K × (result - expected result)</code>
        </div>
      </section>
      <section>
        <span>04</span>
        <div>
          <h2>Your shelf settles over time.</h2>
          <p>
            Early ratings move quickly because Tuzi has little evidence. More comparisons make the order increasingly
            representative of your taste. Skipping a pair never changes either rating.
          </p>
        </div>
      </section>

      <aside className={styles.eloExample}>
        <p className={styles.eyebrow}>A simple example</p>
        <h2>Two new books meet at 1500.</h2>
        <p>You pick Pachinko. With equal expectations, it gains 16 points and the other book loses 16.</p>
        <div><strong>1516</strong><span>Pachinko</span></div>
        <div><strong>1484</strong><span>Other book</span></div>
      </aside>

      <Link className={styles.rankCta} to="/tuzi/">Start comparing books →</Link>
    </main>
  )
}

export default function TuziRoute(): ReactElement {
  return (
    <div className={styles.page}>
      <TuziPwa />
      <header className={styles.nav}>
        <Link className={styles.brand} to="/tuzi/" aria-label="Tuzi home">
          <span className={styles.mark}>T</span>
          <span>tuzi</span>
        </Link>
        <nav aria-label="Tuzi navigation">
          <Link to="/tuzi/">Rank</Link>
          <Link to="/tuzi/how-ranking-works">How it works</Link>
        </nav>
        <button className={styles.profileButton} type="button" aria-label="Open profile">LC</button>
      </header>

      <PrivacyNotice />

      <Routes>
        <Route index element={<RankingHome />} />
        <Route path="how-ranking-works" element={<HowRankingWorks />} />
      </Routes>

      <nav className={styles.mobileDock} aria-label="Tuzi mobile navigation">
        <Link to="/tuzi/"><span>↕</span>Rank</Link>
        <Link to="/tuzi/#shelf"><span>▤</span>Shelf</Link>
        <Link to="/tuzi/#catalog"><span>▦</span>Books</Link>
        <Link to="/tuzi/how-ranking-works"><span>?</span>Elo</Link>
      </nav>

      <footer>
        <span>Tuzi · an early experiment by Leon</span>
        <Link to="/tuzi/how-ranking-works">How ranking works</Link>
      </footer>
    </div>
  )
}
