/**
 * The fixed cluster of controls in the top-right corner, present on every
 * page. Holds the global ViewSwitcher (Customer / Admin / Factory) and,
 * only while in the customer view, the StoreSwitcher that scopes the
 * customer's requests to a single store.
 *
 * Mounted once in App.jsx (outside <Routes>) so a single instance floats
 * above whatever page is rendered.
 */
import { useLocation } from 'react-router-dom';
import StoreSwitcher from './StoreSwitcher.jsx';
import ViewSwitcher from './ViewSwitcher.jsx';

export default function TopRightControls() {
  const { pathname } = useLocation();
  const isCustomer = !pathname.startsWith('/admin') && !pathname.startsWith('/factory');

  return (
    <div className="fixed right-4 top-3 z-50 flex items-center gap-2">
      {isCustomer && <StoreSwitcher />}
      <ViewSwitcher />
    </div>
  );
}
