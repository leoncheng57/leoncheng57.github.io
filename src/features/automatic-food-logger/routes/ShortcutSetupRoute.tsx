import { useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { LOG_FOOD_SHORTCUT_NAME } from '../utils/shortcutHandoff'
import styles from '../automatic-food-logger.module.css'

export const CLAUDE_ESTIMATE_PROMPT =
  'Estimate the nutrition for this meal: [description]. ' +
  'Reply with only a JSON object and no code fences, exactly like ' +
  '{"kcal":650,"protein_g":40,"carbs_g":70,"fat_g":22}'

export default function ShortcutSetupRoute(): ReactElement {
  const [copyStatusMessage, setCopyStatusMessage] = useState<string | null>(null)

  const copyPromptToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(CLAUDE_ESTIMATE_PROMPT)
      setCopyStatusMessage('Prompt copied.')
    } catch {
      setCopyStatusMessage('Copy failed. Select the prompt and copy it by hand.')
    }
  }

  return (
    <article className={styles.setupArticle}>
      <h1 className={styles.setupTitle}>Set up Food Logger</h1>
      <p>
        Websites cannot write to Apple Health, so Food Logger hands each meal to an Apple Shortcut named{' '}
        <strong>{LOG_FOOD_SHORTCUT_NAME}</strong>. The Shortcut asks the Claude app for macros when you leave them
        blank, then writes them to Health. You build it once; it takes about five minutes.
      </p>

      <section className={styles.card} aria-labelledby="setup-requirements-title">
        <h2 id="setup-requirements-title" className={styles.cardTitle}>
          You need
        </h2>
        <ul className={styles.setupList}>
          <li>An iPhone with the Shortcuts and Health apps (both built in).</li>
          <li>The Claude app, signed in. Its &ldquo;Ask Claude&rdquo; action runs on your existing plan.</li>
        </ul>
      </section>

      <section className={styles.card} aria-labelledby="setup-install-title">
        <h2 id="setup-install-title" className={styles.cardTitle}>
          1. Add Food Logger to your Home Screen
        </h2>
        <ol className={styles.setupList}>
          <li>Open this page in Safari.</li>
          <li>
            Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
          </li>
          <li>Open Food Logger from its new icon from now on.</li>
        </ol>
      </section>

      <section className={styles.card} aria-labelledby="setup-shortcut-title">
        <h2 id="setup-shortcut-title" className={styles.cardTitle}>
          2. Build the {LOG_FOOD_SHORTCUT_NAME} Shortcut
        </h2>
        <ol className={styles.setupList}>
          <li>
            In Shortcuts, tap <strong>+</strong> and name the shortcut exactly <strong>{LOG_FOOD_SHORTCUT_NAME}</strong>.
          </li>
          <li>
            Add <strong>Get Dictionary from Input</strong> with <em>Shortcut Input</em>. Food Logger sends the meal as
            JSON text with <code>description</code>, <code>kcal</code>, <code>protein_g</code>, <code>carbs_g</code>{' '}
            and <code>fat_g</code>.
          </li>
          <li>
            Add <strong>Get Dictionary Value</strong> for the key <code>kcal</code>, then an <strong>If</strong> block:
            <em> Dictionary Value</em> <strong>does not have any value</strong>.
          </li>
          <li>
            Inside <strong>If</strong>:
            <ol className={styles.setupSubList}>
              <li>
                <strong>Text</strong> holding the prompt below, with <code>[description]</code> replaced by the{' '}
                <code>description</code> value from the dictionary.
              </li>
              <li>
                <strong>Ask Claude</strong> (from the Claude app) with that Text.
              </li>
              <li>
                <strong>Get Dictionary from Input</strong> with Claude&apos;s response, then{' '}
                <strong>Set Variable</strong> <code>Macros</code> to it.
              </li>
            </ol>
          </li>
          <li>
            Under <strong>Otherwise</strong>: <strong>Set Variable</strong> <code>Macros</code> to the first dictionary.
          </li>
          <li>
            After <strong>End If</strong>, add four <strong>Log Health Sample</strong> actions, each reading its value
            from <code>Macros</code>:
            <ul className={styles.setupSubList}>
              <li>
                Dietary Energy ← <code>kcal</code> (kcal)
              </li>
              <li>
                Protein ← <code>protein_g</code> (g)
              </li>
              <li>
                Carbohydrates ← <code>carbs_g</code> (g)
              </li>
              <li>
                Total Fat ← <code>fat_g</code> (g)
              </li>
            </ul>
          </li>
          <li>
            Add <strong>Copy to Clipboard</strong> with <code>Macros</code>, then <strong>Show Notification</strong>{' '}
            &ldquo;Logged to Apple Health&rdquo;.
          </li>
        </ol>

        <h3 className={styles.recentMealsTitle}>Prompt for Ask Claude</h3>
        <pre className={styles.promptBlock}>{CLAUDE_ESTIMATE_PROMPT}</pre>
        <button type="button" className={styles.secondaryButton} onClick={() => void copyPromptToClipboard()}>
          Copy prompt
        </button>
        {copyStatusMessage ? (
          <p className={styles.hintText} role="status">
            {copyStatusMessage}
          </p>
        ) : null}
      </section>

      <section className={styles.card} aria-labelledby="setup-try-title">
        <h2 id="setup-try-title" className={styles.cardTitle}>
          3. Log your first meal
        </h2>
        <ol className={styles.setupList}>
          <li>
            Type a meal on the <Link to="/automatic-food-logger/">log page</Link> and tap{' '}
            <strong>Log to Apple Health</strong>. Allow Health access and running from Food Logger the first time.
          </li>
          <li>
            Come back with the <strong>◀</strong> link at the top-left of the screen.
          </li>
          <li>
            If Claude estimated the macros, tap <strong>Paste estimate</strong> on the meal and allow pasting.
          </li>
          <li>Check Health → Browse → Nutrition to see the new entries.</li>
        </ol>
      </section>
    </article>
  )
}
