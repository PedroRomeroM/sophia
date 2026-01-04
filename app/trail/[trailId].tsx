import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const SAMPLE_BLOCKS = [
  { id: '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f101', title: 'Socrates', isFree: true },
  { id: '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f102', title: 'Platao', isFree: true },
  { id: '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f103', title: 'Aristoteles', isFree: false },
];

export default function TrailScreen() {
  const router = useRouter();
  const { trailId } = useLocalSearchParams<{ trailId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trilha</Text>
      <Text style={styles.subtitle}>ID: {trailId}</Text>

      {SAMPLE_BLOCKS.map(block => (
        <TouchableOpacity
          key={block.id}
          style={styles.blockCard}
          onPress={() =>
            router.push({
              pathname: '/block/[blockId]',
              params: { blockId: block.id },
            })
          }
        >
          <Text style={styles.blockTitle}>{block.title}</Text>
          <Text style={styles.blockMeta}>
            {block.isFree ? 'Gratis' : 'Assinatura'}
          </Text>
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
  blockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
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
  },
});
