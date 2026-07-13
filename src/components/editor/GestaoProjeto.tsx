import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  Copy,
  ExternalLink,
  History,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DadosProjeto, Exigencia, STATUS_PROJETO, StatusProjeto } from '@/lib/projeto';
import {
  STATUS_INFO,
  evento,
  formatarData,
  gerarTokenPortal,
  listarClientes,
  situacaoAvcb,
  urlPortal,
} from '@/lib/gestao';
import { StatusBadge } from '@/components/shell/StatusBadge';

interface Props {
  projeto: DadosProjeto;
  atualizar: (mudancas: Partial<DadosProjeto>) => void;
}

export function GestaoProjeto({ projeto, atualizar }: Props) {
  const { toast } = useToast();
  const clientes = useMemo(() => listarClientes(), []);
  const [novaExigencia, setNovaExigencia] = useState('');
  const [prazoExigencia, setPrazoExigencia] = useState('');

  const avcb = situacaoAvcb(projeto.avcbValidade);
  const exigenciasPendentes = projeto.exigencias.filter((e) => !e.resolvida).length;

  const mudarStatus = (status: StatusProjeto) => {
    if (status === projeto.status) return;
    atualizar({
      status,
      historico: [...projeto.historico, evento(`Status alterado para "${status}"`)],
    });
  };

  const adicionarExigencia = () => {
    const descricao = novaExigencia.trim();
    if (!descricao) return;
    const nova: Exigencia = {
      id: `exg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      descricao,
      prazo: prazoExigencia,
      resolvida: false,
      criadaEm: new Date().toISOString(),
    };
    atualizar({
      exigencias: [...projeto.exigencias, nova],
      historico: [...projeto.historico, evento(`Exigência registrada: ${descricao}`)],
    });
    setNovaExigencia('');
    setPrazoExigencia('');
  };

  const alternarExigencia = (id: string, resolvida: boolean) => {
    const alvo = projeto.exigencias.find((e) => e.id === id);
    atualizar({
      exigencias: projeto.exigencias.map((e) => (e.id === id ? { ...e, resolvida } : e)),
      historico: alvo && resolvida
        ? [...projeto.historico, evento(`Exigência atendida: ${alvo.descricao}`)]
        : projeto.historico,
    });
  };

  const removerExigencia = (id: string) => {
    atualizar({ exigencias: projeto.exigencias.filter((e) => e.id !== id) });
  };

  const definirValidade = (anos: number) => {
    const base = projeto.avcbEmissao ? new Date(`${projeto.avcbEmissao}T12:00:00`) : new Date();
    base.setFullYear(base.getFullYear() + anos);
    atualizar({ avcbValidade: base.toISOString().slice(0, 10) });
  };

  const copiarLinkPortal = async () => {
    let atual = projeto;
    if (!projeto.tokenPortal) {
      atual = { ...projeto, tokenPortal: gerarTokenPortal() };
      atualizar({ tokenPortal: atual.tokenPortal });
    }
    const url = urlPortal(atual);
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link do portal copiado', description: 'Envie ao cliente por WhatsApp ou e-mail.' });
    } catch {
      window.prompt('Copie o link do portal:', url);
    }
  };

  const abrirPortal = () => {
    let atual = projeto;
    if (!projeto.tokenPortal) {
      atual = { ...projeto, tokenPortal: gerarTokenPortal() };
      atualizar({ tokenPortal: atual.tokenPortal });
    }
    window.open(urlPortal(atual), '_blank');
  };

  const historicoOrdenado = [...projeto.historico].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserRound className="w-5 h-5 text-primary" /> Cliente / Contratante
          </CardTitle>
          <CardDescription>Vincule este projeto a um cliente do seu cadastro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={projeto.clienteId || 'nenhum'}
            onValueChange={(v) => {
              const cliente = clientes.find((c) => c.id === v);
              atualizar({
                clienteId: v === 'nenhum' ? '' : v,
                cliente: cliente?.nome ?? '',
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Sem cliente vinculado</SelectItem>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome || '(sem nome)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {clientes.length === 0 ? 'Nenhum cliente cadastrado ainda. ' : ''}
            <Link to={projeto.clienteId ? `/clientes/${projeto.clienteId}` : '/clientes'} className="text-primary hover:underline">
              {projeto.clienteId ? 'Abrir ficha do cliente' : 'Gerenciar clientes'}
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Status do processo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="w-5 h-5 text-primary" /> Status do processo
          </CardTitle>
          <CardDescription>Acompanhamento da tramitação no Corpo de Bombeiros.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={projeto.status} onValueChange={(v) => mudarStatus(v as StatusProjeto)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_PROJETO.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <StatusBadge status={projeto.status} />
          </div>
          <p className="text-xs text-muted-foreground">{STATUS_INFO[projeto.status].descricao}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="protocolo">Protocolo CBM</Label>
              <Input
                id="protocolo"
                value={projeto.protocoloCBMBA}
                onChange={(e) => atualizar({ protocoloCBMBA: e.target.value })}
                placeholder="Nº do protocolo"
              />
            </div>
            <div>
              <Label htmlFor="dataProtocolo">Data do protocolo</Label>
              <Input
                id="dataProtocolo"
                type="date"
                value={projeto.dataProtocolo}
                onChange={(e) => atualizar({ dataProtocolo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AVCB */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="w-5 h-5 text-primary" /> AVCB — emissão e validade
          </CardTitle>
          <CardDescription>
            Cadastre a validade para receber alertas de renovação no painel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="avcbNumero">Nº do AVCB</Label>
              <Input
                id="avcbNumero"
                value={projeto.avcbNumero}
                onChange={(e) => atualizar({ avcbNumero: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="avcbEmissao">Emissão</Label>
              <Input
                id="avcbEmissao"
                type="date"
                value={projeto.avcbEmissao}
                onChange={(e) => atualizar({ avcbEmissao: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="avcbValidade">Validade</Label>
              <Input
                id="avcbValidade"
                type="date"
                value={projeto.avcbValidade}
                onChange={(e) => atualizar({ avcbValidade: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 5].map((anos) => (
              <Button key={anos} variant="outline" size="sm" onClick={() => definirValidade(anos)}>
                <CalendarClock className="w-3.5 h-3.5 mr-1" /> +{anos} ano{anos > 1 ? 's' : ''}
              </Button>
            ))}
            <span className="text-xs text-muted-foreground self-center">
              (a partir da data de emissão)
            </span>
          </div>
          {avcb.nivel !== 'sem_data' && (
            <Alert variant={avcb.nivel === 'vencido' || avcb.nivel === 'critico' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{avcb.rotulo}</AlertTitle>
              <AlertDescription>
                {avcb.nivel === 'vencido'
                  ? 'Solicite a renovação do AVCB junto ao CBMBA o quanto antes.'
                  : avcb.nivel === 'critico'
                    ? 'Inicie a renovação imediatamente para evitar a expiração.'
                    : avcb.nivel === 'atencao'
                      ? 'Programe a renovação com o cliente.'
                      : `Validade em ${formatarData(projeto.avcbValidade)}.`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Exigências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-primary" /> Exigências do CBM (comunique-se)
            {exigenciasPendentes > 0 && (
              <span className="text-xs font-normal text-amber-600">
                {exigenciasPendentes} pendente(s)
              </span>
            )}
          </CardTitle>
          <CardDescription>Registre e acompanhe as exigências apontadas na análise ou vistoria.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projeto.exigencias.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma exigência registrada.</p>
          )}
          {projeto.exigencias.map((e) => (
            <div key={e.id} className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                checked={e.resolvida}
                onCheckedChange={(v) => alternarExigencia(e.id, v === true)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${e.resolvida ? 'line-through text-muted-foreground' : ''}`}>
                  {e.descricao}
                </p>
                {e.prazo && (
                  <p className="text-xs text-muted-foreground">Prazo: {formatarData(e.prazo)}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removerExigencia(e.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="space-y-2 border-t pt-4">
            <Textarea
              value={novaExigencia}
              onChange={(e) => setNovaExigencia(e.target.value)}
              placeholder="Descreva a exigência apontada pelo Corpo de Bombeiros…"
              rows={2}
            />
            <div className="flex gap-2">
              <Input
                type="date"
                value={prazoExigencia}
                onChange={(e) => setPrazoExigencia(e.target.value)}
                className="max-w-[180px]"
                aria-label="Prazo da exigência"
              />
              <Button onClick={adicionarExigencia} disabled={!novaExigencia.trim()}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portal do cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ExternalLink className="w-5 h-5 text-primary" /> Portal do cliente
          </CardTitle>
          <CardDescription>
            Gere um link somente leitura para o cliente acompanhar o andamento sem precisar ligar.
            O link mostra sempre a situação atual do projeto (sincronizada com a nuvem).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={copiarLinkPortal}>
            <Copy className="w-4 h-4 mr-2" /> Copiar link do portal
          </Button>
          <Button variant="outline" onClick={abrirPortal}>
            <ExternalLink className="w-4 h-4 mr-2" /> Visualizar
          </Button>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-primary" /> Histórico do projeto
          </CardTitle>
          <CardDescription>Linha do tempo das movimentações registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          {historicoOrdenado.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              As mudanças de status e exigências aparecerão aqui automaticamente.
            </p>
          ) : (
            <ul className="space-y-3">
              {historicoOrdenado.map((h, i) => (
                <li key={`${h.data}-${i}`} className="flex gap-3 text-sm">
                  <span className="text-muted-foreground whitespace-nowrap">
                    {new Date(h.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span>{h.descricao}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
