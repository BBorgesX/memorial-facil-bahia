import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DadosProjeto } from '@/lib/projeto';
import { ResultadoTecnico } from '@/lib/engine';
import { TABELA_1_OCUPACOES, getDivisao, getGrupo } from '@/lib/normas/ocupacoes';
import { CARGA_INCENDIO_SUGERIDA } from '@/lib/normas/classificacao';

interface Props {
  projeto: DadosProjeto;
  resultado: ResultadoTecnico;
  atualizar: (mudancas: Partial<DadosProjeto>) => void;
}

const num = (v: string): number => {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export const DadosGerais = ({ projeto, resultado, atualizar }: Props) => {
  const grupoSelecionado = getGrupo(projeto.grupo);
  const divisaoInfo = projeto.divisao ? getDivisao(projeto.divisao) : undefined;

  const selecionarDivisao = (cod: string) => {
    const sugestao = CARGA_INCENDIO_SUGERIDA[cod];
    atualizar({
      divisao: cod,
      // Sugere a carga de incêndio típica quando o usuário ainda não informou
      cargaIncendioMJm2: projeto.cargaIncendioMJm2 > 0 ? projeto.cargaIncendioMJm2 : (sugestao ?? 0),
    });
  };

  return (
    <div className="space-y-6">
      {resultado.erros.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dados pendentes para o processamento completo</AlertTitle>
          <AlertDescription>
            <ul className="list-disc ml-4 mt-1">
              {resultado.erros.map((e) => (
                <li key={e.campo}>{e.mensagem}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Identificação do Projeto
          </CardTitle>
          <CardDescription>Dados do proprietário, do responsável e do endereço da obra</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proprietario">Proprietário / Nome da obra</Label>
              <Input id="proprietario" value={projeto.proprietario} onChange={(e) => atualizar({ proprietario: e.target.value })} placeholder="Nome da obra ou proprietário" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Cliente / Empresa (construtora)</Label>
              <Input id="empresa" value={projeto.empresa} onChange={(e) => atualizar({ empresa: e.target.value })} placeholder="Cliente ou construtora" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={projeto.cnpj} onChange={(e) => atualizar({ cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-2">
              <Label>Tipo de edificação</Label>
              <Select value={projeto.tipoEdificacao} onValueChange={(v) => atualizar({ tipoEdificacao: v as DadosProjeto['tipoEdificacao'] })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="construcao">Construção (a construir)</SelectItem>
                  <SelectItem value="existente">Edificação existente (IT 42)</SelectItem>
                  <SelectItem value="renovacao">Renovação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Forma de apresentação</Label>
              <Select value={projeto.apresentacao} onValueChange={(v) => atualizar({ apresentacao: v as DadosProjeto['apresentacao'] })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PT">Projeto Técnico (PT)</SelectItem>
                  <SelectItem value="PTS">Projeto Técnico Simplificado (PTS)</SelectItem>
                  <SelectItem value="PTIOT">PT para Instalação e Ocupação Temporária (PTIOT)</SelectItem>
                  <SelectItem value="PTOTEP">PT para Ocupação Temporária em Edificação Permanente (PTOTEP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />
          <h4 className="font-medium text-sm">Endereço do imóvel</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input id="logradouro" value={projeto.logradouro} onChange={(e) => atualizar({ logradouro: e.target.value })} placeholder="Rua, Avenida..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input id="numero" value={projeto.numero} onChange={(e) => atualizar({ numero: e.target.value })} placeholder="123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input id="complemento" value={projeto.complemento} onChange={(e) => atualizar({ complemento: e.target.value })} placeholder="Galpão, sala..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" value={projeto.bairro} onChange={(e) => atualizar({ bairro: e.target.value })} placeholder="Bairro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="municipio">Município (BA)</Label>
              <Input id="municipio" value={projeto.municipio} onChange={(e) => atualizar({ municipio: e.target.value })} placeholder="Salvador" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" value={projeto.cep} onChange={(e) => atualizar({ cep: e.target.value })} placeholder="00000-000" />
            </div>
          </div>

          <Separator />
          <h4 className="font-medium text-sm">Responsável técnico</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rtNome">Nome completo</Label>
              <Input id="rtNome" value={projeto.respTecnicoNome} onChange={(e) => atualizar({ respTecnicoNome: e.target.value })} placeholder="Nome do RT" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rtRegistro">Registro (CREA/CAU)</Label>
              <Input id="rtRegistro" value={projeto.respTecnicoRegistro} onChange={(e) => atualizar({ respTecnicoRegistro: e.target.value })} placeholder="CREA-BA 000000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Características e Classificação da Edificação
          </CardTitle>
          <CardDescription>
            A classificação pelas Tabelas 1, 2 e 3 do Decreto nº 16.302/2015 é feita automaticamente a partir destes dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="areaExistente">Área existente (m²)</Label>
              <Input id="areaExistente" type="number" min="0" step="0.01" value={projeto.areaExistente || ''} onChange={(e) => atualizar({ areaExistente: num(e.target.value) })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaConstruir">Área a construir (m²)</Label>
              <Input id="areaConstruir" type="number" min="0" step="0.01" value={projeto.areaConstruir || ''} onChange={(e) => atualizar({ areaConstruir: num(e.target.value) })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Área total (m²)</Label>
              <Input value={resultado.areaTotal.toLocaleString('pt-BR')} disabled className="bg-muted font-semibold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altura">Altura da edificação (m)</Label>
              <Input id="altura" type="number" min="0" step="0.01" value={projeto.alturaM || ''} onChange={(e) => atualizar({ alturaM: num(e.target.value) })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pavimentos">Nº de pavimentos</Label>
              <Input id="pavimentos" type="number" min="1" step="1" value={projeto.pavimentos || ''} onChange={(e) => atualizar({ pavimentos: Math.max(1, Math.round(num(e.target.value))) })} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocupantes">População fixa + flutuante (opcional)</Label>
              <Input id="ocupantes" type="number" min="0" step="1" value={projeto.ocupantes || ''} onChange={(e) => atualizar({ ocupantes: Math.round(num(e.target.value)) })} placeholder="Calcular pela IT 11" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grupo de ocupação (Tabela 1)</Label>
              <Select
                value={projeto.grupo}
                onValueChange={(v) => atualizar({ grupo: v, divisao: '' })}
              >
                <SelectTrigger><SelectValue placeholder="Selecione o grupo" /></SelectTrigger>
                <SelectContent>
                  {TABELA_1_OCUPACOES.map((g) => (
                    <SelectItem key={g.codigo} value={g.codigo}>
                      {g.codigo} — {g.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Divisão (Tabela 1)</Label>
              <Select value={projeto.divisao} onValueChange={selecionarDivisao} disabled={!grupoSelecionado}>
                <SelectTrigger><SelectValue placeholder={grupoSelecionado ? 'Selecione a divisão' : 'Escolha o grupo primeiro'} /></SelectTrigger>
                <SelectContent>
                  {grupoSelecionado?.divisoes.map((d) => (
                    <SelectItem key={d.cod} value={d.cod}>
                      {d.cod} — {d.desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {divisaoInfo && (
            <p className="text-xs text-muted-foreground border-l-2 border-primary pl-3">
              <strong>Exemplos ({divisaoInfo.divisao.cod}):</strong> {divisaoInfo.divisao.exemplos}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carga">Carga de incêndio específica (MJ/m²)</Label>
              <Input id="carga" type="number" min="0" step="1" value={projeto.cargaIncendioMJm2 || ''} onChange={(e) => atualizar({ cargaIncendioMJm2: num(e.target.value) })} placeholder="Ex.: 300" />
              {projeto.divisao && CARGA_INCENDIO_SUGERIDA[projeto.divisao] !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Valor típico para {projeto.divisao}: {CARGA_INCENDIO_SUGERIDA[projeto.divisao]} MJ/m² (IT 14 — confirmar para a edificação real)
                </p>
              )}
            </div>
            <div className="space-y-4 pt-1">
              {(projeto.divisao === 'G-1' || projeto.divisao === 'G-2') && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="garagemAberta" checked={projeto.garagemAberta} onCheckedChange={(c) => atualizar({ garagemAberta: !!c })} />
                  <Label htmlFor="garagemAberta" className="text-sm">Garagem aberta lateralmente (reduz TRRF — IT 08)</Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox id="saidaUnica" checked={projeto.saidaUnica} onCheckedChange={(c) => atualizar({ saidaUnica: !!c })} />
                <Label htmlFor="saidaUnica" className="text-sm">Edificação com saída única (afeta distâncias máximas — IT 11)</Label>
              </div>
            </div>
          </div>

          <Separator />
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="temSubsolo" checked={projeto.temSubsolo} onCheckedChange={(c) => atualizar({ temSubsolo: !!c })} />
              <Label htmlFor="temSubsolo" className="font-medium">A edificação possui subsolo</Label>
            </div>
            {projeto.temSubsolo && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="areaSubsolo">Área do subsolo (m²)</Label>
                  <Input id="areaSubsolo" type="number" min="0" step="0.01" value={projeto.areaSubsoloM2 || ''} onChange={(e) => atualizar({ areaSubsoloM2: num(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profSubsolo">Profundidade (m)</Label>
                  <Input id="profSubsolo" type="number" min="0" step="0.01" value={projeto.profundidadeSubsoloM || ''} onChange={(e) => atualizar({ profundidadeSubsoloM: num(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Nível do subsolo</Label>
                  <Select
                    value={projeto.subsoloPrimeiroSegundoNivel ? '12' : '3'}
                    onValueChange={(v) => atualizar({ subsoloPrimeiroSegundoNivel: v === '12' })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">1º ou 2º subsolo</SelectItem>
                      <SelectItem value="3">3º subsolo ou inferior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ocupSubsolo">Ocupação do subsolo</Label>
                  <Input id="ocupSubsolo" value={projeto.ocupacaoSubsolo} onChange={(e) => atualizar({ ocupacaoSubsolo: e.target.value })} placeholder="Ex.: garagem, depósito..." />
                </div>
              </div>
            )}
          </div>

          {resultado.altura && resultado.carga && resultado.ocupacao && (
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Classificação automática (Decreto nº 16.302/2015)</AlertTitle>
              <AlertDescription>
                <strong>{resultado.ocupacao.divisao}</strong> ({resultado.ocupacao.descricao}) ·{' '}
                Altura <strong>Tipo {resultado.altura.tipo}</strong> — {resultado.altura.denominacao} ·{' '}
                Risco <strong>{resultado.carga.nivel}</strong> ({resultado.carga.descricao}) ·{' '}
                <strong>{resultado.medidasExigidas.length}</strong> medidas de segurança exigidas
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
