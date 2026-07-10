/**
 * TABELA 1 do Decreto Estadual nº 69.118/2024 (São Paulo) — Anexo A.
 * Classificação das edificações e áreas de risco quanto à ocupação.
 *
 * Fonte: Decreto nº 69.118, de 9 de dezembro de 2024, que institui o
 * Regulamento de Segurança Contra Incêndios das edificações e áreas de
 * risco no Estado de São Paulo (revoga o Decreto nº 63.911/2018).
 * Transcrição fornecida pelo usuário — documento oficial vigente.
 */

import type { GrupoOcupacao } from '@/lib/normas/ocupacoes';

export const TABELA_1_OCUPACOES_SP: GrupoOcupacao[] = [
  {
    codigo: 'A',
    nome: 'Residencial',
    divisoes: [
      { cod: 'A-1', desc: 'Habitação unifamiliar', exemplos: 'Casas, condomínios horizontais' },
      { cod: 'A-2', desc: 'Habitação multifamiliar', exemplos: 'Edifícios de apartamentos' },
      { cod: 'A-3', desc: 'Habitação coletiva', exemplos: 'Pensionatos, internatos (até 16 leitos)' },
    ],
  },
  {
    codigo: 'B',
    nome: 'Serviço de Hospedagem',
    divisoes: [
      { cod: 'B-1', desc: 'Hotel e assemelhado', exemplos: 'Hotéis, motéis, pousadas, albergues' },
      { cod: 'B-2', desc: 'Hotel residencial', exemplos: 'Apart-hotéis, flats' },
    ],
  },
  {
    codigo: 'C',
    nome: 'Comercial',
    divisoes: [
      { cod: 'C-1', desc: 'Comércio com baixa carga de incêndio', exemplos: 'Metal, louças, artigos hospitalares' },
      { cod: 'C-2', desc: 'Comércio com média e alta carga de incêndio', exemplos: 'Lojas de departamento, supermercados' },
      { cod: 'C-3', desc: 'Shopping center', exemplos: 'Shopping center' },
    ],
  },
  {
    codigo: 'D',
    nome: 'Serviço Profissional',
    divisoes: [
      { cod: 'D-1', desc: 'Local para prestação de serviço', exemplos: 'Escritórios, instituições financeiras' },
      { cod: 'D-2', desc: 'Agência bancária', exemplos: 'Bancos' },
      { cod: 'D-3', desc: 'Serviço de reparação', exemplos: 'Lavanderias, assistência técnica' },
      { cod: 'D-4', desc: 'Laboratório', exemplos: 'Análises clínicas, laboratórios químicos' },
    ],
  },
  {
    codigo: 'E',
    nome: 'Educacional e Cultura Física',
    divisoes: [
      { cod: 'E-1', desc: 'Escola em geral', exemplos: 'Ensino fundamental, médio e superior' },
      { cod: 'E-2', desc: 'Escola especial', exemplos: 'Artes, línguas, religiões' },
      { cod: 'E-3', desc: 'Espaço para cultura física', exemplos: 'Artes marciais, natação, ginástica' },
      { cod: 'E-4', desc: 'Centro de treinamento profissional', exemplos: 'Escolas profissionais' },
      { cod: 'E-5', desc: 'Pré-escola', exemplos: 'Creches, jardins de infância' },
      { cod: 'E-6', desc: 'Escola para portadores de deficiências', exemplos: 'Escolas para excepcionais' },
    ],
  },
  {
    codigo: 'F',
    nome: 'Local de Reunião de Público',
    divisoes: [
      { cod: 'F-1', desc: 'Local onde há objeto de valor inestimável', exemplos: 'Museus, bibliotecas, galerias' },
      { cod: 'F-2', desc: 'Local religioso e velório', exemplos: 'Igrejas, templos, cemitérios' },
      { cod: 'F-3', desc: 'Centro esportivo e de exibição', exemplos: 'Arenas, estádios, ginásios (com arquibancadas)' },
      { cod: 'F-4', desc: 'Estação e terminal de passageiro', exemplos: 'Rodoviárias, aeroportos, metrô' },
      { cod: 'F-5', desc: 'Arte cênica e auditório', exemplos: 'Teatros, cinemas, auditórios' },
      { cod: 'F-6', desc: 'Clube social e diversão', exemplos: 'Salões de festa, clubes, bingo' },
      { cod: 'F-7', desc: 'Ocupação temporária', exemplos: 'Circos, parques, feiras, shows' },
      { cod: 'F-8', desc: 'Local para refeição', exemplos: 'Restaurantes, bares, lanchonetes' },
      { cod: 'F-9', desc: 'Recreação pública', exemplos: 'Zoológico, parques recreativos' },
      { cod: 'F-10', desc: 'Exposição de objetos ou animais', exemplos: 'Salões de exposição (edificações permanentes)' },
      { cod: 'F-11', desc: 'Boate', exemplos: 'Casas noturnas, danceterias' },
    ],
  },
  {
    codigo: 'G',
    nome: 'Serviço Automotivo e Assemelhado',
    divisoes: [
      { cod: 'G-1', desc: 'Garagem sem acesso de público', exemplos: 'Garagens automáticas' },
      { cod: 'G-2', desc: 'Garagem com acesso de público', exemplos: 'Garagens coletivas' },
      { cod: 'G-3', desc: 'Local dotado de abastecimento de combustível', exemplos: 'Postos de combustível' },
      { cod: 'G-4', desc: 'Serviço de conservação, manutenção e reparo', exemplos: 'Oficinas, borracharias' },
      { cod: 'G-5', desc: 'Hangar', exemplos: 'Abrigos para aeronaves' },
    ],
  },
  {
    codigo: 'H',
    nome: 'Serviço de Saúde e Institucional',
    divisoes: [
      { cod: 'H-1', desc: 'Hospital veterinário e assemelhado', exemplos: 'Clínicas veterinárias' },
      { cod: 'H-2', desc: 'Local onde pessoas requerem cuidados especiais', exemplos: 'Asilos, orfanatos, dependência química' },
      { cod: 'H-3', desc: 'Hospital e assemelhado', exemplos: 'Hospitais, prontos-socorros com internação' },
      { cod: 'H-4', desc: 'Repartição pública', exemplos: 'Tribunais, quartéis, delegacias' },
      { cod: 'H-5', desc: 'Local onde a liberdade das pessoas sofre restrições', exemplos: 'Presídios, manicômios (com celas)' },
      { cod: 'H-6', desc: 'Clínica e consultório médico/odontológico', exemplos: 'Clínicas sem internação' },
    ],
  },
  {
    codigo: 'I',
    nome: 'Indústria',
    divisoes: [
      { cod: 'I-1', desc: 'Indústria com carga de incêndio até 300 MJ/m²', exemplos: 'Aço, metal, vidro, sabão' },
      { cod: 'I-2', desc: 'Indústria com carga de incêndio entre 300 e 1.200 MJ/m²', exemplos: 'Bebidas, móveis, alimentos, marcenaria' },
      { cod: 'I-3', desc: 'Indústria com carga de incêndio acima de 1.200 MJ/m²', exemplos: 'Líquidos igníferos, tintas, borracha' },
    ],
  },
  {
    codigo: 'J',
    nome: 'Depósito',
    divisoes: [
      { cod: 'J-1', desc: 'Depósito de material incombustível', exemplos: 'Tijolos, pedras, cimentos, metais' },
      { cod: 'J-2', desc: 'Depósito com carga de incêndio até 300 MJ/m²', exemplos: 'Baixa carga de incêndio' },
      { cod: 'J-3', desc: 'Depósito com carga de incêndio entre 300 e 1.200 MJ/m²', exemplos: 'Média carga de incêndio' },
      { cod: 'J-4', desc: 'Depósito com carga de incêndio acima de 1.200 MJ/m²', exemplos: 'Alta carga, recicláveis combustíveis' },
    ],
  },
  {
    codigo: 'K',
    nome: 'Energia',
    divisoes: [
      { cod: 'K-1', desc: 'Transmissão e distribuição de energia', exemplos: 'Subestação elétrica' },
    ],
  },
  {
    codigo: 'L',
    nome: 'Explosivo',
    divisoes: [
      { cod: 'L-1', desc: 'Comércio', exemplos: 'Fogos de artifício' },
      { cod: 'L-2', desc: 'Indústria', exemplos: 'Material explosivo' },
      { cod: 'L-3', desc: 'Depósito', exemplos: 'Material explosivo' },
    ],
  },
  {
    codigo: 'M',
    nome: 'Especial',
    divisoes: [
      { cod: 'M-1', desc: 'Túnel', exemplos: 'Túnel rodoferroviário/marítimo' },
      { cod: 'M-2', desc: 'Líquido ou gás ignífero', exemplos: 'Produção/armazenamento de inflamáveis' },
      { cod: 'M-3', desc: 'Central de comunicação', exemplos: 'Central telefônica' },
      { cod: 'M-4', desc: 'Canteiro de obras', exemplos: 'Canteiro de obras' },
      { cod: 'M-5', desc: 'Silos', exemplos: 'Armazéns de grãos' },
      { cod: 'M-6', desc: 'Floresta', exemplos: 'Unidades de conservação' },
      { cod: 'M-7', desc: 'Pátio de contêineres', exemplos: 'Área aberta para contêineres' },
    ],
  },
];

export function getDivisaoSP(cod: string) {
  for (const grupo of TABELA_1_OCUPACOES_SP) {
    const divisao = grupo.divisoes.find((d) => d.cod === cod);
    if (divisao) return { grupo, divisao };
  }
  return undefined;
}
