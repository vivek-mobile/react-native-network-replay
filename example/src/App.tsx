
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';

import {
  createNetworkReplay,
  createNetworkReplayAxiosAdapter,
} from 'react-native-network-replay';

type Product = {
  id: string;
  name: string;
  price: number;
};

type ProductsResponse = {
  products: Product[];
};

const BASE_URL = 'https://api.example.com';

export default function App() {
  const [mode, setMode] = useState<'mock' | 'live'>('mock');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string>('');

  const replay = useMemo(
    () => createNetworkReplay({ mode: 'mock' }),
    [],
  );

  const api = useMemo(
    () =>
      axios.create({
        baseURL: BASE_URL,
        adapter: createNetworkReplayAxiosAdapter(replay),
      }),
    [replay],
  );

  // Register mock data once.
  React.useEffect(() => {
    replay.mock('GET', '/products', {
      status: 200,
      delayMs: 600,
      body: {
        products: [
          { id: 'p1', name: 'iPhone', price: 79999 },
          { id: 'p2', name: 'Pixel', price: 69999 },
          { id: 'p3', name: 'Samsung Galaxy', price: 59999 },
        ],
      } satisfies ProductsResponse,
    });
  }, [replay]);

  function changeMode(nextMode: 'mock' | 'live') {
    replay.setMode(nextMode);
    setMode(nextMode);
    setProducts([]);
    setError(null);
    setLastResponse('');
  }

  async function loadProducts() {
    setLoading(true);
    setError(null);
    setLastResponse('');

    try {
      const response = await api.get<ProductsResponse>('/products');

      setProducts(response.data.products);
      setLastResponse(
        `HTTP ${response.status}\n${JSON.stringify(
          response.data,
          null,
          2,
        )}`,
      );
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Something went wrong';

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Network Replay</Text>
        <Text style={styles.subtitle}>
          Build and test your UI without depending on a live backend.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>API mode</Text>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'mock' && styles.activeMode,
              ]}
              onPress={() => changeMode('mock')}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'mock' && styles.activeModeText,
                ]}
              >
                Mock mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'live' && styles.activeMode,
              ]}
              onPress={() => changeMode('live')}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'live' && styles.activeModeText,
                ]}
              >
                Live mode
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modeDescription}>
            {mode === 'mock'
              ? 'Using local fixtures. No backend request is made.'
              : 'Using the real API. The example URL is intentionally not a real backend.'}
          </Text>

          <TouchableOpacity
            style={styles.loadButton}
            onPress={loadProducts}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loadButtonText}>Fetch products</Text>
            )}
          </TouchableOpacity>
        </View>

        {error !== null && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Request failed</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.sectionHeading}>
          Products ({products.length})
        </Text>

        {products.map(product => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productIcon}>
              <Text style={styles.productIconText}>P</Text>
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productId}>{product.id}</Text>
            </View>

            <Text style={styles.price}>
              ₹{product.price.toLocaleString('en-IN')}
            </Text>
          </View>
        ))}

        {lastResponse !== '' && (
          <View style={styles.responseCard}>
            <Text style={styles.sectionTitle}>Last API response</Text>
            <Text selectable style={styles.responseText}>
              {lastResponse}
            </Text>
          </View>
        )}

        <Text style={styles.footer}>
          React Native Network Replay · MVP
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#172033',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#657089',
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E6EAF2',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#172033',
    marginBottom: 14,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8DEEA',
    alignItems: 'center',
  },
  activeMode: {
    backgroundColor: '#2457D6',
    borderColor: '#2457D6',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
  },
  activeModeText: {
    color: '#FFFFFF',
  },
  modeDescription: {
    marginTop: 14,
    color: '#657089',
    fontSize: 13,
    lineHeight: 19,
  },
  loadButton: {
    backgroundColor: '#2457D6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  loadButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#172033',
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EAF2',
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2457D6',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172033',
  },
  productId: {
    fontSize: 12,
    color: '#8992A5',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172033',
  },
  errorCard: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFD0D0',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B42318',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#912018',
    lineHeight: 19,
  },
  responseCard: {
    marginTop: 20,
    backgroundColor: '#172033',
    padding: 16,
    borderRadius: 14,
  },
  responseText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 19,
    color: '#E4EBFF',
  },
  footer: {
    textAlign: 'center',
    color: '#8992A5',
    fontSize: 12,
    marginTop: 28,
  },
});
