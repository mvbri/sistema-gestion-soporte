import type { FC } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

type DashboardActionAccent = 'sky' | 'emerald' | 'amber' | 'violet';

const accentStyles: Record<
  DashboardActionAccent,
  { icon: string; border: string; ring: string }
> = {
  sky: {
    icon: 'bg-sky-500/15 text-sky-300 border-sky-400/25 group-hover:bg-sky-500/25',
    border: 'border-white/10 group-hover:border-sky-400/35',
    ring: 'group-focus-visible:ring-sky-400/40',
  },
  emerald: {
    icon: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25 group-hover:bg-emerald-500/25',
    border: 'border-white/10 group-hover:border-emerald-400/35',
    ring: 'group-focus-visible:ring-emerald-400/40',
  },
  amber: {
    icon: 'bg-amber-500/15 text-amber-300 border-amber-400/25 group-hover:bg-amber-500/25',
    border: 'border-white/10 group-hover:border-amber-400/35',
    ring: 'group-focus-visible:ring-amber-400/40',
  },
  violet: {
    icon: 'bg-violet-500/15 text-violet-300 border-violet-400/25 group-hover:bg-violet-500/25',
    border: 'border-white/10 group-hover:border-violet-400/35',
    ring: 'group-focus-visible:ring-violet-400/40',
  },
};

interface DashboardActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: DashboardActionAccent;
  onClick: () => void;
}

export const DashboardActionCard: FC<DashboardActionCardProps> = ({
  title,
  description,
  icon: Icon,
  accent,
  onClick,
}) => {
  const styles = accentStyles[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full flex-col rounded-2xl border bg-[#1f262e]/90 p-5 text-left shadow-sm shadow-black/20 transition-all duration-200 hover:bg-[#252d38]/95 hover:shadow-md hover:shadow-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] ${styles.border} ${styles.ring}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <ChevronRight
          className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-300"
          aria-hidden
        />
      </div>
      <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">{description}</p>
    </button>
  );
};
