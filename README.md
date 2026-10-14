# React Native Network Replay

**Mock APIs, build UI before the backend, and record & replay network requests in React Native.**

`react-native-network-replay` is a developer-focused library designed to help React Native developers develop, test, and debug applications without depending on a live backend.

Define mock API responses, simulate network delays, reproduce API errors, and switch between mock and live modes.

## Features

- **API mocking** — Return predefined responses without calling a real backend.
- **JSON fixtures** — Define mock endpoints and responses in JSON files.
- **Axios integration** — Intercept requests through a custom Axios adapter.
- **Network delay simulation** — Simulate slow API responses.
- **Error simulation** — Configure HTTP error responses for testing.
- **Mock and live modes** — Switch between local fixtures and real API requests.
- **Safe unmatched requests** — Fail clearly when no mock is registered in mock mode.

### Roadmap

- OpenAPI / Swagger contract import
- Automatic mock generation from API schemas
- Network request recording and replay
- Import validation and improved debugging tools

## Installation

```bash
npm install react-native-network-replay axios
```

Install a compatible version of Axios if your project does not already use it.

## Quick Start

### 1. Create a Network Replay instance

```typescript
import axios from 'axios';

import {
  createNetworkReplay,
  createNetworkReplayAxiosAdapter,
} from 'react-native-network-replay';

const replay = createNetworkReplay({
  mode: 'mock',
});
```

### 2. Register a mock API response

```typescript
replay.mock('GET', '/products', {
  status: 200,
  delayMs: 300,
  body: {
    products: [
      {
        id: 'p1',
        name: 'iPhone',
        price: 79999,
      },
      {
        id: 'p2',
        name: 'Pixel',
        price: 69999,
      },
    ],
  },
});
```

### 3. Configure Axios

```typescript
export const api = axios.create({
  baseURL: 'https://api.example.com',
  adapter: createNetworkReplayAxiosAdapter(replay),
});
```

### 4. Make an API request

```typescript
const response = await api.get('/products');

console.log(response.data);
```

In mock mode, the registered response is returned without contacting the backend.

## JSON Mock Fixtures

You can define API responses in a JSON file instead of writing them directly in TypeScript.

Example: `mocks/products.json`

```json
{
  "mocks": [
    {
      "method": "GET",
      "url": "/products",
      "status": 200,
      "delayMs": 300,
      "body": {
        "products": [
          {
            "id": "p1",
            "name": "iPhone",
            "price": 79999
          }
        ]
      }
    },
    {
      "method": "GET",
      "url": "/products/404",
      "status": 404,
      "body": {
        "message": "Product not found"
      }
    }
  ]
}
```

Once JSON fixture import is implemented and exported, the intended API will be:

```typescript
import mocks from './mocks/products.json';

replay.importMocks(mocks);
```

This lets developers maintain their mock data separately from their application code.

## Switching Between Mock and Live Modes

Use mock mode during UI development and live mode when testing against a real backend.

```typescript
// Use local mock responses
replay.setMode('mock');

// Use the normal Axios network adapter
replay.setMode('live');
```

In live mode, requests are delegated to the configured fallback adapter.

## Testing API Error States

Register an error response to test your application's error handling.

```typescript
replay.mock('GET', '/products', {
  status: 500,
  body: {
    message: 'Internal server error',
  },
});
```

With standard Axios status validation, HTTP errors should reject the request and expose the response through `error.response`.

## Example Use Cases

### Develop UI before the backend is ready

Use API fixtures provided by the backend team to build screens while API implementation is in progress.

### Test loading states

Configure a delay to simulate slow network responses.

### Test empty and error states

Create fixtures for empty lists, unauthorized requests, missing resources, and server errors.

### Reproduce bugs

Use consistent mock responses to reproduce UI issues and verify fixes.

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/vivek-mobile/react-native-network-replay.git

cd react-native-network-replay

 yarn install
```

Run the checks:

```bash
 yarn typecheck
 yarn test
 yarn prepare
```

## Contributing

Contributions, bug reports, and feature requests are welcome.

Please open an issue before submitting major changes so we can discuss the proposed approach.

## License

MIT

---

Created by [Vivek Kumar](https://github.com/vivek-mobile).