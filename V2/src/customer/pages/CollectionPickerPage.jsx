/**
 * Step 1 of the customer flow — the landing/collection picker.
 *
 * The customer either picks a known collection (CrownRing, Noam Carver,
 * MFit My Caroline) or opts for a Full Custom request. Choosing a
 * collection persists it into the form context and navigates them on to
 * the Contact Information page.
 *
 * The PageHeader also surfaces the "View Ongoing Requests" link that
 * sends returning customers to /requests.
 */
import PageHeader from '../components/collection/PageHeader.jsx';
import CollectionCard from '../components/collection/CollectionCard.jsx';
import FullCustomBanner from '../components/collection/FullCustomBanner.jsx';
import PageFooter from '../../shared/PageFooter.jsx';
import { collections } from '../../data/collections.js';
import { useCustomRequest } from '../../state/CustomRequestContext.jsx';

export default function CustomRequestPage() {
  const { setCollection } = useCustomRequest();
  return (
    <div className="min-h-screen bg-stone-50">
      <main>
        <PageHeader />
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} onChoose={setCollection} />
          ))}
        </section>
        <FullCustomBanner onChoose={setCollection} />
      </main>
      <PageFooter />
    </div>
  );
}
