import type {
  HttpMethod,
  MockRequest,
  MockResponse,
  ResolvedMockResponse,
} from './types';

export class MockRegistry {
  private readonly mocks = new Map<string, ResolvedMockResponse>();

  register<T>(
    method: HttpMethod,
    url: string,
    response: MockResponse<T>
  ): void {
    const key = this.createKey(method, url);

    this.mocks.set(key, {
      status: response.status ?? 200,
      headers: response.headers ?? {},
      body: response.body,
      delayMs: response.delayMs ?? 0,
    });
  }

  find(request: MockRequest): ResolvedMockResponse | undefined {
    const key = this.createKey(request.method, request.url);
    return this.mocks.get(key);
  }

  clear(): void {
    this.mocks.clear();
  }

  private createKey(method: HttpMethod, url: string): string {
    const path = url.split('?')[0] ?? '';
    const normalizedUrl = path.replace(/\/+$/, '');

    return `${method.toUpperCase()} ${normalizedUrl}`;
  }
}
