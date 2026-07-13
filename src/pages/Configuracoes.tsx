/**
 * Configurações — UF padrão e dados do responsável técnico (CREA/RRT),
 * injetados automaticamente em memoriais, checklists e respostas.
 */

import { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/store/appStore';
import type { UFProjeto } from '@/lib/projeto';

export default function Configuracoes() {
  const { toast } = useToast();
  const { usuario, perfil, salvarPerfil } = useApp();
  const [rascunho, setRascunho] = useState(perfil);

  useEffect(() => setRascunho(perfil), [perfil]);

  const set = <K extends keyof typeof rascunho>(chave: K, valor: (typeof rascunho)[K]) =>
    setRascunho((r) => ({ ...r, [chave]: valor }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Conta: {usuario?.email}. Os dados do responsável técnico são injetados automaticamente nos
          novos projetos, memoriais e respostas.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Responsável técnico</CardTitle>
          <CardDescription>Nome, título profissional, registro e contato.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cfg-nome">Nome completo</Label>
            <Input
              id="cfg-nome"
              value={rascunho.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder="Ex.: Maria Souza"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cfg-titulo">Título profissional</Label>
            <Input
              id="cfg-titulo"
              value={rascunho.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              placeholder="Ex.: Engenheira Civil"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cfg-registro">Registro CREA / RRT</Label>
            <Input
              id="cfg-registro"
              value={rascunho.registro}
              onChange={(e) => set('registro', e.target.value)}
              placeholder="Ex.: CREA-BA 000000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cfg-contato">Contato profissional</Label>
            <Input
              id="cfg-contato"
              value={rascunho.contato}
              onChange={(e) => set('contato', e.target.value)}
              placeholder="Telefone / e-mail"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preferências</CardTitle>
          <CardDescription>UF padrão aplicada aos novos projetos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-1.5">
            <Label>UF padrão</Label>
            <Select value={rascunho.ufPadrao} onValueChange={(v) => set('ufPadrao', v as UFProjeto)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BA">BA — CBMBA (lógica validada)</SelectItem>
                <SelectItem value="SP">SP — CBMSP (em validação)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => {
          salvarPerfil(rascunho);
          toast({ title: 'Configurações salvas' });
        }}
      >
        <Save className="w-4 h-4 mr-2" /> Salvar configurações
      </Button>
    </div>
  );
}
