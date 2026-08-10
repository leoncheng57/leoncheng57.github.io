import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ScrollToTop from './components/scroll-to-top/ScrollToTop'
import AppsIndexRoute from './features/apps/routes/AppsIndexRoute'
import PrivacyRoute from './features/apps/whoops-hoops/routes/PrivacyRoute'
import SupportRoute from './features/apps/whoops-hoops/routes/SupportRoute'
import BlogIndexRoute from './features/blog/routes/BlogIndexRoute'
import BlogPostRoute from './features/blog/routes/BlogPostRoute'
import GameNightsRoute from './features/game-nights/routes/GameNightsRoute'
import CiRoute from './features/repo/routes/CiRoute'
import PlanningRoute from './features/repo/routes/PlanningRoute'
import PreviewsRoute from './features/repo/routes/PreviewsRoute'
import ProductionRoute from './features/repo/routes/ProductionRoute'
import RepoRoute from './features/repo/routes/RepoRoute'
import WorkoutLabRoute from './features/workout-lab/routes/WorkoutLabRoute'
import HomeRoute from './routes/HomeRoute'

export default function App(): ReactElement {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/blog" element={<BlogIndexRoute />} />
        <Route path="/blog/:slug" element={<BlogPostRoute />} />
        <Route path="/game-nights" element={<GameNightsRoute />} />
        <Route path="/apps" element={<AppsIndexRoute />} />
        <Route path="/repo" element={<RepoRoute />} />
        <Route path="/repo/ci" element={<CiRoute />} />
        <Route path="/repo/production" element={<ProductionRoute />} />
        <Route path="/repo/previews" element={<PreviewsRoute />} />
        <Route path="/repo/planning" element={<PlanningRoute />} />
        {/* The Repo section shipped briefly as /development; keep old links working. */}
        <Route path="/development" element={<Navigate to="/repo" replace />} />
        <Route
          path="/development/previews"
          element={<Navigate to="/repo/previews" replace />}
        />
        <Route path="/apps/whoops-hoops/privacy" element={<PrivacyRoute />} />
        <Route path="/apps/whoops-hoops/support" element={<SupportRoute />} />
        <Route path="/workout-lab/*" element={<WorkoutLabRoute />} />
      </Routes>
    </>
  )
}
