import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomRequestProvider } from './state/CustomRequestContext.jsx';
import customerRoutes from './customer/routes.jsx';
import adminRoutes from './admin/routes.jsx';
import factoryRoutes from './factory/routes.jsx';

export default function App() {
  return (
    <CustomRequestProvider>
      <Routes>
        {customerRoutes()}
        {adminRoutes()}
        {factoryRoutes()}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CustomRequestProvider>
  );
}
