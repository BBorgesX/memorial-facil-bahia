/**
 * Memorial de Brigada de Incêndio (IT 25) — reaproveita 100% o app original
 * "MEMORIAL DE BRIGADA IT25", embarcado dentro da casca. A lógica e os
 * valores normativos do app validado são preservados sem alteração.
 */

import { Flame, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { useModulo } from './useModulo';

const URL_APP = '/modulos/memorial-brigada.html';

export default function MemorialBrigada() {
  const { projeto, resultado, normas } = useModulo();

  if (!projeto || !resultado) return <SemProjetoAtivo modulo="Memorial de Brigada (IT 25)" />;

  const brigada = resultado.brigada;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" /> Memorial de Brigada de Incêndio
          </h1>
          <p className="text-sm text-muted-foreground">
            App original preservado (lógica validada) · {normas.orgao}.
            {brigada
              ? ` Referência do projeto ativo: ${brigada.quantidadeMinima} brigadista(s), nível ${brigada.nivelTreinamento}.`
              : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={URL_APP} target="_blank" rel="noreferrer">
            Abrir em tela cheia <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <iframe
            src={URL_APP}
            title="Memorial de Brigada de Incêndio (IT 25)"
            className="w-full rounded-md border-0"
            style={{ height: 'calc(100vh - 220px)', minHeight: 560 }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
