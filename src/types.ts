export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type NetworkReplayMode = 'mock' | 'live';

export interface MockResponse<T = unknown> {
  status?: number;
  headers?: Record<string, string>;
  body: T;
  delayMs?: number;
}

export interface NetworkReplayConfig {
  mode?: NetworkReplayMode;
}

export interface MockRequest {
  method: HttpMethod;
  url: string;
}

export interface ResolvedMockResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body: T;
  delayMs: number;
}
