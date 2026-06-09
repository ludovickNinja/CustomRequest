/**
 * Renderings for one reference — the factory-provided 3D viewer, angle
 * renders, and spec sheet. Shared by the customer and admin design-detail
 * pages. We can't host real models/images in this POC, so each item is a
 * labelled placeholder card read from the reference's `renderings` object.
 */
import { Box, ImageIcon, FileText, ExternalLink } from 'lucide-react';

function Placeholder({ caption }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-stone-100 to-blue-50">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-stone-400 ring-1 ring-stone-200">
          <ImageIcon className="h-5 w-5" />
        </span>
      </div>
      <p className="border-t border-stone-100 px-3 py-2 text-xs font-medium text-stone-600">{caption}</p>
    </div>
  );
}

export default function RenderingsSection({ design }) {
  const r = design.renderings || { model: null, angles: [], specSheet: null };
  const empty = !r.model && (!r.angles || r.angles.length === 0) && !r.specSheet;

  return (
    <section className="card-panel p-6">
      <h2 className="font-serif text-xl text-stone-900">Renderings</h2>
      <p className="mt-1 text-sm text-stone-500">
        Factory-provided viewer, render angles, and spec sheet will appear here when uploaded.
      </p>

      {empty ? (
        <p className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
          Nothing uploaded yet.
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          {r.model && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-900">3D Viewer</h3>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                  Open viewer in new tab
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-gold-100">
                  <Box className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-medium text-stone-800">{r.model.name}</p>
                  <p className="text-xs text-stone-500">Interactive 3D model</p>
                </div>
              </div>
            </div>
          )}

          {r.angles?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-900">{r.angles.length} Angle Renders</h3>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {r.angles.map((a) => (
                  <Placeholder key={a.id || a.label} caption={`${design.referenceNo} • ${a.label}`} />
                ))}
              </div>
            </div>
          )}

          {r.specSheet && (
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Spec Sheet</h3>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3">
                <FileText className="h-4 w-4 shrink-0 text-stone-400" />
                <span className="truncate text-sm text-stone-700">{r.specSheet.name}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
