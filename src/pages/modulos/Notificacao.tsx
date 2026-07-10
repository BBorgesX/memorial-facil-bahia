/**
 * Resposta a Notificação / Comunique-se — módulo novo do MVP.
 * Cole o texto da notificação do CBM e gere uma resposta técnica formal
 * (services/ai.ts — modo template no MVP, com ponto de extensão para IA).
 */

import { useState } from 'react';
import { Clipboard, FileDown, MailWarning, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SemProjetoAtivo } from '@/components/shell/SemProjetoAtivo';
import { gerarRespostaNotificacao } from '@/services/ai';
import { exportarPDF } from '@/services/pdf';
import { useApp } from '@/store/appStore';
import { useModulo } from './useModulo';

export default function Notificacao() {
  const { toast } = useToast();
  const { perfil } = useApp();
  const { projeto, resultado, atualizar, normas } = useModulo();
  const [gerando, setGerando] = useState(false);

  if (!projeto || !resultado) return <SemProjetoAtivo modulo="Resposta a Notificação" />;

  const classificacao = resultado.ocupacao
    ? `${resultado.ocupacao.divisao} · Altura Tipo ${resultado.altura?.tipo ?? '—'} · Risco ${resultado.carga?.nivel ?? '—'}`
    : '';

  const responsavel =
    projeto.respTecnicoNome || perfil.nome
      ? `${projeto.respTecnicoNome || perfil.nome}${perfil.titulo ? ` — ${perfil.titulo}` : ''}${
          (projeto.respTecnicoRegistro || perfil.registro) ? ` — CREA ${projeto.respTecnicoRegistro || perfil.registro}` : ''
        }`
      : '';

  const gerar = async () => {
    if (!projeto.notificacaoTexto.trim()) {
      toast({ title: 'Cole o texto da notificação primeiro.', variant: 'destructive' });
      return;
    }
    setGerando(true);
    try {
      const r = await gerarRespostaNotificacao(projeto.notificacaoTexto, {
        uf: projeto.uf,
        orgao: normas.orgao,
        legislacao: normas.legislacao,
        projeto: projeto.nome,
        municipio: projeto.municipio,
        classificacao,
        responsavel,
      });
      atualizar({ notificacaoResposta: r.texto });
      toast({
        title: r.origem === 'ia' ? 'Resposta gerada com IA' : 'Resposta gerada (modo template)',
        description:
          r.origem === 'template'
            ? 'Revise os trechos entre colchetes e complete as providências de cada item.'
            : undefined,
      });
    } finally {
      setGerando(false);
    }
  };

  const copiar = async () => {
    await navigator.clipboard.writeText(projeto.notificacaoResposta);
    toast({ title: 'Resposta copiada para a área de transferência' });
  };

  const exportar = () => {
    const ok = exportarPDF(
      `Resposta a notificação — ${projeto.nome}`,
      `<h1>Resposta à Notificação — ${normas.orgao}</h1>
       <pre>${projeto.notificacaoResposta.replace(/</g, '&lt;')}</pre>`,
    );
    if (!ok) toast({ title: 'Habilite pop-ups para exportar o PDF.', variant: 'destructive' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MailWarning className="w-6 h-6 text-primary" /> Resposta a Notificação / Comunique-se
        </h1>
        <p className="text-sm text-muted-foreground">
          Resposta técnica formal com citação das normas da UF ativa ({normas.orgao} ·{' '}
          {normas.legislacao}).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">1. Notificação recebida</CardTitle>
            <CardDescription>
              Cole abaixo o texto integral da notificação (comunique-se) do Corpo de Bombeiros.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={16}
              placeholder={'Ex.:\n1. Apresentar memorial de cálculo do sistema de hidrantes…\n2. Corrigir a distância máxima a percorrer no 2º pavimento…'}
              value={projeto.notificacaoTexto}
              onChange={(e) => atualizar({ notificacaoTexto: e.target.value })}
            />
            <Button onClick={gerar} disabled={gerando} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              {gerando ? 'Gerando…' : 'Gerar resposta técnica'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">2. Resposta gerada (editável)</CardTitle>
            <CardDescription>
              Revise e complete os trechos entre colchetes antes de protocolar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={16}
              placeholder="A resposta técnica aparecerá aqui…"
              value={projeto.notificacaoResposta}
              onChange={(e) => atualizar({ notificacaoResposta: e.target.value })}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={copiar}
                disabled={!projeto.notificacaoResposta}
              >
                <Clipboard className="w-4 h-4 mr-2" /> Copiar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={exportar}
                disabled={!projeto.notificacaoResposta}
              >
                <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
