import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Building2,
  MessageSquarePlus,
  NotebookPen,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Cliente,
  TIPOS_INTERACAO,
  TipoInteracao,
  carregarCliente,
  excluirCliente,
  novaInteracao,
  projetosDoCliente,
  salvarCliente,
  situacaoAvcb,
  statusEfetivo,
} from '@/lib/gestao';
import { StatusBadge } from '@/components/shell/StatusBadge';
import { useApp } from '@/store/appStore';

const ClienteDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { usuario } = useApp();
  const [cliente, setCliente] = useState<Cliente | null>(() => (id ? carregarCliente(id) : null));
  const [tipoInteracao, setTipoInteracao] = useState<TipoInteracao>('ligacao');
  const [textoInteracao, setTextoInteracao] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const obras = id ? projetosDoCliente(id, usuario?.id) : [];

  // Auto-save com debounce, no mesmo padrão do editor de projetos
  useEffect(() => {
    if (!cliente) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => salvarCliente(cliente), 800);
    return () => clearTimeout(timerRef.current);
  }, [cliente]);

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Cliente não encontrado neste navegador.</p>
        <Button onClick={() => navigate('/clientes')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos clientes
        </Button>
      </div>
    );
  }

  const atualizar = (mudancas: Partial<Cliente>) =>
    setCliente((atual) => (atual ? { ...atual, ...mudancas } : atual));

  const registrarInteracao = () => {
    const descricao = textoInteracao.trim();
    if (!descricao) return;
    atualizar({ interacoes: [...cliente.interacoes, novaInteracao(tipoInteracao, descricao)] });
    setTextoInteracao('');
    toast({ title: 'Interação registrada' });
  };

  const removerInteracao = (intId: string) => {
    atualizar({ interacoes: cliente.interacoes.filter((i) => i.id !== intId) });
  };

  const remover = () => {
    if (!window.confirm(`Excluir o cliente "${cliente.nome}"? Os projetos vinculados não serão excluídos.`)) return;
    excluirCliente(cliente.id);
    navigate('/clientes');
  };

  const interacoesOrdenadas = [...cliente.interacoes].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Clientes
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2 truncate">
          <UserRound className="w-5 h-5 text-primary" /> {cliente.nome || '(sem nome)'}
        </h1>
        <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={remover}>
          <Trash2 className="w-4 h-4 mr-1" /> Excluir
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dados do cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do cliente</CardTitle>
            <CardDescription>As alterações são salvas automaticamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome / Razão social</Label>
                <Input id="nome" value={cliente.nome} onChange={(e) => atualizar({ nome: e.target.value })} />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={cliente.tipoPessoa} onValueChange={(v) => atualizar({ tipoPessoa: v as 'PF' | 'PJ' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PJ">Empresa (PJ)</SelectItem>
                    <SelectItem value="PF">Pessoa física (PF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cpfCnpj">{cliente.tipoPessoa === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
                <Input id="cpfCnpj" value={cliente.cpfCnpj} onChange={(e) => atualizar({ cpfCnpj: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="municipio">Município</Label>
                <Input id="municipio" value={cliente.municipio} onChange={(e) => atualizar({ municipio: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" value={cliente.telefone} onChange={(e) => atualizar({ telefone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={cliente.whatsapp} onChange={(e) => atualizar({ whatsapp: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={cliente.email} onChange={(e) => atualizar({ email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" value={cliente.endereco} onChange={(e) => atualizar({ endereco: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                rows={3}
                value={cliente.observacoes}
                onChange={(e) => atualizar({ observacoes: e.target.value })}
                placeholder="Anotações gerais sobre o cliente…"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Obras / projetos do cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-primary" /> Obras / Projetos
              </CardTitle>
              <CardDescription>
                Vincule projetos a este cliente na aba “Gestão” do editor de cada projeto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {obras.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum projeto vinculado.</p>
              ) : (
                obras.map((p) => {
                  const avcb = situacaoAvcb(p.avcbValidade);
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-md border p-3">
                      <div className="flex-1 min-w-0">
                        <button
                          className="font-medium hover:underline truncate text-left"
                          onClick={() => navigate(`/projeto/${p.id}?aba=gestao`)}
                        >
                          {p.nome}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          {p.municipio ? `${p.municipio} · ` : ''}
                          {avcb.nivel === 'sem_data' ? 'Sem AVCB' : avcb.rotulo}
                        </p>
                      </div>
                      <StatusBadge status={statusEfetivo(p)} />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Interações (CRM) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <NotebookPen className="w-5 h-5 text-primary" /> Interações
              </CardTitle>
              <CardDescription>Registre ligações, mensagens, reuniões e visitas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select value={tipoInteracao} onValueChange={(v) => setTipoInteracao(v as TipoInteracao)}>
                    <SelectTrigger className="max-w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TIPOS_INTERACAO) as TipoInteracao[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {TIPOS_INTERACAO[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={registrarInteracao} disabled={!textoInteracao.trim()} className="ml-auto">
                    <MessageSquarePlus className="w-4 h-4 mr-1" /> Registrar
                  </Button>
                </div>
                <Textarea
                  rows={2}
                  value={textoInteracao}
                  onChange={(e) => setTextoInteracao(e.target.value)}
                  placeholder="O que foi tratado com o cliente?"
                />
              </div>
              {interacoesOrdenadas.length > 0 && (
                <ul className="space-y-3 border-t pt-4">
                  {interacoesOrdenadas.map((i) => (
                    <li key={i.id} className="flex items-start gap-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {TIPOS_INTERACAO[i.tipo]} ·{' '}
                          {new Date(i.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                        <p className="whitespace-pre-wrap">{i.descricao}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive shrink-0"
                        onClick={() => removerInteracao(i.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClienteDetalhe;
