# -*- coding: utf-8 -*-
import pathlib

f = pathlib.Path(r'C:\Users\83668\.qwenpaw\workspaces\default\football-predict\lib\results.ts')
content = f.read_text(encoding='utf-8')

anchor = 'const STATIC_RESULTS_URL = \x60\/data/results.json\x60;'
hardwired = '''

// Hardwired match results - persisted in code for guaranteed display
const HARDWIRED_RESULTS: ResultMap = {
  'wc-a1-01': { matchId: 'wc-a1-01', actualScore: '2:0', updatedAt: '2026-06-13T17:08:51Z' },
  'wc-a1-02': { matchId: 'wc-a1-02', actualScore: '1:1', updatedAt: '2026-06-14T00:00:00Z' },
  'wc-b1-01': { matchId: 'wc-b1-01', actualScore: '1:1', updatedAt: '2026-06-14T00:00:00Z' },
  'wc-d1-01': { matchId: 'wc-d1-01', actualScore: '1:0', updatedAt: '2026-06-14T00:00:00Z' },
  'wc-b1-02': { matchId: 'wc-b1-02', actualScore: '0:2', updatedAt: '2026-06-14T00:00:00Z' },
  'wc-c1-01': { matchId: 'wc-c1-01', actualScore: '0:2', updatedAt: '2026-06-14T00:00:00Z' },
  'wc-c1-02': { matchId: 'wc-c1-02', actualScore: '2:0', updatedAt: '2026-06-14T00:00:00Z' },
  'wc-d1-02': { matchId: 'wc-d1-02', actualScore: '0:1', updatedAt: '2026-06-14T00:00:00Z' },
};'''

content = content.replace(anchor, anchor + hardwired)

old_fn = '''export async function loadResultSnapshot(): Promise<ResultSnapshot> {
  try {
    const results = await requestRemote();
    return { results, source: 'remote' };
  } catch {
    try {
      const results = await requestStaticResults();
      return { results, source: 'static' };
    } catch {
      return { results: {}, source: 'static' };
    }
  }
}'''

new_fn = '''export async function loadResultSnapshot(): Promise<ResultSnapshot> {
  const base = { ...HARDWIRED_RESULTS };

  try {
    const remote = await requestRemote();
    return { results: { ...base, ...remote }, source: 'remote' };
  } catch {
    try {
      const staticResults = await requestStaticResults();
      return { results: { ...base, ...staticResults }, source: 'static' };
    } catch {
      return { results: base, source: 'static' };
    }
  }
}'''

content = content.replace(old_fn, new_fn)

f.write_text(content, encoding='utf-8')
print('Done')
