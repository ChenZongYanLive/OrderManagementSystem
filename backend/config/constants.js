// Application constants

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
export const DEFAULT_FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const IMPORT_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  COMPLETED_WITH_ERRORS: 'completed_with_errors',
  FAILED: 'failed',
};

export const FILE_TYPES = {
  CSV: 'csv',
  EXCEL: 'excel',
  XLSX: 'xlsx',
  JSON: 'json',
};

export const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/json',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const ALLOWED_FILE_EXTENSIONS = ['.csv', '.json', '.xls', '.xlsx'];
