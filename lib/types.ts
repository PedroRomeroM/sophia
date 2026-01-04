export type LocaleCode = string;
export type PhaseType = 'regular' | 'review';

export type ProgressStatus = 'locked' | 'in_progress' | 'completed';
export type LockReason = 'subscription' | 'previous_block' | 'previous_phase' | null;

export type ChallengeType = 'quiz' | 'true_false' | 'match';

export type QuizPayload = {
  prompt: string;
  choices: string[];
  answer_index: number;
  explanation?: string;
  min_score?: number;
};

export type TrueFalsePayload = {
  prompt: string;
  answer: boolean;
  explanation?: string;
};

export type MatchPair = {
  left: string;
  right: string;
};

export type MatchPayload = {
  prompt: string;
  pairs: MatchPair[];
};

export type ChallengePayload = QuizPayload | TrueFalsePayload | MatchPayload;

export type QuizAttemptAnswer = {
  choiceIndex: number;
};

export type TrueFalseAttemptAnswer = {
  answer: boolean;
};

export type MatchAttemptAnswer = {
  pairs: MatchPair[];
};

export type ChallengeAttemptAnswer =
  | QuizAttemptAnswer
  | TrueFalseAttemptAnswer
  | MatchAttemptAnswer;

export type ChallengeAttemptSummary = {
  answers: ChallengeAttemptAnswer;
  result: boolean;
  score: number;
  createdAt: string;
};

export type TrailBlock = {
  id: string;
  orderIndex: number;
  title: string;
  description: string | null;
  isFree: boolean;
  hasAccess: boolean;
  isUnlocked: boolean;
  status: ProgressStatus;
  lockReason: 'subscription' | 'previous_block' | null;
};

export type NextBlockSummary = {
  id: string;
  trailId: string;
  orderIndex: number;
  title: string;
  description: string | null;
  isFree: boolean;
  hasAccess: boolean;
  isUnlocked: boolean;
  status: ProgressStatus;
  lockReason: 'subscription' | 'previous_block' | null;
};

export type TrailSummary = {
  id: string;
  slug: string;
  title: string;
  objective: string | null;
  orderIndex: number;
  blocks: TrailBlock[];
};

export type TrailDetail = TrailSummary;

export type PhaseSummary = {
  id: string;
  orderIndex: number;
  title: string;
  description: string | null;
  phaseType: PhaseType;
  isUnlocked: boolean;
  status: ProgressStatus;
  lockReason: LockReason;
};

export type ReadingItem = {
  id: string;
  orderIndex: number;
  title: string;
  author: string | null;
  url: string | null;
  notes: string | null;
};

export type BlockDetail = {
  id: string;
  trailId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isFree: boolean;
  hasAccess: boolean;
  isUnlocked: boolean;
  status: ProgressStatus;
  lockReason: 'subscription' | 'previous_block' | null;
  phases: PhaseSummary[];
  readings: ReadingItem[];
};

export type QuizChallengeItem = {
  id: string;
  orderIndex: number;
  type: 'quiz';
  isFinal: boolean;
  payload: QuizPayload;
  bestAttempt?: ChallengeAttemptSummary | null;
};

export type TrueFalseChallengeItem = {
  id: string;
  orderIndex: number;
  type: 'true_false';
  isFinal: boolean;
  payload: TrueFalsePayload;
  bestAttempt?: ChallengeAttemptSummary | null;
};

export type MatchChallengeItem = {
  id: string;
  orderIndex: number;
  type: 'match';
  isFinal: boolean;
  payload: MatchPayload;
  bestAttempt?: ChallengeAttemptSummary | null;
};

export type ChallengeItem = QuizChallengeItem | TrueFalseChallengeItem | MatchChallengeItem;

export type PhaseDetail = {
  id: string;
  blockId: string;
  title: string;
  description: string | null;
  phaseType: PhaseType;
  orderIndex: number;
  challenges: ChallengeItem[];
};

export type SubmitChallengeAttemptResponse = {
  result: boolean;
  score: number;
  phaseStatus: ProgressStatus;
  phaseCompleted: boolean;
  blockStatus: ProgressStatus;
  blockCompleted: boolean;
  correctCount: number;
  totalChallenges: number;
};

export type DebugGrantEntitlementResponse = {
  status: string;
  provider: string;
  productId: string;
};

export type DebugResetAccountResponse = {
  attemptsDeleted: number;
  phaseProgressDeleted: number;
  blockProgressDeleted: number;
  entitlementsDeleted: number;
};
