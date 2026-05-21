import { useRef, useState } from 'react';
import { Upload, X, FileText, Plus } from 'lucide-react';

const ACCEPT = 'image/jpeg,image/png,application/pdf';
const MAX_BYTES = 10 * 1024 * 1024;

export default function ReferenceImagesUploader({ value, onChange }) {
  const fileInput = useRef(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files) {
    const next = [...value];
    const errors = [];
    Array.from(files).forEach((file) => {
      if (!ACCEPT.split(',').includes(file.type)) {
        errors.push(`${file.name}: unsupported type.`);
        return;
      }
      if (file.size > MAX_BYTES) {
        errors.push(`${file.name}: exceeds 10MB.`);
        return;
      }
      next.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        blobUrl: URL.createObjectURL(file),
      });
    });
    onChange(next);
    setError(errors.join(' '));
  }

  function remove(id) {
    const target = value.find((u) => u.id === id);
    if (target?.blobUrl) {
      try { URL.revokeObjectURL(target.blobUrl); } catch { /* noop */ }
    }
    onChange(value.filter((u) => u.id !== id));
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <p className="label-base">Upload Reference Images (Optional)</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_repeat(3,_minmax(0,_1fr))_auto]">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ' +
            (dragOver
              ? 'border-gold-500 bg-gold-50'
              : 'border-gold-300 bg-gold-50/30 hover:border-gold-400')
          }
        >
          <Upload className="h-5 w-5 text-gold-700" />
          <p className="mt-2 text-sm font-medium text-stone-700">Click to upload or drag and drop</p>
          <p className="mt-1 text-xs text-stone-500">JPG, PNG or PDF (Max. 10MB each)</p>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {value.map((upload) => (
          <div
            key={upload.id}
            className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
          >
            {upload.type === 'application/pdf' || !upload.blobUrl ? (
              <div className="flex flex-col items-center p-2 text-center text-stone-500">
                <FileText className="h-8 w-8" />
                <p className="mt-1 line-clamp-2 text-[10px]">{upload.name}</p>
                {!upload.blobUrl && (
                  <p className="text-[9px] text-amber-700">Re-attach required</p>
                )}
              </div>
            ) : (
              <img src={upload.blobUrl} alt={upload.name} className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => remove(upload.id)}
              aria-label={`Remove ${upload.name}`}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex aspect-square min-w-[80px] flex-col items-center justify-center rounded-xl border border-stone-300 bg-white text-stone-500 hover:border-stone-400 hover:text-stone-700"
        >
          <Plus className="h-5 w-5" />
          <span className="mt-1 text-xs">Add more</span>
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
