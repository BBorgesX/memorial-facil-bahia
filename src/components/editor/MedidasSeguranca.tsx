import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, RotateCcw, Layers, BellRing, Radar, Droplets, ImagePlus, Trash2 } from 'lucide-react';
import { alarmePadrao, ConfiguracaoAlarme, ConfiguracaoDeteccao, ConfiguracaoHidrantes, DadosProjeto, deteccaoPadrao, hidrantesPadrao } from '@/lib/projeto';
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

  const deteccao = projeto.deteccao ?? deteccaoPadrao();
  const atualizarDeteccao = (mudancas: Partial<ConfiguracaoDeteccao>) => {
    atualizar({ deteccao: { ...deteccao, ...mudancas } });
  };

  const hid = projeto.hidrantesConfig ?? hidrantesPadrao();
  const atualizarHidrantes = (mudancas: Partial<ConfiguracaoHidrantes>) => {
    atualizar({ hidrantesConfig: { ...hid, ...mudancas } });
  };

  /** Litros da RTI — mesma informação da tabela da reserva de incêndio (IT 22). */
  const rtiLitros = resultado.hidrantes ? resultado.hidrantes.rtiM3 * 1000 : null;
  const rtiLitrosTxt = rtiLitros !== null
    ? `${rtiLitros.toLocaleString('pt-BR')} litros (RTI)`
    : 'RTI a calcular (preencha a classificação na aba 1)';

  const inputMemoriaCalculo = useRef<HTMLInputElement>(null);

  /** Lê a imagem da memória de cálculo, limita a 1200 px e anexa como data URL. */
  const anexarMemoriaCalculo = (arquivo: File) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, 1200 / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        atualizarHidrantes({
          memoriaCalculoImagens: [...(hid.memoriaCalculoImagens ?? []), canvas.toDataURL('image/png')],
        });
      };
      img.src = String(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  };

  const removerMemoriaCalculo = (indice: number) => {
    atualizarHidrantes({
      memoriaCalculoImagens: (hid.memoriaCalculoImagens ?? []).filter((_, i) => i !== indice),
    });
  };

  const TIPOS_DETECTORES: { id: keyof Omit<ConfiguracaoDeteccao, 'outros'>; nome: string; descricao: string }[] = [
    { id: 'pontuais', nome: 'Detectores de Fumaça Pontuais', descricao: 'tecnologia fotoelétrica, sensibilidade ajustável, indicados para áreas administrativas, corredores e salas técnicas.' },
    { id: 'lineares', nome: 'Detectores de Fumaça Lineares', descricao: 'feixe infravermelho, alcance até 100 m, aplicados em áreas amplas como galpões e auditórios.' },
    { id: 'chama', nome: 'Detectores de Chama', descricao: 'baseados em radiação ultravioleta/infravermelha, destinados a áreas com risco de combustíveis líquidos e inflamáveis.' },
    { id: 'termovelocimetricos', nome: 'Detectores Termovelocimétricos (Térmicos e Velocímetros)', descricao: 'acionados por elevação brusca ou crítica de temperatura, instalados em cozinhas, áreas técnicas e depósitos.' },
    { id: 'gases', nome: 'Detectores de Gases Combustíveis', descricao: 'sensores específicos para metano, GLP ou outros, aplicados em centrais de GLP e salas de geradores.' },
  ];

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
                    {aplicavel && medida.id === 'deteccao_incendio' && (
                      <div className="p-4 border rounded-lg bg-muted/40 space-y-3">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Radar className="w-4 h-4" /> Detectores Automáticos — marcar o que é aplicável
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sistema integrado de detecção precoce de incêndios projetado para identificar automaticamente
                          sinais de combustão em ambientes internos e externos, proporcionando resposta rápida e eficaz
                          para proteção de vidas e patrimônio.
                        </p>
                        <div className="space-y-3">
                          {TIPOS_DETECTORES.map((tipo) => (
                            <div key={tipo.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={`det-${tipo.id}`}
                                checked={deteccao[tipo.id]}
                                onCheckedChange={(c) => atualizarDeteccao({ [tipo.id]: !!c } as Partial<ConfiguracaoDeteccao>)}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <Label htmlFor={`det-${tipo.id}`} className="text-sm font-medium">{tipo.nome}</Label>
                                <p className="text-xs text-muted-foreground">{tipo.descricao}</p>
                              </div>
                            </div>
                          ))}
                          <div className="space-y-1">
                            <Label htmlFor="det-outros" className="text-sm font-medium">Outros:</Label>
                            <Textarea
                              id="det-outros"
                              value={deteccao.outros}
                              onChange={(e) => atualizarDeteccao({ outros: e.target.value })}
                              placeholder="Ex.: localização dos detectores, central do sistema, fonte alternativa de energia"
                              rows={3}
                              className="text-sm bg-background"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Se nenhum tipo for marcado, o memorial apresenta a relação geral de detectores com definição
                          remetida ao projeto executivo.
                        </p>
                      </div>
                    )}
                    {aplicavel && medida.id === 'hidrantes' && (
                      <div className="p-4 border rounded-lg bg-muted/40 space-y-5">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Droplets className="w-4 h-4" /> Sistema de Hidrantes e Mangotinhos — configuração
                        </p>

                        {/* ------------------- Reservatórios ------------------- */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Reservatórios</p>
                          <p className="text-xs text-muted-foreground">
                            A capacidade em litros é a mesma informação da tabela da Reserva Técnica de Incêndio (RTI).
                          </p>
                          {([
                            { id: 'reservatorioSuperior', nome: 'Superior' },
                            { id: 'reservatorioInferior', nome: 'Inferior' },
                            { id: 'reservatorioPiscina', nome: 'Piscina' },
                          ] as const).map((res) => (
                            <div key={res.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`hid-${res.id}`}
                                checked={hid[res.id]}
                                onCheckedChange={(c) => atualizarHidrantes({ [res.id]: !!c } as Partial<ConfiguracaoHidrantes>)}
                              />
                              <Label htmlFor={`hid-${res.id}`} className="text-sm">
                                {res.nome} — {rtiLitrosTxt}
                              </Label>
                            </div>
                          ))}
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="hid-res-outros"
                              checked={hid.reservatorioOutrosAtivo}
                              onCheckedChange={(c) => atualizarHidrantes({ reservatorioOutrosAtivo: !!c })}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-1">
                              <Label htmlFor="hid-res-outros" className="text-sm">Outros (descrever abaixo)</Label>
                              {hid.reservatorioOutrosAtivo && (
                                <Textarea
                                  value={hid.reservatorioOutros}
                                  onChange={(e) => atualizarHidrantes({ reservatorioOutros: e.target.value })}
                                  placeholder="Descreva o(s) outro(s) reservatório(s)"
                                  rows={2}
                                  className="text-sm bg-background"
                                />
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-medium pt-1">Material construtivo do reservatório</p>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hid-mat-concreto"
                              checked={hid.materialConcretoAco}
                              onCheckedChange={(c) => atualizarHidrantes({ materialConcretoAco: !!c })}
                            />
                            <Label htmlFor="hid-mat-concreto" className="text-sm">Concreto armado / aço</Label>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="hid-mat-outro"
                              checked={hid.materialOutroAtivo}
                              onCheckedChange={(c) => atualizarHidrantes({ materialOutroAtivo: !!c })}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-1">
                              <Label htmlFor="hid-mat-outro" className="text-sm">Outro (descrever abaixo)</Label>
                              {hid.materialOutroAtivo && (
                                <Textarea
                                  value={hid.materialOutro}
                                  onChange={(e) => atualizarHidrantes({ materialOutro: e.target.value })}
                                  placeholder="Descreva o material construtivo do reservatório"
                                  rows={2}
                                  className="text-sm bg-background"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* --------------- Rede hidráulica — tubulações --------------- */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Rede hidráulica — tubulações (onde será instalada)</p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {([
                              { id: 'redeAparente', nome: 'Rede aparente (teto)' },
                              { id: 'redeForro', nome: 'Interior de forros' },
                              { id: 'redeEmbutida', nome: 'Embutida em paredes' },
                              { id: 'redeSubterranea', nome: 'Rede subterrânea' },
                            ] as const).map((rede) => (
                              <div key={rede.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`hid-${rede.id}`}
                                  checked={hid[rede.id]}
                                  onCheckedChange={(c) => atualizarHidrantes({ [rede.id]: !!c } as Partial<ConfiguracaoHidrantes>)}
                                />
                                <Label htmlFor={`hid-${rede.id}`} className="text-sm">{rede.nome}</Label>
                              </div>
                            ))}
                          </div>
                          {(hid.redeAparente || hid.redeForro || hid.redeEmbutida) && (
                            <p className="text-xs text-muted-foreground border-l-2 pl-2">
                              Material (fixo): tubo em aço DIN 2440 — NBR 5580, Classe Média, com costura, acabamento
                              galvanizado preto.
                            </p>
                          )}
                          {hid.redeSubterranea && (
                            <p className="text-xs text-muted-foreground border-l-2 pl-2">
                              Material (fixo): PEAD (Polietileno de Alta Densidade) PN20 — profundidade mínima de 1,00 m e
                              afastamento mínimo de 1,00 m da área de risco.
                            </p>
                          )}
                        </div>

                        {/* --------------- Rede hidráulica — conexões --------------- */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Rede hidráulica — conexões</p>
                          <p className="text-xs text-muted-foreground">
                            Marque apenas os sistemas de conexão utilizados no projeto — itens não selecionados são
                            excluídos do texto final do memorial.
                          </p>
                          <p className="text-xs font-medium">Para redes de aço:</p>
                          {([
                            { id: 'conexoesRosqueaveis', nome: 'Conexões rosqueáveis em ferro maleável, Classe 10' },
                            { id: 'conexoesSoldaveis', nome: 'Conexões soldáveis em aço carbono, pretas, biseladas, para 150 psi' },
                            { id: 'conexoesGrooving', nome: 'Sistema Grooving (ranhurado)' },
                          ] as const).map((cx) => (
                            <div key={cx.id} className="flex items-center space-x-2 ml-2">
                              <Checkbox
                                id={`hid-${cx.id}`}
                                checked={hid[cx.id]}
                                onCheckedChange={(c) => atualizarHidrantes({ [cx.id]: !!c } as Partial<ConfiguracaoHidrantes>)}
                              />
                              <Label htmlFor={`hid-${cx.id}`} className="text-sm">{cx.nome}</Label>
                            </div>
                          ))}
                          <p className="text-xs font-medium">Para redes plásticas (PEAD):</p>
                          <div className="flex items-center space-x-2 ml-2">
                            <Checkbox
                              id="hid-conexoesPEADFusao"
                              checked={hid.conexoesPEADFusao}
                              onCheckedChange={(c) => atualizarHidrantes({ conexoesPEADFusao: !!c })}
                            />
                            <Label htmlFor="hid-conexoesPEADFusao" className="text-sm">
                              Conexões soldáveis por fusão térmica, mesma classe de pressão da tubulação
                            </Label>
                          </div>
                        </div>

                        {/* --------------- Sistema de pressurização --------------- */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Sistema de pressurização — a pressurização será feita através de:</p>
                          <div className="flex flex-wrap gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hid-press-eletrica"
                                checked={hid.pressurizacaoEletrica}
                                onCheckedChange={(c) => atualizarHidrantes({ pressurizacaoEletrica: !!c })}
                              />
                              <Label htmlFor="hid-press-eletrica" className="text-sm">Elétrica</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="hid-press-diesel"
                                checked={hid.pressurizacaoDiesel}
                                onCheckedChange={(c) => atualizarHidrantes({ pressurizacaoDiesel: !!c })}
                              />
                              <Label htmlFor="hid-press-diesel" className="text-sm">Combustão Diesel</Label>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {hid.pressurizacaoDiesel
                              ? 'Com Diesel marcado, o memorial descreve a bomba reserva a combustão conforme a NFPA 20.'
                              : 'Sem Diesel, o memorial descreve o suprimento por grupo gerador de emergência dimensionado para a bomba elétrica.'}
                            {' '}Os textos de automação, painéis e a observação da IT-41 (vedação do dispositivo DR) são
                            incluídos automaticamente.
                          </p>
                          <div className="space-y-1">
                            <Label htmlFor="hid-bomba-principal" className="text-sm font-medium">
                              Bomba Elétrica (Bomba Principal) — dados técnicos + curva de desempenho
                            </Label>
                            <Textarea
                              id="hid-bomba-principal"
                              value={hid.bombaPrincipalDados}
                              onChange={(e) => atualizarHidrantes({ bombaPrincipalDados: e.target.value })}
                              placeholder="Ex.: marca/modelo, vazão (m³/h), pressão (mca), potência (cv), rotação (rpm), ponto de operação"
                              rows={3}
                              className="text-sm bg-background"
                            />
                          </div>
                          {hid.pressurizacaoDiesel && (
                            <div className="space-y-1">
                              <Label htmlFor="hid-bomba-combustao" className="text-sm font-medium">
                                Bomba a Combustão — dados técnicos + curva de desempenho
                              </Label>
                              <Textarea
                                id="hid-bomba-combustao"
                                value={hid.bombaCombustaoDados}
                                onChange={(e) => atualizarHidrantes({ bombaCombustaoDados: e.target.value })}
                                placeholder="Ex.: marca/modelo, vazão (m³/h), pressão (mca), potência (cv), autonomia do tanque de Diesel"
                                rows={3}
                                className="text-sm bg-background"
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            <Label htmlFor="hid-bomba-jockey" className="text-sm font-medium">
                              Bomba Jockey — dados técnicos + curva de desempenho
                            </Label>
                            <Textarea
                              id="hid-bomba-jockey"
                              value={hid.bombaJockeyDados}
                              onChange={(e) => atualizarHidrantes({ bombaJockeyDados: e.target.value })}
                              placeholder="Ex.: marca/modelo, vazão (m³/h), pressão (mca), potência (cv), pressões de liga/desliga dos pressostatos"
                              rows={3}
                              className="text-sm bg-background"
                            />
                          </div>
                        </div>

                        {/* --------------- Cálculo hidráulico --------------- */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Cálculo hidráulico — memória de cálculo do sistema de hidrantes</p>
                          <input
                            ref={inputMemoriaCalculo}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) anexarMemoriaCalculo(f);
                              e.target.value = '';
                            }}
                          />
                          <div className="flex flex-wrap items-center gap-3">
                            {(hid.memoriaCalculoImagens ?? []).map((img, i) => (
                              <div key={i} className="relative">
                                <img
                                  src={img}
                                  alt={`Memória de cálculo ${i + 1}`}
                                  className="h-20 max-w-32 object-contain border rounded bg-white p-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 p-0 text-destructive bg-background border rounded-full"
                                  onClick={() => removerMemoriaCalculo(i)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => inputMemoriaCalculo.current?.click()}>
                              <ImagePlus className="w-4 h-4 mr-1" /> Anexar imagem
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG ou WEBP — as imagens anexadas são incluídas na seção de cálculo hidráulico do memorial.
                          </p>
                        </div>
                      </div>
                    )}
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
