/**
 * Step 2 of the customer flow — Contact Information.
 *
 * Layout: form on the left, a sticky summary sidebar on the right that
 * shows the collection chosen on step 1. If the URL parameter doesn't
 * match a known collection we bounce the user back to the picker — that
 * also prevents bookmarking deep URLs that don't make sense without
 * earlier state.
 *
 * The page also syncs the URL's `:collection` param into the form
 * context so a refresh on this page (or arriving via a deep link from a
 * known collection page) doesn't drop the selection.
 */
import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import TopBar from '../../shared/TopBar.jsx';
import Stepper from '../../shared/Stepper.jsx';
import PageFooter from '../../shared/PageFooter.jsx';
import ContactInfoForm from '../components/contact/ContactInfoForm.jsx';
import RequestSummarySidebar from '../components/contact/RequestSummarySidebar.jsx';
import { findCollection } from '../../data/collections.js';
import { useCustomRequest } from '../../state/CustomRequestContext.jsx';

export default function ContactInfoPage() {
  const { collection } = useParams();
  const { state, setCollection } = useCustomRequest();

  useEffect(() => {
    if (collection && state.collection !== collection) {
      setCollection(collection);
    }
  }, [collection, state.collection, setCollection]);

  if (!findCollection(collection)) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-stone-50">
      <TopBar backTo="/" backLabel="Back to Collections" />
      <Stepper currentStep={2} />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <ContactInfoForm />
          <RequestSummarySidebar collectionId={collection} />
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
