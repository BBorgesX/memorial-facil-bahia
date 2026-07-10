/**
 * Checklist de Aprovação CBM (anti-comunique-se) — módulo novo do MVP.
 * Gerado dinamicamente pela Matriz de Exigências do Classificador, por UF e
 * ocupação, com progresso e status final de prontidão para protocolo.
 */

import { FileDown, ListChecks, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { nomeMedida } from '@/lib/engine';
import { referenciaMedidaUF } from '@/data/normas';
import { exportarPDF } from '@/services/pdf';
import { useModulo } from './useModulo';

/** Itens documentais fixos do protocolo, além dos sistemas da matriz. */
const ITENS_DOCUMENTAIS: { id: string; nome: string; referencia: string }[] = [
  { id: 'doc_art', nome: 'ART/RRT de projeto recolhida e assinada', referencia: 'CREA/CAU' },
  { id: 'doc_memorial', nome: 'Memorial descritivo revisado e assinado', referencia: 'Legislação da UF' },
  { id: 'doc_plantas', nome: 'Plantas com leiaute dos sistemas e rotas de fuga', referencia: 'ITs da UF' },
  { id: 'doc_dados', nome: 'Dados cadastrais (proprietário, endereço, CNPJ) conferidos', referencia: '—' },
];

export default function Checklist() {
  const { toast } = useToast();
  const { projeto, resultado, atualizar, normas } = useModulo();

  if (!projeto || !resultado) return <SemProjetoAtivo modulo="Checklist CBM" />;

  if (!resultado.ocupacao) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert>
          <AlertTitle>Classifique o projeto primeiro</AlertTitle>
          <AlertDescription>
            O checklist é gerado a partir da Matriz de Exigências. Preencha o módulo Classificação &
            Enquadramento.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const itensSistemas = resultado.medidasExigidas.map((m) => ({
    id: m.id,
    nome: nomeMedida(m.id),
    referencia: referenciaMedidaUF(projeto.uf, m.id) || '—',
    nota: m.nota,
  }));
  const todos = [...itensSistemas, ...ITENS_DOCUMENTAIS.map((d) => ({ ...d, nota: undefined }))];

  const marcados = todos.filter((i) => projeto.checklistMarcado[i.id]).length;
  const progresso = todos.length > 0 ? Math.round((marcados / todos.length) * 100) : 0;

  const statusFinal =
    progresso === 100
      ? { rotulo: '✅ Pronto para protocolo', cor: 'bg-emerald-600 hover:bg-emerald-600' }
      : progresso >= 60
        ? { rotulo: '⚠️ Revisar', cor: 'bg-amber-500 hover:bg-amber-500' }
        : { rotulo: '❌ Incompleto', cor: 'bg-red-600 hover:bg-red-600' };

  const alternar = (id: string, valor: boolean) => {
    atualizar({ checklistMarcado: { ...projeto.checklistMarcado, [id]: valor } });
  };

  const exportar = () => {
    const linhas = todos
      .map(
        (i) =>
          `<tr><td>${projeto.checklistMarcado[i.id] ? '☑' : '☐'}</td><td>${i.nome}</td><td>${i.referencia}</td></tr>`,
      )
      .join('');
    const ok = exportarPDF(
      `Checklist CBM — ${projeto.nome}`,
      `<h1>Checklist de Aprovação — ${normas.orgao}</h1>
       <p><strong>Projeto:</strong> ${projeto.nome} · ${resultado.ocupacao?.divisao} · UF ${projeto.uf}</p>
       <p><strong>Progresso:</strong> ${progresso}% (${marcados}/${todos.length}) — ${statusFinal.rotulo.replace(/^[^ ]+ /, '')}</p>
       <table><tr><th></th><th>Item</th><th>Referência (${normas.orgao})</th></tr>${linhas}</table>`,
    );
    if (!ok) toast({ title: 'Habilite pop-ups para exportar o PDF.', variant: 'destructive' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-primary" /> Checklist de Aprovação CBM
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerado pela Matriz de Exigências — ocupação {resultado.ocupacao.divisao} · {normas.orgao}. O
          objetivo: protocolar sem comunique-se.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex flex-wrap items-center justify-between gap-2">
            <span>
              Progresso: {marcados}/{todos.length} itens
            </span>
            <Badge className={statusFinal.cor}>{statusFinal.rotulo}</Badge>
          </CardTitle>
          <Progress value={progresso} className="h-2.5" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2">
              Sistemas e medidas exigidos ({itensSistemas.length})
            </p>
            <div className="space-y-1.5">
              {itensSistemas.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border p-3 hover:bg-muted/40 cursor-pointer"
                >
                  <Checkbox
                    checked={!!projeto.checklistMarcado[item.id]}
                    onCheckedChange={(v) => alternar(item.id, v === true)}
                    className="mt-0.5"
                  />
                  <span className="flex-1">
                    <span className="text-sm font-medium block">{item.nome}</span>
                    {item.nota && (
                      <span className="text-xs text-muted-foreground block">{item.nota}</span>
                    )}
                  </span>
                  <Badge variant="outline" className="shrink-0 text-[11px] whitespace-nowrap">
                    {item.referencia}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Documentação do protocolo</p>
            <div className="space-y-1.5">
              {ITENS_DOCUMENTAIS.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border p-3 hover:bg-muted/40 cursor-pointer"
                >
                  <Checkbox
                    checked={!!projeto.checklistMarcado[item.id]}
                    onCheckedChange={(v) => alternar(item.id, v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm font-medium flex-1">{item.nome}</span>
                  <Badge variant="outline" className="shrink-0 text-[11px]">
                    {item.referencia}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={exportar}>
              <FileDown className="w-4 h-4 mr-1" /> Exportar PDF
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                atualizar({ checklistMarcado: {} });
                toast({ title: 'Checklist reiniciado' });
              }}
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
