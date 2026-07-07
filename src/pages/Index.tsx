import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FilePlus2, FileText, Copy, Trash2, Upload, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  listarProjetos,
  novoProjeto,
  salvarProjeto,
  excluirProjeto,
  duplicarProjeto,
  importarProjetoJSON,
} from '@/lib/projeto';
import heroImage from '@/assets/fire-safety-hero.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projetos, setProjetos] = useState(listarProjetos());
  const inputImportar = useRef<HTMLInputElement>(null);

  const criarProjeto = () => {
    const projeto = salvarProjeto(novoProjeto());
    navigate(`/projeto/${projeto.id}`);
  };

  const remover = (id: string, nome: string) => {
    if (!window.confirm(`Excluir o projeto "${nome}"? Esta ação não pode ser desfeita.`)) return;
    excluirProjeto(id);
    setProjetos(listarProjetos());
    toast({ title: 'Projeto excluído' });
  };

  const duplicar = (id: string) => {
    const copia = duplicarProjeto(id);
    if (copia) {
      setProjetos(listarProjetos());
      toast({ title: 'Projeto duplicado', description: copia.nome });
    }
  };

  const importar = async (arquivo: File) => {
    try {
      const projeto = importarProjetoJSON(await arquivo.text());
      setProjetos(listarProjetos());
      toast({ title: 'Projeto importado', description: projeto.nome });
    } catch {
      toast({ title: 'Falha ao importar', description: 'Arquivo JSON inválido.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-gradient-professional opacity-90" />
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center text-center text-white">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center gap-3">
              <Flame className="w-10 h-10" /> Memorial Fácil Bahia
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Projetos de Segurança Contra Incêndio e Pânico — classificação, cálculos e memorial automático
            </p>
            <p className="text-white/75 text-sm mt-1">
              Lei nº 12.929/2013 · Decreto nº 16.302/2015 · Instruções Técnicas do CBMBA
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Meus Projetos</h2>
            <p className="text-muted-foreground text-sm">
              Os projetos ficam salvos neste navegador e podem ser editados a qualquer momento.
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
            <Button onClick={criarProjeto} size="lg">
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
                Crie um novo projeto, preencha os dados da edificação e gere o memorial descritivo automaticamente.
              </p>
              <Button onClick={criarProjeto}>
                <FilePlus2 className="w-4 h-4 mr-2" /> Criar meu primeiro projeto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projetos.map((projeto) => (
              <Card key={projeto.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between gap-2">
                    <button
                      className="text-left hover:underline flex-1 truncate"
                      onClick={() => navigate(`/projeto/${projeto.id}`)}
                    >
                      {projeto.nome}
                    </button>
                    {projeto.divisao && <Badge variant="secondary">{projeto.divisao}</Badge>}
                  </CardTitle>
                  <CardDescription>
                    {projeto.municipio ? `${projeto.municipio} – BA · ` : ''}
                    Atualizado em {new Date(projeto.atualizadoEm).toLocaleString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => navigate(`/projeto/${projeto.id}`)}>
                    <FileText className="w-4 h-4 mr-1" /> Abrir
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => duplicar(projeto.id)}>
                    <Copy className="w-4 h-4 mr-1" /> Duplicar
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => remover(projeto.id, projeto.nome)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
