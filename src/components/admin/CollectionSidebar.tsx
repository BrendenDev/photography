
export interface CollectionItem {
  slug: string;
  title: string;
  photoCount: number;
}

interface Props {
  collections: CollectionItem[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onNewCollection: () => void;
  onDeleteCollection: (slug: string) => void;
}

export default function CollectionSidebar({ collections, selectedSlug, onSelect, onNewCollection, onDeleteCollection }: Props) {
  return (
    <div className="w-64 flex flex-col admin-panel border-r border-t-0 border-b-0 border-l-0 overflow-y-auto">
      <div className="p-4 border-b" style={{borderColor: 'var(--admin-border)'}}>
        <h2 className="font-bold text-lg">Collections</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {collections.map(c => (
          <div
            key={c.slug}
            onClick={() => onSelect(c.slug)}
            className={`cursor-pointer p-3 mb-1 rounded flex justify-between items-center group ${selectedSlug === c.slug ? 'bg-[var(--admin-input-bg)] text-[var(--admin-text-accent)]' : 'hover:bg-[var(--admin-border)]'}`}
          >
            <div>
              <div className="font-medium">{c.title || c.slug}</div>
              <div className="text-xs" style={{color: 'var(--admin-text-secondary)'}}>{c.photoCount} photos</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t" style={{borderColor: 'var(--admin-border)'}}>
        {selectedSlug && (
          <button
            onClick={() => onDeleteCollection(selectedSlug)}
            className="w-full text-left mb-4 text-sm hover:underline admin-text-danger"
          >
            Delete Selected Collection
          </button>
        )}
        <button
          onClick={onNewCollection}
          className="admin-btn w-full flex justify-center items-center gap-2"
        >
          <span>+</span> New Collection
        </button>
      </div>
    </div>
  );
}
