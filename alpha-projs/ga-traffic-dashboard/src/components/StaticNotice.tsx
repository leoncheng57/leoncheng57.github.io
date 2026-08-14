import styles from '../dashboard.module.css'

// Optional deep link to the GA4 report for this property. Kept out of the
// repo: set VITE_GA_REPORT_URL in .env.local (see .env.example).
const GA_REPORT_URL = import.meta.env.VITE_GA_REPORT_URL as string | undefined

export default function StaticNotice() {
  return (
    <div className={`${styles.card} ${styles.notice}`}>
      <h2>This is a static deployment - no data here</h2>
      <p className={styles.sectionNote}>
        The charts need a local API server that queries Google Analytics with
        private credentials, so they only work on your machine. Static hosts
        like GitHub Pages can&apos;t run it.
      </p>
      <p className={styles.sectionNote}>Run it locally:</p>
      <pre>{`git clone git@github.com:leoncheng57/leoncheng57.github.io.git
cd leoncheng57.github.io/alpha-projs/ga-traffic-dashboard
npm install
cp .env.example .env.local   # fill in your GA4 property + key path
npm run dev
# open http://localhost:5199`}</pre>
      <p className={styles.sectionNote}>
        {GA_REPORT_URL ? (
          <>
            Or view the full data directly in{' '}
            <a href={GA_REPORT_URL} target="_blank" rel="noreferrer">
              Google Analytics - Pages and screens
            </a>
            .
          </>
        ) : (
          'Or view the full data directly in Google Analytics.'
        )}
      </p>
    </div>
  )
}
