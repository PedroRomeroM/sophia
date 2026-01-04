import { supabase } from './supabase';
import type {
  BlockDetail,
  LocaleCode,
  PhaseDetail,
  SubmitChallengeAttemptResponse,
  TrailDetail,
  TrailSummary,
} from './types';

const DEFAULT_LOCALE: LocaleCode = 'pt-BR';

async function callRpc<T>(name: string, params: Record<string, unknown>) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) {
    throw error;
  }
  return data as T;
}

export async function getTrails(locale: LocaleCode = DEFAULT_LOCALE): Promise<TrailSummary[]> {
  return callRpc<TrailSummary[]>('rpc_get_trails', { p_locale: locale });
}

export async function getTrail(
  trailId: string,
  locale: LocaleCode = DEFAULT_LOCALE
): Promise<TrailDetail | null> {
  return callRpc<TrailDetail | null>('rpc_get_trail', {
    p_trail_id: trailId,
    p_locale: locale,
  });
}

export async function getBlock(
  blockId: string,
  locale: LocaleCode = DEFAULT_LOCALE
): Promise<BlockDetail | null> {
  return callRpc<BlockDetail | null>('rpc_get_block', {
    p_block_id: blockId,
    p_locale: locale,
  });
}

export async function getPhase(
  phaseId: string,
  locale: LocaleCode = DEFAULT_LOCALE
): Promise<PhaseDetail | null> {
  return callRpc<PhaseDetail | null>('rpc_get_phase', {
    p_phase_id: phaseId,
    p_locale: locale,
  });
}

export async function submitChallengeAttempt(
  challengeId: string,
  answers: Record<string, unknown>
): Promise<SubmitChallengeAttemptResponse> {
  return callRpc<SubmitChallengeAttemptResponse>('rpc_submit_challenge_attempt', {
    p_challenge_id: challengeId,
    p_answers: answers,
  });
}
