/**
 * Dashboard — visão geral dos projetos do usuário.
 */

import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  CheckCircle2,
  FilePlus2,
  FolderKanban,
  Hourglass,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shell/StatusBadge';
import { useApp } from '@/store/appStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario, projetos, criarProjeto, setProjetoAtivoId, projetoAtivo } = useApp();

  const total = projetos.length;
  const emAnalise = projetos.filter((p) => p.status === 'Em análise').length;
  const aprovados = projetos.filter((p) => p.status === 'Aprovado').length;
  const comuniqueSe = projetos.filter((p) => p.status === 'Comunique-se').length;

  const cards = [
    { rotulo: 'Total de projetos', valor: total, icone: FolderKanban, cor: 'text-primary' },
    { rotulo: 'Em análise', valor: emAnalise, icone: Hourglass, cor: 'text-amber-600' },
    { rotulo: 'Aprovados', valor: aprovados, icone: CheckCircle2, cor: 'text-emerald-600' },
    { rotulo: 'Em comunique-se', valor: comuniqueSe, icone: AlertOctagon, cor: 'text-red-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo, {usuario?.nome?.split(' ')[0] ?? 'engenheiro'} — visão geral dos seus projetos de PPCI.
          </p>
        </div>
        <Button
          onClick={() => {
            const p = criarProjeto();
            navigate(`/projeto/${p.id}`);
          }}
        >
          <FilePlus2 className="w-4 h-4 mr-2" /> Novo Projeto
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.rotulo}>
            <CardContent className="flex items-center gap-4 py-5">
              <c.icone className={`h-8 w-8 ${c.cor}`} />
              <div>
                <p className="text-2xl font-bold leading-none">{c.valor}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.rotulo}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Projetos recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {projetos.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum projeto ainda. Crie o primeiro para começar: classificação, cálculos, memoriais
              e checklist são gerados a partir de um único cadastro.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Ocupação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetos.slice(0, 8).map((p) => (
                    <TableRow
                      key={p.id}
                      className={p.id === projetoAtivo?.id ? 'bg-muted/60' : undefined}
                    >
                      <TableCell className="font-medium max-w-[260px] truncate">
                        {p.nome}
                        {p.cliente ? (
                          <span className="block text-xs text-muted-foreground truncate">{p.cliente}</span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.uf ?? 'BA'}</Badge>
                      </TableCell>
                      <TableCell>{p.divisao || '—'}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(p.atualizadoEm).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setProjetoAtivoId(p.id);
                            navigate(`/projeto/${p.id}`);
                          }}
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Abrir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
