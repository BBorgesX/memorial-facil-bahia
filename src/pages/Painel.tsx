/**
 * Painel de Gestão — visão dos projetos por status de aprovação, alertas de
 * vencimento do AVCB e troca rápida de status.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, FileText, Users } from 'lucide-react';
import { DadosProjeto, STATUS_PROJETO, StatusProjeto, salvarProjeto } from '@/lib/projeto';
import {
  STATUS_INFO,
  carregarTodosProjetos,
  evento,
  formatarData,
  listarClientes,
  situacaoAvcb,
  statusEfetivo,
} from '@/lib/gestao';
import { StatusBadge } from '@/components/shell/StatusBadge';
import { useApp } from '@/store/appStore';

const Painel = () => {
  const navigate = useNavigate();
  const { usuario, recarregarProjetos } = useApp();
  const [projetos, setProjetos] = useState<DadosProjeto[]>([]);
  const [filtro, setFiltro] = useState<StatusProjeto | 'todos'>('todos');

  useEffect(() => {
    setProjetos(carregarTodosProjetos(usuario?.id));
  }, [usuario]);

  const clientes = useMemo(() => {
    const mapa = new Map<string, string>();
    listarClientes().forEach((c) => mapa.set(c.id, c.nome));
    return mapa;
  }, []);

  const contagem = useMemo(() => {
    const c = Object.fromEntries(STATUS_PROJETO.map((s) => [s, 0])) as Record<StatusProjeto, number>;
    projetos.forEach((p) => c[statusEfetivo(p)]++);
    return c;
  }, [projetos]);

  const alertas = useMemo(
    () =>
      projetos
        .map((p) => ({ projeto: p, avcb: situacaoAvcb(p.avcbValidade) }))
        .filter(({ avcb }) => avcb.nivel === 'vencido' || avcb.nivel === 'critico' || avcb.nivel === 'atencao')
        .sort((a, b) => (a.avcb.dias ?? 0) - (b.avcb.dias ?? 0)),
    [projetos]
  );

  const exibidos = useMemo(
    () => (filtro === 'todos' ? projetos : projetos.filter((p) => statusEfetivo(p) === filtro)),
    [projetos, filtro]
  );

  const mudarStatus = (p: DadosProjeto, status: StatusProjeto) => {
    if (status === p.status) return;
    salvarProjeto({
      ...p,
      status,
      historico: [...p.historico, evento(`Status alterado para "${status}"`)],
    });
    setProjetos(carregarTodosProjetos(usuario?.id));
    recarregarProjetos();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Painel de Gestão</h1>
          <p className="text-sm text-muted-foreground">
            Status dos processos, alertas de renovação do AVCB e acesso rápido à gestão de cada projeto.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/clientes')}>
          <Users className="w-4 h-4 mr-2" /> Clientes
        </Button>
      </div>

      {/* Contadores por status */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <button
          onClick={() => setFiltro('todos')}
          className={`rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent ${filtro === 'todos' ? 'ring-2 ring-primary' : ''}`}
        >
          <p className="text-2xl font-bold">{projetos.length}</p>
          <p className="text-xs text-muted-foreground">Todos</p>
        </button>
        {STATUS_PROJETO.map((s) => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className={`rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent ${filtro === s ? 'ring-2 ring-primary' : ''}`}
          >
            <p className="text-2xl font-bold flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_INFO[s].ponto}`} />
              {contagem[s]}
            </p>
            <p className="text-xs text-muted-foreground truncate">{s}</p>
          </button>
        ))}
      </div>

      {/* Alertas de vencimento do AVCB */}
      {alertas.length > 0 && (
        <Card className="border-amber-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Alertas de vencimento do AVCB
            </CardTitle>
            <CardDescription>
              Renovações a programar — o alerta começa 90 dias antes do vencimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertas.map(({ projeto, avcb }) => (
              <div
                key={projeto.id}
                className={`flex flex-wrap items-center gap-3 rounded-md border p-3 ${
                  avcb.nivel === 'vencido'
                    ? 'border-red-300 bg-red-50'
                    : avcb.nivel === 'critico'
                      ? 'border-amber-300 bg-amber-50'
                      : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <button
                    className="font-medium hover:underline truncate"
                    onClick={() => navigate(`/projeto/${projeto.id}?aba=gestao`)}
                  >
                    {projeto.nome}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {clientes.get(projeto.clienteId) ?? (projeto.cliente || 'Sem cliente')} · Validade:{' '}
                    {formatarData(projeto.avcbValidade)}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    avcb.nivel === 'vencido' ? 'text-red-600' : avcb.nivel === 'critico' ? 'text-amber-600' : ''
                  }`}
                >
                  {avcb.rotulo}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabela de projetos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {filtro === 'todos' ? 'Todos os projetos' : filtro}
            <span className="text-muted-foreground font-normal text-sm ml-2">({exibidos.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exibidos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhum projeto {filtro !== 'todos' ? `com status "${filtro}"` : 'cadastrado'}.{' '}
              <Link to="/projetos" className="text-primary hover:underline">
                Ir para os projetos
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto / Obra</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validade AVCB</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exibidos.map((p) => {
                    const avcb = situacaoAvcb(p.avcbValidade);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <button className="hover:underline text-left" onClick={() => navigate(`/projeto/${p.id}`)}>
                            {p.nome}
                          </button>
                          {p.municipio && <p className="text-xs text-muted-foreground">{p.municipio}</p>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.clienteId ? (
                            <Link to={`/clientes/${p.clienteId}`} className="hover:underline">
                              {clientes.get(p.clienteId) ?? p.cliente ?? '—'}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">{p.cliente || '—'}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{p.uf}</TableCell>
                        <TableCell>
                          <Select value={p.status} onValueChange={(v) => mudarStatus(p, v as StatusProjeto)}>
                            <SelectTrigger className="h-8 w-[170px] border-0 bg-transparent p-0 focus:ring-0 [&>svg]:opacity-50">
                              <StatusBadge status={statusEfetivo(p)} />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_PROJETO.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatarData(p.avcbValidade)}
                          {(avcb.nivel === 'vencido' || avcb.nivel === 'critico' || avcb.nivel === 'atencao') && (
                            <p className={`text-xs ${avcb.nivel === 'vencido' ? 'text-red-600' : 'text-amber-600'}`}>
                              {avcb.rotulo}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(p.atualizadoEm).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/projeto/${p.id}?aba=gestao`)}>
                            <FileText className="w-4 h-4 mr-1" /> Gestão
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Painel;
