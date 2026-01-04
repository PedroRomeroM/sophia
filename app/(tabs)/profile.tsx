import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { debugGrantEntitlement, debugResetAccount } from '@/lib/api';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [debugMessage, setDebugMessage] = useState<string | null>(null);
  const [granting, setGranting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleGrant = async () => {
    if (granting) {
      return;
    }
    setGranting(true);
    setDebugMessage(null);
    try {
      await debugGrantEntitlement();
      setDebugMessage('Plano premium liberado para esta conta.');
    } catch (err) {
      console.warn('Failed to grant debug entitlement:', err);
      setDebugMessage('Nao foi possivel liberar o premium.');
    } finally {
      setGranting(false);
    }
  };

  const handleReset = () => {
    if (resetting) {
      return;
    }
    Alert.alert(
      'Resetar conta',
      'Isso apaga progresso e tentativas desta conta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            setDebugMessage(null);
            try {
              await debugResetAccount();
              setDebugMessage('Dados resetados com sucesso.');
            } catch (err) {
              console.warn('Failed to reset account:', err);
              setDebugMessage('Nao foi possivel resetar os dados.');
            } finally {
              setResetting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Configuracoes e progresso vao aparecer aqui.</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{user?.email ?? 'Nao informado'}</Text>
        </View>

        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Debug</Text>
          <Text style={styles.debugSubtitle}>Ferramentas temporarias para testes.</Text>
          <TouchableOpacity
            style={[styles.debugButton, granting ? styles.debugButtonDisabled : null]}
            onPress={handleGrant}
            disabled={granting}
          >
            <Text style={styles.debugButtonText}>
              {granting ? 'Liberando...' : 'Liberar premium (debug)'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resetButton, resetting ? styles.debugButtonDisabled : null]}
            onPress={handleReset}
            disabled={resetting}
          >
            <Text style={styles.resetButtonText}>
              {resetting ? 'Resetando...' : 'Resetar dados da conta'}
            </Text>
          </TouchableOpacity>
          {debugMessage ? <Text style={styles.debugMessage}>{debugMessage}</Text> : null}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sair</Text>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  debugCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  debugSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  debugButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  resetButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#991b1b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  debugButtonDisabled: {
    opacity: 0.7,
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  debugMessage: {
    marginTop: 10,
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '600',
  },
  signOutButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#991b1b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
