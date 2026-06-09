/**
 * Composition root for the V2 single-page app.
 *
 * V2 serves three user roles from one bundle: customer, admin, and factory.
 * Each role owns its own folder under V2/src and exports its route subtree
 * from a `routes.jsx` module. We mount all three subtrees here and fall
 * back to the customer home page for any unmatched path.
 *
 * The whole tree is wrapped in <CustomRequestProvider> because the
 * customer flow keeps its in-progress form state in React Context. Admin
 * and factory pages don't read from that context — they go through the
 * `services/submissionsStore` module instead — but it's harmless to have
 * the provider mounted everywhere.
 *
 * <ViewSwitcher> lives outside <Routes> so the single floating dropdown in
 * the top-right corner persists across every page and role.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomRequestProvider } from './state/CustomRequestContext.jsx';
import ViewSwitcher from './shared/ViewSwitcher.jsx';
import customerRoutes from './customer/routes.jsx';
import adminRoutes from './admin/routes.jsx';
import factoryRoutes from './factory/routes.jsx';

export default function App() {
  return (
    <CustomRequestProvider>
      <ViewSwitcher />
      <Routes>
        {/* Each role's route module returns an array of <Route> elements. */}
        {customerRoutes()}
        {adminRoutes()}
        {factoryRoutes()}
        {/* Anything we didn't recognize sends the user back to the picker. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CustomRequestProvider>
  );
}
