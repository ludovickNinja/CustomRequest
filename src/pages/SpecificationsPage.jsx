import { Navigate, useParams } from 'react-router-dom';
import TopBar from '../components/shared/TopBar.jsx';
import Stepper from '../components/shared/Stepper.jsx';
import PageFooter from '../components/shared/PageFooter.jsx';
import { findCollection } from '../data/collections.js';

export default function SpecificationsPage() {
  const { collection } = useParams();
  if (!findCollection(collection)) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen bg-stone-50">
      <TopBar backTo={`/design/${collection}/details`} backLabel="Back to Design Details" />
      <Stepper currentStep={4} />
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-serif text-4xl text-stone-900">Specifications</h2>
        <p className="mt-4 text-stone-500">
          Step 4 is coming soon. Your design details have been saved.
        </p>
      </main>
      <PageFooter />
    </div>
  );
}
