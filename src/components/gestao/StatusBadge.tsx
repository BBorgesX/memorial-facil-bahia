import { Badge } from '@/components/ui/badge';
import { StatusProjeto } from '@/lib/projeto';
import { STATUS_INFO } from '@/lib/gestao';

export function StatusBadge({ status }: { status: StatusProjeto }) {
  const info = STATUS_INFO[status] ?? STATUS_INFO.rascunho;
  return (
    <Badge variant="outline" className={`${info.classe} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${info.ponto}`} />
      {info.rotulo}
    </Badge>
  );
}
