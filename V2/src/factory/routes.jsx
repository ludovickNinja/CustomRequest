/**
 * Factory section routes.
 *
 * Today this is only a placeholder home page reachable at /factory so the
 * URL responds with something sensible. Future factory pages (production
 * queue, job status, etc.) drop into this folder and register here.
 *
 * Access is URL-gated today (no auth). When real auth lands, wrap these
 * routes with a role guard.
 */
import { Route } from 'react-router-dom';
import FactoryHomePage from './pages/FactoryHomePage.jsx';

export default function factoryRoutes() {
  return [
    <Route key="factory-home" path="/factory" element={<FactoryHomePage />} />,
    // Reserve the sub-route space behind the same placeholder.
    <Route key="factory-catchall" path="/factory/*" element={<FactoryHomePage />} />,
  ];
}
