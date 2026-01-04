import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getBlock } from '@/lib/api';
import type { BlockDetail, PhaseSummary } from '@/lib/types';

const lockReasonLabel: Record<string, string> = {
  subscription: 'Assinatura necessaria',
  previous_block: 'Conclua o bloco anterior',
  previous_phase: 'Conclua a fase anterior',
};

export default function BlockScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ blockId?: string }>();
  const blockId = typeof params.blockId === 'string' ? params.blockId : '';
  const [block, setBlock] = useState<BlockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlock = async () => {
    if (!blockId) {
      setError('Bloco invalido.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getBlock(blockId);
      if (!data) {
        setBlock(null);
        setError('Bloco nao encontrado.');
        return;
      }
      setBlock(data);
    } catch (err) {
      console.warn('Failed to load block:', err);
      setError('Nao foi possivel carregar o bloco.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBlock();
    }, [blockId])
  );

  const handlePhasePress = (phase: PhaseSummary) => {
    if (phase.isUnlocked) {
      router.push({
        pathname: '/phase/[phaseId]',
        params: { phaseId: phase.id },
      });
      return;
    }
    if (phase.lockReason === 'subscription') {
      router.push({
        pathname: '/paywall',
        params: { reason: phase.lockReason, source: 'fase' },
      });
    }
  };

  const renderPhase = (phase: PhaseSummary) => {
    const isLocked = !phase.isUnlocked;
    return (
      <TouchableOpacity
        key={phase.id}
        style={[styles.phaseCard, isLocked ? styles.phaseCardLocked : null]}
        onPress={() => handlePhasePress(phase)}
        disabled={isLocked && phase.lockReason !== 'subscription'}
      >
        <View style={styles.phaseHeader}>
          <Text style={styles.phaseTitle}>{phase.title}</Text>
          <Text style={styles.phaseStatus}>{phase.status}</Text>
        </View>
        <Text style={styles.phaseMeta}>
          {phase.lockReason ? lockReasonLabel[phase.lockReason] : 'Disponivel'}
        </Text>
        {phase.lockReason === 'subscription' ? (
          <Text style={styles.phaseCta}>Assinar para desbloquear</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{block?.title ?? 'Bloco'}</Text>
        <Text style={styles.subtitle}>{block?.description ?? ''}</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#0f172a" />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadBlock}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error && block ? (
          <>
            {!block.isUnlocked ? (
              <View style={styles.lockCard}>
                <Text style={styles.lockTitle}>Bloco bloqueado</Text>
                <Text style={styles.lockText}>
                  {block.lockReason ? lockReasonLabel[block.lockReason] : ''}
                </Text>
                {block.lockReason === 'subscription' ? (
                  <TouchableOpacity
                    style={styles.lockButton}
                    onPress={() =>
                      router.push({
                        pathname: '/paywall',
                        params: { reason: block.lockReason, source: 'bloco' },
                      })
                    }
                  >
                    <Text style={styles.lockButtonText}>Ver assinatura</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <View style={styles.blockMeta}>
              <Text style={styles.blockMetaText}>
                Status: {block.status}
              </Text>
              {block.lockReason ? (
                <Text style={styles.blockMetaText}>
                  {lockReasonLabel[block.lockReason]}
                </Text>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>Fases</Text>
            {block.phases.map(renderPhase)}

            {block.readings.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Leituras recomendadas</Text>
                {block.readings.map(reading => (
                  <View key={reading.id} style={styles.readingCard}>
                    <Text style={styles.readingTitle}>{reading.title}</Text>
                    <Text style={styles.readingMeta}>{reading.author ?? ''}</Text>
                    <Text style={styles.readingNotes}>{reading.notes ?? ''}</Text>
                  </View>
                ))}
              </>
            ) : null}
          </>
        ) : null}
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
  blockMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  blockMetaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    marginTop: 8,
  },
  phaseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  phaseCardLocked: {
    opacity: 0.7,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  phaseStatus: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '600',
  },
  phaseMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  phaseCta: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
    marginTop: 6,
  },
  readingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  readingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  readingMeta: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  readingNotes: {
    fontSize: 12,
    color: '#475569',
  },
  lockCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
    padding: 12,
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 6,
  },
  lockText: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 8,
  },
  lockButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lockButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
