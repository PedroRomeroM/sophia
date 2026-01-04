import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    reason?: string;
    source?: string;
  }>();

  const reason = typeof params.reason === 'string' ? params.reason : 'subscription';
  const source = typeof params.source === 'string' ? params.source : 'conteudo';

  const reasonLabel =
    reason === 'subscription'
      ? 'Este conteudo faz parte da assinatura.'
      : 'Este conteudo esta bloqueado.';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Desbloqueie tudo</Text>
        <Text style={styles.subtitle}>
          Para acessar este {source}, assine e libere todos os blocos e desafios.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assinatura premium</Text>
          <Text style={styles.cardText}>{reasonLabel}</Text>
          <Text style={styles.cardText}>
            Inclui todas as trilhas, blocos e atualizacoes futuras.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => {}}>
          <Text style={styles.primaryButtonText}>Assinar em breve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.helper}>
          Pagamentos via Apple/Google serao ativados em breve.
        </Text>
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
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
  },
  primaryButton: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  helper: {
    marginTop: 16,
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
