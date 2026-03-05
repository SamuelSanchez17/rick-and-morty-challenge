export interface ApiResponse<T> {
  info: ApiInfo;
  results: T[];
}

export interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}
