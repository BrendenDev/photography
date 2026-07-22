import { useState, useEffect } from 'react';

interface Props {
  json: Record<string, unknown>;
  title: string;
  onApply: (updatedJson: Record<string, unknown>) => void;
}

export default function PropertiesPanel({ json, title, onApply }: Props) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(json))); // Deep copy
  }, [json]);

  const handleChange = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (parentKey: string, childKey: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as Record<string, unknown> || {}),
        [childKey]: value
      }
    }));
  };

  const renderField = (key: string, value: unknown, parentKey?: string) => {
    if (key === 'variants' || key === 'slug') {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-1 text-sm font-medium" style={{color: 'var(--admin-text-secondary)'}}>{key} (read-only)</label>
          <div className="admin-input opacity-50 bg-transparent">{JSON.stringify(value)}</div>
        </div>
      );
    }

    const handleChangeFn = (val: unknown) => {
      if (parentKey) handleNestedChange(parentKey, key, val);
      else handleChange(key, val);
    };

    if (typeof value === 'string') {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-1 text-sm font-medium capitalize" style={{color: 'var(--admin-text-secondary)'}}>{key}</label>
          <input
            type="text"
            className="admin-input w-full"
            value={value}
            onChange={(e) => handleChangeFn(e.target.value)}
          />
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-1 text-sm font-medium capitalize" style={{color: 'var(--admin-text-secondary)'}}>{key}</label>
          <input
            type="number"
            className="admin-input w-full"
            value={value}
            onChange={(e) => handleChangeFn(parseFloat(e.target.value))}
          />
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleChangeFn(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-sm font-medium capitalize" style={{color: 'var(--admin-text-secondary)'}}>{key}</label>
        </div>
      );
    }

    if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-1 text-sm font-medium capitalize" style={{color: 'var(--admin-text-secondary)'}}>{key} (comma-separated)</label>
          <textarea
            className="admin-input w-full"
            rows={3}
            value={value.join(', ')}
            onChange={(e) => handleChangeFn(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          />
        </div>
      );
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (parentKey) return null; // Only support 1 level deep
      return (
        <div key={key} className="mb-4 p-3 border rounded" style={{borderColor: 'var(--admin-border)'}}>
          <label className="block mb-3 text-sm font-bold capitalize" style={{color: 'var(--admin-text-primary)'}}>{key}</label>
          {Object.entries(value).map(([k, v]) => renderField(k, v, key))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-80 flex flex-col admin-panel border-l border-t-0 border-b-0 border-r-0 overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center" style={{borderColor: 'var(--admin-border)'}}>
        <h2 className="font-bold text-lg">{title} Properties</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(formData).map(([k, v]) => renderField(k, v))}
      </div>

      <div className="p-4 border-t" style={{borderColor: 'var(--admin-border)'}}>
        <button
          onClick={() => onApply(formData)}
          className="admin-btn admin-btn-primary w-full"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}
