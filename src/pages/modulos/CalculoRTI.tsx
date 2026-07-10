/**
 * Cálculo de RTI (Reserva Técnica de Incêndio) — reaproveita a lógica do
 * app original "CÁLCULO DE RTI AUTOMÁTICA" (src/lib/calculos/hidrantes.ts),
 * alimentado pelos dados do projeto ativo.
 */

import { Calculator } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { referenciaMedidaUF } from '@/data/normas';
import { useModulo } from './useModulo';

export default function CalculoRTI() {
  const { projeto, resultado, atualizar, normas } = useModulo();

  if (!projeto || !resultado) return <SemProjetoAtivo modulo="Cálculo de RTI" />;

  const h = resultado.hidrantes;
  const referencia = referenciaMedidaUF(projeto.uf, 'hidrantes');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" /> Cálculo de RTI
        </h1>
        <p className="text-sm text-muted-foreground">
          Reserva Técnica de Incêndio e sistema de hidrantes — {referencia || 'IT de hidrantes da UF'} ·{' '}
          {normas.orgao}.
        </p>
      </div>

      {!resultado.ocupacao ? (
        <Alert>
          <AlertTitle>Classifique o projeto primeiro</AlertTitle>
          <AlertDescription>
            O dimensionamento da RTI depende da ocupação, carga de incêndio e área do projeto ativo.
            Preencha-os no módulo Classificação & Enquadramento.
          </AlertDescription>
        </Alert>
      ) : !h ? (
        <Alert>
          <AlertTitle>Sistema de hidrantes não exigido</AlertTitle>
          <AlertDescription>
            Pela matriz de exigências atual, o sistema de hidrantes não é obrigatório para esta
            edificação (área ≤ 750 m²). Você pode torná-lo aplicável manualmente na aba “Medidas de
            Segurança” do cadastro do projeto.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Parâmetros</CardTitle>
              <CardDescription>
                Tipo de sistema definido pela ocupação {resultado.ocupacao.divisao} e risco{' '}
                {resultado.carga?.nivel} — {h.origemTipo}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tipo de sistema de hidrantes</Label>
                <Select
                  value={String(projeto.hidranteTipoManual)}
                  onValueChange={(v) => atualizar({ hidranteTipoManual: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Automático (mínimo Tipo 2)</SelectItem>
                    {[1, 2, 3, 4, 5].map((t) => (
                      <SelectItem key={t} value={String(t)}>
                        Tipo {t} (seleção manual)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground self-end">
                Área total considerada: {resultado.areaTotal.toLocaleString('pt-BR')} m²
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                Resultado <Badge>Sistema Tipo {h.sistemaTipo}</Badge>
              </CardTitle>
              <CardDescription>{h.descricaoSistema}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/40 p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{h.rtiM3} m³</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reserva Técnica de Incêndio (RTI)
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4 text-center">
                  <p className="text-3xl font-bold">{h.vazaoMinimaLmin} L/min</p>
                  <p className="text-xs text-muted-foreground mt-1">Vazão mínima do sistema</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4 text-center">
                  <p className="text-3xl font-bold">{h.duracaoMinutos} min</p>
                  <p className="text-xs text-muted-foreground mt-1">Autonomia garantida pela RTI</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Esguicho:</span> DN {h.esguichoDN} mm
                </p>
                <p>
                  <span className="text-muted-foreground">Mangueira:</span> DN {h.mangueiraDN} mm ×{' '}
                  {h.mangueiraComprimentoM} m
                </p>
                <p>
                  <span className="text-muted-foreground">Expedições:</span> {h.expedicoes}
                </p>
                <p>
                  <span className="text-muted-foreground">Pressão mínima no esguicho mais desfavorável:</span>{' '}
                  {h.pressaoMinimaMca} mca
                </p>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Estes resultados alimentam automaticamente o memorial descritivo e o checklist. Para a
                verificação hidráulica completa (perda de carga e pressão necessária), use o módulo{' '}
                <strong>Cálculos → Hidráulica</strong>.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
