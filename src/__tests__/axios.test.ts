import { describe, expect, it, afterEach, jest } from '@jest/globals';
import axios, { type AxiosAdapter } from 'axios';

import { createNetworkReplay } from '../NetworkReplay';
import { createNetworkReplayAxiosAdapter } from '../adapters/axios';

describe('NetworkReplay Axios adapter', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the registered mock response without a network call', async () => {
    const replay = createNetworkReplay({ mode: 'mock' });

    replay.mock('GET', '/products', {
      status: 200,
      body: { products: [{ id: 'p1', name: 'iPhone' }] },
    });

    const fallbackAdapter = jest.fn<AxiosAdapter>();

    const api = axios.create({
      adapter: createNetworkReplayAxiosAdapter(replay, fallbackAdapter),
    });

    const response = await api.get('/products');

    expect(response.status).toBe(200);
    expect(response.data.products).toEqual([{ id: 'p1', name: 'iPhone' }]);
    expect(fallbackAdapter).not.toHaveBeenCalled();
  });

  it('rejects requests without a registered mock', async () => {
    const replay = createNetworkReplay({ mode: 'mock' });

    const api = axios.create({
      adapter: createNetworkReplayAxiosAdapter(replay),
    });

    await expect(api.get('/unknown')).rejects.toThrow(
      '[NetworkReplay] No mock registered for GET /unknown'
    );
  });

  it('applies the configured response delay', async () => {
    jest.useFakeTimers();

    const replay = createNetworkReplay({ mode: 'mock' });

    replay.mock('GET', '/products', {
      body: { products: [] },
      delayMs: 100,
    });

    const api = axios.create({
      adapter: createNetworkReplayAxiosAdapter(replay),
    });

    const request = api.get('/products');

    await jest.advanceTimersByTimeAsync(100);

    const response = await request;

    expect(response.data).toEqual({ products: [] });
  });

  it('uses the fallback adapter in live mode', async () => {
    const replay = createNetworkReplay({ mode: 'live' });

    const fallbackAdapter = jest.fn<AxiosAdapter>(async (config) => ({
      data: { source: 'live' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    }));

    const api = axios.create({
      adapter: createNetworkReplayAxiosAdapter(replay, fallbackAdapter),
    });

    const response = await api.get('/products');

    expect(response.data).toEqual({ source: 'live' });
    expect(fallbackAdapter).toHaveBeenCalledTimes(1);
  });

  it('rejects mocked HTTP 500 responses by default', async () => {
    const replay = createNetworkReplay({ mode: 'mock' });

    replay.mock('GET', '/products', {
      status: 500,
      body: { message: 'Internal server error' },
    });

    const api = axios.create({
      adapter: createNetworkReplayAxiosAdapter(replay),
    });

    await expect(api.get('/products')).rejects.toMatchObject({
      response: {
        status: 500,
        data: { message: 'Internal server error' },
      },
    });
  });

  it('respects a custom validateStatus function', async () => {
    const replay = createNetworkReplay({ mode: 'mock' });

    replay.mock('GET', '/products', {
      status: 500,
      body: { message: 'Internal server error' },
    });

    const api = axios.create({
      adapter: createNetworkReplayAxiosAdapter(replay),
    });

    const response = await api.get('/products', {
      validateStatus: (status) => status < 600,
    });

    expect(response.status).toBe(500);
  });
});
