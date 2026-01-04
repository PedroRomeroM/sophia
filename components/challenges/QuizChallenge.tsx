import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChallengeCard from './ChallengeCard';
import { submitChallengeAttempt } from '@/lib/api';
import type { QuizChallengeItem, SubmitChallengeAttemptResponse } from '@/lib/types';

type QuizChallengeProps = {
  challenge: QuizChallengeItem;
  onSubmitted?: (response: SubmitChallengeAttemptResponse) => void;
};

export default function QuizChallenge({ challenge, onSubmitted }: QuizChallengeProps) {
  const { payload } = challenge;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const attempt = challenge.bestAttempt;
    if (!attempt || !('choiceIndex' in attempt.answers)) {
      setSelectedIndex(null);
      setResult(null);
      return;
    }
    setSelectedIndex(attempt.answers.choiceIndex);
    setResult(attempt.result);
  }, [challenge.id, challenge.bestAttempt?.createdAt]);

  const handleSelect = async (index: number) => {
    if (submitting) {
      return;
    }
    setSelectedIndex(index);
    setResult(null);
    setSubmitting(true);
    setError(null);
    try {
      const response = await submitChallengeAttempt(challenge.id, {
        choiceIndex: index,
      });
      setResult(response.result);
      onSubmitted?.(response);
    } catch (err) {
      console.warn('Failed to submit quiz attempt:', err);
      setError('Nao foi possivel salvar a resposta.');
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ChallengeCard
      title={`Desafio ${challenge.orderIndex}`}
      meta="Quiz"
      isFinal={challenge.isFinal}
    >
      <Text style={styles.prompt}>{payload.prompt}</Text>
      <View style={styles.options}>
        {payload.choices.map((choice, index) => {
          const isSelected = selectedIndex === index;
          const showFeedback = result !== null;
          const isRight = isSelected && showFeedback && result === true;
          const isWrong = isSelected && showFeedback && result === false;
          return (
            <TouchableOpacity
              key={`${index}-${choice}`}
              style={[
                styles.option,
                isSelected ? styles.optionSelected : null,
                isRight ? styles.optionCorrect : null,
                isWrong ? styles.optionWrong : null,
              ]}
              onPress={() => handleSelect(index)}
              disabled={submitting}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected ? styles.optionTextSelected : null,
                ]}
              >
                {choice}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {result !== null ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>
            {result ? 'Correto.' : 'Incorreto.'}
          </Text>
          {payload.explanation ? (
            <Text style={styles.explanation}>{payload.explanation}</Text>
          ) : null}
        </View>
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
  options: {
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  optionSelected: {
    borderColor: '#0f172a',
    backgroundColor: '#e2e8f0',
  },
  optionCorrect: {
    borderColor: '#16a34a',
    backgroundColor: '#dcfce7',
  },
  optionWrong: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  optionText: {
    fontSize: 13,
    color: '#0f172a',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  feedback: {
    marginTop: 12,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  explanation: {
    fontSize: 12,
    color: '#475569',
  },
  errorText: {
    marginTop: 12,
    fontSize: 12,
    color: '#991b1b',
    fontWeight: '600',
  },
});
