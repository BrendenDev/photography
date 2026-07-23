import { useRef, useState } from 'react';

export interface PhotoItem {
  slug: string;
  title?: string;
  isPending?: boolean; // If it's a locally added photo
  pendingUrl?: string; // object URL for preview
}

interface Props {
  photos: PhotoItem[];
  selectedSlug: string | null;
  collectionSlug: string | null;
  onSelect: (slug: string) => void;
  onAddPhotos: (files: File[]) => void;
  onDeletePhoto: (slug: string) => void;
  onReorder: (newOrder: string[]) => void;
}

export default function PhotoGrid({ photos, selectedSlug, collectionSlug, onSelect, onAddPhotos, onDeletePhoto, onReorder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  if (!collectionSlug) {
    return <div className="flex-1 flex items-center justify-center" style={{color: 'var(--admin-text-secondary)'}}>Select a collection</div>;
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const newOrder = [...photos];
    const item = newOrder[draggedIdx];
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(index, 0, item);
    
    onReorder(newOrder.map(p => p.slug));
    setDraggedIdx(null);
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newOrder = photos.map(p => p.slug);
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    onReorder(newOrder);
  };

  return (
    <div className="flex-1 flex flex-col admin-panel border-r border-t-0 border-b-0 border-l-0 overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center" style={{borderColor: 'var(--admin-border)'}}>
        <h2 className="font-bold text-lg">Photos</h2>
        <div className="flex gap-2">
          {selectedSlug && (
            <button onClick={() => onDeletePhoto(selectedSlug)} className="admin-btn text-sm admin-text-danger border-none">
              Delete Photo
            </button>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="admin-btn text-sm">
            + Add Photos
          </button>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                const fileArray = Array.from(e.target.files);
                onAddPhotos(fileArray);
              }
              e.target.value = '';
            }}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((p, idx) => {
            const url = p.pendingUrl || `https://raw.githubusercontent.com/brendendev/photography/main/public/content/collections/${collectionSlug}/images/${p.slug}-thumb.webp`;
            const isSelected = selectedSlug === p.slug;
            
            return (
              <div
                key={p.slug}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => onSelect(p.slug)}
                className={`group relative aspect-square cursor-pointer rounded overflow-hidden border-2 ${isSelected ? 'border-[var(--admin-text-accent)]' : 'border-transparent hover:border-[var(--admin-border)]'}`}
              >
                <img src={url} alt={p.title || p.slug} className="w-full h-full object-cover pointer-events-none" />
                {/* Position badge */}
                <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">{idx + 1}</div>
                {p.isPending && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] px-1 rounded">New</div>
                )}
                <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 p-1.5 w-full flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {idx > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); movePhoto(idx, idx - 1); }}
                        className="text-white/80 hover:text-white text-xs bg-white/10 hover:bg-white/20 rounded px-1.5 py-0.5 transition-colors"
                        title="Move left"
                      >←</button>
                    )}
                    {idx < photos.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); movePhoto(idx, idx + 1); }}
                        className="text-white/80 hover:text-white text-xs bg-white/10 hover:bg-white/20 rounded px-1.5 py-0.5 transition-colors"
                        title="Move right"
                      >→</button>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeletePhoto(p.slug); }}
                    className="text-red-400 hover:text-red-300 text-xs bg-white/10 hover:bg-red-900/30 rounded px-1.5 py-0.5 transition-colors"
                  >✕</button>
                </div>
              </div>
            );
          })}
        </div>
        {photos.length === 0 && (
          <div className="text-center mt-10" style={{color: 'var(--admin-text-secondary)'}}>No photos yet. Click "Add Photos" to upload.</div>
        )}
      </div>
    </div>
  );
}
