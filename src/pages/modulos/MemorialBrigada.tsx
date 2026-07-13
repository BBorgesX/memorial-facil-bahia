/**
 * Memorial de Brigada de Incêndio (IT 17/NBR 14276) — módulo nativo,
 * vinculado aos dados da aba "1. Dados e Classificação" do projeto ativo:
 * ocupação/divisão, nível de risco e população alimentam o dimensionamento
 * e o documento automaticamente, na mesma interface do restante do app.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  FileDown,
  Flame,
  GraduationCap,
  Pencil,
  Printer,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import {
  exportarBrigadaPDF,
  exportarBrigadaWord,
  gerarMemorialBrigadaHTML,
} from '@/lib/memorialBrigada';
import { useModulo } from './useModulo';

export default function MemorialBrigada() {
  const { projeto, resultado, atualizar, normas } = useModulo();
  const { toast } = useToast();

  const corpo = useMemo(
    () => (projeto && resultado ? gerarMemorialBrigadaHTML(projeto, resultado) : ''),
    [projeto, resultado],
  );

  if (!projeto || !resultado) return <SemProjetoAtivo modulo="Memorial de Brigada de Incêndio" />;

  const brigada = resultado.brigada;
  const ocupacao = resultado.ocupacao;
  const turnos = Math.max(1, projeto.brigadaTurnos || 1);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" /> Memorial de Brigada de Incêndio
          </h1>
          <p className="text-sm text-muted-foreground">
            IT 17 / NBR 14276 · {normas.orgao} — dimensionado automaticamente pelos dados do
            projeto <strong>{projeto.nome}</strong>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!brigada}
            onClick={() => {
              if (!exportarBrigadaPDF(projeto, resultado)) {
                toast({
                  title: 'Bloqueado pelo navegador',
                  description: 'Permita pop-ups para gerar o PDF.',
                  variant: 'destructive',
                });
              }
            }}
          >
            <Printer className="w-4 h-4 mr-1" /> Imprimir / PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!brigada}
            onClick={() => exportarBrigadaWord(projeto, resultado)}
          >
            <FileDown className="w-4 h-4 mr-1" /> Word
          </Button>
        </div>
      </div>

      {!ocupacao || !brigada ? (
        <Alert>
          <ClipboardList className="h-4 w-4" />
          <AlertTitle>Complete a classificação do projeto</AlertTitle>
          <AlertDescription>
            O dimensionamento da brigada depende da ocupação, da carga de incêndio e da
            população definidas na aba{' '}
            <Link to={`/projeto/${projeto.id}?aba=dados`} className="text-primary underline">
              1. Dados e Classificação
            </Link>{' '}
            do projeto ativo.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Dados vindos da aba 1 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2 text-lg">
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" /> Dados do projeto (aba 1)
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/projeto/${projeto.id}?aba=dados`}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar na aba 1
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>
                Estes valores alimentam o dimensionamento — para alterá-los, edite a classificação
                do projeto.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Ocupação</p>
                <p className="font-medium">
                  {ocupacao.divisao} — {ocupacao.descricao}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Nível de risco</p>
                <p className="font-medium">{resultado.carga?.nivel ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">População fixa adotada</p>
                <p className="font-medium">
                  {(resultado.saidas?.populacaoAdotada ?? projeto.ocupantes).toLocaleString('pt-BR')}{' '}
                  pessoa(s)
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Pavimentos</p>
                <p className="font-medium">{projeto.pavimentos}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dimensionamento */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" /> Dimensionamento (Tabela A.1)
                </CardTitle>
                <CardDescription>Composição mínima por população fixa e nível de risco.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg border p-3">
                    <p className="text-3xl font-bold text-primary">{brigada.quantidadeMinima}</p>
                    <p className="text-xs text-muted-foreground">brigadistas por turno</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-3xl font-bold">{turnos}</p>
                    <p className="text-xs text-muted-foreground">turno(s) de trabalho</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-3xl font-bold text-primary">
                      {brigada.quantidadeMinima * turnos}
                    </p>
                    <p className="text-xs text-muted-foreground">total na edificação</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-sm">
                    Treinamento nível <strong>{brigada.nivelTreinamento}</strong> —{' '}
                    {brigada.cargaHoraria}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{brigada.composicao}</p>
              </CardContent>
            </Card>

            {/* Dados complementares do memorial */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dados complementares</CardTitle>
                <CardDescription>
                  Salvos no projeto e incluídos no documento automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="brigadaTurnos">Turnos de trabalho</Label>
                    <Input
                      id="brigadaTurnos"
                      type="number"
                      min={1}
                      max={4}
                      value={projeto.brigadaTurnos || 1}
                      onChange={(e) =>
                        atualizar({ brigadaTurnos: Math.max(1, Number(e.target.value) || 1) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="brigadaCoordenador">Coordenador geral</Label>
                    <Input
                      id="brigadaCoordenador"
                      value={projeto.brigadaCoordenador}
                      placeholder="Nome (opcional)"
                      onChange={(e) => atualizar({ brigadaCoordenador: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="brigadaObservacoes">Observações complementares</Label>
                  <Textarea
                    id="brigadaObservacoes"
                    rows={3}
                    value={projeto.brigadaObservacoes}
                    placeholder="Particularidades da edificação, setores especiais, PCD, etc."
                    onChange={(e) => atualizar({ brigadaObservacoes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prévia do documento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Prévia do memorial</CardTitle>
              <CardDescription>
                Documento no mesmo padrão visual do Memorial Descritivo — atualiza em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-md border bg-white p-6 text-sm leading-relaxed [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-0.5 [&_table]:w-full [&_table]:my-3 [&_table]:border-collapse [&_th]:text-left [&_th]:bg-muted [&_th]:p-1.5 [&_th]:border [&_td]:p-1.5 [&_td]:border [&_.assinatura]:mt-10 [&_.assinatura]:text-center"
                dangerouslySetInnerHTML={{ __html: corpo }}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
