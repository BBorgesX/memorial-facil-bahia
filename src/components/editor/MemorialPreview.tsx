import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, FileDown, FileText, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DadosProjeto } from '@/lib/projeto';
import { ResultadoTecnico } from '@/lib/engine';
import { documentoCompleto, exportarPDF, exportarWord } from '@/lib/memorial';

interface Props {
  projeto: DadosProjeto;
  resultado: ResultadoTecnico;
  atualizar: (mudancas: Partial<DadosProjeto>) => void;
}

export const MemorialPreview = ({ projeto, resultado, atualizar }: Props) => {
  const { toast } = useToast();
  const pronto = resultado.valido && !!resultado.ocupacao;
  const html = useMemo(
    () => (resultado.ocupacao ? documentoCompleto(projeto, resultado) : ''),
    [projeto, resultado],
  );

  if (!resultado.ocupacao) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Memorial indisponível</AlertTitle>
        <AlertDescription>
          Preencha a classificação de ocupação e as áreas na aba 1 para gerar o memorial descritivo.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Geração do Memorial Descritivo
          </CardTitle>
          <CardDescription>
            O memorial é montado automaticamente com a classificação, as medidas aplicáveis e os cálculos das ITs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!resultado.valido && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Pendências de validação</AlertTitle>
              <AlertDescription>
                <ul className="list-disc ml-4">
                  {resultado.erros.map((e) => <li key={e.campo}>{e.mensagem}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Checkbox
              id="termo"
              checked={projeto.termoAceito}
              onCheckedChange={(c) => atualizar({ termoAceito: !!c })}
              className="mt-1"
            />
            <div>
              <Label htmlFor="termo" className="font-medium">Termo de Ciência e Responsabilidade</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Declaro que as informações prestadas são verdadeiras e estou ciente de que o Corpo de Bombeiros
                Militar da Bahia pode, a qualquer tempo, proceder à verificação, inclusive por meio de fiscalizações e
                solicitação de documentos adicionais, nos termos da legislação estadual vigente.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={!pronto || !projeto.termoAceito}
              onClick={() => {
                if (!exportarPDF(projeto, resultado)) {
                  toast({
                    title: 'Bloqueio de pop-up',
                    description: 'Permita pop-ups para gerar o PDF (impressão).',
                    variant: 'destructive',
                  });
                }
              }}
            >
              <Printer className="w-4 h-4 mr-2" /> Gerar PDF (imprimir)
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={!pronto || !projeto.termoAceito}
              onClick={() => {
                exportarWord(projeto, resultado);
                toast({ title: 'Memorial exportado', description: 'Documento Word (.doc) gerado.' });
              }}
            >
              <FileDown className="w-4 h-4 mr-2" /> Exportar Word (.doc)
            </Button>
          </div>
          {!projeto.termoAceito && (
            <p className="text-xs text-muted-foreground">Aceite o termo acima para habilitar a exportação.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <iframe
            title="Pré-visualização do memorial"
            srcDoc={html}
            className="w-full h-[75vh] border rounded-lg bg-white"
          />
        </CardContent>
      </Card>
    </div>
  );
};
