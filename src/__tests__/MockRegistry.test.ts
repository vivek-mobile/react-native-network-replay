import { createNetworkReplay } from '../NetworkReplay';
import { describe, expect, it } from '@jest/globals';

describe('NetworkReplay', () => {
  it('returns a registered mock response', () => {
    const replay = createNetworkReplay({ mode: 'mock' });

    replay.mock('GET', '/products', {
      status: 200,
      body: {
        products: [{ id: 'p1', name: 'iPhone' }],
      },
    });

    const response = replay.findMock('GET', '/products');

    expect(response?.status).toBe(200);
    expect(response?.body).toEqual({
      products: [{ id: 'p1', name: 'iPhone' }],
    });
  });

  it('does not return mocks in live mode', () => {
    const replay = createNetworkReplay({ mode: 'live' });

    replay.mock('GET', '/products', {
      body: { products: [] },
    });

    expect(replay.findMock('GET', '/products')).toBeUndefined();
  });
});
