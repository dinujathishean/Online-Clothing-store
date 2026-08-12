import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { uploadImages } from '../../services/uploadService.js';

/**
 * Upload tee photos from the PC. Appends returned URLs into the parent list.
 * @param {{ urls: string[], onChange: (urls: string[]) => void, multiple?: boolean, label?: string, hint?: string }} props
 */
export default function ImageUploadField({
  urls = [],
  onChange,
  multiple = true,
  label = 'Add photos',
  hint,
}) {
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

  const helper =
    hint ??
    (multiple
      ? 'JPG, PNG, WebP · max 5MB each · select multiple or click again to add more. First image is the catalogue thumbnail.'
      : 'JPG, PNG, WebP · max 5MB');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : urls.length > 0 && multiple ? 'Add more photos' : label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={onPick}
        />
        <span className="text-xs text-slate-500">{helper}</span>
      </div>

      {urls.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-700 bg-slate-950"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              {multiple && i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/70 py-0.5 text-center text-[10px] font-medium text-amber-300">
                  Primary
                </span>
              )}
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
      ) : (
        <p className="text-xs text-slate-600">No photos yet — click Add photos to upload from your PC.</p>
      )}
    </div>
  );
}
