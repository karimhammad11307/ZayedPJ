'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { UploadCloud, X, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      // 1. Get signature
      const sigRes = await fetch('/api/admin/upload-signature')
      if (!sigRes.ok) throw new Error('Failed to get upload signature')
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json()

      const uploadedUrls: string[] = []

      // 2. Upload each file directly to Cloudinary
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp)
        formData.append('signature', signature)
        formData.append('folder', folder)

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const errData = await uploadRes.json()
          throw new Error(errData.error?.message || 'Upload failed')
        }

        const data = await uploadRes.json()
        uploadedUrls.push(data.secure_url)
      }

      onChange([...images, ...uploadedUrls])
    } catch (err) {
      console.error('Upload error:', err)
      setError((err as Error).message)
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  // Simple drag-to-reorder (swap with adjacent)
  // For a full drag-and-drop, dnd-kit or react-beautiful-dnd would be used, 
  // but for admin simplicity we'll just allow basic array shifting
  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return
    if (direction === 'right' && index === images.length - 1) return
    
    const newImages = [...images]
    const swapIndex = direction === 'left' ? index - 1 : index + 1
    const temp = newImages[index]
    newImages[index] = newImages[swapIndex]
    newImages[swapIndex] = temp
    onChange(newImages)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="relative w-24 h-24 rounded-card overflow-hidden bg-cream-light border border-brown/10 group">
            <Image 
              src={url} 
              alt={`Upload ${i}`} 
              fill 
              className="object-cover"
              unoptimized={url.includes('placehold.co')} 
            />
            <div className="absolute inset-0 bg-brown/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => moveImage(i, 'left')}
                disabled={i === 0}
                className="text-white hover:text-mint disabled:opacity-30 text-xs"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="text-white hover:text-terracotta"
              >
                <X size={16} />
              </button>
              <button
                type="button"
                onClick={() => moveImage(i, 'right')}
                disabled={i === images.length - 1}
                className="text-white hover:text-mint disabled:opacity-30 text-xs"
              >
                ▶
              </button>
            </div>
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-mint text-white text-[10px] text-center py-0.5">
                Main Image
              </span>
            )}
          </div>
        ))}

        {uploading && (
          <div className="w-24 h-24 rounded-card bg-cream-light border border-brown/10 flex items-center justify-center">
            <Loader2 className="animate-spin text-mint" size={24} />
          </div>
        )}
      </div>

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className={`
          w-full border-2 border-dashed border-brown/20 rounded-card bg-cream-light p-8 
          flex flex-col items-center justify-center gap-2 transition-colors
          ${uploading ? 'opacity-50' : 'hover:border-mint hover:bg-mint/5'}
        `}>
          <UploadCloud className="text-brown-muted" size={32} />
          <p className="font-body text-sm text-brown font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-brown-muted">PNG, JPG up to 10MB</p>
        </div>
      </div>
      
      {error && <p className="text-terracotta text-xs mt-2 font-body">{error}</p>}
    </div>
  )
}
