import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './nav.module.css'

const Nav: React.FC = () => {
  const location = useLocation()

  return (
    <nav className={styles.nav}>
      <Link to="/" className={location.pathname === '/' ? styles.active : ''}>
        Home
      </Link>
      <Link
        to="/apps"
        className={location.pathname === '/apps' ? styles.active : ''}
      >
        Apps
      </Link>
    </nav>
  )
}

export default Nav
