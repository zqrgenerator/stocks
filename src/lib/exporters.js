import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { formatCurrency } from './utils';

/**
 * Export tabular data to Excel (.xlsx) file
 * @param {Array<Object>} data 
 * @param {string} fileName 
 * @param {string} sheetName 
 */
export function exportToExcel(data, fileName = 'report', sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
}

/**
 * Export tabular data to PDF with SaaS header and styling
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.companyName
 * @param {Array<string>} options.headers
 * @param {Array<Array<any>>} options.rows
 * @param {string} [options.fileName]
 * @param {string} [options.orientation] 'portrait' | 'landscape'
 */
export function exportToPDF({
  title = 'Inventory Report',
  companyName = 'BuildStaok Logistics Pvt Ltd',
  headers = [],
  rows = [],
  fileName = 'report',
  orientation = 'portrait',
}) {
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, pageWidth, 55, 'F');

  // Company Name
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 30, 32);

  // App tag
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('BuildStaok Inventory System', pageWidth - 30, 32, { align: 'right' });

  // Report Title & Metadata
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('helvetica', 'bold');
  doc.text(title, 30, 85);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate 500
  const dateStr = `Generated on: ${format(new Date(), 'dd MMMM yyyy, hh:mm a')}`;
  doc.text(dateStr, 30, 100);

  // Table
  autoTable(doc, {
    startY: 115,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 30, right: 30, bottom: 40 },
    didDrawPage: function (data) {
      // Footer page numbering
      const str = `Page ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 30, doc.internal.pageSize.getHeight() - 15, { align: 'right' });
      doc.text('BuildStaok • Confidentially generated', 30, doc.internal.pageSize.getHeight() - 15);
    },
  });

  doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
}

/**
 * Generate and download a sample CSV/Excel template for Product Bulk Import
 */
export function downloadProductImportTemplate() {
  const sampleData = [
    {
      SKU: 'CEM-PRM-50K',
      Name: 'Premium Portland Cement 50kg',
      Category: 'Building & Cement',
      Supplier: 'Ultratech Mega Supplies',
      Unit: 'bags',
      CostPrice: 380,
      SellPrice: 440,
      MinStock: 25,
      Barcode: '890123456799',
      Description: 'Standard 50kg bag for reinforced concrete',
    },
    {
      SKU: 'PIP-PVC-050',
      Name: 'PVC Conduit Pipe 1/2 inch',
      Category: 'Pipes & Fittings',
      Supplier: 'Apex Pipes & Sanitary Corp',
      Unit: 'pcs',
      CostPrice: 110,
      SellPrice: 150,
      MinStock: 20,
      Barcode: '890123456788',
      Description: 'Rigid electrical conduit piping',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ProductTemplate');
  XLSX.writeFile(wb, 'BuildStaok_Product_Import_Template.xlsx');
}

/**
 * Parse an Excel or CSV file from File input
 * @param {File} file 
 * @returns {Promise<Array<Object>>}
 */
export async function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
