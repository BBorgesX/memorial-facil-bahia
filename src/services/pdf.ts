/**
 * Exportação de documentos dos módulos (PDF via janela de impressão).
 * O memorial descritivo tem seu próprio gerador (src/lib/memorial.ts);
 * este helper atende os módulos novos (hidráulica, checklist, notificação).
 */

export const NOTA_RESPONSABILIDADE =
  'Documento gerado por ferramenta de apoio; a responsabilidade técnica e a conferência final são ' +
  'do engenheiro responsável conforme as ITs vigentes da UF.';

/** Abre a janela de impressão do navegador com o corpo HTML informado. */
export function exportarPDF(titulo: string, corpoHTML: string): boolean {
  const janela = window.open('', '_blank');
  if (!janela) return false;
  janela.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${titulo}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #1a1a1a; margin: 2cm; }
  h1 { font-size: 16pt; color: #7A1C1C; border-bottom: 2px solid #7A1C1C; padding-bottom: 6pt; }
  h2 { font-size: 13pt; color: #2E2E2E; margin-top: 16pt; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
  th, td { border: 1px solid #999; padding: 4pt 6pt; text-align: left; font-size: 11pt; }
  th { background: #f3f3f3; }
  pre { white-space: pre-wrap; font-family: inherit; }
  .nota { margin-top: 24pt; font-size: 9pt; color: #555; border-top: 1px solid #ccc; padding-top: 6pt; }
  @media print { body { margin: 0.5cm; } }
</style>
</head>
<body>
${corpoHTML}
<p class="nota">${NOTA_RESPONSABILIDADE}</p>
</body>
</html>`);
  janela.document.close();
  setTimeout(() => janela.print(), 400);
  return true;
}
