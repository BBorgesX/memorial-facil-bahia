/** Badge de status do projeto com cor por situação. */

import { Badge } from '@/components/ui/badge';
import type { StatusProjeto } from '@/lib/projeto';
import { cn } from '@/lib/utils';

const CORES: Record<StatusProjeto, string> = {
  Levantamento: 'bg-slate-100 text-slate-700 border-slate-200',
  'Em desenho': 'bg-blue-100 text-blue-800 border-blue-200',
  Protocolado: 'bg-violet-100 text-violet-800 border-violet-200',
  'Em análise': 'bg-amber-100 text-amber-800 border-amber-200',
  Aprovado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Comunique-se': 'bg-red-100 text-red-800 border-red-200',
};

export function StatusBadge({ status }: { status?: StatusProjeto }) {
  const s = status ?? 'Levantamento';
  return (
    <Badge variant="outline" className={cn('font-medium', CORES[s])}>
      {s}
    </Badge>
  );
}
