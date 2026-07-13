import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Flame,
  History,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  STATUS_INFO,
  SnapshotPortal,
  decodificarSnapshot,
  formatarData,
  gerarSnapshotPortal,
  projetoPorToken,
  situacaoAvcb,
  statusEfetivo,
} from '@/lib/gestao';
import { supabase } from '@/lib/supabase';
import { StatusBadge } from '@/components/shell/StatusBadge';

/**
 * Página pública, somente leitura, para o cliente acompanhar o andamento do
 * projeto. A visão ao vivo vem da nuvem pelo token do link; se não houver
 * conexão (ou as tabelas ainda não existirem), cai no retrato codificado no
 * próprio link e, por fim, nos dados locais deste navegador.
 */
const PortalCliente = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const codigoSnapshot = searchParams.get('d');
  const [snapshot, setSnapshot] = useState<SnapshotPortal | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      let resultado: SnapshotPortal | null = null;
      if (token) {
        // 1) Visão ao vivo pela nuvem (funciona em qualquer dispositivo)
        try {
          const { data } = await supabase.rpc('portal_projeto', { token_busca: token });
          if (data) {
            const bruto = data as SnapshotPortal;
            resultado = { ...bruto, status: statusEfetivo(bruto) };
          }
        } catch {
          // sem conexão ou função ainda não criada — usa os fallbacks abaixo
        }
        // 2) Dados locais deste navegador (máquina do responsável)
        if (!resultado) {
          const projeto = projetoPorToken(token);
          if (projeto) resultado = gerarSnapshotPortal(projeto);
        }
      }
      // 3) Retrato embutido no link (parâmetro ?d=)
      if (!resultado && codigoSnapshot) {
        resultado = decodificarSnapshot(codigoSnapshot);
      }
      if (ativo) {
        setSnapshot(resultado);
        setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [token, codigoSnapshot]);

  if (carregando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle className="w-8 h-8 animate-spin" />
        <p className="text-sm">Carregando andamento do projeto…</p>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <Flame className="w-10 h-10 text-primary" />
        <h1 className="text-xl font-bold">Acompanhamento de projeto</h1>
        <p className="text-muted-foreground max-w-md">
          Link inválido ou expirado. Solicite um novo link de acompanhamento ao responsável técnico
          pelo seu projeto.
        </p>
      </div>
    );
  }

  const avcb = situacaoAvcb(snapshot.avcbValidade);
  const pendentes = snapshot.exigencias.filter((e) => !e.resolvida);
  const resolvidas = snapshot.exigencias.filter((e) => e.resolvida);
  const historico = [...snapshot.historico].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-professional text-white">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <p className="text-white/80 text-sm flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4" /> Acompanhamento do projeto de segurança contra incêndio
          </p>
          <h1 className="text-2xl md:text-3xl font-bold">{snapshot.nome}</h1>
          <p className="text-white/85 mt-1">
            {snapshot.empresa || snapshot.municipio
              ? [snapshot.empresa, snapshot.municipio].filter(Boolean).join(' · ')
              : ''}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Situação atual */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between gap-3">
              Situação atual
              <StatusBadge status={snapshot.status} />
            </CardTitle>
            <CardDescription>{STATUS_INFO[snapshot.status].descricao}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Protocolo CBM</p>
              <p className="font-medium">{snapshot.protocoloCBMBA || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data do protocolo</p>
              <p className="font-medium">{formatarData(snapshot.dataProtocolo)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Responsável técnico</p>
              <p className="font-medium">{snapshot.respTecnicoNome || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Atualizado em</p>
              <p className="font-medium">
                {new Date(snapshot.geradoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AVCB */}
        {(snapshot.avcbNumero || snapshot.avcbValidade) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> AVCB
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Número</p>
                  <p className="font-medium">{snapshot.avcbNumero || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emissão</p>
                  <p className="font-medium">{formatarData(snapshot.avcbEmissao)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Validade</p>
                  <p className="font-medium">{formatarData(snapshot.avcbValidade)}</p>
                </div>
              </div>
              {(avcb.nivel === 'vencido' || avcb.nivel === 'critico' || avcb.nivel === 'atencao') && (
                <Alert variant={avcb.nivel === 'vencido' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{avcb.rotulo}</AlertTitle>
                  <AlertDescription>
                    Entre em contato com o responsável técnico para programar a renovação.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Exigências */}
        {snapshot.exigencias.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" /> Exigências do Corpo de Bombeiros
              </CardTitle>
              <CardDescription>
                {pendentes.length === 0
                  ? 'Todas as exigências foram atendidas.'
                  : `${pendentes.length} exigência(s) em atendimento.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendentes.map((e, i) => (
                <div key={`p${i}`} className="flex items-start gap-2 text-sm rounded-md border p-3">
                  <Circle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                  <div>
                    <p>{e.descricao}</p>
                    {e.prazo && <p className="text-xs text-muted-foreground">Prazo: {formatarData(e.prazo)}</p>}
                  </div>
                </div>
              ))}
              {resolvidas.map((e, i) => (
                <div key={`r${i}`} className="flex items-start gap-2 text-sm rounded-md border p-3 opacity-70">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                  <p className="line-through">{e.descricao}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Histórico */}
        {historico.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" /> Linha do tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {historico.map((h, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {new Date(h.data).toLocaleDateString('pt-BR')}
                    </span>
                    <span>{h.descricao}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pb-8">
          Página gerada pelo Memorial Fácil Bahia — acompanhamento informativo, sem valor documental.
        </p>
      </main>
    </div>
  );
};

export default PortalCliente;
