import type { ChallengeItem, SubmitChallengeAttemptResponse } from '@/lib/types';
import MatchChallenge from './MatchChallenge';
import QuizChallenge from './QuizChallenge';
import TrueFalseChallenge from './TrueFalseChallenge';

type ChallengeRendererProps = {
  challenge: ChallengeItem;
  onSubmitted?: (response: SubmitChallengeAttemptResponse) => void;
};

export default function ChallengeRenderer({ challenge, onSubmitted }: ChallengeRendererProps) {
  switch (challenge.type) {
    case 'quiz':
      return <QuizChallenge challenge={challenge} onSubmitted={onSubmitted} />;
    case 'true_false':
      return <TrueFalseChallenge challenge={challenge} onSubmitted={onSubmitted} />;
    case 'match':
      return <MatchChallenge challenge={challenge} onSubmitted={onSubmitted} />;
    default:
      return null;
  }
}
