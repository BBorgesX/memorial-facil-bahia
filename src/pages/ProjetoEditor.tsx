import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { carregarProjeto, DadosProjeto, exportarProjetoJSON, salvarProjeto } from '@/lib/projeto';
import { processarProjeto } from '@/lib/engine';
import { DadosGerais } from '@/components/editor/DadosGerais';
import { MedidasSeguranca } from '@/components/editor/MedidasSeguranca';
import { RiscosEspeciais } from '@/components/editor/RiscosEspeciais';
import { PainelResultados } from '@/components/editor/PainelResultados';
import { MemorialPreview } from '@/components/editor/MemorialPreview';

const ProjetoEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projeto, setProjeto] = useState<DadosProjeto | null>(() => (id ? carregarProjeto(id) : null));
  const [salvoEm, setSalvoEm] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Resultado técnico recalculado em tempo real a cada alteração
  const resultado = useMemo(() => (projeto ? processarProjeto(projeto) : null), [projeto]);

  const atualizar = useCallback((mudancas: Partial<DadosProjeto>) => {
    setProjeto((atual) => (atual ? { ...atual, ...mudancas } : atual));
  }, []);

  // Auto-save com debounce de 800 ms
  useEffect(() => {
    if (!projeto) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      salvarProjeto(projeto);
      setSalvoEm(new Date());
    }, 800);
    return () => clearTimeout(timerRef.current);
  }, [projeto]);

  if (!projeto || !resultado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Projeto não encontrado neste navegador.</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos projetos
        </Button>
      </div>
    );
  }

  const exportarJSON = () => {
    const blob = new Blob([exportarProjetoJSON(projeto)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projeto.nome.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const salvarAgora = () => {
    salvarProjeto(projeto);
    setSalvoEm(new Date());
    toast({ title: 'Projeto salvo' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Projetos
          </Button>
          <Input
            value={projeto.nome}
            onChange={(e) => atualizar({ nome: e.target.value })}
            className="max-w-xs font-semibold"
            aria-label="Nome do projeto"
          />
          {resultado.ocupacao && resultado.altura && (
            <div className="hidden md:flex gap-2">
              <Badge variant="secondary">{resultado.ocupacao.divisao}</Badge>
              <Badge variant="secondary">Tipo {resultado.altura.tipo}</Badge>
              {resultado.carga && <Badge variant="secondary">Risco {resultado.carga.nivel}</Badge>}
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {salvoEm ? `Salvo às ${salvoEm.toLocaleTimeString('pt-BR')}` : 'Salvamento automático ativo'}
            </span>
            <Button variant="outline" size="sm" onClick={exportarJSON}>
              <Download className="w-4 h-4 mr-1" /> JSON
            </Button>
            <Button size="sm" onClick={salvarAgora}>
              <Save className="w-4 h-4 mr-1" /> Salvar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="dados">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="dados">1. Dados e Classificação</TabsTrigger>
            <TabsTrigger value="medidas">2. Medidas de Segurança</TabsTrigger>
            <TabsTrigger value="riscos">3. Riscos Especiais</TabsTrigger>
            <TabsTrigger value="resultados">4. Cálculos</TabsTrigger>
            <TabsTrigger value="memorial">5. Memorial</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-6">
            <DadosGerais projeto={projeto} resultado={resultado} atualizar={atualizar} />
          </TabsContent>
          <TabsContent value="medidas" className="mt-6">
            <MedidasSeguranca projeto={projeto} resultado={resultado} atualizar={atualizar} />
          </TabsContent>
          <TabsContent value="riscos" className="mt-6">
            <RiscosEspeciais projeto={projeto} atualizar={atualizar} />
          </TabsContent>
          <TabsContent value="resultados" className="mt-6">
            <PainelResultados projeto={projeto} resultado={resultado} />
          </TabsContent>
          <TabsContent value="memorial" className="mt-6">
            <MemorialPreview projeto={projeto} resultado={resultado} atualizar={atualizar} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjetoEditor;
