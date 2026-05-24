/**
 * Common cross-domain primitives.
 */
export type ID = string;
export type ISODateString = string;

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: Pagination;
};

export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };
