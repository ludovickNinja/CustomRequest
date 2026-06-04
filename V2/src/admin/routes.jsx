/**
 * Admin section routes.
 *
 * Today this is only a placeholder home page reachable at /admin so that the
 * URL responds with something sensible instead of redirecting to the
 * customer view. Future admin pages (dashboard, full submissions table,
 * quote editor, etc.) drop into this folder and get registered here.
 *
 * Access is URL-gated today (no auth). When real auth lands, wrap these
 * routes with a role guard so only admin users can reach them.
 */
import { Route } from 'react-router-dom';
import AdminHomePage from './pages/AdminHomePage.jsx';

export default function adminRoutes() {
  return [
    <Route key="admin-home" path="/admin" element={<AdminHomePage />} />,
    // Catch-all sub-routes render the same placeholder so the URL space
    // is reserved; replace with real routes as features ship.
    <Route key="admin-catchall" path="/admin/*" element={<AdminHomePage />} />,
  ];
}
