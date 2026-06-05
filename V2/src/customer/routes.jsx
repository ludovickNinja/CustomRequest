/**
 * Customer-facing routes.
 *
 * The customer flow is the main reason this app exists. A buyer:
 *   1. picks a collection on  "/"
 *   2. fills out contact info on  "/design/:collection"
 *   3. fills out one or more designs on  "/design/:collection/details"
 *   4. confirms and submits on  "/design/:collection/review"
 *
 * After they've submitted at least one request, they can come back via the
 * "View Ongoing Requests" link on the collection picker:
 *   - "/requests"        — searchable / sortable list of their submissions
 *   - "/requests/:id"    — detail view with comments thread and quote panel
 */
import { Route } from 'react-router-dom';
import CollectionPickerPage from './pages/CollectionPickerPage.jsx';
import ContactInfoPage from './pages/ContactInfoPage.jsx';
import DesignDetailsPage from './pages/DesignDetailsPage.jsx';
import ReviewSubmitPage from './pages/ReviewSubmitPage.jsx';
import RequestsListPage from './pages/RequestsListPage.jsx';
import RequestDetailPage from './pages/RequestDetailPage.jsx';

export default function customerRoutes() {
  return [
    <Route key="customer-home" path="/" element={<CollectionPickerPage />} />,
    <Route key="customer-contact" path="/design/:collection" element={<ContactInfoPage />} />,
    <Route key="customer-details" path="/design/:collection/details" element={<DesignDetailsPage />} />,
    <Route key="customer-review" path="/design/:collection/review" element={<ReviewSubmitPage />} />,
    <Route key="customer-requests" path="/requests" element={<RequestsListPage />} />,
    <Route key="customer-request-detail" path="/requests/:id" element={<RequestDetailPage />} />,
  ];
}
