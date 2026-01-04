import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PhaseScreen() {
  const { phaseId } = useLocalSearchParams<{ phaseId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fase</Text>
      <Text style={styles.subtitle}>ID: {phaseId}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Desafios</Text>
        <Text style={styles.cardText}>
          Aqui vamos renderizar os desafios vindos do RPC.
        </Text>
      </View>
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
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
  },
});
