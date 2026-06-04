export default function NotesTextarea({
  label = 'Additional Notes (Optional)',
  value,
  onChange,
  maxLength = 500,
  placeholder = 'Anything else we should know?',
  rows = 3,
  eyebrowStyle = true,
}) {
  return (
    <div>
      {label && (eyebrowStyle ? (
        <p className="eyebrow mb-1.5">{label}</p>
      ) : (
        <label className="label-base">{label}</label>
      ))}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        className="input-base resize-none"
      />
      <p className="mt-1 text-right text-xs text-stone-400">{value.length}/{maxLength}</p>
    </div>
  );
}
