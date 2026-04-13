import type { ReactElement } from 'react'
import { Route, Routes } from 'react-router-dom'
import BlogIndexRoute from './features/blog/routes/BlogIndexRoute'
import BlogPostRoute from './features/blog/routes/BlogPostRoute'
import HomeRoute from './routes/HomeRoute'

export default function App(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/blog" element={<BlogIndexRoute />} />
      <Route path="/blog/:slug" element={<BlogPostRoute />} />
    </Routes>
  )
}
