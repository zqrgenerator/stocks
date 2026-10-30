import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { downloadProductImportTemplate, parseImportFile } from '../../lib/exporters';
import { FileSpreadsheet, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsParsing(true);
    try {
      const data = await parseImportFile(selected);
      if (!data || data.length === 0) {
        toast.error('The selected file contains no readable rows.');
        setPreviewRows([]);
        return;
      }
      setPreviewRows(data);
      toast.success(`Loaded ${data.length} rows from file`);
    } catch (err) {
      toast.error('Failed to parse file: ' + err.message);
      setPreviewRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (previewRows.length === 0) return;
    setIsImporting(true);
    try {
      await onImportSuccess(previewRows);
      setFile(null);
      setPreviewRows([]);
      onClose();
    } catch (err) {
      toast.error('Import failed: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Products"
      description="Upload an Excel (.xlsx) or CSV file with product catalog data"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Template download banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                Need the standard spreadsheet format?
              </p>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                Download our pre-formatted template with sample rows and headers.
              </p>
            </div>
          </div>
          <Button
            size="xs"
            variant="outline"
            onClick={downloadProductImportTemplate}
            className="flex items-center gap-1 bg-white dark:bg-slate-900 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Template
          </Button>
        </div>

        {/* Upload drop box */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {file ? file.name : 'Choose an Excel or CSV file to upload'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Supports .xlsx, .xls, and .csv</p>
          <label className="mt-3 inline-block">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium cursor-pointer shadow-sm">
              Select File
            </span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Preview Table */}
        {previewRows.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Row Preview ({previewRows.length} items found)
              </span>
              <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Ready for Import
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold sticky top-0">
                  <tr>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Cost</th>
                    <th className="px-3 py-2">Sell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewRows.slice(0, 10).map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5 font-mono text-[11px] font-bold">
                        {r.SKU || r.sku || '-'}
                      </td>
                      <td className="px-3 py-1.5 truncate max-w-[150px]">
                        {r.Name || r.name || '-'}
                      </td>
                      <td className="px-3 py-1.5">{r.Category || r.category || '-'}</td>
                      <td className="px-3 py-1.5">₹{r.CostPrice || r.cost_price || 0}</td>
                      <td className="px-3 py-1.5">₹{r.SellPrice || r.sell_price || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewRows.length > 10 && (
              <p className="text-[11px] text-slate-400 mt-1">
                Showing first 10 of {previewRows.length} rows.
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleImport}
            disabled={previewRows.length === 0}
            isLoading={isImporting}
          >
            Import {previewRows.length > 0 ? `(${previewRows.length}) Products` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
