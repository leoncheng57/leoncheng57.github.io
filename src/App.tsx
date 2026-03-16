import React from 'react'
import Copyright from './components/copyright/copyright'
import Experiences from './components/experiences/experiences'
import Headline from './components/headline/headline'
import Social from './components/social/social'
import styles from './App.module.css'

const App: React.FC = () => {
  return (
    <div className={styles.container}>
      <main>
        <Headline />
        <hr />
        <Social />
        <hr />
        <Experiences />
        <Copyright />
      </main>
    </div>
  )
}

export default App
