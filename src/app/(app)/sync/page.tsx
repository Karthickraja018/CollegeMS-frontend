import React from "react"
import { Upload } from "lucide-react"

export default function DataSyncCenter() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Upload className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Data Sync Center</h1>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4">Import Data</h2>
        <p className="text-slate-600 mb-6">
          Upload CSV files to ingest historical data into the Academic Intelligence Platform.
        </p>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Drag and drop files here, or click to browse</p>
          <p className="text-sm text-slate-500 mt-2">Supports .csv and .xlsx files</p>
        </div>
      </div>
    </div>
  )
}
