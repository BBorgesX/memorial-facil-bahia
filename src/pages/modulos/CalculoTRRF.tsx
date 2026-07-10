/**
 * Cálculo de TRRF (Tempo Requerido de Resistência ao Fogo) — reaproveita a
 * lógica da Calculadora TRRF original (src/lib/calculos/trrf.ts), alimentada
 * pelos dados do projeto ativo.
 */

import { Timer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { referenciaMedidaUF } from '@/data/normas';
import { useModulo } from './useModulo';

export default function CalculoTRRF() {
  const { projeto, resultado, normas } = useModulo();

  if (!projeto || !resultado) return <SemProjetoAtivo modulo="Cálculo de TRRF" />;

  const trrf = resultado.trrf;
  const referencia = referenciaMedidaUF(projeto.uf, 'seguranca_estrutural');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Timer className="w-6 h-6 text-primary" /> Cálculo de TRRF
        </h1>
        <p className="text-sm text-muted-foreground">
          Tempo Requerido de Resistência ao Fogo — {referencia || 'IT de segurança estrutural da UF'} ·{' '}
          {normas.orgao}.
        </p>
      </div>

      {!resultado.ocupacao || !trrf ? (
        <Alert>
          <AlertTitle>Classifique o projeto primeiro</AlertTitle>
          <AlertDescription>
            O TRRF depende da ocupação, altura e subsolo do projeto ativo. Preencha-os no módulo
            Classificação & Enquadramento.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resultado</CardTitle>
            <CardDescription>
              Ocupação {resultado.ocupacao.divisao} · altura {projeto.alturaM} m ({trrf.faixaAltura})
              {projeto.temSubsolo ? ` · subsolo a ${projeto.profundidadeSubsoloM} m` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/40 p-4 text-center">
                <p className="text-3xl font-bold text-primary">
                  {trrf.pavimentos !== null ? `${trrf.pavimentos} min` : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">TRRF dos pavimentos</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4 text-center">
                <p className="text-3xl font-bold">
                  {trrf.subsolo !== null ? `${trrf.subsolo} min` : projeto.temSubsolo ? '—' : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">TRRF do subsolo</p>
              </div>
            </div>
            {trrf.observacao && (
              <Alert className="mt-4">
                <AlertDescription>{trrf.observacao}</AlertDescription>
              </Alert>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Resultado gerado pela tabela da lógica validada (IT 08 — BA). Alimenta automaticamente o
              memorial descritivo do projeto.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
