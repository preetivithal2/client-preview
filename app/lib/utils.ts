export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const calculateDaysOpen = (reportedDate: string, dateCompleted: string | null): number => {
  const start = new Date(reportedDate);
  const end = dateCompleted ? new Date(dateCompleted) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatus = (dateCompleted: string | null): 'OPEN' | 'CLOSED' => {
  return dateCompleted ? 'CLOSED' : 'OPEN';
};

/** Export an array of objects as a CSV file and trigger download */
export function exportToCsv<T extends Record<string, any>>(data: T[], filename: string, headerMap: Record<string, string>) {
  if (!data.length) return;
  const headers = Object.keys(headerMap);
  const csvRows = [headers.map((h) => `"${headerMap[h]}"`).join(",")];
  for (const row of data) {
    const vals = headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return '""';
      return `"${String(v).replace(/"/g, '""')}"`;
    });
    csvRows.push(vals.join(","));
  }
  const blob = new Blob(["﻿" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Map job status text to theme-friendly Tailwind badge classes */
export function getStatusBadgeClasses(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('open'))     return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
  if (s.includes('progress')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  if (s.includes('cancel'))   return 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  if (s.includes('close') || s.includes('complete')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700';
}