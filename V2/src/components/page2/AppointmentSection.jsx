import { Clock, Calendar } from 'lucide-react';
import FieldRow from '../shared/FieldRow.jsx';

export default function AppointmentSection({
  hasAppointment,
  onHasAppointmentChange,
  appointmentDate,
  appointmentTime,
  onDateChange,
  onTimeChange,
  errors = {},
}) {
  return (
    <div>
      <p className="eyebrow mb-2">When do you need this?</p>
      <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-4">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-gold-700" strokeWidth={1.5} />
          <div className="text-sm text-stone-700">
            Our standard turnaround time is{' '}
            <span className="font-semibold">24–48 business hours.</span>
            <p className="mt-1 text-xs text-stone-500">
              Let us know if you have a specific appointment or deadline.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="label-base">Do you have an appointment with your customer?</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="hasAppointment"
              checked={hasAppointment === 'yes'}
              onChange={() => onHasAppointmentChange('yes')}
              className="accent-gold-500"
            />
            Yes, I have an appointment
          </label>
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="hasAppointment"
              checked={hasAppointment === 'no'}
              onChange={() => onHasAppointmentChange('no')}
              className="accent-gold-500"
            />
            No, standard turnaround is fine
          </label>
        </fieldset>
        {hasAppointment === 'yes' && (
          <div className="space-y-3">
            <FieldRow label="Appointment Date" required htmlFor="appt-date" error={errors.appointmentDate}>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <input
                  id="appt-date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className={'input-base pl-9 ' + (errors.appointmentDate ? 'input-error' : '')}
                />
              </div>
            </FieldRow>
            <FieldRow label="Appointment Time (Optional)" htmlFor="appt-time">
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <input
                  id="appt-time"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="input-base pl-9"
                />
              </div>
            </FieldRow>
          </div>
        )}
      </div>
    </div>
  );
}
