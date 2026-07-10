/**
 * Hook comum dos módulos: expõe o projeto ativo, o resultado técnico
 * recalculado em tempo real e a camada de normas da UF ativa.
 */

import { useMemo } from 'react';
import { processarProjeto, ResultadoTecnico } from '@/lib/engine';
import type { DadosProjeto } from '@/lib/projeto';
import { useApp } from '@/store/appStore';
import type { ConfigUF } from '@/data/normas';

export interface ContextoModulo {
  projeto: DadosProjeto | null;
  resultado: ResultadoTecnico | null;
  atualizar: (mudancas: Partial<DadosProjeto>) => void;
  normas: ConfigUF;
}

export function useModulo(): ContextoModulo {
  const { projetoAtivo, atualizarProjetoAtivo, normas } = useApp();
  const resultado = useMemo(
    () => (projetoAtivo ? processarProjeto(projetoAtivo) : null),
    [projetoAtivo],
  );
  return { projeto: projetoAtivo, resultado, atualizar: atualizarProjetoAtivo, normas };
}
