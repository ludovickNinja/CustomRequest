import PageHeader from '../components/page1/PageHeader.jsx';
import CollectionCard from '../components/page1/CollectionCard.jsx';
import FullCustomBanner from '../components/page1/FullCustomBanner.jsx';
import TrustFooter from '../components/page1/TrustFooter.jsx';
import { collections } from '../data/collections.js';
import { useCustomRequest } from '../state/CustomRequestContext.jsx';

export default function CustomRequestPage() {
  const { setCollection } = useCustomRequest();
  return (
    <main className="min-h-screen bg-stone-50">
      <PageHeader />
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
        {collections.map((c) => (
          <CollectionCard key={c.id} collection={c} onChoose={setCollection} />
        ))}
      </section>
      <FullCustomBanner onChoose={setCollection} />
      <TrustFooter />
    </main>
  );
}
