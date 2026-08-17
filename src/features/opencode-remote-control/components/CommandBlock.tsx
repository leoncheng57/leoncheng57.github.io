import { useState, type ReactElement } from 'react'
import styles from '../opencode-remote-control.module.css'

export default function CommandBlock({
  label,
  command,
}: {
  label: string
  command: string
}): ReactElement {
  const [copied, setCopied] = useState(false)

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className={styles.commandBlock}>
      <div className={styles.commandHeader}>
        <span>{label}</span>
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{command}</code>
      </pre>
    </section>
  )
}
