import React from 'react'
import styles from './Apps.module.css'

const Apps: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Apps</h1>

      <a
        href="https://apps.apple.com/us/app/whoops-hoops/id6763969713"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.card}
      >
        <div className={styles.cardContent}>
          <h2>Whoops Hoops</h2>
          <p className={styles.subtitle}>A daily NBA player guess game</p>
          <p className={styles.description}>
            Guess a mystery NBA player each day using color-coded clues across
            six attributes: team, conference, division, position, height, and
            age. 304 current NBA players bundled offline — no internet required.
          </p>
          <span className={styles.platform}>iOS / iPadOS / macOS</span>
        </div>
      </a>
    </div>
  )
}

export default Apps
