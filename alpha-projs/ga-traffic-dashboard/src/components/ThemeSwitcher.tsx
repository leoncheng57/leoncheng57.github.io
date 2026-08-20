import { THEMES, type Theme } from '../themes'
import styles from './ThemeSwitcher.module.css'

// Temporary, standalone control for previewing the curated dashboard
// themes defined in `../themes`. It is fully controlled by props and is
// NOT wired into `App.tsx` or any other page yet - rendering it has no
// effect on the live dashboard. It exists so themes can be reviewed and
// iterated on in isolation before a deliberate integration decision.

type ThemeSwitcherProps = {
  themes?: Theme[]
  selectedThemeId: string
  onSelect: (themeId: string) => void
  label?: string
}

export default function ThemeSwitcher({
  themes = THEMES,
  selectedThemeId,
  onSelect,
  label = 'Dashboard theme (preview)',
}: ThemeSwitcherProps) {
  return (
    <div className={styles.switcher}>
      <span className={styles.label} id="theme-switcher-label">
        {label}
      </span>
      <div
        className={styles.optionRow}
        role="radiogroup"
        aria-labelledby="theme-switcher-label"
      >
        {themes.map((theme) => {
          const selected = theme.id === selectedThemeId
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${theme.name}: ${theme.description}`}
              title={theme.description}
              className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
              onClick={() => onSelect(theme.id)}
              style={{
                background: theme.tokens.surface,
                borderColor: selected ? theme.tokens.linkColor : theme.tokens.textMuted,
              }}
            >
              <span
                className={styles.swatch}
                aria-hidden="true"
                style={{
                  background: theme.tokens.bg,
                  boxShadow: `inset 0 0 0 0.5rem ${theme.tokens.surface}, inset 0 0 0 0.85rem ${theme.tokens.linkColor}`,
                }}
              >
                <span
                  className={styles.swatchAccent}
                  style={{ background: theme.tokens.accentWarm }}
                />
              </span>
              <span className={styles.optionText} style={{ color: theme.tokens.textPrimary }}>
                {theme.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
