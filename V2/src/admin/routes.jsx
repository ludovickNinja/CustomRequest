/**
 * Admin (In House) section routes.
 *
 * - "/admin"                    — Admin Operations: the reference-level
 *                                 Request Queue across every account.
 * - "/admin/reference/:referenceNo" — the per-reference detail panel
 *                                 (status, factory, renderings, messages,
 *                                 pricing).
 *
 * Access is URL-gated today (no auth). When real auth lands, wrap these
 * routes with a role guard so only admin users can reach them.
 */
import { Route } from 'react-router-dom';
import AdminHomePage from './pages/AdminHomePage.jsx';
import AdminReferencePage from './pages/AdminReferencePage.jsx';

export default function adminRoutes() {
  return [
    <Route key="admin-home" path="/admin" element={<AdminHomePage />} />,
    <Route key="admin-reference" path="/admin/reference/:referenceNo" element={<AdminReferencePage />} />,
    // Any other /admin/* path falls back to the queue.
    <Route key="admin-catchall" path="/admin/*" element={<AdminHomePage />} />,
  ];
}
