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

        {/* Saídas */}
        {r.saidas && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-primary" /> Saídas de Emergência (IT 11)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> População adotada</span>
                <strong>{fmt(r.saidas.populacaoAdotada)} pessoas</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Acessos</span>
                <strong>{r.saidas.unidadesPassagem.acessos} UP · {fmt(r.saidas.larguraMinima.acessosM, 2)} m</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Escadas/rampas</span>
                <strong>{r.saidas.unidadesPassagem.escadas} UP · {fmt(r.saidas.larguraMinima.escadasM, 2)} m</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Portas</span>
                <strong>{r.saidas.unidadesPassagem.portas} UP · {fmt(r.saidas.larguraMinima.portasM, 2)} m</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Dist. máx. (térreo / demais)</span>
                <strong>{fmt(r.saidas.distanciaMaxima.pisoDescargaM)} m / {fmt(r.saidas.distanciaMaxima.demaisPavimentosM)} m</strong>
              </div>
              <div className="flex justify-between">
                <span>Nº mínimo de saídas</span>
                <strong>{r.saidas.numeroMinimoSaidas}</strong>
              </div>
            </CardContent>
          </Card>
        )}

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
