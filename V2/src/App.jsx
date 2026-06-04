import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomRequestProvider } from './state/CustomRequestContext.jsx';
import CustomRequestPage from './pages/CustomRequestPage.jsx';
import ContactInfoPage from './pages/ContactInfoPage.jsx';
import DesignDetailsPage from './pages/DesignDetailsPage.jsx';
import ReviewSubmitPage from './pages/ReviewSubmitPage.jsx';

export default function App() {
  return (
    <CustomRequestProvider>
      <Routes>
        <Route path="/" element={<CustomRequestPage />} />
        <Route path="/design/:collection" element={<ContactInfoPage />} />
        <Route path="/design/:collection/details" element={<DesignDetailsPage />} />
        <Route path="/design/:collection/review" element={<ReviewSubmitPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CustomRequestProvider>
  );
}
