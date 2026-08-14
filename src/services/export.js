const escapeCsvValue = (value) => {
  const safeValue = value == null ? '' : String(value);
  return `"${safeValue.replace(/"/g, '""')}"`;
};

export function exportInvoicesCsv(rows = []) {
  const headers = [
    'invoiceId',
    'passengerName',
    'tripNumber',
    'totalAmount',
    'paid',
    'remaining',
    'paymentMethod',
    'branch',
  ];

  return exportCsvRows(headers, rows);
}

export function exportCsvRows(headers = [], rows = []) {
  const headerLine = headers.map((header) => escapeCsvValue(header)).join(',');
  const bodyLines = rows.map((row) => {
    const values = headers.map((header) => escapeCsvValue(row[header] ?? ''));
    return values.join(',');
  });

  return [headerLine, ...bodyLines].join('\n');
}

export function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportReportCsv(filename, headers, rows) {
  const content = exportCsvRows(headers, rows);
  downloadCsv(filename, content);
}

export function printHtmlReport(title, rows, headers) {
  const thMarkup = headers.map((header) => `<th>${header}</th>`).join('');
  const trMarkup = rows.map((row) => {
    const values = headers.map((header) => `<td>${row[header] ?? ''}</td>`).join('');
    return `<tr>${values}</tr>`;
  }).join('');

  const html = `
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background: #f3f4f6; }
          h1 { margin-bottom: 12px; font-size: 24px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>${thMarkup}</tr>
          </thead>
          <tbody>${trMarkup}</tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}

export function triggerPrint() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
