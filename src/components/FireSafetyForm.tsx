import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/fire-safety-hero.jpg';

interface FormData {
  // Identificação
  empresa: string;
  cnpj: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  cep: string;
  status: string;
  areaExistente: string;
  areaConstruir: string;
  altura: string;
  pavimentos: string;
  subsolo: string;
  uso: string;
  classificacaoAltura: string;
  cargaIncendio: string;
  risco: string;
  ocupantes: string;
  apresentacao: string;
  
  // Medidas de segurança
  medidas: { [key: string]: { aplicavel: boolean; detalhes: string } };
  
  // Acesso de viaturas
  textoAcessoViaturas: string;
  portaoAplicavel: boolean;
  portaoLargura: string;
  portaoAltura: string;
  
  // Iluminação de emergência
  iluminacaoSistemasCentralizados: boolean;
  
  // Riscos especiais
  riscosEspeciais: { [key: string]: { aplicavel: boolean; detalhes: string } };
  
  // Termo
  termoAceito: boolean;
}

const medidasSeguranca = [
  { id: 'acesso_viatura', nome: 'Acesso de Viatura do Corpo de Bombeiros', referencia: 'IT 06/2016' },
  { id: 'separacao_edificacoes', nome: 'Separação entre Edificações (Isolamento de Risco)', referencia: 'IT 07/2016' },
  { id: 'seguranca_estrutural', nome: 'Segurança Estrutural nas Edificações', referencia: 'IT 08/2016' },
  { id: 'compartimentacao_horizontal', nome: 'Compartimentação Horizontal', referencia: 'IT 09/2022' },
  { id: 'compartimentacao_vertical', nome: 'Compartimentação Vertical', referencia: 'IT 09/2022' },
  { id: 'controle_materiais', nome: 'Controle de Materiais de Acabamento', referencia: 'IT 10/2016' },
  { id: 'saidas_emergencia', nome: 'Saídas de Emergência', referencia: 'IT 11/2016, IT 12/2016' },
  { id: 'elevador_emergencia', nome: 'Elevador de Emergência', referencia: 'IT 11/2016' },
  { id: 'brigada_incendio', nome: 'Brigada de Incêndio', referencia: 'IT 17/2016' },
  { id: 'plano_emergencia', nome: 'Plano de Emergência Contra Incêndio e Pânico', referencia: 'IT 16/2018' },
  { id: 'iluminacao_emergencia', nome: 'Iluminação de Emergência', referencia: 'IT 18/2017' },
  { id: 'deteccao_incendio', nome: 'Detecção de Incêndio', referencia: 'IT 19/2017' },
  { id: 'alarme_incendio', nome: 'Alarme de Incêndio', referencia: 'IT 19/2017' },
  { id: 'sinalizacao_emergencia', nome: 'Sinalização de Emergência', referencia: 'IT 20/2017' },
  { id: 'extintores', nome: 'Extintores de Incêndio', referencia: 'IT 21/2017' },
  { id: 'hidrantes', nome: 'Sistemas de Hidrantes e Mangotinhos', referencia: 'IT 22/2016' },
  { id: 'chuveiros_automaticos', nome: 'Sistemas de Chuveiros Automáticos', referencia: 'IT 23/2018, IT 24/2020' },
  { id: 'controle_fumaca', nome: 'Controle de Fumaça', referencia: 'IT 01/2016, IT 43/2016' },
  { id: 'spda', nome: 'Sistema de Proteção Contra Descargas Atmosféricas (SPDA)', referencia: 'IT 41/2018, IT 13/2022' }
];

const riscosEspeciais = [
  { id: 'liquidos_inflamaveis', nome: 'Armazenamento ou manipulação de líquidos inflamáveis/combustíveis', referencia: 'IT 25' },
  { id: 'fogos_artificio', nome: 'Fogos de Artifício', referencia: 'IT 30/2017' },
  { id: 'glp', nome: 'Gás Liquefeito de Petróleo (GLP)', referencia: 'IT 28/2021' },
  { id: 'vaso_pressao', nome: 'Vaso sob Pressão (Caldeira)', referencia: 'IT 03/2016' },
  { id: 'produtos_perigosos', nome: 'Armazenamento de Produtos Perigosos', referencia: 'IT 32/2021' },
  { id: 'silos', nome: 'Silos', referencia: 'IT 27/2020' },
  { id: 'subestacao_eletrica', nome: 'Subestação Elétrica', referencia: 'IT 37/2018' },
  { id: 'tunel_rodoviario', nome: 'Túnel Rodoviário', referencia: 'IT 35/2021' },
  { id: 'patio_conteineres', nome: 'Pátio de Contêineres', referencia: 'IT 36/2021' },
  { id: 'restricao_liberdade', nome: 'Estabelecimentos destinados à restrição de liberdade', referencia: 'IT 39/2016' },
  { id: 'patrimonio_historico', nome: 'Edificações que compõem o Patrimônio Histórico ou Cultural', referencia: 'IT 40/2017' },
  { id: 'cobertura_sape', nome: 'Cobertura de Sapé, Piaçava e Similares', referencia: 'IT 33/2021' },
  { id: 'hidrante_urbano', nome: 'Hidrante Urbano', referencia: 'IT 34/2021' }
];

// Fire safety tables from Decree 16.302/2015 - Bahia
const getApplicableSafetyMeasures = (
  occupationClass: string, 
  heightClass: string, 
  area: number
): { [key: string]: boolean } => {
  const measures: { [key: string]: boolean } = {};
  
  // Initialize all measures as false
  medidasSeguranca.forEach(medida => {
    measures[medida.id] = false;
  });

  // Get occupation group (first letter)
  const group = occupationClass.charAt(0);
  
  // Common measures for all groups
  measures['acesso_viatura'] = true;
  measures['seguranca_estrutural'] = true;
  measures['brigada_incendio'] = true;
  measures['iluminacao_emergencia'] = true;
  measures['sinalizacao_emergencia'] = true;
  measures['extintores'] = true;
  measures['hidrantes'] = true;
  measures['saidas_emergencia'] = true;

  // Group A - RESIDENTIAL
  if (group === 'A') {
    if (['IV', 'V', 'VI'].includes(heightClass)) {
      measures['compartimentacao_vertical'] = true;
      measures['controle_materiais'] = true;
    }
    if (heightClass === 'VI') {
      measures['elevador_emergencia'] = true;
    }
    // Alarm can be substituted by intercom with 24h center
    measures['alarme_incendio'] = true;
  }

  // Group B - HOSPITALITY SERVICES
  if (group === 'B') {
    measures['controle_materiais'] = true;
    measures['alarme_incendio'] = true;
    
    if (['II', 'III'].includes(heightClass)) {
      measures['compartimentacao_horizontal'] = true;
      measures['deteccao_incendio'] = true;
    }
    if (['IV', 'V'].includes(heightClass)) {
      measures['compartimentacao_horizontal'] = true;
      measures['compartimentacao_vertical'] = true;
      measures['deteccao_incendio'] = true;
      measures['chuveiros_automaticos'] = true;
      measures['plano_emergencia'] = true;
    }
    if (heightClass === 'VI') {
      measures['compartimentacao_horizontal'] = true;
      measures['compartimentacao_vertical'] = true;
      measures['deteccao_incendio'] = true;
      measures['chuveiros_automaticos'] = true;
      measures['controle_fumaca'] = true;
      measures['plano_emergencia'] = true;
      measures['elevador_emergencia'] = true;
    }
  }

  // Group C - COMMERCIAL
  if (group === 'C') {
    measures['compartimentacao_horizontal'] = true;
    measures['controle_materiais'] = true;
    measures['deteccao_incendio'] = true;
    measures['alarme_incendio'] = true;
    
    if (['IV', 'V'].includes(heightClass)) {
      measures['compartimentacao_vertical'] = true;
      measures['chuveiros_automaticos'] = true;
    }
    if (heightClass === 'VI') {
      measures['compartimentacao_vertical'] = true;
      measures['chuveiros_automaticos'] = true;
      measures['controle_fumaca'] = true;
      measures['elevador_emergencia'] = true;
    }
    
    // C-3 (Shopping Centers) require emergency plan
    if (occupationClass === 'C-3') {
      measures['plano_emergencia'] = true;
    }
  }

  // Group D - PROFESSIONAL SERVICES
  if (group === 'D') {
    measures['compartimentacao_horizontal'] = true;
    measures['controle_materiais'] = true;
    measures['alarme_incendio'] = true;
    
    if (['IV', 'V'].includes(heightClass)) {
      measures['compartimentacao_vertical'] = true;
    }
    if (heightClass === 'VI') {
      measures['compartimentacao_vertical'] = true;
      measures['deteccao_incendio'] = true;
      measures['chuveiros_automaticos'] = true;
      measures['controle_fumaca'] = true;
      measures['plano_emergencia'] = true;
      measures['elevador_emergencia'] = true;
    }
  }

  // Group E - EDUCATIONAL AND CULTURAL
  if (group === 'E') {
    measures['controle_materiais'] = true;
    measures['alarme_incendio'] = true;
    
    if (['IV', 'V'].includes(heightClass)) {
      measures['compartimentacao_vertical'] = true;
      measures['deteccao_incendio'] = true;
      measures['plano_emergencia'] = true;
    }
    if (heightClass === 'VI') {
      measures['compartimentacao_vertical'] = true;
      measures['deteccao_incendio'] = true;
      measures['chuveiros_automaticos'] = true;
      measures['controle_fumaca'] = true;
      measures['plano_emergencia'] = true;
      measures['elevador_emergencia'] = true;
    }
  }

  // Group F - PUBLIC ASSEMBLY
  if (group === 'F') {
    measures['compartimentacao_vertical'] = true;
    measures['controle_materiais'] = true;
    measures['alarme_incendio'] = true;
    measures['controle_fumaca'] = true;
    
    // F-1, F-2 require detection
    if (['F-1', 'F-2'].includes(occupationClass)) {
      measures['deteccao_incendio'] = true;
    }
    
    // Emergency plan for public > 1000 people
    measures['plano_emergencia'] = true;
    
    if (heightClass === 'VI') {
      measures['chuveiros_automaticos'] = true;
      measures['elevador_emergencia'] = true;
    }
  }

  // Group G - AUTOMOTIVE SERVICES
  if (group === 'G') {
    measures['controle_materiais'] = true;
    measures['alarme_incendio'] = true;
    
    if (['IV', 'V'].includes(heightClass)) {
      measures['compartimentacao_vertical'] = true;
    }
    if (['V', 'VI'].includes(heightClass)) {
      measures['chuveiros_automaticos'] = true;
    }
    if (heightClass === 'VI') {
      measures['compartimentacao_vertical'] = true;
      measures['deteccao_incendio'] = true;
      measures['controle_fumaca'] = true;
      measures['elevador_emergencia'] = true;
    }
    
    // G-5 (Hangars) have special requirements
    if (occupationClass === 'G-5') {
      measures['compartimentacao_vertical'] = true;
      measures['deteccao_incendio'] = true;
      measures['plano_emergencia'] = true;
      
      if (area > 5000) {
        measures['plano_emergencia'] = true;
      }
    }
  }

  // Group H - HEALTH SERVICES
  if (group === 'H') {
    measures['controle_materiais'] = true;
    measures['alarme_incendio'] = true;
    measures['compartimentacao_vertical'] = true;
    
    // H-2, H-3 require detection in specific areas
    if (['H-2', 'H-3', 'H-5'].includes(occupationClass)) {
      measures['deteccao_incendio'] = true;
      measures['plano_emergencia'] = true;
    }
    
    if (heightClass === 'VI') {
      measures['chuveiros_automaticos'] = true;
      measures['controle_fumaca'] = true;
      measures['elevador_emergencia'] = true;
    }
  }

  // Groups I, J, K, L, M (Industrial, Storage, Special Services, Special Risks)
  if (['I', 'J', 'K', 'L', 'M'].includes(group)) {
    measures['compartimentacao_horizontal'] = true;
    measures['controle_materiais'] = true;
    measures['deteccao_incendio'] = true;
    measures['alarme_incendio'] = true;
    measures['chuveiros_automaticos'] = true;
    
    if (['IV', 'V'].includes(heightClass)) {
      measures['compartimentacao_vertical'] = true;
    }
    if (heightClass === 'VI') {
      measures['compartimentacao_vertical'] = true;
      measures['controle_fumaca'] = true;
      measures['elevador_emergencia'] = true;
    }
    
    if (area > 10000) {
      measures['plano_emergencia'] = true;
    }
  }

  return measures;
};

export const FireSafetyForm: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    empresa: '',
    cnpj: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    cep: '',
    status: '',
    areaExistente: '',
    areaConstruir: '',
    altura: '',
    pavimentos: '',
    subsolo: '',
    uso: '',
    classificacaoAltura: '',
    cargaIncendio: '',
    risco: '',
    ocupantes: '',
    apresentacao: '',
    medidas: {},
    textoAcessoViaturas: 'O uso das viaturas dos bombeiros segue regras para buscas, salvamentos e combate a incêndios, conforme as condições estabelecidas.\n\nCaracterísticas da via de Acesso\n• Largura mínima: 6m.\n• Peso a Suportar: Viaturas com peso de 25.000kg.\n• Altura livre mínima: 4,50m.',
    portaoAplicavel: false,
    portaoLargura: '',
    portaoAltura: '',
    iluminacaoSistemasCentralizados: false,
    riscosEspeciais: {},
    termoAceito: false
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-classify safety measures when key data changes
  useEffect(() => {
    const { uso, classificacaoAltura, areaExistente, areaConstruir } = formData;
    
    if (uso && classificacaoAltura && (areaExistente || areaConstruir)) {
      const totalArea = parseFloat(areaExistente || '0') + parseFloat(areaConstruir || '0');
      const applicableMeasures = getApplicableSafetyMeasures(uso, classificacaoAltura, totalArea);
      
      // Update measures with automatic classification
      const newMedidas: { [key: string]: { aplicavel: boolean; detalhes: string } } = {};
      
      medidasSeguranca.forEach(medida => {
        const isApplicable = applicableMeasures[medida.id] || false;
        newMedidas[medida.id] = {
          aplicavel: isApplicable,
          detalhes: formData.medidas[medida.id]?.detalhes || 
                   (isApplicable ? 'Medida determinada automaticamente conforme Decreto 16.302/2015 - detalhes a serem especificados.' : '')
        };
      });
      
      setFormData(prev => ({
        ...prev,
        medidas: newMedidas
      }));
      
      if (totalArea > 0) {
        toast({
          title: "Classificação Automática Realizada!",
          description: `Medidas de segurança foram determinadas automaticamente para ${uso} - ${classificacaoAltura} com ${totalArea}m².`,
        });
      }
    }
  }, [formData.uso, formData.classificacaoAltura, formData.areaExistente, formData.areaConstruir]);

  const updateMedida = (id: string, field: 'aplicavel' | 'detalhes', value: any) => {
    setFormData(prev => ({
      ...prev,
      medidas: {
        ...prev.medidas,
        [id]: {
          ...prev.medidas[id],
          [field]: value
        }
      }
    }));
  };

  const updateRiscoEspecial = (id: string, field: 'aplicavel' | 'detalhes', value: any) => {
    setFormData(prev => ({
      ...prev,
      riscosEspeciais: {
        ...prev.riscosEspeciais,
        [id]: {
          ...prev.riscosEspeciais[id],
          [field]: value
        }
      }
    }));
  };

  const generateDocument = (format: 'word' | 'pdf') => {
    const doc = generateMemorialText();
    
    if (format === 'word') {
      // Create HTML content with styling for Word document
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; font-size: 11pt; }
              .title { font-weight: bold; font-size: 13pt; font-family: Arial, sans-serif; }
              .content { font-family: Arial, sans-serif; font-size: 11pt; }
            </style>
          </head>
          <body>${doc}</body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memorial-seguranca-incendio.doc';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For PDF, we would need a PDF generation library
      // For now, we'll copy HTML content to clipboard
      navigator.clipboard.writeText(doc);
      toast({
        title: "Documento gerado!",
        description: "O memorial foi copiado para a área de transferência.",
      });
    }
  };

  const generateMemorialText = (): string => {
    const areaTotal = (parseFloat(formData.areaExistente || '0') + parseFloat(formData.areaConstruir || '0')).toString();
    
    // Parse occupation classification to extract detailed information
    const getOccupationDetails = (uso: string) => {
      const occupationGroups: { [key: string]: string } = {
        'A': 'GRUPO A - RESIDENCIAL',
        'B': 'GRUPO B - SERVIÇOS DE HOSPEDAGEM', 
        'C': 'GRUPO C - COMERCIAL',
        'D': 'GRUPO D - SERVIÇOS PROFISSIONAIS',
        'E': 'GRUPO E - EDUCACIONAL E CULTURAL',
        'F': 'GRUPO F - LOCAIS DE REUNIÃO DE PÚBLICO',
        'G': 'GRUPO G - SERVIÇOS AUTOMOTIVOS',
        'H': 'GRUPO H - SERVIÇOS DE SAÚDE',
        'I': 'GRUPO I - SERVIÇOS ESPECIAIS',
        'J': 'GRUPO J - ARMAZENAMENTO',
        'L': 'GRUPO L - EXPLOSIVOS E INFLAMÁVEIS',
        'M': 'GRUPO M - INDÚSTRIA E DEPÓSITO'
      };

      if (!uso) return { grupo: '', divisao: '', descricao: '' };
      
      const [codigo, ...descricaoArray] = uso.split(' - ');
      const grupo = codigo ? codigo.charAt(0) : '';
      const divisao = codigo || '';
      const descricao = descricaoArray.join(' - ') || '';
      
      return {
        grupo: occupationGroups[grupo] || `GRUPO ${grupo}`,
        divisao: divisao,
        descricao: descricao
      };
    };

    const occupationInfo = getOccupationDetails(formData.uso);
    
    let doc = `<p class="title">MEMORIAL DESCRITIVO DO PROJETO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO</p>

<p class="title">1. DADOS DE IDENTIFICAÇÃO DO PROJETO/EDIFICAÇÃO</p>

<div class="content">
<p>Empresa/Órgão: ${formData.empresa}<br>
CNPJ: ${formData.cnpj}<br>
Endereço: ${formData.logradouro}, ${formData.numero}, ${formData.complemento}, ${formData.bairro}, ${formData.municipio}, BA, ${formData.cep}</p>

<p>Informações da Edificação:<br>
Status: ${formData.status}<br>
Decreto Estadual adotado: 16.302/2015<br>
Área Existente: ${formData.areaExistente} m²<br>
Área a Construir: ${formData.areaConstruir} m²<br>
Área Total: ${areaTotal} m²<br>
Altura: ${formData.altura} m<br>
Nº de Pavimentos: ${formData.pavimentos}<br>
Ocupação do Subsolo: ${formData.subsolo}<br>
Uso: ${occupationInfo.grupo}<br>
Divisão: ${occupationInfo.divisao}<br>
Descrição: ${occupationInfo.descricao}<br>
Classificação de Altura: ${formData.classificacaoAltura}<br>
Risco (Carga de Incêndio): ${formData.risco} MJ/m²<br>
Número de Ocupantes (População): ${formData.ocupantes}</p>
</div>

<p class="title">2. NORMAS TÉCNICAS</p>

<div class="content">
<p><strong>Diretrizes Gerais</strong></p>
<p>Os equipamentos e serviços objeto desta especificação deverão estar em plena conformidade com a legislação vigente do Estado da Bahia, as regulamentações do Corpo de Bombeiros Militar do Estado da Bahia (CBMBA), as normas da Associação Brasileira de Normas Técnicas (ABNT) e demais diretrizes técnicas aplicáveis.</p>

<p><strong>Normas de Referência Obrigatórias</strong></p>
<p>Todas as normas relacionadas abaixo deverão ser observadas em sua versão mais atualizada e vigente na data de execução dos serviços:</p>

<p><strong>Legislação Federal</strong></p>
<p>• Lei Federal nº 13.425/2017 - Estabelece diretrizes gerais sobre medidas de prevenção e combate a incêndio e desastres em estabelecimentos, edificações e áreas de reunião de público</p>

<p><strong>Instruções Técnicas do CBMBA</strong></p>
<p>• IT-01 a IT-43 - Instruções Técnicas do Corpo de Bombeiros Militar do Estado da Bahia</p>

<p><strong>Normas Técnicas ABNT</strong></p>

<p><strong>Estruturas e Componentes Construtivos</strong></p>
<p>• ABNT NBR 5628 - Componentes construtivos estruturais - Determinação da resistência ao fogo</p>

<p><strong>Acessibilidade e Circulação</strong></p>
<p>• ABNT NBR 9050 - Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos<br>
• ABNT NBR 9077 - Saídas de emergência em edifícios</p>

<p><strong>Sistemas de Emergência e Sinalização</strong></p>
<p>• ABNT NBR 10898 - Sistema de iluminação de emergência<br>
• ABNT NBR 13434 - Sinalização de segurança contra incêndio e pânico - Princípios de projeto<br>
• ABNT NBR 16820 - Sistemas de sinalização de emergência</p>

<p><strong>Equipamentos de Proteção Passiva</strong></p>
<p>• ABNT NBR 11742 - Porta corta-fogo para saída de emergência - Especificação<br>
• ABNT NBR 11785 - Barra antipânico - Requisitos</p>

<p><strong>Sistemas de Combate a Incêndio</strong></p>
<p>• ABNT NBR 12693 - Sistemas de proteção por extintores de incêndio<br>
• ABNT NBR 13714 - Sistemas de hidrantes e de mangotinhos para combate a incêndio</p>

<p><strong>Legislação Estadual da Bahia</strong></p>
<p>• Lei nº 12.929/2013 - Lei de Prevenção e Proteção Contra Incêndio do Estado da Bahia<br>
• Decreto nº 16.302/2015 - Regulamentação da Lei nº 12.929/2013</p>

<p><strong>Estabelecimentos Específicos</strong></p>
<p>• ABNT NBR 16651 - Proteção contra incêndio em estabelecimentos assistenciais de saúde (EAS) - Requisitos</p>

<p><strong>Normas Internacionais</strong></p>
<p>• NFPA 20 - Standard for the Installation of Stationary Pumps for Fire Protection (Norma para instalação de bombas estacionárias para proteção contra incêndio)</p>

<p><strong>Observações Importantes</strong></p>
<p>1. Atualização Normativa: Deverão sempre ser aplicadas as versões mais recentes das normas mencionadas, vigentes na data de execução dos serviços.<br>
2. Prevalência: Em caso de conflito entre normas, prevalecerá a mais restritiva, respeitando-se a hierarquia da legislação brasileira.<br>
3. Normas Complementares: Outras normas técnicas pertinentes ao objeto, mesmo que não explicitamente mencionadas, deverão ser observadas quando aplicáveis.</p>
</div>

<p class="title">3. FORMA DE APRESENTAÇÃO DO PROJETO</p>

<div class="content">
<p>O presente projeto é apresentado como: ${formData.apresentacao}</p>
</div>

<p class="title">4. MEDIDAS DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO</p>

<div class="content">
<p>${formData.textoAcessoViaturas.replace(/\n/g, '<br>')}</p>

${formData.portaoAplicavel ? `<p>Medida Aplicável Portão: Largura ${formData.portaoLargura}m / Altura ${formData.portaoAltura}m.</p>` : ''}

<p>Acesso das viaturas do corpo de bombeiros será pela ${formData.logradouro}, ${formData.numero}${formData.complemento ? `, ${formData.complemento}` : ''}, ${formData.bairro}, ${formData.municipio}, BA.</p>

<p>As seguintes medidas de segurança contra incêndio e pânico serão implementadas/atendidas na edificação, conforme as Instruções Técnicas (ITs) do CBMBA e o Decreto Estadual nº 16.302/2015:</p>

`;

    // Add selected safety measures
    medidasSeguranca.forEach(medida => {
      const medidaData = formData.medidas[medida.id];
      if (medidaData?.aplicavel) {
        doc += `<p>- ${medida.nome} (${medida.referencia}):<br>`;
        if (medida.id === 'iluminacao_emergencia') {
          doc += `${medidaData.detalhes || 'Detalhes a serem especificados.'}`;
          if (formData.iluminacaoSistemasCentralizados) {
            doc += `<br><br><strong>SISTEMAS CENTRALIZADOS (QUANDO APLICÁVEL)</strong><br>
Características:<br>
• Central de bateria com sistema de carregamento inteligente<br>
• Monitoramento individual dos circuitos<br>
• Sinalização de falhas e alarmes<br>
• Teste automático programável<br>
• Interface para supervisão remota`;
          }
          doc += `</p>`;
        } else {
          doc += `&nbsp;&nbsp;${medidaData.detalhes || 'Detalhes a serem especificados.'}</p>`;
        }
      }
    });

    doc += `</div>

<p class="title">4. RISCOS ESPECIAIS</p>

<div class="content">
<p>Os seguintes riscos especiais são presentes na edificação e suas respectivas medidas de segurança serão implementadas/atendidas:</p>
`;

    // Add selected special risks
    riscosEspeciais.forEach(risco => {
      const riscoData = formData.riscosEspeciais[risco.id];
      if (riscoData?.aplicavel) {
        doc += `<p>- ${risco.nome} (${risco.referencia}):<br>`;
        doc += `&nbsp;&nbsp;${riscoData.detalhes || 'Detalhes a serem especificados.'}</p>`;
      }
    });

    const currentDate = new Date().toLocaleDateString('pt-BR');
    doc += `</div>

<div class="content">
<p><br>${formData.municipio}, ${currentDate}.</p>

<p><br>___________________________________________<br>
[Nome Completo do Proprietário/Responsável pelo Uso]<br>
Proprietário / Responsável pelo Uso</p>

<p><br>___________________________________________<br>
[Nome Completo do Responsável Técnico]<br>
Responsável Técnico - CREA/CAU: [CREA/CAU]</p>
</div>`;

    return doc;
  };

  const renderStep1 = () => (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Dados de Identificação do Projeto/Edificação
        </CardTitle>
        <CardDescription>
          Insira as informações gerais da edificação e dos responsáveis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="empresa">Nome da Empresa/Órgão</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => updateFormData('empresa', e.target.value)}
              placeholder="Nome da empresa ou órgão"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => updateFormData('cnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Endereço do Imóvel</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input
                id="logradouro"
                value={formData.logradouro}
                onChange={(e) => updateFormData('logradouro', e.target.value)}
                placeholder="Rua, Avenida, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => updateFormData('numero', e.target.value)}
                placeholder="123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento}
                onChange={(e) => updateFormData('complemento', e.target.value)}
                placeholder="Apto, Sala, etc."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => updateFormData('bairro', e.target.value)}
                placeholder="Nome do bairro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="municipio">Município</Label>
              <Input
                id="municipio"
                value={formData.municipio}
                onChange={(e) => updateFormData('municipio', e.target.value)}
                placeholder="Salvador"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => updateFormData('cep', e.target.value)}
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Informações da Edificação</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">A edificação será</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a-construir">A construir</SelectItem>
                  <SelectItem value="construida">Construída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apresentacao">Forma de Apresentação</Label>
              <Select value={formData.apresentacao} onValueChange={(value) => updateFormData('apresentacao', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de apresentação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Projeto Técnico (PT)</SelectItem>
                  <SelectItem value="pts">Projeto Técnico Simplificado (PTS)</SelectItem>
                  <SelectItem value="ptiot">Projeto Técnico para Instalação e Ocupação Temporária (PTIOT)</SelectItem>
                  <SelectItem value="ptotep">Projeto Técnico para Ocupação Temporária em Edificação Permanente (PTOTEP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="areaExistente">Área Existente (m²)</Label>
              <Input
                id="areaExistente"
                type="number"
                value={formData.areaExistente}
                onChange={(e) => updateFormData('areaExistente', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaConstruir">Área a Construir (m²)</Label>
              <Input
                id="areaConstruir"
                type="number"
                value={formData.areaConstruir}
                onChange={(e) => updateFormData('areaConstruir', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaTotal">Área Total (m²)</Label>
              <Input
                id="areaTotal"
                type="number"
                value={(parseFloat(formData.areaExistente || '0') + parseFloat(formData.areaConstruir || '0')).toString()}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="altura">Altura (m)</Label>
              <Input
                id="altura"
                type="number"
                value={formData.altura}
                onChange={(e) => updateFormData('altura', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pavimentos">Nº de pavimentos</Label>
              <Input
                id="pavimentos"
                type="number"
                value={formData.pavimentos}
                onChange={(e) => updateFormData('pavimentos', e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocupantes">Número de ocupantes</Label>
              <Input
                id="ocupantes"
                type="number"
                value={formData.ocupantes}
                onChange={(e) => updateFormData('ocupantes', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subsolo">Ocupação do subsolo (se houver)</Label>
              <Select value={formData.subsolo} onValueChange={(value) => updateFormData('subsolo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ocupação do subsolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao-ha">Não há subsolo</SelectItem>
                  <SelectItem value="garagem">Garagem/Estacionamento (G-1)</SelectItem>
                  <SelectItem value="garagem-publica">Garagem com acesso público (G-2)</SelectItem>
                  <SelectItem value="deposito">Depósito (J-3)</SelectItem>
                  <SelectItem value="area-tecnica">Área técnica/Instalações prediais</SelectItem>
                  <SelectItem value="comercio">Comércio (C-1/C-2)</SelectItem>
                  <SelectItem value="servicos">Serviços (D-1)</SelectItem>
                  <SelectItem value="lazer">Área de lazer/Recreação</SelectItem>
                  <SelectItem value="auditorio">Auditório/Sala de reuniões (F-1)</SelectItem>
                  <SelectItem value="restaurante">Restaurante/Lanchonete (F-8)</SelectItem>
                  <SelectItem value="outro">Outro (especificar em observações)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="risco">Risco (MJ/m²)</Label>
              <Select value={formData.risco} onValueChange={(value) => updateFormData('risco', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo (até 300)</SelectItem>
                  <SelectItem value="medio">Médio (acima de 300 até 1200)</SelectItem>
                  <SelectItem value="alto">Alto (acima de 1200 MJ/m²)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uso">Classificação de Ocupação</Label>
            <Select value={formData.uso} onValueChange={(value) => updateFormData('uso', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a classificação de ocupação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A-1">A-1 - Habitação unifamiliar</SelectItem>
                <SelectItem value="A-2">A-2 - Habitação multifamiliar</SelectItem>
                <SelectItem value="A-3">A-3 - Habitação coletiva</SelectItem>
                <SelectItem value="B-1">B-1 - Hotel e pousada</SelectItem>
                <SelectItem value="B-2">B-2 - Hotel residencial e dormitório</SelectItem>
                <SelectItem value="C-1">C-1 - Comércio com baixa carga de incêndio</SelectItem>
                <SelectItem value="C-2">C-2 - Comércio com média e alta carga de incêndio</SelectItem>
                <SelectItem value="C-3">C-3 - Shoppings centers</SelectItem>
                <SelectItem value="D-1">D-1 - Serviços profissionais, pessoais e técnicos</SelectItem>
                <SelectItem value="D-2">D-2 - Agências bancárias e assemelhados</SelectItem>
                <SelectItem value="D-3">D-3 - Serviços de reparação</SelectItem>
                <SelectItem value="D-4">D-4 - Lavanderias e assemelhados</SelectItem>
                <SelectItem value="E-1">E-1 - Escola em geral</SelectItem>
                <SelectItem value="E-2">E-2 - Escola especial</SelectItem>
                <SelectItem value="E-3">E-3 - Espaço para cultura física</SelectItem>
                <SelectItem value="E-4">E-4 - Casas de diversões, clubes sociais</SelectItem>
                <SelectItem value="E-5">E-5 - Arte cênica e auditório</SelectItem>
                <SelectItem value="E-6">E-6 - Clubes noturnos</SelectItem>
                <SelectItem value="F-1">F-1 - Locais de reunião de público</SelectItem>
                <SelectItem value="F-2">F-2 - Locais de reunião de público em geral</SelectItem>
                <SelectItem value="F-3">F-3 - Centros esportivos</SelectItem>
                <SelectItem value="F-4">F-4 - Estações e terminais de passageiros</SelectItem>
                <SelectItem value="F-5">F-5 - Arenas e estádios</SelectItem>
                <SelectItem value="F-6">F-6 - Locais dotados de arquibancadas</SelectItem>
                <SelectItem value="F-7">F-7 - Construções provisórias</SelectItem>
                <SelectItem value="F-8">F-8 - Locais para refeição</SelectItem>
                <SelectItem value="F-9">F-9 - Recreação pública</SelectItem>
                <SelectItem value="F-10">F-10 - Exposições</SelectItem>
                <SelectItem value="G-1">G-1 - Garagens sem acesso de público e sem abastecimento</SelectItem>
                <SelectItem value="G-2">G-2 - Garagens com acesso de público e sem abastecimento</SelectItem>
                <SelectItem value="G-3">G-3 - Locais dotados de abastecimento de combustível</SelectItem>
                <SelectItem value="G-4">G-4 - Serviços de conservação, manutenção e reparo</SelectItem>
                <SelectItem value="G-5">G-5 - Hangares</SelectItem>
                <SelectItem value="H-1">H-1 - Hospital e casa de saúde</SelectItem>
                <SelectItem value="H-2">H-2 - Hospital veterinário</SelectItem>
                <SelectItem value="H-3">H-3 - Pronto-socorro</SelectItem>
                <SelectItem value="H-4">H-4 - Consultório médico e dentário</SelectItem>
                <SelectItem value="H-5">H-5 - Outros locais destinados a prestação de cuidados com a saúde</SelectItem>
                <SelectItem value="H-6">H-6 - Clínica e laboratório de análise clínica sem internação</SelectItem>
                <SelectItem value="I-1">I-1 - Creche</SelectItem>
                <SelectItem value="I-2">I-2 - Escola para portadores de deficiências</SelectItem>
                <SelectItem value="I-3">I-3 - Orfanato, asilo e assemelhados</SelectItem>
                <SelectItem value="J-1">J-1 - Museu e biblioteca</SelectItem>
                <SelectItem value="J-2">J-2 - Centro de processamento de dados</SelectItem>
                <SelectItem value="J-3">J-3 - Depósito sem comércio</SelectItem>
                <SelectItem value="J-4">J-4 - Indústria e depósito de baixo risco de incêndio</SelectItem>
                <SelectItem value="L-1">L-1 - Explosivos</SelectItem>
                <SelectItem value="L-2">L-2 - Líquidos e gases inflamáveis e combustíveis</SelectItem>
                <SelectItem value="L-3">L-3 - Usinas, refinarias e destilarias</SelectItem>
                <SelectItem value="M-1">M-1 - Depósito de baixo risco</SelectItem>
                <SelectItem value="M-2">M-2 - Depósito de médio risco</SelectItem>
                <SelectItem value="M-3">M-3 - Depósito de alto risco</SelectItem>
                <SelectItem value="M-4">M-4 - Indústria de baixo risco de incêndio</SelectItem>
                <SelectItem value="M-5">M-5 - Indústria de médio risco de incêndio</SelectItem>
                <SelectItem value="M-6">M-6 - Indústria de alto risco de incêndio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classificacaoAltura">Classificação de Altura</Label>
            <Select value={formData.classificacaoAltura} onValueChange={(value) => updateFormData('classificacaoAltura', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a classificação de altura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="I">Tipo I - Edificação Térrea (Um pavimento)</SelectItem>
                <SelectItem value="II">Tipo II - Edificação Baixa (H ≤ 6,00 m)</SelectItem>
                <SelectItem value="III">Tipo III - Edificação de Baixa-Média Altura (6,00 m &lt; H ≤ 12,00 m)</SelectItem>
                <SelectItem value="IV">Tipo IV - Edificação de Média Altura (12,00 m &lt; H ≤ 23,00 m)</SelectItem>
                <SelectItem value="V">Tipo V - Edificação Mediamente Alta (23,00 m &lt; H ≤ 30,00 m)</SelectItem>
                <SelectItem value="VI">Tipo VI - Edificação Alta (Acima de 30,00 m)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargaIncendio">Classificação de Carga de Incêndio</Label>
            <Select value={formData.cargaIncendio} onValueChange={(value) => updateFormData('cargaIncendio', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a classificação de carga de incêndio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixo">Baixo - até 300MJ/m²</SelectItem>
                <SelectItem value="medio">Médio - Entre 300 e 1.200MJ/m²</SelectItem>
                <SelectItem value="alto">Alto - Acima de 1.200MJ/m²</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Medidas de Segurança Contra Incêndio e Pânico
        </CardTitle>
        <CardDescription>
          Medidas determinadas automaticamente conforme Decreto 16.302/2015. Você pode ajustar conforme necessário.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {formData.uso && formData.classificacaoAltura && (
          <div className="p-4 bg-accent/10 border border-accent rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">Classificação Automática Ativa</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Medidas determinadas para: <strong>{formData.uso}</strong> - <strong>{formData.classificacaoAltura}</strong>
            </p>
            <Button 
              onClick={() => {
                const { uso, classificacaoAltura, areaExistente, areaConstruir } = formData;
                if (uso && classificacaoAltura && (areaExistente || areaConstruir)) {
                  const totalArea = parseFloat(areaExistente || '0') + parseFloat(areaConstruir || '0');
                  const applicableMeasures = getApplicableSafetyMeasures(uso, classificacaoAltura, totalArea);
                  
                  const newMedidas: { [key: string]: { aplicavel: boolean; detalhes: string } } = {};
                  
                  medidasSeguranca.forEach(medida => {
                    const isApplicable = applicableMeasures[medida.id] || false;
                    newMedidas[medida.id] = {
                      aplicavel: isApplicable,
                      detalhes: formData.medidas[medida.id]?.detalhes || 
                               (isApplicable ? 'Medida determinada automaticamente conforme Decreto 16.302/2015 - detalhes a serem especificados.' : '')
                    };
                  });
                  
                  setFormData(prev => ({
                    ...prev,
                    medidas: newMedidas
                  }));
                  
                  toast({
                    title: "Reclassificação Realizada!",
                    description: "As medidas foram atualizadas conforme os dados atuais.",
                  });
                }
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Reclassificar Agora
            </Button>
          </div>
        )}
        
        {medidasSeguranca.map((medida) => (
          <div key={medida.id} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={medida.id}
                checked={formData.medidas[medida.id]?.aplicavel || false}
                onCheckedChange={(checked) => updateMedida(medida.id, 'aplicavel', checked)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor={medida.id} className="text-sm font-medium leading-relaxed">
                    {medida.nome}
                  </Label>
                  {formData.medidas[medida.id]?.aplicavel && formData.medidas[medida.id]?.detalhes?.includes('determinada automaticamente') && (
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                      Auto
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Referência: {medida.referencia}
                </p>
              </div>
            </div>
            {formData.medidas[medida.id]?.aplicavel && (
              <div className="mt-3">
                <Label htmlFor={`${medida.id}-detalhes`} className="text-sm">
                  Detalhes da implementação:
                </Label>
                {medida.id === 'acesso_viatura' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="textoAcessoViaturas">Descrição do Acesso (editável)</Label>
                      <Textarea
                        id="textoAcessoViaturas"
                        value={formData.textoAcessoViaturas}
                        onChange={(e) => updateFormData('textoAcessoViaturas', e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="portaoAplicavel"
                          checked={formData.portaoAplicavel}
                          onCheckedChange={(checked) => updateFormData('portaoAplicavel', checked)}
                        />
                        <Label htmlFor="portaoAplicavel" className="text-sm font-medium">
                          Medida Aplicável Portão (quando houver)
                        </Label>
                      </div>

                      {formData.portaoAplicavel && (
                        <div className="grid grid-cols-2 gap-4 ml-6">
                          <div className="space-y-2">
                            <Label htmlFor="portaoLargura">Largura do Portão (m)</Label>
                            <Input
                              id="portaoLargura"
                              type="number"
                              step="0.1"
                              value={formData.portaoLargura}
                              onChange={(e) => updateFormData('portaoLargura', e.target.value)}
                              placeholder="0.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="portaoAltura">Altura do Portão (m)</Label>
                            <Input
                              id="portaoAltura"
                              type="number"
                              step="0.1"
                              value={formData.portaoAltura}
                              onChange={(e) => updateFormData('portaoAltura', e.target.value)}
                              placeholder="0.0"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Acesso das viaturas do corpo de bombeiros</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">
                          Acesso das viaturas do corpo de bombeiros será pela {formData.logradouro || '[Logradouro]'}, {formData.numero || '[Número]'}{formData.complemento ? `, ${formData.complemento}` : ''}, {formData.bairro || '[Bairro]'}, {formData.municipio || '[Município]'}, BA
                        </p>
                      </div>
                    </div>
                  </div>
                ) : medida.id === 'iluminacao_emergencia' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${medida.id}-detalhes`}>Especificações Técnicas (editável)</Label>
                      <Textarea
                        id={`${medida.id}-detalhes`}
                        value={formData.medidas[medida.id]?.detalhes || `<p style="font-family: Arial; font-size: 14px; font-weight: bold;">Iluminação de Emergência</p>

<p style="font-family: Arial; font-size: 12px;">O projeto do sistema de iluminação de emergência fundamenta-se na ABNT NBR 10898:2023 (3ª edição, publicada em 14 de fevereiro de 2023), bem como nas demais normas e legislações vigentes aplicáveis:</p>

• Instruções Técnicas do CBMBA aplicáveis
• NBR 10898:2023

<p style="font-family: Arial; font-size: 12px; font-weight: bold;">CLASSIFICAÇÃO DO SISTEMA</p>

<p style="font-family: Arial; font-size: 12px; font-weight: bold;">Tipos de Iluminação de Emergência</p>
O sistema será composto pelos seguintes tipos de iluminação:

a) Iluminação de Aclaramento
• Destinada a iluminar e permitir a utilização segura das rotas de fuga e áreas comuns
• Proporciona visibilidade adequada para evacuação segura dos ocupantes

b) Iluminação de Balizamento
• Destinada a demarcar claramente as rotas de fuga
• Sinalização visual das saídas e caminhos de evacuação
• Orientação direcional para as rotas de escape

<p style="font-family: Arial; font-size: 12px; font-weight: bold;">REQUISITOS TÉCNICOS PRINCIPAIS</p>

Autonomia do Sistema
O sistema de iluminação de emergência deverá possuir autonomia mínima de 2 (duas) horas, conforme atualização da NBR 10898:2023, ou o tempo superior de autonomia determinado pela autoridade local competente.

Níveis de Iluminância
Iluminação de Aclaramento:
• Nível mínimo de 5 lux no piso das rotas de fuga
• Uniformidade adequada, evitando contrastes excessivos
• Tempo máximo de 15 segundos para atingir 50% da iluminância requerida

Iluminação de Balizamento:
• Luminância adequada para visualização eficaz da sinalização
• Contraste suficiente entre a sinalização e o ambiente circundante
• Visibilidade mantida durante toda a autonomia do sistema

Distanciamento entre Pontos de Iluminação
A distância máxima entre os pontos de iluminação de emergência de aclaramento não deve ultrapassar 15 m, e entre o ponto de iluminação e a parede 7,5 m. Distanciamentos diferentes podem ser adotados desde que atendam aos parâmetros estabelecidos na NBR 10898:2023.

<p style="font-family: Arial; font-size: 12px; font-weight: bold;">ESPECIFICAÇÕES DOS COMPONENTES</p>

Luminárias de Emergência
Características Técnicas:
• Grau de proteção mínimo IP20 para uso interno
• Grau de proteção mínimo IP54 para áreas molhadas ou externas
• Corpo fabricado em material resistente ao fogo e autoextinguível
• Sistema óptico com proteção adequada
• Indicador visual de funcionamento normal/emergência
• Teste automático mensal

Alimentação:
• Fonte de alimentação normal através da rede elétrica
• Fonte de alimentação de emergência através de bateria incorporada
• Sistema de carregamento automático da bateria
• Chaveamento automático entre as fontes

Baterias
Especificações:
• Tecnologia de bateria selada, livre de manutenção
• Vida útil mínima de 4 anos
• Capacidade adequada para garantir a autonomia especificada
• Resistência a ciclos de carga e descarga
• Operação em temperatura ambiente de -5°C a +40°C

Critérios de Instalação
Posicionamento das Luminárias
Localizações Obrigatórias:
• Saídas de emergência e saídas de andares
• Mudanças de direção e interseção de corredores
• Mudanças de nível (escadas, rampas)
• Próximo a equipamentos de segurança (extintores, hidrantes)
• Áreas de refúgio temporário

Altura de Instalação:
• Altura mínima de 2,0 m do piso acabado
• Instalação que evite ofuscamento direto
• Distribuição que garanta uniformidade adequada

Circuitos Elétricos
Alimentação Normal:
• Circuitos independentes para alimentação das luminárias
• Proteção individual por circuito
• Cabeamento em eletrodutos rígidos ou eletrocalhas
• Condutores com isolação mínima 750V

Circuitos de Emergência:
• Fiação específica para sinalização de emergência
• Condutores resistentes ao fogo quando exigido
• Separação física dos circuitos normais`}
                        onChange={(e) => updateMedida(medida.id, 'detalhes', e.target.value)}
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="iluminacaoSistemasCentralizados"
                          checked={formData.iluminacaoSistemasCentralizados}
                          onCheckedChange={(checked) => updateFormData('iluminacaoSistemasCentralizados', checked)}
                        />
                        <Label htmlFor="iluminacaoSistemasCentralizados" className="text-sm font-medium">
                          SISTEMAS CENTRALIZADOS (QUANDO APLICÁVEL)
                        </Label>
                      </div>

                      {formData.iluminacaoSistemasCentralizados && (
                        <div className="p-4 bg-muted rounded-md ml-6">
                          <p className="text-sm">
                            <strong>Características:</strong><br/>
                            • Central de bateria com sistema de carregamento inteligente<br/>
                            • Monitoramento individual dos circuitos<br/>
                            • Sinalização de falhas e alarmes<br/>
                            • Teste automático programável<br/>
                            • Interface para supervisão remota
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Textarea
                    id={`${medida.id}-detalhes`}
                    value={formData.medidas[medida.id]?.detalhes || ''}
                    onChange={(e) => updateMedida(medida.id, 'detalhes', e.target.value)}
                    placeholder="Descreva detalhadamente como esta medida será implementada..."
                    rows={3}
                    className="mt-1"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );


  const renderStep4 = () => (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Riscos Especiais
        </CardTitle>
        <CardDescription>
          Selecione os riscos especiais presentes na edificação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {riscosEspeciais.map((risco) => (
          <div key={risco.id} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={risco.id}
                checked={formData.riscosEspeciais[risco.id]?.aplicavel || false}
                onCheckedChange={(checked) => updateRiscoEspecial(risco.id, 'aplicavel', checked)}
              />
              <div className="flex-1">
                <Label htmlFor={risco.id} className="text-sm font-medium leading-relaxed">
                  {risco.nome}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Referência: {risco.referencia}
                </p>
              </div>
            </div>
            {formData.riscosEspeciais[risco.id]?.aplicavel && (
              <div className="mt-3">
                <Label htmlFor={`${risco.id}-detalhes`} className="text-sm">
                  Detalhes da implementação:
                </Label>
                <Textarea
                  id={`${risco.id}-detalhes`}
                  value={formData.riscosEspeciais[risco.id]?.detalhes || ''}
                  onChange={(e) => updateRiscoEspecial(risco.id, 'detalhes', e.target.value)}
                  placeholder="Descreva detalhadamente como este risco será gerenciado..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        ))}
        
        <div className="space-y-3 p-4 border rounded-lg">
          <Label className="text-sm font-medium">
            Outros Riscos (especificar):
          </Label>
          <Textarea
            value={formData.riscosEspeciais['outros']?.detalhes || ''}
            onChange={(e) => updateRiscoEspecial('outros', 'detalhes', e.target.value)}
            placeholder="Descreva outros riscos especiais não listados acima..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Declarações Finais e Geração do Memorial
        </CardTitle>
        <CardDescription>
          Aceite os termos de responsabilidade e gere o memorial descritivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-3 p-4 border rounded-lg">
          <Checkbox
            id="termo"
            checked={formData.termoAceito}
            onCheckedChange={(checked) => updateFormData('termoAceito', checked)}
          />
          <div className="flex-1">
            <Label htmlFor="termo" className="text-sm font-medium leading-relaxed">
              Termo de Ciência e Responsabilidade
            </Label>
            <p className="text-sm text-muted-foreground mt-2">
              Declaro estar ciente de que as informações e declarações prestadas são verdadeiras e que o Corpo de Bombeiros Militar da Bahia pode, a qualquer tempo, proceder à verificação, inclusive por meio de fiscalizações e solicitação de documentos adicionais. Estou ciente das penalidades previstas na Lei Estadual nº 8.151/2016 e no Decreto Estadual nº 40.637/2020 em caso de informações falsas ou omissões.
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Gerar Memorial Descritivo</h4>
          <p className="text-sm text-muted-foreground">
            Clique em um dos botões abaixo para gerar o memorial descritivo formatado com base nas informações fornecidas.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => generateDocument('word')}
              disabled={!formData.termoAceito}
              variant="professional"
              size="lg"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar Memorial para Word
            </Button>
            <Button 
              onClick={() => generateDocument('pdf')}
              disabled={!formData.termoAceito}
              variant="fire"
              size="lg"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar Memorial para PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const steps = [
    { title: 'Identificação', component: renderStep1 },
    { title: 'Medidas de Segurança', component: renderStep2 },
    { title: 'Riscos Especiais', component: renderStep4 },
    { title: 'Finalização', component: renderStep5 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-professional opacity-90"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Memorial Fácil Bahia
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-2">
              Gerador de Memorial de Segurança Contra Incêndio e Pânico
            </p>
            <p className="text-white/80">
              Conforme Decreto Estadual nº 16.302/2015 - CBMBA
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Formulário Interativo
            </h2>
            <p className="text-muted-foreground">
              Preencha os dados do seu projeto e gere automaticamente o memorial descritivo
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === index + 1
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > index + 1
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium">{step.title}</span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-muted ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step */}
        <div className="max-w-4xl mx-auto">
          {steps[currentStep - 1].component()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              variant="outline"
            >
              Anterior
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
              variant="default"
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};