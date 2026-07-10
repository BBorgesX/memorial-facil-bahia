/**
 * Memorial Descritivo (unificado) — reaproveita o gerador validado do
 * Memorial Fácil Bahia (src/lib/memorial.ts), consolidando dados do projeto
 * + resultados de todos os cálculos, com exportação em PDF e Word.
 */

import { FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MemorialPreview } from '@/components/editor/MemorialPreview';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { useModulo } from './useModulo';

export default function MemorialDescritivo() {
  const { projeto, resultado, atualizar, normas } = useModulo();

  if (!projeto || !resultado) return <SemProjetoAtivo modulo="Memorial Descritivo" />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> Memorial Descritivo
        </h1>
        <p className="text-sm text-muted-foreground">
          Documento consolidado (classificação, medidas, cálculos e riscos) do projeto{' '}
          <strong>{projeto.nome}</strong> — {normas.legislacao}.
        </p>
      </div>

      {projeto.uf === 'SP' && (
        <Alert>
          <AlertTitle>Memorial parametrizado para a Bahia</AlertTitle>
          <AlertDescription>
            O gerador de memorial usa o modelo validado do CBMBA. Para SP, revise as citações de
            legislação e IT antes de protocolar ({normas.avisoValidacao ? 'UF em validação' : ''}).
          </AlertDescription>
        </Alert>
      )}

      <MemorialPreview projeto={projeto} resultado={resultado} atualizar={atualizar} />
    </div>
  );
}
