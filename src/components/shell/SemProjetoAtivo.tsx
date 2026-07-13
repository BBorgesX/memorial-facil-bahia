/**
 * Estado vazio exibido pelos módulos quando não há projeto ativo selecionado.
 */

import { useNavigate } from 'react-router-dom';
import { FilePlus2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/store/appStore';

export function SemProjetoAtivo({ modulo }: { modulo: string }) {
  const navigate = useNavigate();
  const { criarProjeto } = useApp();

  return (
    <Card className="border-dashed max-w-2xl mx-auto mt-8">
      <CardContent className="py-14 text-center text-muted-foreground">
        <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p className="font-medium mb-1 text-foreground">Nenhum projeto ativo</p>
        <p className="text-sm mb-6">
          O módulo <strong>{modulo}</strong> lê os dados do projeto ativo. Selecione um projeto na
          barra superior ou crie um novo — os dados são digitados uma única vez e alimentam todos os
          módulos.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => navigate('/projetos')}>
            <FolderOpen className="w-4 h-4 mr-2" /> Meus projetos
          </Button>
          <Button
            onClick={() => {
              const p = criarProjeto();
              navigate(`/projeto/${p.id}`);
            }}
          >
            <FilePlus2 className="w-4 h-4 mr-2" /> Novo projeto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
