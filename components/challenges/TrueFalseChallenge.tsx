import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChallengeCard from './ChallengeCard';
import { submitChallengeAttempt } from '@/lib/api';
import type { SubmitChallengeAttemptResponse, TrueFalseChallengeItem } from '@/lib/types';

type TrueFalseChallengeProps = {
  challenge: TrueFalseChallengeItem;
  onSubmitted?: (response: SubmitChallengeAttemptResponse) => void;
};

export default function TrueFalseChallenge({ challenge, onSubmitted }: TrueFalseChallengeProps) {
  const { payload } = challenge;
  const [selectedValue, setSelectedValue] = useState<boolean | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options: Array<{ label: string; value: boolean }> = [
    { label: 'Verdadeiro', value: true },
    { label: 'Falso', value: false },
  ];

  useEffect(() => {
    const attempt = challenge.bestAttempt;
    if (!attempt || !('answer' in attempt.answers)) {
      setSelectedValue(null);
      setResult(null);
      return;
    }
    setSelectedValue(attempt.answers.answer);
    setResult(attempt.result);
  }, [challenge.id, challenge.bestAttempt?.createdAt]);

  const handleSelect = async (value: boolean) => {
    if (submitting) {
      return;
    }
    setSelectedValue(value);
    setResult(null);
    setSubmitting(true);
    setError(null);
    try {
      const response = await submitChallengeAttempt(challenge.id, {
        answer: value,
      });
      setResult(response.result);
      onSubmitted?.(response);
    } catch (err) {
      console.warn('Failed to submit true/false attempt:', err);
      setError('Nao foi possivel salvar a resposta.');
      setResult(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ChallengeCard
      title={`Desafio ${challenge.orderIndex}`}
      meta="Verdadeiro/Falso"
      isFinal={challenge.isFinal}
    >
      <Text style={styles.prompt}>{payload.prompt}</Text>
      <View style={styles.options}>
        {options.map(option => {
          const isSelected = selectedValue === option.value;
          const showFeedback = result !== null;
          const isRight = isSelected && showFeedback && result === true;
          const isWrong = isSelected && showFeedback && result === false;
          return (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.option,
                isSelected ? styles.optionSelected : null,
                isRight ? styles.optionCorrect : null,
                isWrong ? styles.optionWrong : null,
              ]}
              onPress={() => handleSelect(option.value)}
              disabled={submitting}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected ? styles.optionTextSelected : null,
                ]}
              >
                {option.label}
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
