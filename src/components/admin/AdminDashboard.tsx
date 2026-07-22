import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { listDirectory, readJsonFile, batchCommit, blobToBase64, type PendingChange } from '../../lib/github';
import { generateVariants, extractMetadata } from '../../lib/imageProcessor';
import CollectionSidebar, { type CollectionItem } from './CollectionSidebar';
import PhotoGrid, { type PhotoItem } from './PhotoGrid';
import PropertiesPanel from './PropertiesPanel';

export default function AdminDashboard() {
  const { token, logout, username } = useAdminAuth();
  
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<{ slug: string, json: any, sha?: string } | null>(null);
  
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<{ slug: string, json: any, sha?: string } | null>(null);
  
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagsFileSha, setTagsFileSha] = useState<string | undefined>();

  const loadTags = async () => {
    if (!token) return;
    try {
      const { data, sha } = await readJsonFile<string[]>(token, 'public/content/tags.json');
      setAvailableTags(data);
      setTagsFileSha(sha);
    } catch {
      setAvailableTags([]);
    }
  };

  const loadCollections = async () => {
    if (!token) return;
    setStatusMessage('Loading collections...');
    try {
      // List collection directories via GitHub API
      const dirs = await listDirectory(token, 'public/content/collections');
      const collDirs = dirs.filter(d => d.type === 'dir');
      const collItems: CollectionItem[] = [];
      
      for (const dir of collDirs) {
        try {
          const { data: collJson } = await readJsonFile<any>(token, `public/content/collections/${dir.name}/collection.json`);
          collItems.push({
            slug: dir.name,
            title: collJson.title || dir.name,
            photoCount: collJson.photoOrder?.length || 0
          });
        } catch {
          // Skip directories without a valid collection.json
        }
      }
      setCollections(collItems);
      setStatusMessage(`Loaded ${collItems.length} collection(s)`);
    } catch (e) {
      setStatusMessage('Failed to load collections');
      console.error(e);
    }
  };

  useEffect(() => {
    loadCollections();
    loadTags();
  }, [token]);

  const selectCollection = async (slug: string) => {
    if (!token) return;
    setStatusMessage(`Loading collection ${slug}...`);
    try {
      // Check pending first
      const pendingJsonPath = `public/content/collections/${slug}/collection.json`;
      const pendingJson = pendingChanges.get(pendingJsonPath);
      
      let collJson, sha;
      if (pendingJson) {
        collJson = JSON.parse(pendingJson.content);
      } else {
        const res = await readJsonFile<any>(token, pendingJsonPath);
        collJson = res.data;
        sha = res.sha;
      }
      
      setSelectedCollection({ slug, json: collJson, sha });
      
      // Load photos
      const loadedPhotos: PhotoItem[] = [];
      for (const photoSlug of collJson.photoOrder || []) {
        // Find if pending
        const pPath = `public/content/collections/${slug}/photos/${photoSlug}.json`;
        const pPending = pendingChanges.get(pPath);
        if (pPending && pPending.action !== 'delete') {
          const pJson = JSON.parse(pPending.content);
          loadedPhotos.push({ slug: photoSlug, title: pJson.title, isPending: true });
        } else if (!pPending) {
          try {
            const pRes = await readJsonFile<any>(token, pPath);
            loadedPhotos.push({ slug: photoSlug, title: pRes.data.title });
          } catch(e) {}
        }
      }
      
      setPhotos(loadedPhotos);
      setSelectedPhoto(null);
      setStatusMessage(`Loaded collection ${slug}`);
    } catch (e) {
      setStatusMessage('Failed to load collection details');
      console.error(e);
    }
  };

  const selectPhoto = async (photoSlug: string) => {
    if (!selectedCollection || !token) return;
    setStatusMessage(`Loading photo ${photoSlug}...`);
    try {
      const pPath = `public/content/collections/${selectedCollection.slug}/photos/${photoSlug}.json`;
      const pPending = pendingChanges.get(pPath);
      
      let pJson, sha;
      if (pPending) {
        pJson = JSON.parse(pPending.content);
      } else {
        const res = await readJsonFile<any>(token, pPath);
        pJson = res.data;
        sha = res.sha;
      }
      
      setSelectedPhoto({ slug: photoSlug, json: pJson, sha });
      setStatusMessage(`Loaded photo ${photoSlug}`);
    } catch(e) {
      setStatusMessage('Failed to load photo details');
    }
  };

  const handleApplyCollectionProperties = (updatedJson: any) => {
    if (!selectedCollection) return;
    const path = `public/content/collections/${selectedCollection.slug}/collection.json`;
    const newChanges = new Map(pendingChanges);
    newChanges.set(path, {
      path,
      content: JSON.stringify(updatedJson, null, 2),
      encoding: 'utf-8',
      action: selectedCollection.sha ? 'update' : 'create',
      sha: selectedCollection.sha
    });
    setPendingChanges(newChanges);
    setSelectedCollection({ ...selectedCollection, json: updatedJson });
    setStatusMessage(`Updated collection properties for ${selectedCollection.slug}`);
  };

  const handleApplyPhotoProperties = (updatedJson: any) => {
    if (!selectedCollection || !selectedPhoto) return;
    const path = `public/content/collections/${selectedCollection.slug}/photos/${selectedPhoto.slug}.json`;
    const newChanges = new Map(pendingChanges);
    newChanges.set(path, {
      path,
      content: JSON.stringify(updatedJson, null, 2),
      encoding: 'utf-8',
      action: selectedPhoto.sha ? 'update' : 'create',
      sha: selectedPhoto.sha
    });
    setPendingChanges(newChanges);
    setSelectedPhoto({ ...selectedPhoto, json: updatedJson });
    setStatusMessage(`Updated photo properties for ${selectedPhoto.slug}`);
  };

  const handleNewCollection = async () => {
    const slug = prompt('Enter new collection slug (e.g. nature, portraits):');
    if (!slug) return;
    
    const newCollJson = {
      title: slug,
      slug: slug,
      volumeNumber: 1,
      featured: false,
      visible: true,
      photoOrder: []
    };
    
    const newChanges = new Map(pendingChanges);
    
    // Create collection.json
    newChanges.set(`public/content/collections/${slug}/collection.json`, {
      path: `public/content/collections/${slug}/collection.json`,
      content: JSON.stringify(newCollJson, null, 2),
      encoding: 'utf-8',
      action: 'create'
    });
    
    // Create dirs via .gitkeep
    newChanges.set(`public/content/collections/${slug}/photos/.gitkeep`, {
      path: `public/content/collections/${slug}/photos/.gitkeep`,
      content: '',
      encoding: 'utf-8',
      action: 'create'
    });
    newChanges.set(`public/content/collections/${slug}/images/.gitkeep`, {
      path: `public/content/collections/${slug}/images/.gitkeep`,
      content: '',
      encoding: 'utf-8',
      action: 'create'
    });
    
    // No index.json needed — collections are discovered via directory listing
    
    setPendingChanges(newChanges);
    setCollections([...collections, { slug, title: slug, photoCount: 0 }]);
    selectCollection(slug);
  };

  const handleDeleteCollection = (slug: string) => {
    if (!confirm(`Are you sure you want to delete collection ${slug}?`)) return;
    const newChanges = new Map(pendingChanges);
    
    setStatusMessage('Warning: Full deletion of remote directories not fully implemented here. Deleting from index.');
    
    setPendingChanges(newChanges);
    setCollections(collections.filter(c => c.slug !== slug));
    setSelectedCollection(null);
  };

  const handleAddPhotos = async (files: FileList) => {
    if (!selectedCollection) return;
    setStatusMessage(`Processing ${files.length} photos...`);
    
    const newChanges = new Map(pendingChanges);
    const newPhotos = [...photos];
    const newPhotoOrder = [...(selectedCollection.json.photoOrder || [])];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nameWithoutExt = file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
      const photoSlug = `${nameWithoutExt}-${Date.now().toString().slice(-4)}`;
      
      const variants = await generateVariants(file);
      const thumbBase64 = await blobToBase64(variants.thumb);
      const lgBase64 = await blobToBase64(variants.lg);
      
      const metadata = await extractMetadata(file);
      const pJson: Record<string, unknown> = {
        title: file.name.split('.')[0],
        slug: photoSlug,
        orientation: variants.orientation,
        dimensions: variants.dimensions,
        variants: {
          thumb: `content/collections/${selectedCollection.slug}/images/${photoSlug}-thumb.webp`,
          lg: `content/collections/${selectedCollection.slug}/images/${photoSlug}-lg.webp`
        },
        ...(metadata.dateTaken ? { dateTaken: metadata.dateTaken as string } : {}),
        ...(metadata.gps ? { location: metadata.gps as string } : {}),
        ...(Object.keys(metadata).length > 0 ? { metadata } : {})
      };
      
      // Save images
      newChanges.set(`public/content/collections/${selectedCollection.slug}/images/${photoSlug}-thumb.webp`, {
        path: `public/content/collections/${selectedCollection.slug}/images/${photoSlug}-thumb.webp`,
        content: thumbBase64,
        encoding: 'base64',
        action: 'create'
      });
      newChanges.set(`public/content/collections/${selectedCollection.slug}/images/${photoSlug}-lg.webp`, {
        path: `public/content/collections/${selectedCollection.slug}/images/${photoSlug}-lg.webp`,
        content: lgBase64,
        encoding: 'base64',
        action: 'create'
      });
      
      // Save JSON
      newChanges.set(`public/content/collections/${selectedCollection.slug}/photos/${photoSlug}.json`, {
        path: `public/content/collections/${selectedCollection.slug}/photos/${photoSlug}.json`,
        content: JSON.stringify(pJson, null, 2),
        encoding: 'utf-8',
        action: 'create'
      });
      
      newPhotoOrder.push(photoSlug);
      newPhotos.push({
        slug: photoSlug,
        title: file.name,
        isPending: true,
        pendingUrl: URL.createObjectURL(file)
      });
    }
    
    // Update collection JSON
    const updatedCollJson = { ...selectedCollection.json, photoOrder: newPhotoOrder, photoCount: newPhotoOrder.length };
    newChanges.set(`public/content/collections/${selectedCollection.slug}/collection.json`, {
      path: `public/content/collections/${selectedCollection.slug}/collection.json`,
      content: JSON.stringify(updatedCollJson, null, 2),
      encoding: 'utf-8',
      action: selectedCollection.sha ? 'update' : 'create',
      sha: selectedCollection.sha
    });
    
    setPendingChanges(newChanges);
    setPhotos(newPhotos);
    setSelectedCollection({ ...selectedCollection, json: updatedCollJson });
    setStatusMessage(`Added ${files.length} photos`);
  };

  const handleDeletePhoto = (photoSlug: string) => {
    if (!selectedCollection) return;
    const newChanges = new Map(pendingChanges);
    
    // Remove from photoOrder
    const newPhotoOrder = selectedCollection.json.photoOrder.filter((s: string) => s !== photoSlug);
    const updatedCollJson = { ...selectedCollection.json, photoOrder: newPhotoOrder, photoCount: newPhotoOrder.length };
    
    newChanges.set(`public/content/collections/${selectedCollection.slug}/collection.json`, {
      path: `public/content/collections/${selectedCollection.slug}/collection.json`,
      content: JSON.stringify(updatedCollJson, null, 2),
      encoding: 'utf-8',
      action: selectedCollection.sha ? 'update' : 'create',
      sha: selectedCollection.sha
    });
    
    if (selectedPhoto && selectedPhoto.slug === photoSlug && selectedPhoto.sha) {
      newChanges.set(`public/content/collections/${selectedCollection.slug}/photos/${photoSlug}.json`, {
        path: `public/content/collections/${selectedCollection.slug}/photos/${photoSlug}.json`,
        content: '',
        encoding: 'utf-8',
        action: 'delete',
        sha: selectedPhoto.sha
      });
    }
    
    setPendingChanges(newChanges);
    setPhotos(photos.filter(p => p.slug !== photoSlug));
    setSelectedCollection({ ...selectedCollection, json: updatedCollJson });
    setSelectedPhoto(null);
  };

  const handleReorder = (newOrder: string[]) => {
    if (!selectedCollection) return;
    const newChanges = new Map(pendingChanges);
    const updatedCollJson = { ...selectedCollection.json, photoOrder: newOrder };
    
    newChanges.set(`public/content/collections/${selectedCollection.slug}/collection.json`, {
      path: `public/content/collections/${selectedCollection.slug}/collection.json`,
      content: JSON.stringify(updatedCollJson, null, 2),
      encoding: 'utf-8',
      action: selectedCollection.sha ? 'update' : 'create',
      sha: selectedCollection.sha
    });
    
    setPendingChanges(newChanges);
    setSelectedCollection({ ...selectedCollection, json: updatedCollJson });
    const orderedPhotos = newOrder.map(slug => photos.find(p => p.slug === slug)).filter(Boolean) as PhotoItem[];
    setPhotos(orderedPhotos);
  };

  const handlePublish = async () => {
    if (!token || pendingChanges.size === 0) return;
    setIsPublishing(true);
    setStatusMessage('Publishing changes...');
    try {
      const changesArr = Array.from(pendingChanges.values());

      // Collect all tags used in pending changes and merge with available
      const allUsedTags = new Set<string>(availableTags);
      for (const change of changesArr) {
        if (change.path.endsWith('.json') && change.action !== 'delete' && change.content) {
          try {
            const parsed = JSON.parse(change.content);
            if (Array.isArray(parsed.tags)) {
              parsed.tags.forEach((t: string) => allUsedTags.add(t));
            }
          } catch { /* not json */ }
        }
      }

      // If new tags were added, include tags.json update
      const sortedTags = [...allUsedTags].sort();
      if (JSON.stringify(sortedTags) !== JSON.stringify([...availableTags].sort())) {
        changesArr.push({
          path: 'public/content/tags.json',
          content: JSON.stringify(sortedTags, null, 2),
          encoding: 'utf-8',
          action: tagsFileSha ? 'update' : 'create',
          sha: tagsFileSha
        });
      }

      const message = `archive-${Math.random().toString(36).substring(2, 10)}`;
      await batchCommit(token, changesArr, message);
      setPendingChanges(new Map());
      setStatusMessage('Changes published successfully!');
      setTimeout(() => {
        loadCollections();
        loadTags();
        setSelectedCollection(null);
        setSelectedPhoto(null);
        setPhotos([]);
      }, 1000);
    } catch(e) {
      console.error(e);
      setStatusMessage('Failed to publish changes');
    }
    setIsPublishing(false);
  };

  const handleDiscard = () => {
    if (!confirm('Discard all uncommitted changes?')) return;
    setPendingChanges(new Map());
    loadCollections();
    setSelectedCollection(null);
    setSelectedPhoto(null);
    setPhotos([]);
    setStatusMessage('Changes discarded');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-white admin-root w-full">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-3" style={{backgroundColor: 'var(--admin-bg-toolbar)'}}>
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl" style={{color: 'var(--admin-text-accent)'}}>Photography Admin</div>
          <button onClick={loadCollections} className="admin-btn text-sm">🔄 Refresh</button>
        </div>
        <div className="flex items-center gap-3">
          {pendingChanges.size > 0 && (
            <>
              <button onClick={handleDiscard} className="admin-btn text-sm">🗑 Discard</button>
              <button onClick={handlePublish} disabled={isPublishing} className="admin-btn admin-btn-primary text-sm shadow-md">
                {isPublishing ? 'Publishing...' : '💾 Publish Changes'}
              </button>
            </>
          )}
          <div className="h-6 w-px bg-gray-600 mx-2"></div>
          <span className="text-sm" style={{color: 'var(--admin-text-secondary)'}}>{username}</span>
          <button onClick={logout} className="admin-btn text-sm">🚪 Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <CollectionSidebar
          collections={collections}
          selectedSlug={selectedCollection?.slug || null}
          onSelect={selectCollection}
          onNewCollection={handleNewCollection}
          onDeleteCollection={handleDeleteCollection}
        />
        
        <PhotoGrid
          photos={photos}
          selectedSlug={selectedPhoto?.slug || null}
          collectionSlug={selectedCollection?.slug || null}
          onSelect={selectPhoto}
          onAddPhotos={handleAddPhotos}
          onDeletePhoto={handleDeletePhoto}
          onReorder={handleReorder}
        />

        {(selectedPhoto || selectedCollection) && (
          <PropertiesPanel
            key={selectedPhoto ? `photo-${selectedPhoto.slug}` : `col-${selectedCollection?.slug}`}
            mode={selectedPhoto ? 'photo' : 'collection'}
            json={selectedPhoto ? selectedPhoto.json : selectedCollection!.json}
            availableTags={availableTags}
            onApply={selectedPhoto ? handleApplyPhotoProperties : handleApplyCollectionProperties}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="p-2 text-xs flex justify-between border-t" style={{backgroundColor: 'var(--admin-bg-toolbar)', borderColor: 'var(--admin-border)'}}>
        <span>{statusMessage}</span>
        <span>Pending changes: {pendingChanges.size}</span>
      </div>
    </div>
  );
}
