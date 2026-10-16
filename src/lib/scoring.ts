// Editorial scoring engine implementing the published /methodology formula (weights fixed, never influenced by payment).
// A total is produced ONLY when all five sub-scores (0–100) are supplied from data; otherwise null ("לא זמין").
// No sub-scores exist in /data yet, so the site currently shows no scores (see docs/engineering/BLOCKERS.md).
export const SCORE_WEIGHTS = { price: 0.3, fit: 0.3, support: 0.15, reliability: 0.15, transparency: 0.1 } as const;
export type ScoreKey = keyof typeof SCORE_WEIGHTS;
export type SubScores = Partial<Record<ScoreKey, number | null>>;

export const SCORE_LABELS_HE: Record<ScoreKey, string> = {
  price: 'מחיר',
  fit: 'התאמת יכולות',
  support: 'תמיכה',
  reliability: 'אמינות',
  transparency: 'שקיפות',
};

export function totalScore(s: SubScores): number | null {
  let sum = 0;
  for (const k of Object.keys(SCORE_WEIGHTS) as ScoreKey[]) {
    const v = s[k];
    if (typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > 100) return null;
    sum += v * SCORE_WEIGHTS[k];
  }
  return Math.round(sum * 10) / 10;
}

export const WEIGHTS_SUM = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
