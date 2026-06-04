import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import TopBar from '../components/shared/TopBar.jsx';
import Stepper from '../components/shared/Stepper.jsx';
import PageFooter from '../components/shared/PageFooter.jsx';
import ContactInfoForm from '../components/page2/ContactInfoForm.jsx';
import RequestSummarySidebar from '../components/page2/RequestSummarySidebar.jsx';
import { findCollection } from '../data/collections.js';
import { useCustomRequest } from '../state/CustomRequestContext.jsx';

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
