import hardwiredResultsData from '@/data/daily-results.json';
import type { Match } from './mockData';

export type StoredResult = {
  matchId: string;
  actualScore: string;
  updatedAt: string;
};

export type ResultMap = Record<string, StoredResult>;

export type HistoryStatRecord = {
  matchId: string;
  match: string;
  date: string;
  stage: string;
  predictedScore: string;
  actualScore: string;
  isExact: boolean;
  isTop5: boolean;
  isOutcomeCorrect: boolean;
};

export type HistorySummary = {
  total: number;
  exact: number;
  top5: number;
  outcome: number;
  exactRate: string;
  top5Rate: string;
  outcomeRate: string;
};

export type ResultSource = 'remote' | 'static';

export type ResultSnapshot = {
  results: ResultMap;
  source: ResultSource;
};

const API_URL = process.env.NEXT_PUBLIC_RESULTS_API_URL || '';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const STATIC_RESULTS_URL = `${BASE_PATH}/data/results.json`;

// Hardwired match results - persisted in code for guaranteed display
const HARDWIRED_RESULTS: ResultMap = hardwiredResultsData as ResultMap;

export const CONFIRMED_RESULT_IDS = new Set(Object.keys(HARDWIRED_RESULTS));

function normalizeScore(score?: string | null): string | null {
  if (!score) return null;
  const match = score.trim().replace('：', ':').match(/^(\d+)\s*:\s*(\d+)$/);
  if (!match) return null;
  const home = Number(match[1]);
  const away = Number(match[2]);
  if (!Number.isInteger(home) || !Number.isInteger(away)) return null;
  if (home < 0 || away < 0 || home > 20 || away > 20) return null;
  return `${home}:${away}`;
}

export function parseScore(score?: string | null): [number, number] | null {
  const normalized = normalizeScore(score);
  if (!normalized) return null;
  const [home, away] = normalized.split(':').map(Number);
  return [home, away];
}

export function validateScore(score?: string | null): { ok: true; score: string } | { ok: false; message: string } {
  const trimmed = score?.trim();
  if (!trimmed) return { ok: false, message: '请输入实际比分，例如 2:1' };
  const normalized = normalizeScore(trimmed);
  if (!normalized) return { ok: false, message: '比分格式应为 2:1，且单队进球不超过 20' };
  return { ok: true, score: normalized };
}

export function scoreOutcome(score?: string | null): 'home' | 'draw' | 'away' | null {
  const parsed = parseScore(score);
  if (!parsed) return null;
  const [home, away] = parsed;
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'draw';
}

async function requestRemote(path = '', init?: RequestInit): Promise<ResultMap> {
  if (!API_URL) throw new Error('Remote result API is not configured');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Result API failed: ${response.status}`);
  const payload = await response.json();
  return normalizeResultPayload(payload);
}

async function requestStaticResults(): Promise<ResultMap> {
  const response = await fetch(STATIC_RESULTS_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Static results failed: ${response.status}`);
  const payload = await response.json();
  return normalizeResultPayload(payload);
}

function normalizeResultPayload(payload: unknown): ResultMap {
  const raw = (payload && typeof payload === 'object' && 'results' in payload)
    ? (payload as { results: unknown }).results
    : payload;
  if (Array.isArray(raw)) {
    return raw.reduce<ResultMap>((map, item) => {
      if (!item || typeof item !== 'object') return map;
      const result = item as Partial<StoredResult>;
      if (!result.matchId || !result.actualScore) return map;
      map[result.matchId] = {
        matchId: result.matchId,
        actualScore: normalizeScore(result.actualScore) || result.actualScore,
        updatedAt: result.updatedAt || new Date().toISOString(),
      };
      return map;
    }, {});
  }
  if (!raw || typeof raw !== 'object') return {};
  return Object.entries(raw as Record<string, Partial<StoredResult>>).reduce<ResultMap>((map, [matchId, result]) => {
    if (!result?.actualScore) return map;
    map[matchId] = {
      matchId: result.matchId || matchId,
      actualScore: normalizeScore(result.actualScore) || result.actualScore,
      updatedAt: result.updatedAt || new Date().toISOString(),
    };
    return map;
  }, {});
}

function sanitizeResults(results: ResultMap): ResultMap {
  return Object.entries(results).reduce<ResultMap>((map, [matchId, result]) => {
    const normalized = normalizeScore(result?.actualScore);
    if (!normalized) return map;
    map[matchId] = {
      matchId: result.matchId || matchId,
      actualScore: normalized,
      updatedAt: result.updatedAt || new Date().toISOString(),
    };
    return map;
  }, {});
}

export async function loadResultSnapshot(): Promise<ResultSnapshot> {
  const base = { ...HARDWIRED_RESULTS };

  try {
    const remote = sanitizeResults(await requestRemote());
    return { results: { ...remote, ...base }, source: 'remote' };
  } catch {
    try {
      const staticResults = sanitizeResults(await requestStaticResults());
      return { results: { ...staticResults, ...base }, source: 'static' };
    } catch {
      return { results: base, source: 'static' };
    }
  }
}

export function getAllResults(results: ResultMap = {}): StoredResult[] {
  return Object.values(results).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
}

export function getResultForMatch(matchId: string, results: ResultMap = {}): StoredResult | null {
  return results[matchId] || null;
}

export async function saveMatchResult(matchId: string, actualScore: string): Promise<{ ok: boolean; message: string; source?: ResultSource; results?: ResultMap }> {
  const validated = validateScore(actualScore);
  if (!validated.ok) return validated;

  try {
    const results = await requestRemote(`/${encodeURIComponent(matchId)}`, {
      method: 'PUT',
      body: JSON.stringify({ actualScore: validated.score }),
    });
    return { ok: true, message: '赛果已保存，并同步到共享数据源', source: 'remote', results };
  } catch {
    return { ok: false, message: '当前为静态发布模式，赛果不会保存到浏览器。请通过 GitHub Actions 的 Record Match Result 工作流录入并重新发布。' };
  }
}

export async function deleteMatchResult(matchId: string): Promise<{ ok: boolean; message: string; source?: ResultSource; results?: ResultMap }> {
  try {
    const results = await requestRemote(`/${encodeURIComponent(matchId)}`, { method: 'DELETE' });
    return { ok: true, message: '赛果已删除，并同步到共享数据源', source: 'remote', results };
  } catch {
    return { ok: false, message: '当前为静态发布模式，不能从浏览器删除赛果。请修改 data/daily-results.json 后重新发布，或接入共享 API。' };
  }
}

export function isExactScore(predictedScore: string | undefined, actualScore: string): boolean {
  return !!predictedScore && normalizeScore(predictedScore) === normalizeScore(actualScore);
}

export function isTop5Score(match: Match, actualScore: string): boolean {
  const normalized = normalizeScore(actualScore);
  return !!normalized && match.topScores.slice(0, 5).some((score) => normalizeScore(score.score) === normalized);
}

export function isOutcomeHit(predictedScore: string | undefined, actualScore: string): boolean {
  const predicted = scoreOutcome(predictedScore);
  const actual = scoreOutcome(actualScore);
  return !!predicted && !!actual && predicted === actual;
}

export function buildHistoryRecords(matches: Match[], results: ResultMap = {}): HistoryStatRecord[] {
  return matches
    .filter((match) => !!results[match.id])
    .map((match) => {
      const actualScore = results[match.id].actualScore;
      const predictedScore = match.predictedScore || match.topScores[0]?.score || '-';
      return {
        matchId: match.id,
        match: `${match.homeTeam} vs ${match.awayTeam}`,
        date: `${match.date} ${match.time}`,
        stage: match.stage,
        predictedScore,
        actualScore,
        isExact: isExactScore(predictedScore, actualScore),
        isTop5: isTop5Score(match, actualScore),
        isOutcomeCorrect: isOutcomeHit(predictedScore, actualScore),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildHistorySummary(records: HistoryStatRecord[]): HistorySummary {
  const total = records.length;
  const exact = records.filter((record) => record.isExact).length;
  const top5 = records.filter((record) => record.isTop5).length;
  const outcome = records.filter((record) => record.isOutcomeCorrect).length;
  return {
    total,
    exact,
    top5,
    outcome,
    exactRate: percentage(exact, total),
    top5Rate: percentage(top5, total),
    outcomeRate: percentage(outcome, total),
  };
}

export function percentage(hit: number, total: number): string {
  if (!total) return '待更新';
  return `${Math.round((hit / total) * 100)}%`;
}
