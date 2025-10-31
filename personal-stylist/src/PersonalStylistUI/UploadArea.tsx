import React from "react";
import { Upload } from "lucide-react";

export default function UploadArea({ onUpload }:{ onUpload:(files:File[])=>void }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-medium">Upload your closet</h3>
          <p className="text-sm text-zinc-600">Add photos or color cards for hyper-relevant suggestions.</p>
        </div>
        <div className="flex gap-2">
          <FileButton icon={<Upload className="h-4 w-4" />} onFiles={onUpload}>Upload photos</FileButton>
          
        </div>
      </div>
    </div>
  );
}

function FileButton({ icon, children, onFiles }:{ icon?:React.ReactNode; children:React.ReactNode; onFiles:(files:File[])=>void }) {
  const id = React.useId();
  return (
    <>
      <label htmlFor={id} className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-sm hover:bg-zinc-200 transition cursor-pointer">
        {icon}{children}
      </label>
      <input id={id} type="file" accept="image/*" multiple className="hidden"
        onChange={(e)=> e.target.files && onFiles(Array.from(e.target.files))}/>
    </>
  );
}
