import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, RotateCcw, Layers } from 'lucide-react';
import { DadosProjeto } from '@/lib/projeto';
import { medidaAplicavel, ResultadoTecnico } from '@/lib/engine';
import { MEDIDAS_SEGURANCA } from '@/lib/normas/exigencias';

interface Props {
  projeto: DadosProjeto;
  resultado: ResultadoTecnico;
  atualizar: (mudancas: Partial<DadosProjeto>) => void;
}

export const MedidasSeguranca = ({ projeto, resultado, atualizar }: Props) => {
  const exigidaIds = new Set(resultado.medidasExigidas.map((m) => m.id));
  const notas = new Map(resultado.medidasExigidas.map((m) => [m.id, m.nota]));

  const alterarAplicavel = (id: string, aplicavel: boolean) => {
    atualizar({
      medidas: {
        ...projeto.medidas,
        [id]: { aplicavel, automatica: false, detalhes: projeto.medidas[id]?.detalhes ?? '' },
      },
    });
  };

  const alterarDetalhes = (id: string, detalhes: string) => {
    const atual = projeto.medidas[id];
    atualizar({
      medidas: {
        ...projeto.medidas,
        [id]: {
          aplicavel: atual && !atual.automatica ? atual.aplicavel : exigidaIds.has(id),
          automatica: atual?.automatica ?? true,
          detalhes,
        },
      },
    });
  };

  const restaurarAutomatico = () => {
    // Mantém os textos de detalhes, mas volta o estado aplicável para o automático
    const medidas: DadosProjeto['medidas'] = {};
    for (const [id, m] of Object.entries(projeto.medidas)) {
      medidas[id] = { ...m, automatica: true };
    }
    atualizar({ medidas });
  };

  const temAjusteManual = Object.values(projeto.medidas).some((m) => !m.automatica);

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Classificação automática pelas Tabelas 5 e 6 do Decreto nº 16.302/2015</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-2">
          {resultado.medidasExigidas.length > 0 ? (
            <>
              <span>
                <strong>{resultado.medidasExigidas.length}</strong> medidas exigidas para{' '}
                <strong>{resultado.ocupacao?.divisao ?? '—'}</strong>, altura Tipo{' '}
                <strong>{resultado.altura?.tipo ?? '—'}</strong>, risco{' '}
                <strong>{resultado.carga?.nivel ?? '—'}</strong> e {resultado.areaTotal.toLocaleString('pt-BR')} m².
                Você pode ajustar manualmente cada medida abaixo.
              </span>
              {temAjusteManual && (
                <Button variant="outline" size="sm" onClick={restaurarAutomatico}>
                  <RotateCcw className="w-3 h-3 mr-1" /> Restaurar automático
                </Button>
              )}
            </>
          ) : (
            <span>Preencha os dados e a classificação na aba 1 para determinar as medidas automaticamente.</span>
          )}
        </AlertDescription>
      </Alert>

      {resultado.exigenciasSubsolo.length > 0 && (
        <Card className="border-amber-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4" /> Exigências adicionais para o subsolo (Tabela 7)
            </CardTitle>
            <CardDescription>
              Subsolo de {projeto.areaSubsoloM2.toLocaleString('pt-BR')} m² com ocupação diversa de estacionamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {resultado.exigenciasSubsolo.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {MEDIDAS_SEGURANCA.map((medida) => {
          const aplicavel = medidaAplicavel(projeto, resultado, medida.id);
          const exigida = exigidaIds.has(medida.id);
          const ajusteManual = projeto.medidas[medida.id] && !projeto.medidas[medida.id].automatica;
          const nota = notas.get(medida.id);
          return (
            <Card key={medida.id} className={aplicavel ? 'border-primary/40' : 'opacity-80'}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={medida.id}
                    checked={aplicavel}
                    onCheckedChange={(c) => alterarAplicavel(medida.id, !!c)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label htmlFor={medida.id} className="font-medium">
                        {medida.nome}
                      </Label>
                      <Badge variant="outline" className="text-xs">{medida.referencia}</Badge>
                      {exigida && !ajusteManual && <Badge className="text-xs">Exigida (auto)</Badge>}
                      {ajusteManual && <Badge variant="secondary" className="text-xs">Ajuste manual</Badge>}
                    </div>
                    {nota && <p className="text-xs text-muted-foreground">{nota}</p>}
                    {aplicavel && (
                      <Textarea
                        value={projeto.medidas[medida.id]?.detalhes ?? ''}
                        onChange={(e) => alterarDetalhes(medida.id, e.target.value)}
                        placeholder="Detalhes/complementos específicos desta medida para o memorial (opcional — o texto técnico padrão já é gerado automaticamente)"
                        rows={2}
                        className="text-sm"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
