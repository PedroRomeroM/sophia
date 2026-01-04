import { StyleSheet, Text, View } from 'react-native';
import type { PropsWithChildren } from 'react';

type ChallengeCardProps = PropsWithChildren<{
  title: string;
  meta: string;
  isFinal?: boolean;
}>;

export default function ChallengeCard({ title, meta, isFinal, children }: ChallengeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      {isFinal ? <Text style={styles.finalBadge}>Final do bloco</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  meta: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  finalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
});
