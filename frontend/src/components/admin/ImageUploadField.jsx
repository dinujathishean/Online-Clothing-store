import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { uploadImages } from '../../services/uploadService.js';

/**
 * Upload tee photos from the PC. Appends returned URLs into the parent list.
 * @param {{ urls: string[], onChange: (urls: string[]) => void, multiple?: boolean, label?: string }} props
 */
export default function ImageUploadField({ urls = [], onChange, multiple = true, label = 'Upload from PC' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function onPick(e) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = await uploadImages(files);
      onChange(multiple ? [...urls, ...uploaded] : uploaded.slice(0, 1));
      toast.success(uploaded.length > 1 ? `${uploaded.length} images uploaded` : 'Image uploaded');
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeAt(index) {
    onChange(urls.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={onPick}
        />
        <span className="text-xs text-slate-500">JPG, PNG, WebP · max 5MB each</span>
      </div>

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div key={`${url}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded bg-black/70 px-1.5 text-xs text-white hover:bg-red-600"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
