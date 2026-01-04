import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getTrail } from '@/lib/api';
import type { TrailBlock, TrailDetail } from '@/lib/types';

const lockReasonLabel: Record<string, string> = {
  subscription: 'Assinatura necessaria',
  previous_block: 'Conclua o bloco anterior',
};

export default function TrailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ trailId?: string }>();
  const trailId = typeof params.trailId === 'string' ? params.trailId : '';
  const [trail, setTrail] = useState<TrailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrail = async () => {
    if (!trailId) {
      setError('Trilha invalida.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getTrail(trailId);
      if (!data) {
        setTrail(null);
        setError('Trilha nao encontrada.');
        return;
      }
      setTrail(data);
    } catch (err) {
      console.warn('Failed to load trail:', err);
      setError('Nao foi possivel carregar a trilha.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrail();
    }, [trailId])
  );

  const handleBlockPress = (block: TrailBlock) => {
    if (block.isUnlocked) {
      router.push({
        pathname: '/block/[blockId]',
        params: { blockId: block.id },
      });
      return;
    }
    if (block.lockReason === 'subscription') {
      router.push({
        pathname: '/paywall',
        params: { reason: block.lockReason, source: 'bloco' },
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{trail?.title ?? 'Trilha'}</Text>
        <Text style={styles.subtitle}>{trail?.objective ?? ''}</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#0f172a" />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadTrail}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error && trail
          ? trail.blocks.map(block => {
              const isLocked = !block.isUnlocked;
              return (
                <TouchableOpacity
                  key={block.id}
                  style={[styles.blockCard, isLocked ? styles.blockCardLocked : null]}
                  onPress={() => handleBlockPress(block)}
                  disabled={isLocked && block.lockReason !== 'subscription'}
                >
                  <View style={styles.blockHeader}>
                    <Text style={styles.blockTitle}>{block.title}</Text>
                    <Text style={styles.blockStatus}>{block.status}</Text>
                  </View>
                  <Text style={styles.blockMeta}>
                    {block.isFree ? 'Gratis' : 'Assinatura'}
                    {block.lockReason ? ` - ${lockReasonLabel[block.lockReason]}` : ''}
                  </Text>
                  <Text style={styles.blockDescription}>{block.description ?? ''}</Text>
                  {block.lockReason === 'subscription' ? (
                    <Text style={styles.blockCta}>Assinar para desbloquear</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })
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
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 12,
  },
  center: {
    paddingVertical: 16,
  },
  blockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  blockCardLocked: {
    opacity: 0.7,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  blockMeta: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  blockStatus: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '600',
  },
  blockDescription: {
    fontSize: 13,
    color: '#475569',
  },
  blockCta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 8,
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
