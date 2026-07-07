import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { DadosProjeto } from '@/lib/projeto';
import { RISCOS_ESPECIAIS } from '@/lib/normas/exigencias';

interface Props {
  projeto: DadosProjeto;
  atualizar: (mudancas: Partial<DadosProjeto>) => void;
}

export const RiscosEspeciais = ({ projeto, atualizar }: Props) => {
  const alterar = (id: string, campo: 'aplicavel' | 'detalhes', valor: boolean | string) => {
    const atual = projeto.riscosEspeciais[id] ?? { aplicavel: false, detalhes: '' };
    atualizar({
      riscosEspeciais: {
        ...projeto.riscosEspeciais,
        [id]: { ...atual, [campo]: valor },
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Riscos Especiais
          </CardTitle>
          <CardDescription>
            Selecione os riscos especiais presentes na edificação — cada um gera uma seção específica no memorial,
            com referência à IT correspondente do CBMBA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {RISCOS_ESPECIAIS.map((risco) => {
            const dados = projeto.riscosEspeciais[risco.id];
            return (
              <div key={risco.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={risco.id}
                    checked={dados?.aplicavel ?? false}
                    onCheckedChange={(c) => alterar(risco.id, 'aplicavel', !!c)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label htmlFor={risco.id} className="font-medium">{risco.nome}</Label>
                      <Badge variant="outline" className="text-xs">{risco.referencia}</Badge>
                    </div>
                  </div>
                </div>
                {dados?.aplicavel && (
                  <Textarea
                    value={dados.detalhes}
                    onChange={(e) => alterar(risco.id, 'detalhes', e.target.value)}
                    placeholder="Descreva como este risco será gerenciado (capacidades, quantidades, localização...)"
                    rows={3}
                    className="ml-7 text-sm"
                  />
                )}
              </div>
            );
          })}

          <div className="p-4 border rounded-lg space-y-2">
            <Label className="font-medium">Outros riscos (especificar)</Label>
            <Textarea
              value={projeto.riscosEspeciais['outros']?.detalhes ?? ''}
              onChange={(e) => alterar('outros', 'detalhes', e.target.value)}
              placeholder="Descreva outros riscos especiais não listados acima..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
