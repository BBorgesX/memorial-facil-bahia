/**
 * Cálculo Hidráulico de Hidrantes — IT 22/2016 (CBMBA) + Hazen-Williams.
 * Segue o método da planilha de referência do usuário (passos 5 a 17):
 * hidrante mais desfavorável → perdas → pressão no ponto A → fator K →
 * vazão da coluna → altura manométrica → verificações → RTI/bomba.
 */

import { useMemo } from 'react';
import { CheckCircle2, Droplets, FileDown, Info, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import {
  calcularHidraulicaHidrantes,
  CONEXOES_COLUNA,
  MATERIAIS_TUBULACAO,
  TABELA_2_IT22,
  type StatusHidraulica,
} from '@/lib/calculos/hidraulica';
import type { EntradaHidraulica } from '@/lib/projeto';
import { referenciaMedidaUF } from '@/data/normas';
import { exportarPDF } from '@/services/pdf';
import { useModulo } from './useModulo';

const CORES_STATUS: Record<StatusHidraulica, string> = {
  OK: 'bg-emerald-600 hover:bg-emerald-600',
  Atenção: 'bg-amber-500 hover:bg-amber-500',
  'Fora do padrão': 'bg-red-600 hover:bg-red-600',
};

function fmt(n: number, casas = 2) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

export default function CalculoHidraulica() {
  const { toast } = useToast();
  const { projeto, resultado: resultadoProjeto, atualizar, normas } = useModulo();

  const entrada = projeto?.hidraulica;
  const hidrantesProjeto = resultadoProjeto?.hidrantes;

  const resultado = useMemo(() => {
    if (!entrada) return null;
    return calcularHidraulicaHidrantes(entrada, {
      tipoSistema: hidrantesProjeto?.sistemaTipo ?? 0,
      pressaoResidualMca: hidrantesProjeto?.pressaoMinimaMca ?? 0,
      rtiM3: hidrantesProjeto?.rtiM3 ?? 0,
    });
  }, [entrada, hidrantesProjeto]);

  if (!projeto || !entrada || !resultado) return <SemProjetoAtivo modulo="Cálculo Hidráulico de Hidrantes" />;

  const refHidrantes = referenciaMedidaUF(projeto.uf, 'hidrantes');
  const num = (v: string) => (v === '' ? 0 : Number(v.replace(',', '.')));

  const setCampo = <K extends keyof EntradaHidraulica>(chave: K, valor: EntradaHidraulica[K]) =>
    atualizar({ hidraulica: { ...entrada, [chave]: valor } });

  const setConexao = (id: keyof EntradaHidraulica['conexoesColuna'], valor: number) =>
    atualizar({
      hidraulica: { ...entrada, conexoesColuna: { ...entrada.conexoesColuna, [id]: valor } },
    });

  const exportar = () => {
    const linhasVerif = resultado.verificacoes
      .map(
        (v) =>
          `<tr><td>${v.ok === true ? 'Atende' : v.ok === false ? 'NÃO atende' : 'Verificar'}</td><td>${v.item}</td><td>${v.referencia}</td><td>${v.detalhe}</td></tr>`,
      )
      .join('');
    const ok = exportarPDF(
      `Cálculo hidráulico de hidrantes — ${projeto.nome}`,
      `<h1>Memória de Cálculo — Sistema de Hidrantes (${refHidrantes || 'IT 22/2016'})</h1>
       <p><strong>Projeto:</strong> ${projeto.nome} · UF ${projeto.uf} (${normas.orgao}) · ${normas.legislacao}</p>
       <h2>Quadro resumo</h2>
       <table>
         <tr><th>Grandeza</th><th>Valor</th></tr>
         <tr><td>Sistema (Tabela 2, IT 22)</td><td>Tipo ${resultado.tipoAdotado} — ${resultado.sistema} · ${resultado.vazaoPorPontoLmin} L/min por ponto · ${resultado.pontosSimultaneos} ponto(s) simultâneo(s)</td></tr>
         <tr><td>Pressão residual mínima</td><td>${fmt(resultado.pressaoResidualMca)} mca</td></tr>
         <tr><td>Pressão no ponto A (terminal)</td><td>${fmt(resultado.pressaoPontoAMca)} mca</td></tr>
         <tr><td>Fator de vazão K</td><td>${fmt(resultado.fatorK)} L/min·mca⁻¹ᐟ²</td></tr>
         <tr><td>Vazão de cálculo na coluna</td><td>${fmt(resultado.vazaoColunaLmin, 0)} L/min (${fmt(resultado.vazaoColunaM3h, 1)} m³/h)</td></tr>
         <tr><td>Altura manométrica total (bomba)</td><td>${fmt(resultado.alturaManometricaMca)} mca</td></tr>
         <tr><td>Velocidades (sub-ramal / coluna)</td><td>${fmt(resultado.velocidadeSubRamalMs)} / ${fmt(resultado.velocidadeColunaMs)} m/s</td></tr>
         ${resultado.rtiM3 !== null ? `<tr><td>RTI (Tabela 3, IT 22)</td><td>${resultado.rtiM3} m³ — tempo de operação ${fmt(resultado.tempoOperacaoMin ?? 0, 0)} min</td></tr>` : ''}
         <tr><td>Bomba jockey (referência C.1.15)</td><td>vazão ≤ ${resultado.jockey.vazaoMaxLmin} L/min · pressão ≈ ${fmt(resultado.jockey.pressaoMca)} mca</td></tr>
         <tr><td>Status</td><td>${resultado.status}</td></tr>
       </table>
       <h2>Verificações (IT 22/2016)</h2>
       <table><tr><th>Situação</th><th>Item</th><th>Referência</th><th>Detalhe</th></tr>${linhasVerif}</table>
       <h2>Memória de cálculo</h2>
       <pre>${resultado.memoria.join('\n')}</pre>`,
    );
    if (!ok) toast({ title: 'Habilite pop-ups para exportar o PDF.', variant: 'destructive' });
  };

  const tab2 = TABELA_2_IT22[resultado.tipoAdotado];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Droplets className="w-6 h-6 text-primary" /> Cálculo Hidráulico de Hidrantes
        </h1>
        <p className="text-sm text-muted-foreground">
          {refHidrantes || 'IT 22/2016'} ({normas.orgao}) · perda de carga por Hazen-Williams (item
          5.8.7-b) · método da planilha de memorial de cálculo (Anexo F).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Sistema — Tabela 2 da IT 22 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. Sistema (Tabela 2 — IT 22)</CardTitle>
              <CardDescription>
                {hidrantesProjeto
                  ? `Classificação do projeto define o Tipo ${hidrantesProjeto.sistemaTipo} (${hidrantesProjeto.origemTipo}).`
                  : 'Sem classificação no projeto ativo — selecione o tipo manualmente.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de sistema</Label>
                <Select
                  value={String(entrada.tipoSistema)}
                  onValueChange={(v) => setCampo('tipoSistema', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">
                      Automático{hidrantesProjeto ? ` (Tipo ${hidrantesProjeto.sistemaTipo})` : ''}
                    </SelectItem>
                    {Object.entries(TABELA_2_IT22).map(([t, s]) => (
                      <SelectItem key={t} value={t}>
                        Tipo {t} — {s.sistema} ({s.vazaoPorPontoLmin} L/min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Vazão por ponto (L/min)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder={`${tab2.vazaoPorPontoLmin} (Tabela 2)`}
                  value={entrada.vazaoPorPontoLmin || ''}
                  onChange={(e) => setCampo('vazaoPorPontoLmin', num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Hidrantes simultâneos</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder={`${tab2.pontosSimultaneos} (Tabela 2)`}
                  value={entrada.hidrantesSimultaneos || ''}
                  onChange={(e) => setCampo('hidrantesSimultaneos', num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pressão residual mínima (mca)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder={
                    hidrantesProjeto ? `${hidrantesProjeto.pressaoMinimaMca} (do tipo)` : 'informar'
                  }
                  value={entrada.pressaoResidualMca || ''}
                  onChange={(e) => setCampo('pressaoResidualMca', num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Material da tubulação (Tabela 1 — fator C)</Label>
                <Select value={entrada.material} onValueChange={(v) => setCampo('material', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAIS_TUBULACAO.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome}
                        {m.c > 0 ? ` — C=${m.c}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {entrada.material === 'outro' ? (
                <div className="space-y-1.5">
                  <Label>Fator C</Label>
                  <Input
                    type="number"
                    min={0}
                    value={entrada.coeficienteC || ''}
                    onChange={(e) => setCampo('coeficienteC', num(e.target.value))}
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Diâmetro interno (mm)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={entrada.diametroInternoMm || ''}
                    onChange={(e) => setCampo('diametroInternoMm', num(e.target.value))}
                  />
                </div>
              )}
              {entrada.material === 'outro' && (
                <div className="space-y-1.5">
                  <Label>Diâmetro interno (mm)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={entrada.diametroInternoMm || ''}
                    onChange={(e) => setCampo('diametroInternoMm', num(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sub-ramal do hidrante mais desfavorável */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2. Hidrante mais desfavorável (sub-ramal)</CardTitle>
              <CardDescription>
                Trecho do ponto de junção até o hidrante de menor pressão dinâmica (IT 22, 5.8.4).
                Mangueira máxima do tipo: {tab2.mangueiraMaxM} m.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Comprimento da canalização (reto + equivalentes) (m)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={entrada.comprimentoSubRamalM || ''}
                  onChange={(e) => setCampo('comprimentoSubRamalM', num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Perda na válvula angular (mca)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={entrada.perdaValvulaAngularMca || ''}
                  onChange={(e) => setCampo('perdaValvulaAngularMca', num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Perda na mangueira (mca)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={entrada.perdaMangueiraMca || ''}
                  onChange={(e) => setCampo('perdaMangueiraMca', num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Perda no esguicho (mca)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={entrada.perdaEsguichoMca || ''}
                  onChange={(e) => setCampo('perdaEsguichoMca', num(e.target.value))}
                />
              </div>
              {resultado.pontosSimultaneos >= 2 && (
                <div className="space-y-1.5">
                  <Label>Desnível entre os 2 hidrantes (m)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={entrada.desnivelEntreHidrantesM || ''}
                    onChange={(e) => setCampo('desnivelEntreHidrantesM', num(e.target.value))}
                  />
                </div>
              )}
              <p className="col-span-2 text-xs text-muted-foreground flex gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Perdas localizadas pré-preenchidas com os valores da planilha de referência — ajuste
                conforme os dados do fabricante dos equipamentos.
              </p>
            </CardContent>
          </Card>

          {/* Coluna / recalque */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">3. Coluna de incêndio / recalque</CardTitle>
              <CardDescription>
                Da bomba (ou reservatório) até o ponto de junção — comprimentos equivalentes das
                conexões conforme a planilha de referência.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Comprimento reto (m)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={entrada.comprimentoColunaM || ''}
                    onChange={(e) => setCampo('comprimentoColunaM', num(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Desnível geométrico (m)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={entrada.desnivelGeometricoM || ''}
                    onChange={(e) => setCampo('desnivelGeometricoM', num(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CONEXOES_COLUNA.map((c) => (
                  <div key={c.id} className="space-y-1.5">
                    <Label className="text-xs leading-tight">
                      {c.nome}
                      <span className="block text-muted-foreground">({c.equivalenteM} m equiv.)</span>
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={entrada.conexoesColuna[c.id] || ''}
                      onChange={(e) => setConexao(c.id, num(e.target.value))}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 max-w-xs">
                <Label>Pressão disponível existente (mca) — opcional</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="p/ verificar bomba/reservatório existente"
                  value={entrada.pressaoDisponivelMca || ''}
                  onChange={(e) => setCampo('pressaoDisponivelMca', num(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between gap-2">
                Resultados
                <Badge className={CORES_STATUS[resultado.status]}>{resultado.status}</Badge>
              </CardTitle>
              <CardDescription>
                Sistema Tipo {resultado.tipoAdotado} — {resultado.sistema} · C = {resultado.coeficienteC} ·{' '}
                {resultado.pontosSimultaneos} jato(s) simultâneo(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/40 p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{fmt(resultado.alturaManometricaMca)} mca</p>
                  <p className="text-xs text-muted-foreground mt-1">Altura manométrica total (bomba)</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {fmt(resultado.vazaoColunaLmin, 0)} L/min
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vazão de cálculo ({fmt(resultado.vazaoColunaM3h, 1)} m³/h)
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3 text-center">
                  <p className="text-2xl font-bold">{fmt(resultado.pressaoPontoAMca)} mca</p>
                  <p className="text-xs text-muted-foreground mt-1">Pressão no ponto A (terminal)</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3 text-center">
                  <p className="text-2xl font-bold">{fmt(resultado.fatorK)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Fator K (L/min·mca⁻¹ᐟ²)</p>
                </div>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Perdas sub-ramal:</span>{' '}
                  {fmt(resultado.perdaSubRamalTotalMca)} mca
                </p>
                <p>
                  <span className="text-muted-foreground">Perdas coluna:</span> {fmt(resultado.perdaColunaMca)}{' '}
                  mca ({fmt(resultado.comprimentoColunaTotalM, 1)} m totais)
                </p>
                {resultado.vazaoSegundoJatoLmin !== null && (
                  <p>
                    <span className="text-muted-foreground">2º jato (K·√PB):</span>{' '}
                    {fmt(resultado.vazaoSegundoJatoLmin, 0)} L/min
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Velocidades:</span>{' '}
                  {fmt(resultado.velocidadeSubRamalMs)} / {fmt(resultado.velocidadeColunaMs)} m/s
                </p>
                {resultado.rtiM3 !== null && resultado.tempoOperacaoMin !== null && (
                  <p>
                    <span className="text-muted-foreground">RTI (Tabela 3):</span> {resultado.rtiM3} m³ ·{' '}
                    {fmt(resultado.tempoOperacaoMin, 0)} min de operação
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Jockey (C.1.15):</span> ≤{' '}
                  {resultado.jockey.vazaoMaxLmin} L/min · ≈ {fmt(resultado.jockey.pressaoMca)} mca
                </p>
                {resultado.folgaMca !== null && (
                  <p className="col-span-2">
                    <span className="text-muted-foreground">Folga da pressão disponível:</span>{' '}
                    {fmt(resultado.folgaMca)} mca
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportar}>
                  <FileDown className="w-4 h-4 mr-1" /> Exportar memória de cálculo (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Verificações — IT 22/2016</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {resultado.verificacoes.map((v, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md border p-2.5 text-sm">
                  {v.ok === true ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : v.ok === false ? (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <span className="flex-1">
                    <span className="font-medium">{v.item}</span>
                    <span className="block text-xs text-muted-foreground">{v.detalhe}</span>
                  </span>
                  <Badge variant="outline" className="shrink-0 text-[11px]">
                    {v.referencia}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Memória de cálculo</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-muted-foreground">
                {resultado.memoria.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
