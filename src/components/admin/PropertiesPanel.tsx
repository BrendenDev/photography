import { useState, useEffect } from 'react';
import TagInput from './TagInput';

interface PropertiesPanelProps {
  mode: 'collection' | 'photo';
  json: Record<string, unknown>;
  availableTags: string[];
  onApply: (updatedJson: Record<string, unknown>) => void;
}

function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/\bIso\b/g, 'ISO')
    .replace(/\bGps\b/g, 'GPS');
}

/**
 * Parse a wide variety of date formats into YYYY-MM-DD.
 * Handles: 09-2-3002, 2/23/4245, Jan 5th 2014, March 2024, 2024-01-15, etc.
 */
function parseFlexibleDate(input: string): string {
  if (!input?.trim()) return '';
  const s = input.trim();

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // Try native Date parsing for common formats
  // Remove ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
  const cleaned = s.replace(/(\d+)(st|nd|rd|th)/gi, '$1');

  // Month name patterns: "Jan 5, 2014" / "January 5 2014" / "5 Jan 2014" / "March 2024"
  const monthNames: Record<string, number> = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6,
    jul: 7, july: 7, aug: 8, august: 8, sep: 9, september: 9,
    oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
  };

  // "Month Day, Year" or "Month Day Year"
  const mdy = cleaned.match(/^([a-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (mdy) {
    const m = monthNames[mdy[1].toLowerCase()];
    if (m) return `${mdy[3]}-${String(m).padStart(2, '0')}-${mdy[2].padStart(2, '0')}`;
  }

  // "Day Month Year"
  const dmy = cleaned.match(/^(\d{1,2})\s+([a-z]+),?\s+(\d{4})$/i);
  if (dmy) {
    const m = monthNames[dmy[2].toLowerCase()];
    if (m) return `${dmy[3]}-${String(m).padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }

  // "Month Year" (no day)
  const my = cleaned.match(/^([a-z]+)\s+(\d{4})$/i);
  if (my) {
    const m = monthNames[my[1].toLowerCase()];
    if (m) return `${my[2]}-${String(m).padStart(2, '0')}-01`;
  }

  // Numeric: MM/DD/YYYY or MM-DD-YYYY or DD/MM/YYYY
  const numeric = cleaned.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (numeric) {
    let [, a, b, year] = numeric;
    // If first number > 12, it's DD/MM/YYYY
    const n1 = parseInt(a);
    let month: string, day: string;
    if (n1 > 12) { month = b; day = a; }
    else { month = a; day = b; }
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // YYYY/MM/DD
  const ymd = cleaned.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (ymd) {
    return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
  }

  // Fallback: try native parser
  const d = new Date(cleaned);
  if (!isNaN(d.getTime()) && d.getFullYear() > 1800) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Can't parse — return original
  return s;
}

const DateInput = ({ label, value, onChange }: { label: string; value: unknown; onChange: (v: string) => void }) => (
  <div className="mb-4">
    <label className="block mb-1 text-sm font-medium capitalize" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
    <input
      type="text"
      className="admin-input w-full"
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => {
        const formatted = parseFlexibleDate(e.target.value);
        if (formatted !== e.target.value) onChange(formatted);
      }}
      placeholder="e.g. Jan 5, 2014 or 2024-01-15"
    />
  </div>
);

const TextInput = ({ label, value, onChange, disabled = false, placeholder = '' }: any) => (
  <div className="mb-4">
    <label className="block mb-1 text-sm font-medium capitalize" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
    <input
      type="text"
      className="admin-input w-full"
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
    />
  </div>
);

const TextArea = ({ label, value, onChange, rows = 3 }: any) => (
  <div className="mb-4">
    <label className="block mb-1 text-sm font-medium capitalize" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
    <textarea
      className="admin-input w-full"
      rows={rows}
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const CheckboxInput = ({ label, checked, onChange }: any) => (
  <div className="mb-4 flex items-center gap-2">
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4"
    />
    <label className="text-sm font-medium capitalize" style={{ color: 'var(--admin-text-secondary)' }}>{label}</label>
  </div>
);

const ReadOnlyField = ({ label, value }: any) => (
  <div className="mb-4">
    <label className="block mb-1 text-sm font-medium capitalize" style={{ color: 'var(--admin-text-secondary)' }}>{label} (read-only)</label>
    <div className="admin-input opacity-50 bg-transparent">{typeof value === 'object' ? JSON.stringify(value) : String(value || '')}</div>
  </div>
);

function renderCollectionForm(
  form: Record<string, unknown>,
  set: (k: string, v: unknown) => void,
  setNested: (p: string, c: string, v: unknown) => void,
  availableTags: string[]
) {
  return (
    <>
      <TextInput label="title" value={form.title} onChange={(v: string) => set('title', v)} />
      <TextInput label="slug" value={form.slug} onChange={(v: string) => set('slug', v)} disabled />
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium capitalize" style={{ color: 'var(--admin-text-secondary)' }}>volumeNumber</label>
        <input
          type="number"
          className="admin-input w-full"
          value={form.volumeNumber as number || ''}
          onChange={(e) => set('volumeNumber', parseInt(e.target.value, 10))}
        />
      </div>
      <TextArea label="description" value={form.description} onChange={(v: string) => set('description', v)} rows={3} />
      <TextArea label="story" value={form.story} onChange={(v: string) => set('story', v)} rows={4} />
      <TagInput
        tags={Array.isArray(form.tags) ? form.tags as string[] : []}
        availableTags={availableTags}
        onChange={(tags) => set('tags', tags)}
      />
      <DateInput label="dateRange.from" value={(form.dateRange as Record<string, string>)?.from} onChange={(v: string) => setNested('dateRange', 'from', v)} />
      <DateInput label="dateRange.to" value={(form.dateRange as Record<string, string>)?.to} onChange={(v: string) => setNested('dateRange', 'to', v)} />
      <TextInput label="location" value={form.location} onChange={(v: string) => set('location', v)} />
      <CheckboxInput label="featured" checked={form.featured} onChange={(v: boolean) => set('featured', v)} />
      <CheckboxInput label="visible" checked={form.visible} onChange={(v: boolean) => set('visible', v)} />
    </>
  );
}

function renderPhotoForm(
  form: Record<string, unknown>,
  set: (k: string, v: unknown) => void,
  availableTags: string[]
) {
  const metadata = form.metadata as Record<string, unknown> | undefined;

  return (
    <>
      <TextInput label="title" value={form.title} onChange={(v: string) => set('title', v)} />
      <TextInput label="slug" value={form.slug} onChange={(v: string) => set('slug', v)} disabled />
      <TextArea label="caption" value={form.caption} onChange={(v: string) => set('caption', v)} rows={3} />
      <TextArea label="story" value={form.story} onChange={(v: string) => set('story', v)} rows={4} />
      <TextArea label="curatorNote" value={form.curatorNote} onChange={(v: string) => set('curatorNote', v)} rows={3} />
      <TagInput
        tags={Array.isArray(form.tags) ? form.tags as string[] : []}
        availableTags={availableTags}
        onChange={(tags) => set('tags', tags)}
      />
      <DateInput label="dateTaken" value={form.dateTaken} onChange={(v: string) => set('dateTaken', v)} />
      <TextInput label="location" value={form.location} onChange={(v: string) => set('location', v)} />
      <TextInput label="altText" value={form.altText} onChange={(v: string) => set('altText', v)} />
      <ReadOnlyField label="orientation" value={form.orientation} />
      <ReadOnlyField label="dimensions" value={form.dimensions} />
      
      {metadata && Object.keys(metadata).length > 0 && (
        <div className="mt-6 mb-4">
          <h3 className="font-bold text-sm mb-3 border-b pb-1" style={{ color: 'var(--admin-text-primary)', borderColor: 'var(--admin-border)' }}>Camera Metadata</h3>
          {Object.entries(metadata).map(([key, val]) => (
            <ReadOnlyField key={key} label={camelToTitle(key)} value={val} />
          ))}
        </div>
      )}
    </>
  );
}

export default function PropertiesPanel({ mode, json, availableTags, onApply }: PropertiesPanelProps) {
  const [form, setForm] = useState<Record<string, unknown>>({});
  useEffect(() => { setForm(JSON.parse(JSON.stringify(json))); }, [json]);

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));
  const setNested = (parent: string, child: string, value: unknown) => {
    setForm(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] as Record<string, unknown> || {}), [child]: value }
    }));
  };

  return (
    <div className="w-80 flex flex-col admin-panel border-l border-t-0 border-b-0 border-r-0 overflow-hidden">
      <div className="p-4 border-b" style={{borderColor: 'var(--admin-border)'}}>
        <h2 className="font-bold text-lg">{mode === 'collection' ? 'Collection' : 'Photo'} Properties</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'collection'
          ? renderCollectionForm(form, set, setNested, availableTags)
          : renderPhotoForm(form, set, availableTags)}
      </div>
      <div className="p-4 border-t" style={{borderColor: 'var(--admin-border)'}}>
        <button onClick={() => onApply(form)} className="admin-btn admin-btn-primary w-full">Apply Changes</button>
      </div>
    </div>
  );
}
