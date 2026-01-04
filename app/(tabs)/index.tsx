import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

const SAMPLE_TRAIL_ID = '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f001';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trilhas recomendadas</Text>
      <Text style={styles.subtitle}>
        Comece com a trilha principal para destravar o caminho ate Tomas de Aquino.
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/trail/[trailId]',
            params: { trailId: SAMPLE_TRAIL_ID },
          })
        }
      >
        <Text style={styles.cardTitle}>Sao Tomas de Aquino</Text>
        <Text style={styles.cardDescription}>
          Socrates, Platao, Aristoteles e a sintese tomista.
        </Text>
        <Text style={styles.cardCta}>Ver trilha</Text>
      </TouchableOpacity>
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
  cardCta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
});
