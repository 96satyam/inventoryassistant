// src/app/extract/page.tsx
import UploadForm from "@/components/extract/upload-form"

export default function ExtractPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Solar Intelligence - Upload PDF</h2>
      <UploadForm />
    </div>
  )
}
