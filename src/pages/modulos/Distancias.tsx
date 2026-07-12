/**
 * Distâncias Máximas / Rotas de Fuga — reaproveita a "Consulta de distâncias
 * máximas permitidas" (src/lib/calculos/saidas.ts), parametrizada pela
 * ocupação classificada do projeto ativo.
 */

import { Ruler } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { referenciaMedidaUF } from '@/data/normas';
import { useModulo } from './useModulo';

function Conformidade({ conforme }: { conforme: boolean | null }) {
  if (conforme === null) return <Badge variant="secondary">Informar</Badge>;
  return conforme ? (
    <Badge className="bg-emerald-600 hover:bg-emerald-600">Conforme</Badge>
  ) : (
    <Badge variant="destructive">Não conforme</Badge>
  );
}

export default function Distancias() {
  const { projeto, resultado, atualizar, normas } = useModulo();

  if (!projeto || !resultado) return <SemProjetoAtivo modulo="Distâncias Máximas / Rotas de Fuga" />;

  const s = resultado.saidas;
  const referencia = referenciaMedidaUF(projeto.uf, 'saidas_emergencia');
  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ruler className="w-6 h-6 text-primary" /> Distâncias Máximas / Rotas de Fuga
        </h1>
        <p className="text-sm text-muted-foreground">
          Distâncias máximas a percorrer e dimensionamento das saídas — {referencia || 'IT de saídas da UF'} ·{' '}
          {normas.orgao}.
        </p>
      </div>

      {!resultado.ocupacao || !s ? (
        <Alert>
          <AlertTitle>Classifique o projeto primeiro</AlertTitle>
          <AlertDescription>
            A consulta de distâncias é parametrizada pela ocupação classificada. Preencha o módulo
            Classificação & Enquadramento.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Distâncias máximas permitidas</CardTitle>
                <CardDescription>
                  Ocupação {s.divisao} · sprinklers {projeto.medidas['chuveiros_automaticos']?.aplicavel ? 'sim' : 'conforme matriz'} ·
                  detecção conforme matriz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/40 p-4 text-center">
                    <p className="text-3xl font-bold text-primary">
                      {s.distanciaMaxima.pisoDescargaM !== null ? `${s.distanciaMaxima.pisoDescargaM} m` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Piso de descarga (térreo)</p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4 text-center">
                    <p className="text-3xl font-bold text-primary">
                      {s.distanciaMaxima.demaisPavimentosM !== null ? `${s.distanciaMaxima.demaisPavimentosM} m` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Demais pavimentos</p>
                  </div>
                </div>
                {s.distanciaMaxima.consideracoes && (
                  <p className="text-xs text-muted-foreground">{s.distanciaMaxima.consideracoes}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Verificação do projeto (real × permitido)</CardTitle>
                <CardDescription>Informe as distâncias reais medidas em planta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="dist-terreo">Distância real no piso de descarga (m)</Label>
                    <Input
                      id="dist-terreo"
                      type="number"
                      min={0}
                      step="0.1"
                      value={projeto.distanciaRealTerreoM || ''}
                      onChange={(e) => atualizar({ distanciaRealTerreoM: num(e.target.value) })}
                    />
                  </div>
                  <Conformidade conforme={s.conformidade.distanciaTerreo.conforme} />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="dist-demais">Distância real nos demais pavimentos (m)</Label>
                    <Input
                      id="dist-demais"
                      type="number"
                      min={0}
                      step="0.1"
                      value={projeto.distanciaRealDemaisM || ''}
                      onChange={(e) => atualizar({ distanciaRealDemaisM: num(e.target.value) })}
                    />
                  </div>
                  <Conformidade conforme={s.conformidade.distanciaDemais.conforme} />
                </div>
                <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Nº mínimo de saídas:</span>{' '}
                    <strong>{s.numeroMinimoSaidas}</strong> — {s.conformidade.saidas.criterio}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Tipo de escada:</span>{' '}
                    <strong>{s.tipoEscada.sigla}</strong> — {s.tipoEscada.descricao} ({s.tipoEscada.base})
                    {s.tipoEscada.preliminar && (
                      <Badge variant="outline" className="ml-2 text-[11px] bg-amber-50 text-amber-800 border-amber-200">
                        Preliminar — validar Tabela 3 (Anexo C) da IT 11
                      </Badge>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dimensionamento por população (IT 11)</CardTitle>
              <CardDescription>
                População adotada: {s.populacaoAdotada} pessoas ({s.coeficiente}) · pavimento crítico:{' '}
                {s.pavimentoCritico} ({s.populacaoCritica} pessoas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Elemento</TableHead>
                      <TableHead>Unidades de passagem</TableHead>
                      <TableHead>Largura mínima</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(
                      [
                        ['Escadas', s.dimensionamento.escadas],
                        ['Rampas', s.dimensionamento.rampas],
                        ['Descargas', s.dimensionamento.descargas],
                        ['Portas', s.dimensionamento.portas],
                      ] as const
                    ).map(([nome, d]) => (
                      <TableRow key={nome}>
                        <TableCell className="font-medium">{nome}</TableCell>
                        <TableCell>{d.unidades} UP</TableCell>
                        <TableCell>{d.larguraM.toFixed(2).replace('.', ',')} m</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
