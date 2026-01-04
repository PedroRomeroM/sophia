import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const PHASES_BY_BLOCK: Record<string, { id: string; title: string }[]> = {
  '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f101': [
    { id: '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f201', title: 'Contexto e metodo' },
    { id: '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f202', title: 'Virtude e conhecimento' },
  ],
  '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f102': [
    { id: '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f203', title: 'Mundo sensivel e Ideias' },
    { id: '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f204', title: 'Alma e polis' },
  ],
  '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f103': [
    { id: '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f205', title: 'Logica e categorias' },
    { id: '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f206', title: 'Ato e potencia' },
  ],
};

export default function BlockScreen() {
  const router = useRouter();
  const { blockId } = useLocalSearchParams<{ blockId: string }>();
  const phases = PHASES_BY_BLOCK[blockId ?? ''] ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bloco</Text>
      <Text style={styles.subtitle}>ID: {blockId}</Text>

      {phases.map(phase => (
        <TouchableOpacity
          key={phase.id}
          style={styles.phaseCard}
          onPress={() =>
            router.push({
              pathname: '/phase/[phaseId]',
              params: { phaseId: phase.id },
            })
          }
        >
          <Text style={styles.phaseTitle}>{phase.title}</Text>
          <Text style={styles.phaseCta}>Abrir fase</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
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
  phaseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  phaseCta: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
});
