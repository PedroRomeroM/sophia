import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChallengeCard from './ChallengeCard';
import { submitChallengeAttempt } from '@/lib/api';
import type { MatchChallengeItem, SubmitChallengeAttemptResponse } from '@/lib/types';

type MatchChallengeProps = {
  challenge: MatchChallengeItem;
  onSubmitted?: (response: SubmitChallengeAttemptResponse) => void;
};

export default function MatchChallenge({ challenge, onSubmitted }: MatchChallengeProps) {
  const { payload } = challenge;
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Record<number, number>>({});
  const [result, setResult] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rightItems = useMemo(() => payload.pairs.map(pair => pair.right), [payload.pairs]);

  useEffect(() => {
    const attempt = challenge.bestAttempt;
    if (!attempt || !('pairs' in attempt.answers)) {
      setAssignments({});
      setResult(null);
      setSelectedLeft(null);
      return;
    }

    const nextAssignments: Record<number, number> = {};
    attempt.answers.pairs.forEach(pair => {
      const leftIndex = payload.pairs.findIndex(item => item.left === pair.left);
      const rightIndex = rightItems.indexOf(pair.right);
      if (leftIndex >= 0 && rightIndex >= 0) {
        nextAssignments[leftIndex] = rightIndex;
      }
    });
    setAssignments(nextAssignments);
    setResult(attempt.result);
    setSelectedLeft(null);
  }, [challenge.id, challenge.bestAttempt?.createdAt, payload.pairs, rightItems]);

  const handleLeftPress = (index: number) => {
    setSelectedLeft(index);
    setResult(null);
    setError(null);
  };

  const handleRightPress = (rightIndex: number) => {
    if (selectedLeft === null) {
      return;
    }
    const alreadyAssigned = Object.values(assignments).includes(rightIndex);
    if (alreadyAssigned) {
      return;
    }
    setAssignments(prev => ({ ...prev, [selectedLeft]: rightIndex }));
    setSelectedLeft(null);
    setResult(null);
    setError(null);
  };

  const isRightAssigned = (rightIndex: number) =>
    Object.values(assignments).includes(rightIndex);

  const isMatchCorrect = (leftIndex: number, rightIndex: number) =>
    rightItems[rightIndex] === payload.pairs[leftIndex]?.right;

  const allAssigned = Object.keys(assignments).length === payload.pairs.length;
  const showResult = result !== null;

  const handleSubmit = async () => {
    if (!allAssigned || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const pairs = payload.pairs.map((pair, index) => ({
        left: pair.left,
        right: rightItems[assignments[index]],
      }));
      const response = await submitChallengeAttempt(challenge.id, { pairs });
      setResult(response.result);
      onSubmitted?.(response);
    } catch (err) {
      console.warn('Failed to submit match attempt:', err);
      setError('Nao foi possivel salvar a resposta.');
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ChallengeCard
      title={`Desafio ${challenge.orderIndex}`}
      meta="Match"
      isFinal={challenge.isFinal}
    >
      <Text style={styles.prompt}>{payload.prompt}</Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          {payload.pairs.map((pair, index) => {
            const isSelected = selectedLeft === index;
            const isAssigned = assignments[index] !== undefined;
            const assignedRight = assignments[index];
            const isCorrect =
              showResult && isAssigned && isMatchCorrect(index, assignedRight);
            const isWrong = showResult && isAssigned && !isCorrect;
            return (
              <TouchableOpacity
                key={`${index}-${pair.left}`}
                style={[
                  styles.item,
                  isSelected ? styles.itemSelected : null,
                  !showResult && isAssigned ? styles.itemAssigned : null,
                  isCorrect ? styles.itemCorrect : null,
                  isWrong ? styles.itemWrong : null,
                ]}
                onPress={() => handleLeftPress(index)}
                disabled={submitting}
              >
                <Text style={styles.itemText}>{pair.left}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.column}>
          {rightItems.map((item, index) => {
            const assignedRight = isRightAssigned(index);
            const assignedLeft = Object.keys(assignments).find(
              key => assignments[Number(key)] === index
            );
            const assignedLeftIndex = assignedLeft ? Number(assignedLeft) : -1;
            const isCorrect =
              showResult &&
              assignedLeftIndex >= 0 &&
              isMatchCorrect(assignedLeftIndex, index);
            const isWrong = showResult && assignedLeftIndex >= 0 && !isCorrect;
            return (
              <TouchableOpacity
                key={`${index}-${item}`}
                style={[
                  styles.item,
                  !showResult && assignedRight ? styles.itemAssigned : null,
                  isCorrect ? styles.itemCorrect : null,
                  isWrong ? styles.itemWrong : null,
                ]}
                onPress={() => handleRightPress(index)}
                disabled={submitting}
              >
                <Text style={styles.itemText}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          !allAssigned || submitting ? styles.submitButtonDisabled : null,
        ]}
        onPress={handleSubmit}
        disabled={!allAssigned || submitting}
      >
        <Text style={styles.submitText}>Enviar respostas</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {result !== null ? (
        <Text style={styles.feedback}>{result ? 'Correto.' : 'Incorreto.'}</Text>
      ) : null}
    </ChallengeCard>
  );
}

const styles = StyleSheet.create({
  prompt: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  item: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  itemSelected: {
    borderColor: '#0f172a',
    backgroundColor: '#e2e8f0',
  },
  itemAssigned: {
    borderColor: '#38bdf8',
    backgroundColor: '#e0f2fe',
  },
  itemCorrect: {
    borderColor: '#16a34a',
    backgroundColor: '#dcfce7',
  },
  itemWrong: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  itemText: {
    fontSize: 12,
    color: '#0f172a',
  },
  submitButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  feedback: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  errorText: {
    marginTop: 12,
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
  },
});
