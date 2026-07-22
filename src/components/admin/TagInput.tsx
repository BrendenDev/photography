import { useState, useRef, useEffect } from 'react';

interface TagInputProps {
  tags: string[];
  availableTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, availableTags, onChange }: TagInputProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const trimmed = query.trim().toLowerCase();

  // Filter suggestions: available tags not already selected, matching query
  const suggestions = availableTags
    .filter(t => !tags.includes(t))
    .filter(t => !trimmed || t.toLowerCase().includes(trimmed))
    .slice(0, 8);

  // Show "Add new" option if query doesn't exactly match an existing tag
  const isNewTag = trimmed.length > 0 && !availableTags.some(t => t.toLowerCase() === trimmed);

  const allOptions = [
    ...suggestions,
    ...(isNewTag ? [`__new__${trimmed}`] : [])
  ];

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setQuery('');
    setHighlightIdx(0);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, allOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allOptions.length > 0) {
        const selected = allOptions[highlightIdx] || allOptions[0];
        if (selected.startsWith('__new__')) {
          addTag(selected.replace('__new__', ''));
        } else {
          addTag(selected);
        }
      } else if (trimmed) {
        addTag(trimmed);
      }
    } else if (e.key === 'Backspace' && query === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="mb-4" ref={containerRef}>
      <label className="block mb-1 text-sm font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
        Tags
      </label>

      {/* Tag chips */}
      <div
        className="admin-input flex flex-wrap gap-1 min-h-[38px] cursor-text p-1.5"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded"
            style={{
              backgroundColor: 'var(--admin-text-accent)',
              color: '#000',
            }}
          >
            {tag}
            <button
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="hover:opacity-70 font-bold leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setHighlightIdx(0); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[60px] bg-transparent outline-none text-sm"
          style={{ color: 'var(--admin-text-primary)' }}
          placeholder={tags.length === 0 ? 'Type to search tags...' : ''}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && allOptions.length > 0 && (
        <div
          className="mt-1 rounded border overflow-hidden max-h-48 overflow-y-auto"
          style={{
            backgroundColor: 'var(--admin-bg-panel)',
            borderColor: 'var(--admin-border)',
          }}
        >
          {allOptions.map((option, idx) => {
            const isNew = option.startsWith('__new__');
            const display = isNew ? option.replace('__new__', '') : option;

            return (
              <button
                key={option}
                className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
                style={{
                  backgroundColor: idx === highlightIdx ? 'var(--admin-bg-hover)' : 'transparent',
                  color: 'var(--admin-text-primary)',
                }}
                onMouseEnter={() => setHighlightIdx(idx)}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur
                  addTag(display);
                  setShowDropdown(false);
                }}
              >
                {isNew ? (
                  <>
                    <span style={{ color: 'var(--admin-text-accent)' }}>+ Add new tag:</span>
                    <span className="font-medium">"{display}"</span>
                  </>
                ) : (
                  <span>{display}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
