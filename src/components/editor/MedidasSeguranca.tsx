import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, RotateCcw, Layers, BellRing } from 'lucide-react';
import { alarmePadrao, ConfiguracaoAlarme, DadosProjeto } from '@/lib/projeto';
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

  const alarme = projeto.alarme ?? alarmePadrao();
  const atualizarAlarme = (mudancas: Partial<ConfiguracaoAlarme>) => {
    atualizar({ alarme: { ...alarme, ...mudancas } });
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
                    {aplicavel && medida.id === 'alarme_incendio' && (
                      <div className="p-4 border rounded-lg bg-muted/40 space-y-4">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <BellRing className="w-4 h-4" /> Sistema de Detecção e Alarme de Incêndio — configuração
                        </p>

                        <div>
                          <p className="text-sm font-medium mb-2">Descrição geral — o sistema projetado será do tipo:</p>
                          <div className="flex flex-wrap gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="alm-enderecavel"
                                checked={alarme.tipoSistema === 'enderecavel'}
                                onCheckedChange={(c) => atualizarAlarme({ tipoSistema: c ? 'enderecavel' : '' })}
                              />
                              <Label htmlFor="alm-enderecavel" className="text-sm">1) Endereçável</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="alm-convencional"
                                checked={alarme.tipoSistema === 'convencional'}
                                onCheckedChange={(c) => atualizarAlarme({ tipoSistema: c ? 'convencional' : '' })}
                              />
                              <Label htmlFor="alm-convencional" className="text-sm">2) Convencional</Label>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Composto por central de alarme de incêndio, detectores automáticos, acionadores manuais,
                            sinalizadores audiovisuais, módulos de interface, dispositivos auxiliares e cabeamento
                            específico, devidamente setorizado de acordo com a compartimentação da edificação.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Componentes do sistema</p>
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="alm-central"
                              checked={alarme.central}
                              onCheckedChange={(c) => atualizarAlarme({ central: !!c })}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <Label htmlFor="alm-central" className="text-sm font-medium">Central de Alarme de Incêndio</Label>
                              <p className="text-xs text-muted-foreground">
                                Display digital, capacidade de expansão, registro de eventos em memória não volátil,
                                supervisão contínua, indicação de falhas e acionamento automático de sirenes.
                              </p>
                              {alarme.central && (
                                <div className="mt-2 space-y-1">
                                  <Label htmlFor="alm-local" className="text-xs">Localização da central</Label>
                                  <Input
                                    id="alm-local"
                                    value={alarme.centralLocalizacao}
                                    onChange={(e) => atualizarAlarme({ centralLocalizacao: e.target.value })}
                                    placeholder="entrada principal (recepção/portaria) — padrão"
                                    className="h-9"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="alm-fonte"
                              checked={alarme.fonte220}
                              onCheckedChange={(c) => atualizarAlarme({ fonte220: !!c })}
                              className="mt-0.5"
                            />
                            <Label htmlFor="alm-fonte" className="text-sm">
                              Fonte de alimentação: rede elétrica de 220 Vca, com carregador automático de baterias
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Sinalizadores audiovisuais</p>
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="alm-sirenes"
                              checked={alarme.sirenes}
                              onCheckedChange={(c) => atualizarAlarme({ sirenes: !!c })}
                              className="mt-0.5"
                            />
                            <Label htmlFor="alm-sirenes" className="text-sm">
                              Sirenes: alta potência sonora, padrão intermitente, com audibilidade em todos os ambientes ocupados
                            </Label>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="alm-visuais"
                              checked={alarme.sinalizadoresVisuais}
                              onCheckedChange={(c) => atualizarAlarme({ sinalizadoresVisuais: !!c })}
                              className="mt-0.5"
                            />
                            <Label htmlFor="alm-visuais" className="text-sm">
                              Sinalizadores visuais: lâmpadas LED estroboscópicas para locais ruidosos e áreas acessíveis a
                              pessoas com deficiência auditiva
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Equipamentos auxiliares</p>
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="alm-door"
                              checked={alarme.doorHolders}
                              onCheckedChange={(c) => atualizarAlarme({ doorHolders: !!c })}
                              className="mt-0.5"
                            />
                            <Label htmlFor="alm-door" className="text-sm">
                              Door holders (eletroímãs retentores de porta): mantêm portas corta-fogo abertas no uso normal e
                              liberam o fechamento automático em caso de alarme
                            </Label>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="alm-acesso"
                              checked={alarme.controleAcesso}
                              onCheckedChange={(c) => atualizarAlarme({ controleAcesso: !!c })}
                              className="mt-0.5"
                            />
                            <Label htmlFor="alm-acesso" className="text-sm">
                              Equipamentos de controle de acesso: programados para destravar portas em caso de alarme,
                              garantindo a evacuação
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">
                            Flow switches (sensores de fluxo em ramais de sprinklers/hidrantes) são incluídos automaticamente
                            quando houver sistemas hidráulicos supervisionados.
                          </p>
                        </div>
                      </div>
                    )}
                    {aplicavel && (
                      <Textarea
                        value={projeto.medidas[medida.id]?.detalhes ?? ''}
                        onChange={(e) => alterarDetalhes(medida.id, e.target.value)}
                        placeholder={medida.id === 'alarme_incendio'
                          ? 'Texto adicional do responsável técnico para esta seção (opcional — será acrescentado ao texto gerado pelas opções acima)'
                          : 'Detalhes/complementos específicos desta medida para o memorial (opcional — o texto técnico padrão já é gerado automaticamente)'}
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
