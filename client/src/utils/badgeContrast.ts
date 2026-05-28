/**
 * Normaliza clases Tailwind de badges para asegurar contraste texto/fondo
 * (la BD puede incluir `text-white` sobre fondos claros).
 */
const LIGHT_BG =
  /^bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200)(?:\/\d+)?$/;

const DARK_BG =
  /^bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:600|700|800|900)(?:\/\d+)?$/;

export function normalizeBadgeClassName(colorClasses: string, fallbackBg = 'bg-slate-200'): string {
  const parts = colorClasses.trim().split(/\s+/).filter(Boolean);
  const bg = parts.find((p) => p.startsWith('bg-')) ?? fallbackBg;
  const extra = parts.filter((p) => !p.startsWith('text-') && !p.startsWith('bg-'));

  let textClass = 'text-gray-900';
  if (DARK_BG.test(bg)) {
    textClass = 'text-white';
  } else if (!LIGHT_BG.test(bg)) {
    textClass = 'text-slate-900';
  }

  return [bg, textClass, ...extra].join(' ');
}
