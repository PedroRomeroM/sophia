import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getNextBlock, getPhase } from '@/lib/api';
import ChallengeRenderer from '@/components/challenges/ChallengeRenderer';
import type {
  NextBlockSummary,
  PhaseDetail,
  ProgressStatus,
  SubmitChallengeAttemptResponse,
} from '@/lib/types';

export default function PhaseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phaseId?: string }>();
  const phaseId = typeof params.phaseId === 'string' ? params.phaseId : '';
  const [phase, setPhase] = useState<PhaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressSummary, setProgressSummary] = useState<SubmitChallengeAttemptResponse | null>(null);
  const [nextBlock, setNextBlock] = useState<NextBlockSummary | null>(null);
  const [nextBlockLoading, setNextBlockLoading] = useState(false);
  const [nextBlockError, setNextBlockError] = useState<string | null>(null);

  const statusLabel: Record<ProgressStatus, string> = {
    locked: 'Bloqueado',
    in_progress: 'Em andamento',
    completed: 'Concluido',
  };

  const loadPhase = async () => {
    if (!phaseId) {
      setError('Fase invalida.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getPhase(phaseId);
      if (!data) {
        setPhase(null);
        setError('Fase nao encontrada.');
        return;
      }
      setPhase(data);
    } catch (err) {
      console.warn('Failed to load phase:', err);
      setError('Nao foi possivel carregar a fase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) {
        setProgressSummary(null);
        setNextBlock(null);
        setNextBlockError(null);
        await loadPhase();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [phaseId]);

  useEffect(() => {
    let mounted = true;
    const shouldLoadNext =
      phase?.phaseType === 'review' && progressSummary?.blockCompleted === true;
    if (!shouldLoadNext || !phase) {
      return;
    }
    (async () => {
      try {
        setNextBlockLoading(true);
        setNextBlockError(null);
        const data = await getNextBlock(phase.blockId);
        if (mounted) {
          setNextBlock(data);
        }
      } catch (err) {
        console.warn('Failed to load next block:', err);
        if (mounted) {
          setNextBlockError('Nao foi possivel carregar o proximo bloco.');
        }
      } finally {
        if (mounted) {
          setNextBlockLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [phase?.blockId, phase?.phaseType, progressSummary?.blockCompleted]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{phase?.title ?? 'Fase'}</Text>
          {phase?.phaseType === 'review' ? (
            <Text style={styles.reviewBadge}>Revisao</Text>
          ) : null}
        </View>
        <Text style={styles.subtitle}>{phase?.description ?? ''}</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#0f172a" />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorAction} onPress={loadPhase}>
              Tentar novamente
            </Text>
          </View>
        ) : null}

        {!loading && !error && phase ? (
          <>
            {progressSummary ? (
              <View style={styles.progressCard}>
                <Text style={styles.progressTitle}>Progresso da fase</Text>
                <Text style={styles.progressText}>
                  Status: {statusLabel[progressSummary.phaseStatus]}
                </Text>
                <Text style={styles.progressText}>
                  Acertos: {progressSummary.correctCount}/{progressSummary.totalChallenges}
                </Text>
                <Text style={styles.progressText}>
                  Pontuacao: {progressSummary.score}%
                </Text>
                <Text style={styles.progressText}>
                  Bloco: {statusLabel[progressSummary.blockStatus]}
                </Text>
                {progressSummary.phaseCompleted && phase ? (
                  <TouchableOpacity
                    style={styles.backToBlockButton}
                    onPress={() =>
                      router.push({
                        pathname: '/block/[blockId]',
                        params: { blockId: phase.blockId },
                      })
                    }
                  >
                    <Text style={styles.backToBlockButtonText}>Voltar para fases</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
            {progressSummary?.blockCompleted && phase.phaseType === 'review' ? (
              <View style={styles.nextBlockCard}>
                <Text style={styles.nextBlockTitle}>Bloco concluido</Text>
                {nextBlockLoading ? (
                  <Text style={styles.nextBlockText}>Carregando proximo bloco...</Text>
                ) : null}
                {!nextBlockLoading && nextBlock ? (
                  <Text style={styles.nextBlockText}>
                    Proximo bloco: {nextBlock.title}
                  </Text>
                ) : null}
                {!nextBlockLoading && !nextBlock ? (
                  <Text style={styles.nextBlockText}>
                    Voce concluiu o ultimo bloco desta trilha.
                  </Text>
                ) : null}
                {nextBlockError ? (
                  <Text style={styles.nextBlockError}>{nextBlockError}</Text>
                ) : null}
                {nextBlock && nextBlock.isUnlocked ? (
                  <TouchableOpacity
                    style={styles.nextBlockButton}
                    onPress={() =>
                      router.push({
                        pathname: '/block/[blockId]',
                        params: { blockId: nextBlock.id },
                      })
                    }
                  >
                    <Text style={styles.nextBlockButtonText}>Ir para o proximo bloco</Text>
                  </TouchableOpacity>
                ) : null}
                {nextBlock && !nextBlock.isUnlocked && nextBlock.lockReason === 'subscription' ? (
                  <TouchableOpacity
                    style={styles.nextBlockButton}
                    onPress={() =>
                      router.push({
                        pathname: '/paywall',
                        params: { reason: 'subscription', source: 'bloco' },
                      })
                    }
                  >
                    <Text style={styles.nextBlockButtonText}>Assinar para desbloquear</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
            <Text style={styles.sectionTitle}>Desafios</Text>
            {phase.challenges.map(challenge => (
              <ChallengeRenderer
                key={challenge.id}
                challenge={challenge}
                onSubmitted={setProgressSummary}
              />
            ))}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewBadge: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
  },
  center: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  nextBlockCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  nextBlockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  nextBlockText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
  },
  nextBlockError: {
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
    marginBottom: 8,
  },
  nextBlockButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nextBlockButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
  },
  backToBlockButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  backToBlockButtonText: {
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
  errorAction: {
    color: '#7f1d1d',
    fontSize: 12,
    fontWeight: '600',
  },
});
