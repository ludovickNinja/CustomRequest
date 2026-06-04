import { Route } from 'react-router-dom';
import CollectionPickerPage from './pages/CollectionPickerPage.jsx';
import ContactInfoPage from './pages/ContactInfoPage.jsx';
import DesignDetailsPage from './pages/DesignDetailsPage.jsx';
import ReviewSubmitPage from './pages/ReviewSubmitPage.jsx';

export default function customerRoutes() {
  return [
    <Route key="customer-home" path="/" element={<CollectionPickerPage />} />,
    <Route key="customer-contact" path="/design/:collection" element={<ContactInfoPage />} />,
    <Route key="customer-details" path="/design/:collection/details" element={<DesignDetailsPage />} />,
    <Route key="customer-review" path="/design/:collection/review" element={<ReviewSubmitPage />} />,
  ];
}
