import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import RouteMetadata from './components/route-metadata/RouteMetadata'
import ScrollToTop from './components/scroll-to-top/ScrollToTop'
import AppsIndexRoute from './features/apps/routes/AppsIndexRoute'
import PrivacyRoute from './features/apps/whoops-hoops/routes/PrivacyRoute'
import SupportRoute from './features/apps/whoops-hoops/routes/SupportRoute'
import BlogIndexRoute from './features/blog/routes/BlogIndexRoute'
import BlogPostRoute from './features/blog/routes/BlogPostRoute'
import GameNightsRoute from './features/game-nights/routes/GameNightsRoute'
import GuidesIndexRoute from './features/guides/routes/GuidesIndexRoute'
import GuidesRoute from './features/guides/routes/GuidesRoute'
import AlphaProjsRoute from './features/repo/routes/AlphaProjsRoute'
import CiRoute from './features/repo/routes/CiRoute'
import GaTrafficDashboardRoute from './features/repo/routes/GaTrafficDashboardRoute'
import GmailReaderRoute from './features/repo/routes/GmailReaderRoute'
import DesignComponentsRoute from './features/repo/routes/DesignComponentsRoute'
import GoogleAnalyticsRoute from './features/repo/routes/GoogleAnalyticsRoute'
import PlanningRoute from './features/repo/routes/PlanningRoute'
import PreviewsRoute from './features/repo/routes/PreviewsRoute'
import ProductionRoute from './features/repo/routes/ProductionRoute'
import SubWaitRoute from './features/sub-wait/routes/SubWaitRoute'
import TuziRoute from './features/tuzi/routes/TuziRoute'
import WorkoutLabRoute from './features/workout-lab/routes/WorkoutLabRoute'
import HomeRoute from './routes/HomeRoute'

export default function App(): ReactElement {
  return (
    <>
      <RouteMetadata />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/blog" element={<BlogIndexRoute />} />
        <Route path="/blog/:slug" element={<BlogPostRoute />} />
        <Route path="/guides" element={<GuidesIndexRoute />} />
        {/* The standalone agent-dashboard guide was folded into the manager-worker guide. */}
        <Route
          path="/guides/agent-dashboard/*"
          element={
            <Navigate to="/guides/manager-worker-parallel-agents/watch-the-run" replace />
          }
        />
        <Route path="/guides/:slug/*" element={<GuidesRoute />} />
        <Route
          path="/georgies-board-game-nights"
          element={<GameNightsRoute />}
        />
        {/* The page shipped briefly at /game-nights; keep old links working. */}
        <Route
          path="/game-nights"
          element={<Navigate to="/georgies-board-game-nights" replace />}
        />
        <Route path="/apps" element={<AppsIndexRoute />} />
        <Route path="/repo" element={<Navigate to="/" replace />} />
        <Route path="/repo/alpha-projs" element={<AlphaProjsRoute />} />
        <Route
          path="/repo/alpha-projs/ga-traffic-dashboard"
          element={<GaTrafficDashboardRoute />}
        />
        <Route
          path="/repo/alpha-projs/gmail-reader"
          element={<GmailReaderRoute />}
        />
        <Route path="/repo/ci" element={<CiRoute />} />
        <Route path="/repo/design-components" element={<DesignComponentsRoute />} />
        <Route path="/repo/google-analytics" element={<GoogleAnalyticsRoute />} />
        <Route path="/repo/production" element={<ProductionRoute />} />
        <Route path="/repo/previews" element={<PreviewsRoute />} />
        <Route path="/repo/planning" element={<PlanningRoute />} />
        {/* These hub URLs shipped briefly; keep old links from reaching a dead page. */}
        <Route path="/development" element={<Navigate to="/" replace />} />
        <Route
          path="/development/previews"
          element={<Navigate to="/repo/previews" replace />}
        />
        <Route path="/apps/whoops-hoops/privacy" element={<PrivacyRoute />} />
        <Route path="/apps/whoops-hoops/support" element={<SupportRoute />} />
        <Route path="/workout-lab/*" element={<WorkoutLabRoute />} />
        <Route path="/sub-wait/*" element={<SubWaitRoute />} />
        <Route path="/tuzi/*" element={<TuziRoute />} />
      </Routes>
    </>
  )
}
