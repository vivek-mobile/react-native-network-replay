import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { NetworkReplay } from '../NetworkReplay';

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function createNetworkReplayAxiosAdapter(
  replay: NetworkReplay,
  fallbackAdapter?: AxiosAdapter
): AxiosAdapter {
  const liveAdapter = axios.getAdapter(
    fallbackAdapter ?? axios.defaults.adapter
  );

  return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    if (replay.mode === 'live') {
      return liveAdapter(config);
    }

    const method = (config.method ?? 'get').toUpperCase();
    const url = config.url ?? '';

    const mock = replay.findMock(
      method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      url
    );

    if (!mock) {
      throw new Error(
        `[NetworkReplay] No mock registered for ${method} ${url}`
      );
    }

    if (mock.delayMs > 0) {
      await wait(mock.delayMs);
    }

    const response: AxiosResponse = {
      data: mock.body,
      status: mock.status,
      statusText: mock.status >= 400 ? 'Mock Error' : 'OK',
      headers: AxiosHeaders.from(mock.headers),
      config,
      request: {},
    };

    const validateStatus = config.validateStatus;

    if (
      !response.status ||
      !validateStatus ||
      validateStatus(response.status)
    ) {
      return response;
    }

    throw new AxiosError(
      `Request failed with status code ${response.status}`,
      response.status >= 500
        ? AxiosError.ERR_BAD_RESPONSE
        : AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response
    );
  };
}
