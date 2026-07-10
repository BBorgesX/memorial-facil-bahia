/**
 * Classificação & Enquadramento — o "cérebro" da plataforma.
 * Reaproveita o Classificador PPCI Bahia: a partir de uso, área, altura,
 * pavimentos e carga de incêndio, retorna a classificação e a Matriz de
 * Exigências (sistemas obrigatórios), com referências da UF ativa.
 */

import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { TABELA_1_OCUPACOES } from '@/lib/normas/ocupacoes';
import { nomeMedida } from '@/lib/engine';
import { referenciaMedidaUF } from '@/data/normas';
import { useModulo } from './useModulo';

export default function Classificacao() {
  const { projeto, resultado, atualizar, normas } = useModulo();

  if (!projeto || !resultado) return <SemProjetoAtivo modulo="Classificação & Enquadramento" />;

  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Classificação & Enquadramento
        </h1>
        <p className="text-sm text-muted-foreground">
          Classificação de ocupação/risco e Matriz de Exigências — {normas.orgaoNomeCompleto} (
          {normas.legislacao}).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados da edificação</CardTitle>
            <CardDescription>
              Alterações aqui são salvas no projeto ativo e alimentam todos os módulos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Ocupação/Uso (Tabela 1)</Label>
              <Select value={projeto.divisao} onValueChange={(v) => atualizar({ divisao: v, grupo: v.split('-')[0] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a divisão de ocupação…" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {TABELA_1_OCUPACOES.map((g) => (
                    <SelectGroup key={g.codigo}>
                      <SelectLabel>
                        {g.codigo} — {g.nome}
                      </SelectLabel>
                      {g.divisoes.map((d) => (
                        <SelectItem key={d.cod} value={d.cod}>
                          {d.cod} · {d.desc}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cl-areaExistente">Área existente (m²)</Label>
                <Input
                  id="cl-areaExistente"
                  type="number"
                  min={0}
                  value={projeto.areaExistente || ''}
                  onChange={(e) => atualizar({ areaExistente: num(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cl-areaConstruir">Área a construir (m²)</Label>
                <Input
                  id="cl-areaConstruir"
                  type="number"
                  min={0}
                  value={projeto.areaConstruir || ''}
                  onChange={(e) => atualizar({ areaConstruir: num(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cl-altura">Altura (m)</Label>
                <Input
                  id="cl-altura"
                  type="number"
                  min={0}
                  step="0.1"
                  value={projeto.alturaM || ''}
                  onChange={(e) => atualizar({ alturaM: num(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cl-pav">Nº de pavimentos</Label>
                <Input
                  id="cl-pav"
                  type="number"
                  min={1}
                  value={projeto.pavimentos || ''}
                  onChange={(e) => atualizar({ pavimentos: Math.max(1, num(e.target.value)) })}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="cl-carga">Carga de incêndio específica (MJ/m²)</Label>
                <Input
                  id="cl-carga"
                  type="number"
                  min={0}
                  value={projeto.cargaIncendioMJm2 || ''}
                  onChange={(e) => atualizar({ cargaIncendioMJm2: num(e.target.value) })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Subsolo, pavimentos detalhados e demais dados:{' '}
              <Link to={`/projeto/${projeto.id}`} className="underline">
                abrir o cadastro completo do projeto
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Classificação resultante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!resultado.ocupacao ? (
              <Alert>
                <AlertTitle>Aguardando dados</AlertTitle>
                <AlertDescription>
                  Selecione a ocupação e informe área e carga de incêndio para classificar.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge className="text-sm">
                    {resultado.ocupacao.divisao} · {resultado.ocupacao.descricao}
                  </Badge>
                  {resultado.altura && (
                    <Badge variant="secondary" className="text-sm">
                      Altura Tipo {resultado.altura.tipo} — {resultado.altura.descricao}
                    </Badge>
                  )}
                  {resultado.carga && (
                    <Badge variant="secondary" className="text-sm">
                      Risco {resultado.carga.nivel} ({resultado.carga.descricao})
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Grupo {resultado.ocupacao.grupoCodigo} — {resultado.ocupacao.grupoNome}. Área total
                  considerada: {resultado.areaTotal.toLocaleString('pt-BR')} m².
                </p>
                {resultado.erros.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTitle>Pendências de preenchimento</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4">
                        {resultado.erros.map((e) => (
                          <li key={e.campo}>{e.mensagem}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Matriz de Exigências — sistemas obrigatórios ({resultado.medidasExigidas.length})
          </CardTitle>
          <CardDescription>
            Referências normativas da UF ativa ({normas.orgao}). Esta matriz alimenta o Checklist CBM
            e os memoriais automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resultado.medidasExigidas.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Preencha os dados da edificação para gerar a matriz de exigências.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medida de segurança</TableHead>
                    <TableHead>Referência ({normas.orgao})</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.medidasExigidas.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{nomeMedida(m.id)}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {referenciaMedidaUF(projeto.uf, m.id) || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.nota ?? ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {resultado.exigenciasSubsolo.length > 0 && (
            <div className="mt-4 rounded-md border bg-muted/40 p-3">
              <p className="text-sm font-medium mb-1">Exigências adicionais do subsolo (Tabela 7):</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {resultado.exigenciasSubsolo.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/checklist">
                Gerar Checklist CBM <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={normas.linkITs} target="_blank" rel="noreferrer">
                ITs do {normas.orgao} <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
