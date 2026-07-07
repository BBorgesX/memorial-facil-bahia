import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  Clock,
  DoorOpen,
  Droplets,
  FileDown,
  Flame,
  Lightbulb,
  Printer,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DadosProjeto } from '@/lib/projeto';
import { ResultadoTecnico } from '@/lib/engine';
import { exportarCalculosPDF, exportarCalculosWord } from '@/lib/relatorioCalculos';

interface Props {
  projeto: DadosProjeto;
  resultado: ResultadoTecnico;
}

const fmt = (n: number | null | undefined, casas = 0) =>
  n === null || n === undefined ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

export const PainelResultados = ({ projeto, resultado: r }: Props) => {
  const { toast } = useToast();
  if (!r.ocupacao || !r.altura || !r.carga) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Dados insuficientes</AlertTitle>
        <AlertDescription>
          Preencha a classificação de ocupação, as áreas e a carga de incêndio na aba 1 para ver os cálculos em tempo real.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exportação separada dos cálculos */}
      <Card>
        <CardContent className="pt-4 pb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48">
            <p className="font-medium text-sm">Relatório de Cálculos</p>
            <p className="text-xs text-muted-foreground">
              Exporte os dados desta aba separadamente, como memória de cálculo resumida do projeto.
            </p>
          </div>
          <Button
            onClick={() => {
              if (!exportarCalculosPDF(projeto, r)) {
                toast({
                  title: 'Bloqueio de pop-up',
                  description: 'Permita pop-ups para gerar o PDF (impressão).',
                  variant: 'destructive',
                });
              }
            }}
          >
            <Printer className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              exportarCalculosWord(projeto, r);
              toast({ title: 'Relatório exportado', description: 'Documento Word (.doc) gerado.' });
            }}
          >
            <FileDown className="w-4 h-4 mr-2" /> Exportar Word
          </Button>
        </CardContent>
      </Card>

      {r.avisos.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Avisos técnicos</AlertTitle>
          <AlertDescription>
            <ul className="list-disc ml-4 mt-1 space-y-1">
              {r.avisos.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Resumo da classificação */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Classificação (Decreto nº 16.302/2015)</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Ocupação (Tabela 1)</p>
            <p className="font-semibold">{r.ocupacao.divisao} — {r.ocupacao.descricao}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Altura (Tabela 2)</p>
            <p className="font-semibold">Tipo {r.altura.tipo} — {r.altura.denominacao}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Carga de incêndio (Tabela 3)</p>
            <p className="font-semibold">{r.carga.nivel} ({fmt(projeto.cargaIncendioMJm2)} MJ/m²)</p>
          </div>
          <div>
            <p className="text-muted-foreground">Área total</p>
            <p className="font-semibold">{fmt(r.areaTotal, 2)} m²</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* TRRF */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Segurança Estrutural — TRRF (IT 08)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-1">
              <span>TRRF dos pavimentos</span>
              <strong>{r.trrf?.pavimentos ? `${r.trrf.pavimentos} min` : 'Consultar CBMBA'}</strong>
            </div>
            {projeto.temSubsolo && (
              <div className="flex justify-between border-b pb-1">
                <span>TRRF do subsolo</span>
                <strong>{r.trrf?.subsolo ? `${r.trrf.subsolo} min` : '—'}</strong>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Faixa de altura: {r.trrf?.faixaAltura}</p>
          </CardContent>
        </Card>

      </div>

      {/* Memorial de cálculo — Saídas de Emergência (IT 11, Anexo A) */}
      {r.saidas && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-primary" /> Dimensionamento de Saídas de Emergência
            </CardTitle>
            <CardDescription>Memorial de Cálculo Técnico — IT 11/2016 (Anexo A)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            {/* 1. Dados normativos */}
            <div>
              <p className="font-semibold mb-2">1. Dados Normativos da Ocupação</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
                <div className="p-2 bg-muted rounded"><span className="text-muted-foreground block text-xs">Divisão</span><strong>{r.saidas.divisao}</strong></div>
                <div className="p-2 bg-muted rounded lg:col-span-2"><span className="text-muted-foreground block text-xs">Descrição</span><strong>{r.saidas.descricaoOcupacao}</strong></div>
                <div className="p-2 bg-muted rounded"><span className="text-muted-foreground block text-xs">Cap. AD / ER / Portas</span><strong>{r.saidas.capacidadeUP.acessos} / {r.saidas.capacidadeUP.escadas} / {r.saidas.capacidadeUP.portas}</strong></div>
                <div className="p-2 bg-muted rounded"><span className="text-muted-foreground block text-xs">Coeficiente</span><strong className="text-xs">{r.saidas.coeficiente}</strong></div>
              </div>
            </div>

            {/* 2. População por pavimento */}
            <div>
              <p className="font-semibold mb-2">2. Cálculo de População por Pavimento (P)</p>
              <div className="space-y-1">
                {r.saidas.pavimentos.map((pav, i) => (
                  <div key={i} className="flex flex-wrap justify-between gap-2 border-b pb-1">
                    <span className="font-medium">{pav.nome}</span>
                    <span className="text-muted-foreground">{pav.memoria}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 p-2 bg-accent/10 border border-accent rounded flex flex-wrap justify-between gap-2">
                <span className="font-medium">População Crítica (Máxima)</span>
                <strong>{fmt(r.saidas.populacaoCritica)} pessoas ({r.saidas.pavimentoCritico})</strong>
              </div>
              <div className="flex justify-between mt-1 px-2">
                <span className="text-muted-foreground">População total da edificação</span>
                <strong>{fmt(r.saidas.populacaoTotal)} pessoas</strong>
              </div>
            </div>

            {/* 3. Dimensionamento */}
            <div>
              <p className="font-semibold mb-2">3. Dimensionamento das Saídas (W = N × 0,55)</p>
              <p className="text-muted-foreground text-xs mb-1">Acessos (dimensionados por pavimento):</p>
              <div className="space-y-1 mb-3">
                {r.saidas.pavimentos.map((pav, i) => (
                  <div key={i} className="flex flex-wrap justify-between gap-2 border-b pb-1">
                    <span className="font-medium">{pav.nome}</span>
                    <span className="text-muted-foreground">{pav.acessos.memoria}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-xs mb-1">Escadas, rampas, descargas e portas (dimensionados pela população crítica = {fmt(r.saidas.populacaoCritica)}):</p>
              <div className="space-y-1">
                <div className="flex flex-wrap justify-between gap-2 border-b pb-1"><span className="font-medium">E (Escadas)</span><span className="text-muted-foreground">{r.saidas.dimensionamento.escadas.memoria}</span></div>
                <div className="flex flex-wrap justify-between gap-2 border-b pb-1"><span className="font-medium">R (Rampas)</span><span className="text-muted-foreground">{r.saidas.dimensionamento.rampas.memoria}</span></div>
                <div className="flex flex-wrap justify-between gap-2 border-b pb-1"><span className="font-medium">D (Descargas)</span><span className="text-muted-foreground">{r.saidas.dimensionamento.descargas.memoria}</span></div>
                <div className="flex flex-wrap justify-between gap-2"><span className="font-medium">P (Portas)</span><span className="text-muted-foreground">{r.saidas.dimensionamento.portas.memoria}</span></div>
              </div>
            </div>

            {/* 4. Tipo de escada */}
            <div>
              <p className="font-semibold mb-2">4. Tipo de Escada (Anexo C, Tabela 3)</p>
              <div className="grid sm:grid-cols-3 gap-2">
                <div className="p-2 bg-muted rounded"><span className="text-muted-foreground block text-xs">Altura da edificação</span><strong>{fmt(projeto.alturaM, 2)} m</strong></div>
                <div className="p-2 bg-muted rounded"><span className="text-muted-foreground block text-xs">Classificação</span><strong>{r.saidas.tipoEscada.sigla}</strong></div>
                <div className="p-2 bg-muted rounded"><span className="text-muted-foreground block text-xs">Descrição</span><strong>{r.saidas.tipoEscada.descricao}</strong></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Base: {r.saidas.tipoEscada.base}</p>
            </div>

            {/* 5. Veredito */}
            <div>
              <p className="font-semibold mb-2">5. Veredito de Conformidade</p>
              <div className="space-y-2">
                <div className="p-2 border rounded">
                  <p className="font-medium">Tipo de escada exigido</p>
                  <p className="text-muted-foreground">Classificação: {r.saidas.tipoEscada.sigla} | {r.saidas.tipoEscada.descricao} (baseado na altura: {fmt(projeto.alturaM, 2)} m)</p>
                </div>
                <div className={`p-2 border rounded ${r.saidas.conformidade.distanciaTerreo.conforme === false ? 'border-destructive bg-destructive/10' : r.saidas.conformidade.distanciaTerreo.conforme ? 'border-green-500 bg-green-500/10' : ''}`}>
                  <p className="font-medium">De saída da edificação (piso de descarga)
                    {r.saidas.conformidade.distanciaTerreo.conforme === true && <Badge className="ml-2 bg-green-600">Conforme</Badge>}
                    {r.saidas.conformidade.distanciaTerreo.conforme === false && <Badge variant="destructive" className="ml-2">Não conforme</Badge>}
                  </p>
                  <p className="text-muted-foreground">
                    Real: {r.saidas.conformidade.distanciaTerreo.realM > 0 ? `${fmt(r.saidas.conformidade.distanciaTerreo.realM, 1)} m` : 'não informado'} | Permitido: {r.saidas.conformidade.distanciaTerreo.permitidoM ? `${r.saidas.conformidade.distanciaTerreo.permitidoM} m` : 'consultar CBMBA'}
                  </p>
                </div>
                <div className={`p-2 border rounded ${r.saidas.conformidade.distanciaDemais.conforme === false ? 'border-destructive bg-destructive/10' : r.saidas.conformidade.distanciaDemais.conforme ? 'border-green-500 bg-green-500/10' : ''}`}>
                  <p className="font-medium">Demais andares
                    {r.saidas.conformidade.distanciaDemais.conforme === true && <Badge className="ml-2 bg-green-600">Conforme</Badge>}
                    {r.saidas.conformidade.distanciaDemais.conforme === false && <Badge variant="destructive" className="ml-2">Não conforme</Badge>}
                  </p>
                  <p className="text-muted-foreground">
                    Real: {r.saidas.conformidade.distanciaDemais.realM > 0 ? `${fmt(r.saidas.conformidade.distanciaDemais.realM, 1)} m` : 'não informado'} | Permitido: {r.saidas.conformidade.distanciaDemais.permitidoM ? `${r.saidas.conformidade.distanciaDemais.permitidoM} m` : 'consultar CBMBA'}
                  </p>
                </div>
                <div className={`p-2 border rounded ${!r.saidas.conformidade.saidas.conforme ? 'border-destructive bg-destructive/10' : 'border-green-500 bg-green-500/10'}`}>
                  <p className="font-medium">Quantitativo de saídas
                    {r.saidas.conformidade.saidas.conforme
                      ? <Badge className="ml-2 bg-green-600">Conforme</Badge>
                      : <Badge variant="destructive" className="ml-2">Não conforme</Badge>}
                  </p>
                  <p className="text-muted-foreground">
                    Existente: {r.saidas.conformidade.saidas.existente} | Mínimo: {r.saidas.conformidade.saidas.minimo} saída(s) ({r.saidas.conformidade.saidas.criterio})
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{r.saidas.distanciaMaxima.consideracoes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        {/* Hidrantes */}
        {r.hidrantes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" /> Hidrantes e RTI (IT 22)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span>Tipo de sistema</span>
                <strong>Tipo {r.hidrantes.sistemaTipo}</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Vazão mínima (hidrante + desfavorável)</span>
                <strong>{fmt(r.hidrantes.vazaoMinimaLmin)} L/min</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Pressão dinâmica mínima</span>
                <strong>{fmt(r.hidrantes.pressaoMinimaMca)} m.c.a.</strong>
              </div>
              <div className="flex justify-between">
                <span>Reserva Técnica de Incêndio</span>
                <strong>{fmt(r.hidrantes.rtiM3)} m³</strong>
              </div>
              <p className="text-xs text-muted-foreground">{r.hidrantes.descricaoSistema}</p>
            </CardContent>
          </Card>
        )}

        {/* Extintores */}
        {r.extintores && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" /> Extintores (IT 21)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span>Capacidade extintora mínima</span>
                <strong>{r.extintores.capacidadeMinima}</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Distância máxima a percorrer</span>
                <strong>{fmt(r.extintores.distanciaMaximaM)} m</strong>
              </div>
              <div className="flex justify-between">
                <span>Quantidade estimada</span>
                <strong>{fmt(r.extintores.quantidadeEstimada)} unidades</strong>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brigada */}
        {r.brigada && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Brigada de Incêndio (IT 17)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span>Brigadistas (mínimo)</span>
                <strong>{fmt(r.brigada.quantidadeMinima)}</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Nível de treinamento</span>
                <strong>{r.brigada.nivelTreinamento}</strong>
              </div>
              <div className="flex justify-between">
                <span>Carga horária</span>
                <strong>{r.brigada.cargaHoraria}</strong>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Iluminação */}
        {r.iluminacao && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" /> Iluminação de Emergência (IT 18)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span>Autonomia mínima</span>
                <strong>{r.iluminacao.autonomiaHoras} h</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Iluminância mínima</span>
                <strong>{r.iluminacao.iluminanciaMinimaLux} lux</strong>
              </div>
              <div className="flex justify-between">
                <span>Pontos estimados</span>
                <strong>{fmt(r.iluminacao.pontosEstimados)}</strong>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Medidas exigidas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Medidas de segurança aplicáveis ao memorial</CardTitle>
          <CardDescription>Determinadas pelas Tabelas 5/6 do Decreto (com seus ajustes manuais)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {r.medidasExigidas.map((m) => (
            <Badge key={m.id} variant="secondary">{m.id.replace(/_/g, ' ')}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
