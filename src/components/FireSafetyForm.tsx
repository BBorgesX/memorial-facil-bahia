import React, { useState } from 'react';
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
  risco: string;
  ocupantes: string;
  apresentacao: string;
  
  // Medidas de segurança
  medidas: { [key: string]: { aplicavel: boolean; detalhes: string } };
  
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
    risco: '',
    ocupantes: '',
    apresentacao: '',
    medidas: {},
    riscosEspeciais: {},
    termoAceito: false
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
      const blob = new Blob([doc], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memorial-seguranca-incendio.doc';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For PDF, we would need a PDF generation library
      // For now, we'll copy to clipboard
      navigator.clipboard.writeText(doc);
      toast({
        title: "Documento gerado!",
        description: "O memorial foi copiado para a área de transferência.",
      });
    }
  };

  const generateMemorialText = (): string => {
    const areaTotal = (parseFloat(formData.areaExistente || '0') + parseFloat(formData.areaConstruir || '0')).toString();
    
    let doc = `MEMORIAL DESCRITIVO DO PROJETO DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO

1. DADOS DE IDENTIFICAÇÃO DO PROJETO/EDIFICAÇÃO

Empresa/Órgão: ${formData.empresa}
CNPJ: ${formData.cnpj}
Endereço: ${formData.logradouro}, ${formData.numero}, ${formData.complemento}, ${formData.bairro}, ${formData.municipio}, BA, ${formData.cep}

Informações da Edificação:
Status: ${formData.status}
Decreto Estadual adotado: 16.302/2015
Área Existente: ${formData.areaExistente} m²
Área a Construir: ${formData.areaConstruir} m²
Área Total: ${areaTotal} m²
Altura: ${formData.altura} m
Nº de Pavimentos: ${formData.pavimentos}
Ocupação do Subsolo: ${formData.subsolo}
Uso, Divisão e Descrição: ${formData.uso}
Risco (Carga de Incêndio): ${formData.risco} MJ/m²
Número de Ocupantes (População): ${formData.ocupantes}

2. FORMA DE APRESENTAÇÃO DO PROJETO

O presente projeto é apresentado como: ${formData.apresentacao}

3. MEDIDAS DE SEGURANÇA CONTRA INCÊNDIO E PÂNICO

As seguintes medidas de segurança contra incêndio e pânico serão implementadas/atendidas na edificação, conforme as Instruções Técnicas (ITs) do CBMBA e o Decreto Estadual nº 16.302/2015:

`;

    // Add selected safety measures
    medidasSeguranca.forEach(medida => {
      const medidaData = formData.medidas[medida.id];
      if (medidaData?.aplicavel) {
        doc += `- ${medida.nome} (${medida.referencia}):\n`;
        doc += `  ${medidaData.detalhes || 'Detalhes a serem especificados.'}\n\n`;
      }
    });

    doc += `4. RISCOS ESPECIAIS

Os seguintes riscos especiais são presentes na edificação e suas respectivas medidas de segurança serão implementadas/atendidas:

`;

    // Add selected special risks
    riscosEspeciais.forEach(risco => {
      const riscoData = formData.riscosEspeciais[risco.id];
      if (riscoData?.aplicavel) {
        doc += `- ${risco.nome} (${risco.referencia}):\n`;
        doc += `  ${riscoData.detalhes || 'Detalhes a serem especificados.'}\n\n`;
      }
    });

    const currentDate = new Date().toLocaleDateString('pt-BR');
    doc += `\n${formData.municipio}, ${currentDate}.

___________________________________________
[Nome Completo do Proprietário/Responsável pelo Uso]
Proprietário / Responsável pelo Uso

___________________________________________
[Nome Completo do Responsável Técnico]
Responsável Técnico - CREA/CAU: [CREA/CAU]`;

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
              <Input
                id="subsolo"
                value={formData.subsolo}
                onChange={(e) => updateFormData('subsolo', e.target.value)}
                placeholder="Garagem, depósito, etc."
              />
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
          Marque as medidas de segurança aplicáveis ao seu projeto e descreva detalhadamente como elas serão implementadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {medidasSeguranca.map((medida) => (
          <div key={medida.id} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={medida.id}
                checked={formData.medidas[medida.id]?.aplicavel || false}
                onCheckedChange={(checked) => updateMedida(medida.id, 'aplicavel', checked)}
              />
              <div className="flex-1">
                <Label htmlFor={medida.id} className="text-sm font-medium leading-relaxed">
                  {medida.nome}
                </Label>
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
                <Textarea
                  id={`${medida.id}-detalhes`}
                  value={formData.medidas[medida.id]?.detalhes || ''}
                  onChange={(e) => updateMedida(medida.id, 'detalhes', e.target.value)}
                  placeholder="Descreva detalhadamente como esta medida será implementada..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
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

  const renderStep4 = () => (
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
    { title: 'Riscos Especiais', component: renderStep3 },
    { title: 'Finalização', component: renderStep4 }
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