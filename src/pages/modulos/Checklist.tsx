/**
 * Checklist de Aprovação CBM (anti-comunique-se).
 * Seções geradas pela Matriz de Exigências do Classificador; cada seção traz
 * subitens técnicos de conferência com os valores calculados do projeto
 * (src/lib/checklist.ts) e a referência normativa da UF ativa.
 */

import { FileDown, ListChecks, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { gerarChecklist } from '@/lib/checklist';
import { exportarPDF } from '@/services/pdf';
import { useModulo } from './useModulo';

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

  const secoes = gerarChecklist(resultado, projeto);
  const todosSubitens = secoes.flatMap((s) => s.subitens);
  const marcados = todosSubitens.filter((i) => projeto.checklistMarcado[i.id]).length;
  const progresso = todosSubitens.length > 0 ? Math.round((marcados / todosSubitens.length) * 100) : 0;

  const statusFinal =
    progresso === 100
      ? { rotulo: '✅ Pronto para protocolo', cor: 'bg-emerald-600 hover:bg-emerald-600' }
      : progresso >= 60
        ? { rotulo: '⚠️ Revisar', cor: 'bg-amber-500 hover:bg-amber-500' }
        : { rotulo: '❌ Incompleto', cor: 'bg-red-600 hover:bg-red-600' };

  const alternar = (id: string, valor: boolean) =>
    atualizar({ checklistMarcado: { ...projeto.checklistMarcado, [id]: valor } });

  const marcarSecao = (idsSecao: string[], valor: boolean) => {
    const novo = { ...projeto.checklistMarcado };
    idsSecao.forEach((id) => (novo[id] = valor));
    atualizar({ checklistMarcado: novo });
  };

  const exportar = () => {
    const blocos = secoes
      .map((s) => {
        const linhas = s.subitens
          .map(
            (i) =>
              `<tr><td>${projeto.checklistMarcado[i.id] ? '☑' : '☐'}</td><td>${i.texto}${i.detalhe ? `<br/><em>${i.detalhe}</em>` : ''}</td></tr>`,
          )
          .join('');
        return `<h2>${s.titulo} <small>(${s.referencia})</small></h2>
                ${s.nota ? `<p><em>${s.nota}</em></p>` : ''}
                <table><tr><th style="width:28px"></th><th>Item de conferência</th></tr>${linhas}</table>`;
      })
      .join('');
    const ok = exportarPDF(
      `Checklist CBM — ${projeto.nome}`,
      `<h1>Checklist de Aprovação — ${normas.orgao}</h1>
       <p><strong>Projeto:</strong> ${projeto.nome} · ${resultado.ocupacao?.divisao} · UF ${projeto.uf} · ${normas.legislacao}</p>
       <p><strong>Progresso:</strong> ${progresso}% (${marcados}/${todosSubitens.length} itens) — ${statusFinal.rotulo.replace(/^[^ ]+ /, '')}</p>
       ${blocos}`,
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
          Gerado pela Matriz de Exigências — ocupação {resultado.ocupacao.divisao} · {normas.orgao}.
          Subitens citam os valores calculados do projeto; o objetivo é protocolar sem comunique-se.
        </p>
      </div>

      <Card className="sticky top-[60px] z-10 shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex flex-wrap items-center justify-between gap-2">
            <span>
              Progresso: {marcados}/{todosSubitens.length} itens ({progresso}%)
            </span>
            <span className="flex items-center gap-2">
              <Badge className={statusFinal.cor}>{statusFinal.rotulo}</Badge>
              <Button size="sm" variant="outline" onClick={exportar}>
                <FileDown className="w-4 h-4 mr-1" /> PDF
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  atualizar({ checklistMarcado: {} });
                  toast({ title: 'Checklist reiniciado' });
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </span>
          </CardTitle>
          <Progress value={progresso} className="h-2.5" />
        </CardHeader>
      </Card>

      {secoes.map((secao) => {
        const ids = secao.subitens.map((i) => i.id);
        const feitos = ids.filter((id) => projeto.checklistMarcado[id]).length;
        const completa = feitos === ids.length;
        return (
          <Card key={secao.id} className={completa ? 'border-emerald-300' : undefined}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex flex-wrap items-center gap-2">
                <Checkbox
                  checked={completa}
                  onCheckedChange={(v) => marcarSecao(ids, v === true)}
                  aria-label={`Marcar toda a seção ${secao.titulo}`}
                />
                <span className="flex-1">
                  {secao.titulo}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {feitos}/{ids.length}
                  </span>
                </span>
                <Badge variant="outline" className="text-[11px] whitespace-nowrap">
                  {secao.referencia}
                </Badge>
              </CardTitle>
              {secao.nota && <p className="text-xs text-muted-foreground pl-7">{secao.nota}</p>}
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              {secao.subitens.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border p-2.5 hover:bg-muted/40 cursor-pointer"
                >
                  <Checkbox
                    checked={!!projeto.checklistMarcado[item.id]}
                    onCheckedChange={(v) => alternar(item.id, v === true)}
                    className="mt-0.5"
                  />
                  <span className="flex-1">
                    <span className="text-sm block">{item.texto}</span>
                    {item.detalhe && (
                      <span className="text-xs text-primary/90 font-medium block mt-0.5">
                        {item.detalhe}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
