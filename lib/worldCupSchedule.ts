import officialSeeds from '@/data/world-cup-2026-seeds.json';
import hardwiredResultsData from '@/data/daily-results.json';
import { allWorldCupMatches as generatedMatches } from './mockData';
import type { Match } from './mockData';

type Seed = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
  time: string;
  tournament: string;
  stage: string;
  homeStrength: number;
  awayStrength: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  actualScore?: string;
};

type MatchResultRecord = {
  matchId: string;
  actualScore: string;
  updatedAt: string;
};

export type MatchResultMap = Record<string, MatchResultRecord>;

export type OfficialScheduleMatch = Omit<Seed, 'actualScore'> & {
  isConfirmed: boolean;
  generatedByAI: boolean;
  source: 'official';
};

const TOURNAMENT_NAME = '2026 FIFA世界杯';
const RESULT_TIMESTAMP = '2026-07-06T00:00:00.000Z';
const INVALID_TEAM_NAMES = new Set([
  '',
  'TBD',
  '待定',
  '待晋级',
  '待晋级球队',
  'AI生成',
  'AI预测',
  'null',
  'undefined',
]);

const countryNameMap: Record<string, string> = {
  Algeria: '阿尔及利亚',
  Argentina: '阿根廷',
  Australia: '澳大利亚',
  Austria: '奥地利',
  Belgium: '比利时',
  'Bosnia and Herzegovina': '波黑',
  Brazil: '巴西',
  'Cabo Verde': '佛得角',
  Canada: '加拿大',
  Colombia: '哥伦比亚',
  'Congo DR': '刚果(金)',
  Croatia: '克罗地亚',
  Curacao: '库拉索',
  'Curaçao': '库拉索',
  Czechia: '捷克',
  Ecuador: '厄瓜多尔',
  Egypt: '埃及',
  England: '英格兰',
  France: '法国',
  Germany: '德国',
  Ghana: '加纳',
  Haiti: '海地',
  Iraq: '伊拉克',
  'IR Iran': '伊朗',
  Japan: '日本',
  Jordan: '约旦',
  'Korea Republic': '韩国',
  Mexico: '墨西哥',
  Morocco: '摩洛哥',
  Netherlands: '荷兰',
  'New Zealand': '新西兰',
  Norway: '挪威',
  Panama: '巴拿马',
  Paraguay: '巴拉圭',
  Portugal: '葡萄牙',
  Qatar: '卡塔尔',
  'Saudi Arabia': '沙特阿拉伯',
  Scotland: '苏格兰',
  Senegal: '塞内加尔',
  'South Africa': '南非',
  Spain: '西班牙',
  Sweden: '瑞典',
  Switzerland: '瑞士',
  Tunisia: '突尼斯',
  Turkiye: '土耳其',
  'Türkiye': '土耳其',
  Uruguay: '乌拉圭',
  USA: '美国',
  Uzbekistan: '乌兹别克斯坦',
  "Cote d'Ivoire": '科特迪瓦',
  "Côte d'Ivoire": '科特迪瓦',
};

function isPlaceholderName(name: string): boolean {
  return /^(Winner|Loser) of Match \d+$/.test(name);
}

function localizeCountryName(name: string): string {
  return countryNameMap[name] || name;
}

function localizeStageName(stage: string): string {
  const group = stage.match(/^Group ([A-L]) - Matchday (\d)$/);
  if (group) return `小组赛 ${group[1]}组 第${group[2]}轮`;

  const r32 = stage.match(/^Round of 32 - Match (\d+)$/);
  if (r32) return `32强赛 第${r32[1]}场`;

  const r16 = stage.match(/^Round of 16 - Match (\d+)$/);
  if (r16) return `16强赛 第${r16[1]}场`;

  const qf = stage.match(/^Quarter-final (\d+)$/);
  if (qf) return `1/4决赛 第${qf[1]}场`;

  const sf = stage.match(/^Semi-final (\d+)$/);
  if (sf) return `半决赛 第${sf[1]}场`;

  if (stage === 'Third-place Play-off') return '季军赛';
  if (stage === 'Final') return '决赛';
  return stage;
}

function normalizeScore(score?: string): string | undefined {
  if (!score) return undefined;
  const match = score.trim().match(/^(\d+)\s*:\s*(\d+)$/);
  if (!match) return undefined;
  return `${Number(match[1])}:${Number(match[2])}`;
}

function isOfficialMatchConfirmed(match: Seed): boolean {
  return Boolean(match.homeTeam)
    && Boolean(match.awayTeam)
    && Boolean(match.date)
    && Boolean(match.time)
    && !isPlaceholderName(match.homeTeam)
    && !isPlaceholderName(match.awayTeam);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

const rawOfficialSeeds = officialSeeds as Seed[];

export const officialTeamsList = Array.from(
  new Set(
    rawOfficialSeeds
      .flatMap((seed) => [seed.homeTeam, seed.awayTeam])
      .filter((team) => isNonEmptyString(team) && !isPlaceholderName(team))
      .map((team) => localizeCountryName(team.trim())),
  ),
).sort((a, b) => a.localeCompare(b, 'zh-CN'));

const officialTeams = new Set(officialTeamsList);

function isOfficialTeam(team: unknown): team is string {
  if (!isNonEmptyString(team)) return false;
  const normalizedTeam = team.trim();
  if (INVALID_TEAM_NAMES.has(normalizedTeam)) return false;
  if (isPlaceholderName(normalizedTeam)) return false;
  return officialTeams.has(normalizedTeam);
}

const embeddedResults = rawOfficialSeeds.reduce<MatchResultMap>((acc, seed) => {
  const normalizedScore = normalizeScore(seed.actualScore);
  if (!normalizedScore) return acc;
  acc[seed.id] = {
    matchId: seed.id,
    actualScore: normalizedScore,
    updatedAt: RESULT_TIMESTAMP,
  };
  return acc;
}, {});

export const matchResults: MatchResultMap = {
  ...embeddedResults,
  ...(hardwiredResultsData as MatchResultMap),
};

export const officialSchedule: OfficialScheduleMatch[] = rawOfficialSeeds.map((seed) => ({
  ...seed,
  homeTeam: localizeCountryName(seed.homeTeam),
  awayTeam: localizeCountryName(seed.awayTeam),
  tournament: TOURNAMENT_NAME,
  stage: localizeStageName(seed.stage),
  isConfirmed: isOfficialMatchConfirmed(seed),
  generatedByAI: false,
  source: 'official',
}));

export const officialMatches = officialSchedule;

export function isValidMatch(match: OfficialScheduleMatch | null | undefined) {
  return Boolean(
    match
    && match.source === 'official'
    && match.generatedByAI !== true
    && match.isConfirmed === true
    && isOfficialTeam(match.homeTeam)
    && isOfficialTeam(match.awayTeam)
    && match.homeTeam !== match.awayTeam,
  );
}

export function getVisibleMatches(schedule: OfficialScheduleMatch[]) {
  return schedule.filter(isValidMatch);
}

const generatedMatchById = new Map(generatedMatches.map((match) => [match.id, match]));

function buildVisibleMatch(match: OfficialScheduleMatch): Match {
  const base = generatedMatchById.get(match.id);
  if (!base) {
    throw new Error(`Missing generated prediction model for ${match.id}`);
  }

  return {
    ...base,
    id: match.id,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeFlag: match.homeFlag,
    awayFlag: match.awayFlag,
    date: match.date,
    time: match.time,
    tournament: match.tournament,
    stage: match.stage,
    homeStrength: match.homeStrength,
    awayStrength: match.awayStrength,
    actualScore: matchResults[match.id]?.actualScore,
  };
}

const safeMatches = getVisibleMatches(officialSchedule);

export const allWorldCupMatches: Match[] = safeMatches
  .map(buildVisibleMatch)
  .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

export const worldCupMatches: Match[] = allWorldCupMatches;

export const statsSummary = {
  totalAnalyzed: 10000,
  totalHit: 0,
  totalAccuracy: 0,
  recent30Accuracy: 0,
};
