import * as XLSX from 'xlsx';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Download data as an Excel (.xlsx) file in the browser.
 */
export function downloadExcel(data: any[], filename: string, sheetName: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Parse an uploaded .xlsx file and return an array of row objects.
 */
export function parseExcelUpload(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const firstSheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Download an empty template with the given column headers.
 */
export function downloadTemplate(columns: string[], filename: string, sheetName: string) {
  const ws = XLSX.utils.aoa_to_sheet([columns]);
  // Set column widths
  ws['!cols'] = columns.map((col) => ({ wch: Math.max(col.length + 4, 14) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
