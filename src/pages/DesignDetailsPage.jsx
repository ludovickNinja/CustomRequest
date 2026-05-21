import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import TopBar from '../components/shared/TopBar.jsx';
import Stepper from '../components/shared/Stepper.jsx';
import PageFooter from '../components/shared/PageFooter.jsx';
import DesignDetailsForm from '../components/page3/DesignDetailsForm.jsx';
import { findCollection } from '../data/collections.js';
import { useCustomRequest } from '../state/CustomRequestContext.jsx';

export default function DesignDetailsPage() {
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
      <TopBar backTo={`/design/${collection}`} backLabel="Back to Contact Information" />
      <Stepper currentStep={3} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <DesignDetailsForm />
      </main>
      <PageFooter />
    </div>
  );
}
