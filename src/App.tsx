import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactElement,
} from 'react'

export default function App(): ReactElement {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [isDragging, setIsDragging] = useState<boolean>(false) //hook for visuals

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const pickFile = (): void => fileInputRef.current?.click()

  const setSelectedFile = (nextFile: File | null): void => {
    setFile(nextFile)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return nextFile ? URL.createObjectURL(nextFile) : null
    })
  }

  const acceptFirstImage = (maybeFiles: FileList | null | undefined): void => {
    const first = maybeFiles?.[0]
    if (!first) return
    console.log(first)
    if (!first.type?.startsWith('image/')) return
    setSelectedFile(first)
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-gray-50 to-white">
      <header className="border-b border-gray-200 bg-white/70 backdrop-blur px-4 py-3">
        <div className="max-w-4xl w-full mx-auto flex items-baseline justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Borderify</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <div
          className={[
            'relative w-full rounded-2xl border-2 border-dashed p-10',
            'bg-white shadow-sm',
            'min-h-64 flex items-center justify-center text-center',
            'transition-colors',
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400',
          ].join(' ')}
          onDragEnter={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(true)
          }}
          onDragOver={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(true)
          }}
          onDragLeave={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
          }}
          onDrop={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            acceptFirstImage(e.dataTransfer?.files)
          }}
        >
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              acceptFirstImage(e.target.files)
              e.target.value = ''
            }}
          />

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={pickFile}
              className={[
                'inline-flex items-center justify-center rounded-xl px-5 py-3',
                'bg-gray-900 text-white text-sm font-medium cursor-pointer',
                'hover:bg-gray-800 active:bg-gray-950',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
              ].join(' ')}
            >
              Upload image
            </button>
            <p className="text-sm text-gray-600">or drag and drop an image here</p>
            {file ? (
              <p className="text-xs text-gray-500">
                Selected: <span className="font-medium text-gray-700">{file.name}</span>
              </p>
            ) : null}
          </div>
        </div>

        {previewUrl ? (
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-900 mb-2">Preview</div>
            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <img
                alt={file?.name || 'Uploaded preview'}
                src={previewUrl}
                className="w-full max-h-[520px] object-contain rounded-xl bg-gray-50"
              />
            </div>
          </div>
        ) : null}
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-2 text-sm text-gray-500">
      </footer>
    </div>
  )
}

