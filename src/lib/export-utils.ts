/**
 * Export Utilities for Excel and PDF
 * 
 * Provides functions to export data to Excel (.xlsx) and PDF formats
 * using client-side libraries for better performance and user experience.
 */

// Excel export using SheetJS
export interface ExcelExportOptions {
  filename: string;
  sheetName?: string;
  headers: string[];
  data: (string | number)[][];
}

export function exportToExcel(options: ExcelExportOptions): void {
  // Dynamic import to avoid SSR issues
  import('xlsx').then((XLSX) => {
    const { filename, sheetName = 'Sheet1', headers, data } = options;
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate and download file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }).catch((error) => {
    console.error('Error exporting to Excel:', error);
    // Fallback to CSV if Excel export fails
    exportToCSV(options);
  });
}

// PDF export using jsPDF and html2canvas
export interface PDFExportOptions {
  filename: string;
  title: string;
  headers: string[];
  data: (string | number)[][];
  tableElement?: HTMLElement;
}

export function exportToPDF(options: PDFExportOptions): void {
  // Dynamic import to avoid SSR issues
  Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]).then(([jsPDF, html2canvas]) => {
    const { filename, title, headers, data, tableElement } = options;
    const { jsPDF: PDF } = jsPDF;
    const html2canvasLib = html2canvas.default;
    
    if (tableElement) {
      // Export existing table element to PDF
      exportTableElementToPDF(tableElement, filename, title, PDF, html2canvasLib);
    } else {
      // Create PDF from data array
      exportDataArrayToPDF(headers, data, filename, title, PDF);
    }
  }).catch((error) => {
    console.error('Error exporting to PDF:', error);
    // Fallback to CSV if PDF export fails
    exportToCSV({
      filename: options.filename,
      headers: options.headers,
      data: options.data
    });
  });
}

// Helper function to export table element to PDF
async function exportTableElementToPDF(
  tableElement: HTMLElement,
  filename: string,
  title: string,
  PDF: unknown,
  html2canvas: unknown
): Promise<void> {
  try {
    // Create a temporary container for the table
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '20px';
    
    // Clone the table and add title
    const clonedTable = tableElement.cloneNode(true) as HTMLElement;
    const titleElement = document.createElement('h1');
    titleElement.textContent = title;
    titleElement.style.marginBottom = '20px';
    titleElement.style.fontSize = '24px';
    titleElement.style.fontWeight = 'bold';
    titleElement.style.textAlign = 'center';
    
    tempContainer.appendChild(titleElement);
    tempContainer.appendChild(clonedTable);
    document.body.appendChild(tempContainer);
    
    // Convert to canvas
    const canvas = await (html2canvas as (element: HTMLElement, options: Record<string, unknown>) => Promise<HTMLCanvasElement>)(tempContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new (PDF as new (orientation: string, unit: string, format: string) => unknown)('p', 'mm', 'a4') as {
      addImage: (imgData: string, format: string, x: number, y: number, width: number, height: number) => void;
      addPage: () => void;
      save: (filename: string) => void;
    };
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Clean up
    document.body.removeChild(tempContainer);
    
    // Download PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error creating PDF from table element:', error);
    throw error;
  }
}

// Helper function to export data array to PDF
function exportDataArrayToPDF(
  headers: string[],
  data: (string | number)[][],
  filename: string,
  title: string,
  PDF: unknown
): void {
  const pdf = new (PDF as new (orientation: string, unit: string, format: string) => unknown)('p', 'mm', 'a4') as {
    setFontSize: (size: number) => void;
    setFont: (font: string | undefined, style: string) => void;
    text: (text: string, x: number, y: number, options?: { align: string }) => void;
    addPage: () => void;
    save: (filename: string) => void;
  };
  
  // Add title
  pdf.setFontSize(20);
  pdf.text(title, 105, 20, { align: 'center' });
  
  // Add table
  const tableData = [headers, ...data];
  const startY = 40;
  const cellHeight = 8;
  
  // Calculate column widths based on content
  const colWidths = headers.map((_, index) => {
    const maxLength = Math.max(
      ...tableData.map(row => String(row[index] || '').length)
    );
    return Math.min(Math.max(maxLength * 2, 20), 50);
  });
  
  let currentY = startY;
  
  // Add headers
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  let currentX = 10;
  
  headers.forEach((header, index) => {
    pdf.text(header, currentX, currentY);
    currentX += colWidths[index];
  });
  
  currentY += cellHeight;
  
  // Add data rows
  pdf.setFont(undefined, 'normal');
  data.forEach((row) => {
    if (currentY > 280) {
      pdf.addPage();
      currentY = 20;
    }
    
    currentX = 10;
    row.forEach((cell, index) => {
      const cellText = String(cell || '');
      pdf.text(cellText, currentX, currentY);
      currentX += colWidths[index];
    });
    
    currentY += cellHeight;
  });
  
  // Download PDF
  pdf.save(`${filename}.pdf`);
}

// CSV export (fallback and standalone)
export interface CSVExportOptions {
  filename: string;
  headers: string[];
  data: (string | number)[][];
}

export function exportToCSV(options: CSVExportOptions): void {
  const { filename, headers, data } = options;
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape commas and quotes in CSV
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Generic export function that provides multiple format options
export interface ExportOptions {
  filename: string;
  title: string;
  headers: string[];
  data: (string | number)[][];
  tableElement?: HTMLElement;
  formats?: ('excel' | 'pdf' | 'csv')[];
}

export function exportData(options: ExportOptions): void {
  const { filename, title, headers, data, tableElement, formats = ['excel', 'pdf', 'csv'] } = options;
  
  // Create a simple UI to let user choose format
  const formatOptions = [
    { key: 'excel' as const, label: 'Excel (.xlsx)', action: () => exportToExcel({ filename, headers, data }) },
    { key: 'pdf' as const, label: 'PDF (.pdf)', action: () => exportToPDF({ filename, title, headers, data, tableElement }) },
    { key: 'csv' as const, label: 'CSV (.csv)', action: () => exportToCSV({ filename, headers, data }) }
  ];
  
  const availableOptions = formatOptions.filter(option => formats.includes(option.key));
  
  if (availableOptions.length === 1) {
    // If only one format, export directly
    availableOptions[0].action();
  } else {
    // Show format selection (for now, default to Excel)
    const excelOption = availableOptions.find(opt => opt.key === 'excel');
    if (excelOption) {
      excelOption.action();
    } else {
      availableOptions[0].action();
    }
  }
}

// Utility function to extract data from table element
export function extractTableData(tableElement: HTMLElement): { headers: string[], data: (string | number)[][] } {
  const headers: string[] = [];
  const data: (string | number)[][] = [];
  
  // Find table headers
  const headerCells = tableElement.querySelectorAll('thead th, thead td');
  headerCells.forEach(cell => {
    headers.push(cell.textContent?.trim() || '');
  });
  
  // Find table rows
  const rows = tableElement.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const rowData: (string | number)[] = [];
    const cells = row.querySelectorAll('td, th');
    cells.forEach(cell => {
      rowData.push(cell.textContent?.trim() || '');
    });
    if (rowData.length > 0) {
      data.push(rowData);
    }
  });
  
  return { headers, data };
}
