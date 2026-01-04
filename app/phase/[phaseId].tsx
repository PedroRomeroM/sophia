import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getPhase } from '@/lib/api';
import ChallengeRenderer from '@/components/challenges/ChallengeRenderer';
import type { PhaseDetail, ProgressStatus, SubmitChallengeAttemptResponse } from '@/lib/types';

export default function PhaseScreen() {
  const params = useLocalSearchParams<{ phaseId?: string }>();
  const phaseId = typeof params.phaseId === 'string' ? params.phaseId : '';
  const [phase, setPhase] = useState<PhaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressSummary, setProgressSummary] = useState<SubmitChallengeAttemptResponse | null>(null);

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
        await loadPhase();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [phaseId]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{phase?.title ?? 'Fase'}</Text>
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
