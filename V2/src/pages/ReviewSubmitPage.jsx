import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, Send } from 'lucide-react';
import TopBar from '../components/shared/TopBar.jsx';
import Stepper from '../components/shared/Stepper.jsx';
import PageFooter from '../components/shared/PageFooter.jsx';
import { findCollection } from '../data/collections.js';
import { useCustomRequest } from '../state/CustomRequestContext.jsx';
import { metalSummary } from '../components/page3/MetalSection.jsx';

function Row({ label, value }) {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[180px_1fr] sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-800">{value}</dd>
    </div>
  );
}

function SectionCard({ title, editTo, children }) {
  return (
    <section className="card-panel p-6">
      <header className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl text-stone-900">{title}</h3>
        {editTo && (
          <Link
            to={editTo}
            className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>
        )}
      </header>
      <dl className="mt-3 divide-y divide-stone-100">{children}</dl>
    </section>
  );
}

function formatDateTime(date, time) {
  if (!date) return '';
  const parts = [date];
  if (time) parts.push(time);
  return parts.join(' · ');
}

function quoteTypeLabel(id) {
  if (id === 'quote-only') return 'Quote only';
  if (id === 'quote-and-design') return 'Quote and design';
  return id || '';
}

function preferredContactLabel(id) {
  if (id === 'either') return 'Either is fine';
  if (id === 'email') return 'Email';
  if (id === 'phone') return 'Phone';
  return id || '';
}

function projectTypeLabel(contact) {
  if (contact.projectType === 'Other' && contact.projectTypeOther) {
    return `Other — ${contact.projectTypeOther}`;
  }
  return contact.projectType || '';
}

function centerStoneSummary(cs) {
  const typeLabel = cs.type === 'Gemstone' && cs.typeOther ? `Gemstone — ${cs.typeOther}` : cs.type;
  const shapeLabel = cs.shape === 'Other' && cs.shapeOther ? `Other — ${cs.shapeOther}` : cs.shape;
  return { typeLabel, shapeLabel };
}

export default function ReviewSubmitPage() {
  const { collection: collectionId } = useParams();
  const navigate = useNavigate();
  const { state, setDesignField, resetAll } = useCustomRequest();
  const collection = findCollection(collectionId);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const contact = state.contact;
  const design = state.design;
  const cs = design.centerStone;
  const csSummary = useMemo(() => centerStoneSummary(cs), [cs]);

  const incomplete = !contact.email || !contact.contactName || !design.skus.length || !design.fingerSize;

  function submit() {
    setSubmitting(true);
    const submittedAt = new Date().toISOString();
    setDesignField('submittedAt', submittedAt);
    const payload = {
      submittedAt,
      collection: collectionId,
      contact,
      design,
    };
    // Real backend integration would go here. For now we keep a local
    // submission record so the confirmation page can show what was sent.
    if (typeof window !== 'undefined') {
      try {
        const key = 'customrequest:submissions';
        const prior = JSON.parse(window.localStorage.getItem(key) || '[]');
        prior.push(payload);
        window.localStorage.setItem(key, JSON.stringify(prior));
      } catch {
        // ignore quota errors
      }
    }
    setConfirmation(payload);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!collection) return <Navigate to="/" replace />;

  if (confirmation) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Stepper currentStep={4} />
        <main className="mx-auto max-w-2xl px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-white">
            <Check className="h-8 w-8" />
          </span>
          <h2 className="mt-5 font-serif text-4xl text-stone-900">Request Submitted</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-stone-500">
            Thanks, {contact.contactName.split(' ')[0] || 'there'}! Your custom request has been recorded.
            Our team will follow up at <span className="font-medium text-stone-700">{contact.email}</span> within 24–48 business hours.
          </p>
          <p className="mt-2 text-xs text-stone-400">
            Reference: {new Date(confirmation.submittedAt).toLocaleString()}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                resetAll();
                navigate('/');
              }}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-gold-100 hover:bg-neutral-800"
            >
              Start a New Request
            </button>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <TopBar backTo={`/design/${collectionId}/details`} backLabel="Back to Design Details" />
      <Stepper currentStep={4} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="px-1">
          <h2 className="font-serif text-4xl text-stone-900">Review & Submit</h2>
          <p className="mt-2 text-sm text-stone-500">
            Take a moment to confirm the details below. You can jump back to any step to make changes before submitting.
          </p>
        </div>

        {incomplete && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Some required information is missing. Please head back and complete the earlier steps before submitting.
          </div>
        )}

        <div className="mt-6 space-y-4">
          <SectionCard title="Selected Collection" editTo="/">
            <Row label="Collection" value={collection.shortLabel || collection.label} />
            {collection.tagline && <Row label="Tagline" value={collection.tagline} />}
          </SectionCard>

          <SectionCard title="Contact Information" editTo={`/design/${collectionId}`}>
            <Row label="Account / Company" value={contact.accountName} />
            <Row label="Contact Name" value={contact.contactName} />
            <Row label="Email" value={contact.email} />
            {contact.cc?.length > 0 && <Row label="CC" value={contact.cc.join(', ')} />}
            <Row label="Phone" value={contact.phone ? `${contact.phoneCountry || ''} ${contact.phone}`.trim() : ''} />
            <Row label="Project Type" value={projectTypeLabel(contact)} />
            <Row label="Quote Type" value={quoteTypeLabel(contact.quoteType)} />
            <Row label="Preferred Contact" value={preferredContactLabel(contact.preferredContact)} />
            {contact.hasAppointment === 'yes' && (
              <Row label="Appointment" value={formatDateTime(contact.appointmentDate, contact.appointmentTime)} />
            )}
            <Row label="Notes" value={contact.notes} />
          </SectionCard>

          <SectionCard title="Design Details" editTo={`/design/${collectionId}/details`}>
            <Row label="SKU(s)" value={design.skus.join(', ')} />
            <Row label="Metal" value={metalSummary(design.metal)} />
            <Row label="Finger Size" value={design.fingerSize ? `${design.fingerSize} (${design.fingerSizeSystem})` : ''} />
            <Row label="Notes" value={design.notes} />
            {design.uploads?.length > 0 && (
              <Row label="Reference Files" value={`${design.uploads.length} file${design.uploads.length === 1 ? '' : 's'} attached`} />
            )}
          </SectionCard>

          {design.includeCenterStone && (
            <SectionCard title="Center Stone" editTo={`/design/${collectionId}/details`}>
              <Row label="Provided By" value={cs.provideStone === 'yes' ? 'Crown Ring' : 'Customer'} />
              {cs.provideStone === 'yes' && <Row label="Certification" value={cs.certified === 'yes' ? 'Certified' : 'Not certified'} />}
              {cs.provideStone === 'no' && <Row label="Setting" value={cs.setStone === 'yes' ? 'Crown Ring will set the stone' : 'Customer will set'} />}
              <Row label="Stone Type" value={csSummary.typeLabel} />
              <Row label="Shape" value={csSummary.shapeLabel} />
              <Row label="Carat Weight" value={cs.carat ? `${cs.carat} ${cs.caratUnit || 'ct'}` : ''} />
              <Row label="Color" value={cs.color} />
              <Row label="Clarity" value={cs.clarity} />
              {cs.provideStone === 'no' && (
                <Row label="Measurements" value={[cs.length, cs.width, cs.depth].every(Boolean) ? `${cs.length} × ${cs.width} × ${cs.depth} mm` : ''} />
              )}
              <Row label="Notes" value={cs.notes} />
              {cs.uploads?.length > 0 && (
                <Row label="Stone Photos" value={`${cs.uploads.length} file${cs.uploads.length === 1 ? '' : 's'} attached`} />
              )}
            </SectionCard>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/design/${collectionId}/details`)}
            className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Design Details
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || incomplete}
            className={
              'inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition ' +
              (submitting || incomplete
                ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                : 'bg-neutral-900 text-gold-100 hover:bg-neutral-800')
            }
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
            <Send className="h-4 w-4" />
          </button>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
