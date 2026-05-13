import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/nav/nav'
import Home from './pages/Home'
import Apps from './pages/Apps'
import styles from './App.module.css'

const App: React.FC = () => {
  return (
    <div className={styles.container}>
      <img src="/lc-logo.svg" alt="LC Logo" className={styles.logo} />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apps" element={<Apps />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
