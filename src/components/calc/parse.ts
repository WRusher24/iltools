// Tolerant numeric parsing for user text (Western / Arabic-Indic / Persian digits, thousands commas, comma decimals).
export function parseNum(raw: string): number {
  let s = String(raw ?? '').trim();
  if (!s) return NaN;
  s = s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0))
    .replace(/[‎‏‪-‮⁦-⁩\s ₪%]/g, '')
    .replace(/[−–‒]/g, '-')
    .replace(/٫/g, '.')
    .replace(/٬/g, ',');
  if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
  else if (s.includes(',')) {
    // "1,500" / "12,345,678" => thousands; otherwise a decimal comma ("1,5")
    s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  }
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
