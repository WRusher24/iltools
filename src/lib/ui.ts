// UI strings from content/ui/he.json (Agent 3): a flat map with dotted keys, e.g. t('form.submit').
import he from '../../content/ui/he.json';

const MAP = he as Record<string, string>;
export function t(key: string): string {
  const v = MAP[key];
  if (typeof v !== 'string') throw new Error(`Missing UI string: ${key}`);
  return v;
}
