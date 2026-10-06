import { useState, type FormEvent, type ReactElement, type ReactNode } from 'react'
import styles from '../game-nights.module.css'

// Deterrence only: the password and the gated content both ship in the public
// bundle. The gate keeps casual visitors out; it is not access control.
const PASSWORD = 'community'
const STORAGE_KEY = 'georgies-hosting-unlocked-v1'

function readUnlocked(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

type HostingGateProps = {
  children: ReactNode
}

export default function HostingGate({ children }: HostingGateProps): ReactElement {
  const [unlocked, setUnlocked] = useState(readUnlocked)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (value.trim().toLowerCase() !== PASSWORD) {
      setError(true)
      return
    }
    try {
      window.sessionStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // The page still unlocks for this render when storage is disabled.
    }
    setUnlocked(true)
  }

  return (
    <section className={styles.gate} aria-labelledby="gate-title">
      <form className={styles.gateForm} onSubmit={handleSubmit}>
        <h1 id="gate-title">Hosts only</h1>
        <label htmlFor="hosting-password">Password</label>
        <input
          id="hosting-password"
          type="password"
          autoComplete="off"
          value={value}
          aria-invalid={error}
          aria-describedby={error ? 'hosting-password-error' : undefined}
          onChange={(event) => {
            setValue(event.target.value)
            setError(false)
          }}
        />
        {error && (
          <p className={styles.gateError} id="hosting-password-error" role="alert">
            That&apos;s not it. Try again.
          </p>
        )}
        <button className={styles.primaryButton} type="submit">
          Unlock <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  )
}
