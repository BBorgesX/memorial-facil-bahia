/**
 * Calculadora Hidráulica (módulo novo do MVP) — vazão total, perda de carga
 * por Hazen-Williams e pressão necessária no ponto mais desfavorável.
 * Referências: NBR 10897 (sprinklers) e NBR 13714 / IT de hidrantes da UF.
 */

import { useMemo } from 'react';
import { Droplets, FileDown, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { calcularHidraulica, type StatusHidraulica } from '@/lib/calculos/hidraulica';
import type { EntradaHidraulica } from '@/lib/projeto';
import { referenciaMedidaUF } from '@/data/normas';
import { exportarPDF } from '@/services/pdf';
import { useModulo } from './useModulo';

const CORES_STATUS: Record<StatusHidraulica, string> = {
  OK: 'bg-emerald-600 hover:bg-emerald-600',
  Atenção: 'bg-amber-500 hover:bg-amber-500',
  'Fora do padrão': 'bg-red-600 hover:bg-red-600',
};

interface CampoDef {
  chave: keyof EntradaHidraulica;
  rotulo: string;
  passo?: string;
}

const CAMPOS: CampoDef[] = [
  { chave: 'areaProtegidaM2', rotulo: 'Área protegida (m²)' },
  { chave: 'densidadeMmMin', rotulo: 'Densidade (mm/min)', passo: '0.1' },
  { chave: 'numBicos', rotulo: 'Nº de bicos/sprinklers' },
  { chave: 'vazaoHidrantesLmin', rotulo: 'Vazão simultânea de hidrantes (L/min)' },
  { chave: 'comprimentoTubulacaoM', rotulo: 'Comprimento da tubulação (m)', passo: '0.1' },
  { chave: 'diametroTubulacaoMm', rotulo: 'Diâmetro da tubulação (mm)' },
  { chave: 'coeficienteC', rotulo: 'Coeficiente C (Hazen-Williams)' },
  { chave: 'desnivelM', rotulo: 'Desnível geométrico (m)', passo: '0.1' },
  { chave: 'pressaoMinimaRequeridaMca', rotulo: 'Pressão mín. no ponto mais desfavorável (mca)', passo: '0.1' },
  { chave: 'pressaoDisponivelMca', rotulo: 'Pressão disponível na fonte (mca)', passo: '0.1' },
];

export default function CalculoHidraulica() {
  const { toast } = useToast();
  const { projeto, atualizar, normas } = useModulo();

  const entrada = projeto?.hidraulica;
  const resultado = useMemo(() => (entrada ? calcularHidraulica(entrada) : null), [entrada]);

  if (!projeto || !entrada || !resultado) return <SemProjetoAtivo modulo="Calculadora Hidráulica" />;

  const refHidrantes = referenciaMedidaUF(projeto.uf, 'hidrantes');

  const setCampo = (chave: keyof EntradaHidraulica, valor: string) => {
    atualizar({ hidraulica: { ...entrada, [chave]: valor === '' ? 0 : Number(valor) } });
  };

  const exportar = () => {
    const linhas = CAMPOS.map(
      (c) => `<tr><td>${c.rotulo}</td><td>${entrada[c.chave]}</td></tr>`,
    ).join('');
    const ok = exportarPDF(
      `Memória de cálculo hidráulico — ${projeto.nome}`,
      `<h1>Memória de Cálculo Hidráulico</h1>
       <p><strong>Projeto:</strong> ${projeto.nome} · UF ${projeto.uf} (${normas.orgao})</p>
       <p><strong>Referências:</strong> NBR 10897 e NBR 13714 / ${refHidrantes || 'IT de hidrantes da UF'}</p>
       <h2>Dados de entrada</h2>
       <table><tr><th>Parâmetro</th><th>Valor</th></tr>${linhas}</table>
       <h2>Memória de cálculo</h2>
       <pre>${resultado.memoria.join('\n')}</pre>
       <h2>Resultado</h2>
       <table>
         <tr><th>Grandeza</th><th>Valor</th></tr>
         <tr><td>Vazão total simultânea</td><td>${resultado.vazaoTotalLmin.toFixed(1)} L/min (${resultado.vazaoTotalM3h.toFixed(1)} m³/h)</td></tr>
         <tr><td>Perda de carga total</td><td>${resultado.perdaCargaTotalMca.toFixed(2)} mca</td></tr>
         <tr><td>Pressão necessária</td><td>${resultado.pressaoNecessariaMca.toFixed(2)} mca</td></tr>
         <tr><td>Status</td><td>${resultado.status}</td></tr>
       </table>
       <p>${resultado.observacoes.join('<br/>')}</p>`,
    );
    if (!ok) toast({ title: 'Habilite pop-ups para exportar o PDF.', variant: 'destructive' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Droplets className="w-6 h-6 text-primary" /> Calculadora Hidráulica
        </h1>
        <p className="text-sm text-muted-foreground">
          Vazão, perda de carga (Hazen-Williams) e pressão necessária — NBR 10897 · NBR 13714 ·{' '}
          {refHidrantes || 'IT de hidrantes da UF'} ({normas.orgao}).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados de entrada</CardTitle>
            <CardDescription>
              Valores salvos no projeto ativo ({projeto.nome}). Cálculo em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {CAMPOS.map((c) => (
              <div key={c.chave} className="space-y-1.5">
                <Label htmlFor={`hid-${c.chave}`} className="text-xs leading-tight">
                  {c.rotulo}
                </Label>
                <Input
                  id={`hid-${c.chave}`}
                  type="number"
                  min={0}
                  step={c.passo ?? '1'}
                  value={entrada[c.chave] || ''}
                  onChange={(e) => setCampo(c.chave, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between gap-2">
              Resultado
              <Badge className={CORES_STATUS[resultado.status]}>{resultado.status}</Badge>
            </CardTitle>
            <CardDescription>Verificação do ponto mais desfavorável</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/40 p-3 text-center">
                <p className="text-2xl font-bold text-primary">
                  {resultado.vazaoTotalLmin.toFixed(0)} L/min
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vazão total ({resultado.vazaoTotalM3h.toFixed(1)} m³/h)
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 text-center">
                <p className="text-2xl font-bold">{resultado.perdaCargaTotalMca.toFixed(2)} mca</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Perda de carga ({resultado.perdaCargaUnitariaMcaM.toFixed(4)} mca/m)
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 text-center">
                <p className="text-2xl font-bold">{resultado.pressaoNecessariaMca.toFixed(2)} mca</p>
                <p className="text-xs text-muted-foreground mt-1">Pressão necessária</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 text-center">
                <p className="text-2xl font-bold">{resultado.velocidadeMs.toFixed(2)} m/s</p>
                <p className="text-xs text-muted-foreground mt-1">Velocidade do escoamento</p>
              </div>
            </div>

            {resultado.vazaoPorBicoLmin !== null && (
              <p className="text-sm text-muted-foreground">
                Vazão média por bico: {resultado.vazaoPorBicoLmin.toFixed(1)} L/min ({entrada.numBicos}{' '}
                bicos).
              </p>
            )}

            <ul className="space-y-1 text-sm">
              {resultado.observacoes.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground">•</span> {o}
                </li>
              ))}
            </ul>

            <details className="rounded-md border bg-muted/30 p-3 text-xs">
              <summary className="cursor-pointer font-medium">Memória de cálculo</summary>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {resultado.memoria.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </details>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  atualizar({ hidraulica: entrada });
                  toast({
                    title: 'Cálculo anexado ao projeto',
                    description: 'Os dados hidráulicos ficam disponíveis para o memorial.',
                  });
                }}
              >
                <Save className="w-4 h-4 mr-1" /> Anexar ao projeto/memorial
              </Button>
              <Button size="sm" variant="outline" onClick={exportar}>
                <FileDown className="w-4 h-4 mr-1" /> Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
