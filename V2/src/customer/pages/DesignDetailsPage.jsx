/**
 * Step 3 of the customer flow — Design Details.
 *
 * The actual form lives in `DesignDetailsForm.jsx` (which now handles
 * multiple designs at once). This page only sets up the chrome (top
 * bar, stepper, footer), guards against unknown collection slugs, and
 * keeps the URL `:collection` in sync with the form context.
 */
import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import TopBar from '../../shared/TopBar.jsx';
import Stepper from '../../shared/Stepper.jsx';
import PageFooter from '../../shared/PageFooter.jsx';
import DesignDetailsForm from '../components/design/DesignDetailsForm.jsx';
import { findCollection } from '../../data/collections.js';
import { useCustomRequest } from '../../state/CustomRequestContext.jsx';

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
