/**
 * The fixed cluster of controls in the top-right corner, present on every
 * page. Holds the global ViewSwitcher (Customer / Admin / Factory) and a
 * context switcher that depends on the active view:
 *   - customer → StoreSwitcher (which store am I acting as)
 *   - factory  → FactorySwitcher (which factory am I working as)
 *   - admin    → none (the In House view sees everything)
 *
 * Mounted once in App.jsx (outside <Routes>) so a single instance floats
 * above whatever page is rendered.
 */
import { useLocation } from 'react-router-dom';
import StoreSwitcher from './StoreSwitcher.jsx';
import FactorySwitcher from './FactorySwitcher.jsx';
import ViewSwitcher from './ViewSwitcher.jsx';

export default function TopRightControls() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const isFactory = pathname.startsWith('/factory');
  const isCustomer = !isAdmin && !isFactory;

  return (
    <div className="fixed right-4 top-3 z-50 flex items-center gap-2">
      {isCustomer && <StoreSwitcher />}
      {isFactory && <FactorySwitcher />}
      <ViewSwitcher />
    </div>
  );
}
