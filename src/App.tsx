import type { ReactElement } from 'react'
import { Route, Routes } from 'react-router-dom'
import PrivacyRoute from './features/apps/whoops-hoops/routes/PrivacyRoute'
import SupportRoute from './features/apps/whoops-hoops/routes/SupportRoute'
import BlogIndexRoute from './features/blog/routes/BlogIndexRoute'
import BlogPostRoute from './features/blog/routes/BlogPostRoute'
import HomeRoute from './routes/HomeRoute'

export default function App(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/blog" element={<BlogIndexRoute />} />
      <Route path="/blog/:slug" element={<BlogPostRoute />} />
      <Route path="/apps/whoops-hoops/privacy" element={<PrivacyRoute />} />
      <Route path="/apps/whoops-hoops/support" element={<SupportRoute />} />
    </Routes>
  )
}
