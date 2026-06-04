import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, User, Mail, Hash, ArrowLeft, ArrowRight } from 'lucide-react';
import FieldRow from '../../../shared/FieldRow.jsx';
import CcChipInput from './CcChipInput.jsx';
import PhoneInput from './PhoneInput.jsx';
import QuoteTypeCards from './QuoteTypeCards.jsx';
import AppointmentSection from './AppointmentSection.jsx';
import ProjectTypeSelect from './ProjectTypeSelect.jsx';
import NotesTextarea from './NotesTextarea.jsx';
import { useCustomRequest } from '../../../state/CustomRequestContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(contact) {
  const e = {};
  if (!contact.accountName.trim()) e.accountName = 'Required.';
  if (!contact.contactName.trim()) e.contactName = 'Required.';
  if (!contact.email.trim()) e.email = 'Required.';
  else if (!EMAIL_RE.test(contact.email)) e.email = 'Enter a valid email.';
  if (!contact.poReference.trim()) e.poReference = 'Required — enter a PO#, reference, or client name.';
  const digits = contact.phone.replace(/\D/g, '');
  if (!digits) e.phone = 'Required.';
  else if (digits.length < 7) e.phone = 'Please enter a complete phone number.';
  if (!contact.quoteType) e.quoteType = 'Choose one.';
  if (contact.hasAppointment === 'yes' && !contact.appointmentDate) {
    e.appointmentDate = 'Required when an appointment is selected.';
  }
  return e;
}

export default function ContactInfoForm() {
  const { collection } = useParams();
  const navigate = useNavigate();
  const { state, setContact } = useCustomRequest();
  const contact = state.contact;
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function touch(field) { setTouched((t) => ({ ...t, [field]: true })); }
  function update(field, value) {
    setContact({ [field]: value });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate(contact);
    setErrors(v);
    setTouched({
      accountName: true, contactName: true, email: true, poReference: true,
      phone: true, quoteType: true, appointmentDate: true,
    });
    if (Object.keys(v).length === 0) {
      navigate(`/design/${collection}/details`);
    }
  }

  const liveErrors = (() => {
    const v = validate(contact);
    return Object.fromEntries(Object.entries(v).filter(([k]) => touched[k]));
  })();

  const allValid = Object.keys(validate(contact)).length === 0;

  return (
    <form onSubmit={handleSubmit} className="card-panel p-8" noValidate>
      <h2 className="font-serif text-4xl text-stone-900">Tell Us About Your Project</h2>
      <p className="mt-2 text-sm text-stone-500">
        We'll use this information to prepare your quote and contact you regarding your custom request.
      </p>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gold-700" />
          <p className="eyebrow">Contact Information</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldRow label="Account Name / Company Name" required htmlFor="accountName" error={liveErrors.accountName}>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                id="accountName"
                type="text"
                value={contact.accountName}
                onChange={(e) => update('accountName', e.target.value)}
                onBlur={() => touch('accountName')}
                placeholder="Enter company or account name"
                className={'input-base pl-9 ' + (liveErrors.accountName ? 'input-error' : '')}
              />
            </div>
          </FieldRow>
          <FieldRow label="Contact Name" required htmlFor="contactName" error={liveErrors.contactName}>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                id="contactName"
                type="text"
                value={contact.contactName}
                onChange={(e) => update('contactName', e.target.value)}
                onBlur={() => touch('contactName')}
                placeholder="Full name"
                className={'input-base pl-9 ' + (liveErrors.contactName ? 'input-error' : '')}
              />
            </div>
          </FieldRow>
        </div>

        <div className="mt-4">
          <FieldRow label="Email Address" required htmlFor="email" error={liveErrors.email}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                id="email"
                type="email"
                value={contact.email}
                onChange={(e) => update('email', e.target.value)}
                onBlur={() => touch('email')}
                placeholder="name@company.com"
                className={'input-base pl-9 ' + (liveErrors.email ? 'input-error' : '')}
              />
            </div>
          </FieldRow>
        </div>

        <div className="mt-4">
          <CcChipInput value={contact.cc} onChange={(v) => update('cc', v)} />
        </div>

        <div className="mt-4">
          <FieldRow
            label="PO# / Reference / Client Name"
            required
            htmlFor="poReference"
            error={liveErrors.poReference}
            hint="Enter any one — used to identify this request in our system."
          >
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                id="poReference"
                type="text"
                value={contact.poReference}
                onChange={(e) => update('poReference', e.target.value)}
                onBlur={() => touch('poReference')}
                placeholder="e.g. PO-12345, REF-9876, or Smith Wedding"
                maxLength={120}
                className={'input-base pl-9 ' + (liveErrors.poReference ? 'input-error' : '')}
              />
            </div>
          </FieldRow>
        </div>

        <div className="mt-4">
          <FieldRow label="Telephone Number" required htmlFor="phone" error={liveErrors.phone}>
            <PhoneInput
              id="phone"
              country={contact.phoneCountry}
              value={contact.phone}
              onCountryChange={(v) => update('phoneCountry', v)}
              onValueChange={(v) => update('phone', v)}
              error={liveErrors.phone}
            />
          </FieldRow>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuoteTypeCards
          value={contact.quoteType}
          onChange={(v) => update('quoteType', v)}
          error={liveErrors.quoteType}
        />
        <AppointmentSection
          hasAppointment={contact.hasAppointment}
          onHasAppointmentChange={(v) => update('hasAppointment', v)}
          appointmentDate={contact.appointmentDate}
          appointmentTime={contact.appointmentTime}
          onDateChange={(v) => update('appointmentDate', v)}
          onTimeChange={(v) => update('appointmentTime', v)}
          errors={liveErrors}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <p className="eyebrow mb-1.5">Preferred Contact Method</p>
          {[
            { id: 'email', label: 'Email' },
            { id: 'phone', label: 'Phone' },
            { id: 'either', label: 'Either is fine' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 py-0.5 text-sm">
              <input
                type="radio"
                name="preferredContact"
                checked={contact.preferredContact === opt.id}
                onChange={() => update('preferredContact', opt.id)}
                className="accent-gold-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <ProjectTypeSelect
          value={contact.projectType}
          onChange={(v) => update('projectType', v)}
          otherValue={contact.projectTypeOther}
          onOtherChange={(v) => update('projectTypeOther', v)}
        />
        <NotesTextarea value={contact.notes} onChange={(v) => update('notes', v)} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={!allValid}
          className={
            'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition ' +
            (allValid
              ? 'bg-neutral-900 text-gold-100 hover:bg-neutral-800'
              : 'cursor-not-allowed bg-stone-300 text-stone-500')
          }
        >
          Continue to Design Details
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
