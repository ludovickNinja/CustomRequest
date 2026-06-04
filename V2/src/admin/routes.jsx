import { Route } from 'react-router-dom';
import AdminHomePage from './pages/AdminHomePage.jsx';

export default function adminRoutes() {
  return [
    <Route key="admin-home" path="/admin" element={<AdminHomePage />} />,
    <Route key="admin-catchall" path="/admin/*" element={<AdminHomePage />} />,
  ];
}
