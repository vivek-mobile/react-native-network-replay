import { MockRegistry } from './MockRegistry';
import type {
  HttpMethod,
  MockResponse,
  NetworkReplayConfig,
  NetworkReplayMode,
  ResolvedMockResponse,
} from './types';

export class NetworkReplay {
  private readonly registry = new MockRegistry();
  private currentMode: NetworkReplayMode;

  constructor(config: NetworkReplayConfig = {}) {
    this.currentMode = config.mode ?? 'mock';
  }

  get mode(): NetworkReplayMode {
    return this.currentMode;
  }

  setMode(mode: NetworkReplayMode): void {
    this.currentMode = mode;
  }

  mock<T>(method: HttpMethod, url: string, response: MockResponse<T>): void {
    this.registry.register(method, url, response);
  }

  findMock(method: HttpMethod, url: string): ResolvedMockResponse | undefined {
    if (this.currentMode !== 'mock') {
      return undefined;
    }

    return this.registry.find({ method, url });
  }

  clearMocks(): void {
    this.registry.clear();
  }
}

export function createNetworkReplay(
  config: NetworkReplayConfig = {}
): NetworkReplay {
  return new NetworkReplay(config);
}
