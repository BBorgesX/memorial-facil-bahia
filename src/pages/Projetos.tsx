/**
 * Projetos — cadastro central (lista, criação, duplicação, importação).
 * Evolução da antiga página inicial do Memorial Fácil Bahia dentro da casca.
 */

import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, FileText, Copy, Trash2, Upload, MousePointerClick } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { duplicarProjeto, excluirProjeto, importarProjetoJSON } from '@/lib/projeto';
import { StatusBadge } from '@/components/shell/StatusBadge';
import { useApp } from '@/store/appStore';

export default function Projetos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    projetos,
    recarregarProjetos,
    criarProjeto,
    projetoAtivo,
    setProjetoAtivoId,
  } = useApp();
  const inputImportar = useRef<HTMLInputElement>(null);

  const criar = () => {
    const projeto = criarProjeto();
    navigate(`/projeto/${projeto.id}`);
  };

  const remover = (id: string, nome: string) => {
    if (!window.confirm(`Excluir o projeto "${nome}"? Esta ação não pode ser desfeita.`)) return;
    excluirProjeto(id);
    if (projetoAtivo?.id === id) setProjetoAtivoId(null);
    recarregarProjetos();
    toast({ title: 'Projeto excluído' });
  };

  const duplicar = (id: string) => {
    const copia = duplicarProjeto(id);
    if (copia) {
      recarregarProjetos();
      toast({ title: 'Projeto duplicado', description: copia.nome });
    }
  };

  const importar = async (arquivo: File) => {
    try {
      const projeto = importarProjetoJSON(await arquivo.text());
      recarregarProjetos();
      toast({ title: 'Projeto importado', description: projeto.nome });
    } catch {
      toast({ title: 'Falha ao importar', description: 'Arquivo JSON inválido.', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className="text-muted-foreground text-sm">
            Cadastro central: os dados de cada projeto alimentam todos os módulos da plataforma.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputImportar}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importar(f);
              e.target.value = '';
            }}
          />
          <Button variant="outline" onClick={() => inputImportar.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Importar
          </Button>
          <Button onClick={criar} size="lg">
            <FilePlus2 className="w-4 h-4 mr-2" /> Novo Projeto
          </Button>
        </div>
      </div>

      {projetos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium mb-1">Nenhum projeto ainda</p>
            <p className="text-sm mb-6">
              Crie um novo projeto, preencha os dados da edificação uma única vez e gere
              classificação, cálculos, memoriais e checklist automaticamente.
            </p>
            <Button onClick={criar}>
              <FilePlus2 className="w-4 h-4 mr-2" /> Criar meu primeiro projeto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projetos.map((projeto) => (
            <Card
              key={projeto.id}
              className={
                'hover:shadow-md transition-shadow' +
                (projeto.id === projetoAtivo?.id ? ' ring-2 ring-primary/50' : '')
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between gap-2">
                  <button
                    className="text-left hover:underline flex-1 truncate"
                    onClick={() => {
                      setProjetoAtivoId(projeto.id);
                      navigate(`/projeto/${projeto.id}`);
                    }}
                  >
                    {projeto.nome}
                  </button>
                  <span className="flex gap-1.5 shrink-0">
                    <Badge variant="secondary">{projeto.uf ?? 'BA'}</Badge>
                    {projeto.divisao && <Badge variant="secondary">{projeto.divisao}</Badge>}
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={projeto.status} />
                  <span>
                    {projeto.municipio ? `${projeto.municipio} · ` : ''}
                    Atualizado em {new Date(projeto.atualizadoEm).toLocaleString('pt-BR')}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setProjetoAtivoId(projeto.id);
                    navigate(`/projeto/${projeto.id}`);
                  }}
                >
                  <FileText className="w-4 h-4 mr-1" /> Abrir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProjetoAtivoId(projeto.id)}
                  disabled={projeto.id === projetoAtivo?.id}
                >
                  <MousePointerClick className="w-4 h-4 mr-1" />
                  {projeto.id === projetoAtivo?.id ? 'Ativo' : 'Tornar ativo'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => duplicar(projeto.id)}>
                  <Copy className="w-4 h-4 mr-1" /> Duplicar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive ml-auto"
                  onClick={() => remover(projeto.id, projeto.nome)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
