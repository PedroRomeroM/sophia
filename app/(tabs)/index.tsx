import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getTrails } from '@/lib/api';
import type { TrailSummary } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const [trails, setTrails] = useState<TrailSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrails();
      setTrails(data);
    } catch (err) {
      console.warn('Failed to load trails:', err);
      setError('Nao foi possivel carregar as trilhas.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrails();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Trilhas recomendadas</Text>
        <Text style={styles.subtitle}>
          Comece com a trilha principal para destravar o caminho ate Tomas de Aquino.
        </Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#0f172a" />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadTrails}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error
          ? trails.map(trail => (
              <TouchableOpacity
                key={trail.id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/trail/[trailId]',
                    params: { trailId: trail.id },
                  })
                }
              >
                <Text style={styles.cardTitle}>{trail.title}</Text>
                <Text style={styles.cardDescription}>{trail.objective ?? ''}</Text>
                <Text style={styles.cardMeta}>
                  {trail.blocks.length} blocos
                </Text>
                <Text style={styles.cardCta}>Ver trilha</Text>
              </TouchableOpacity>
            ))
          : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
  },
  center: {
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  cardMeta: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  cardCta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#7f1d1d',
    fontSize: 13,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#991b1b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
