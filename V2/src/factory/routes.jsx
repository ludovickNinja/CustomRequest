/**
 * Factory section routes.
 *
 * - "/factory"                      — the Factory Workspace: references
 *                                     assigned to the current factory.
 * - "/factory/reference/:referenceNo" — the per-reference detail (specs,
 *                                     production status, renderings upload).
 *
 * Access is URL-gated today (no auth). When real auth lands, wrap these
 * routes with a role guard and derive the current factory from the session.
 */
import { Route } from 'react-router-dom';
import FactoryHomePage from './pages/FactoryHomePage.jsx';
import FactoryReferencePage from './pages/FactoryReferencePage.jsx';

export default function factoryRoutes() {
  return [
    <Route key="factory-home" path="/factory" element={<FactoryHomePage />} />,
    <Route key="factory-reference" path="/factory/reference/:referenceNo" element={<FactoryReferencePage />} />,
    // Any other /factory/* path falls back to the workspace.
    <Route key="factory-catchall" path="/factory/*" element={<FactoryHomePage />} />,
  ];
}
