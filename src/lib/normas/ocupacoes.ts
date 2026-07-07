/**
 * TABELA 1 do Decreto Estadual nº 16.302/2015 (Bahia)
 * Classificação das edificações e áreas de risco quanto à ocupação.
 *
 * Fonte: Decreto 16.302/2015, que regulamenta a Lei Estadual nº 12.929/2013
 * (Lei de Prevenção e Proteção Contra Incêndio do Estado da Bahia).
 */

export interface DivisaoOcupacao {
  cod: string;
  desc: string;
  exemplos: string;
}

export interface GrupoOcupacao {
  codigo: string;
  nome: string;
  divisoes: DivisaoOcupacao[];
}

export const TABELA_1_OCUPACOES: GrupoOcupacao[] = [
  {
    codigo: 'A',
    nome: 'Residencial',
    divisoes: [
      { cod: 'A-1', desc: 'Habitação unifamiliar', exemplos: 'Casas térreas ou assobradadas (isoladas e não isoladas) e condomínios horizontais' },
      { cod: 'A-2', desc: 'Habitação multifamiliar', exemplos: 'Edifícios de apartamento em geral' },
      { cod: 'A-3', desc: 'Habitação coletiva', exemplos: 'Pensionatos, internatos, alojamentos, mosteiros, conventos, residências geriátricas. Capacidade máxima de 16 leitos' },
    ],
  },
  {
    codigo: 'B',
    nome: 'Serviço de Hospedagem',
    divisoes: [
      { cod: 'B-1', desc: 'Hotel e assemelhado', exemplos: 'Hotéis, motéis, pensões, hospedarias, pousadas, albergues, casas de cômodos, divisão A-3 com mais de 16 leitos' },
      { cod: 'B-2', desc: 'Hotel residencial', exemplos: 'Hotéis e assemelhados com cozinha própria nos apartamentos (incluem-se apart-hotéis, flats, hotéis residenciais)' },
    ],
  },
  {
    codigo: 'C',
    nome: 'Comercial',
    divisoes: [
      { cod: 'C-1', desc: 'Comércio com baixa carga de incêndio', exemplos: 'Artigos de metal, louças, artigos hospitalares e outros' },
      { cod: 'C-2', desc: 'Comércio com média e alta carga de incêndio', exemplos: 'Edifícios de lojas de departamentos, magazines, armarinhos, galerias comerciais, supermercados em geral, mercados e outros' },
      { cod: 'C-3', desc: 'Shopping centers', exemplos: 'Centro de compras em geral (shopping centers)' },
    ],
  },
  {
    codigo: 'D',
    nome: 'Serviço Profissional',
    divisoes: [
      { cod: 'D-1', desc: 'Local para prestação de serviço profissional ou condução de negócios', exemplos: 'Escritórios administrativos ou técnicos, instituições financeiras (que não estejam incluídas em D-2), repartições públicas, cabeleireiros, centros profissionais e assemelhados' },
      { cod: 'D-2', desc: 'Agência bancária', exemplos: 'Agências bancárias e assemelhados' },
      { cod: 'D-3', desc: 'Serviço de reparação (exceto os classificados em G-4)', exemplos: 'Lavanderias, assistência técnica, reparação e manutenção de aparelhos eletrodomésticos, chaveiros, pintura de letreiros e outros' },
      { cod: 'D-4', desc: 'Laboratório', exemplos: 'Laboratórios de análises clínicas sem internação, laboratórios químicos, fotográficos e assemelhados' },
    ],
  },
  {
    codigo: 'E',
    nome: 'Educacional e Cultura Física',
    divisoes: [
      { cod: 'E-1', desc: 'Escola em geral', exemplos: 'Escolas de primeiro, segundo e terceiro graus, cursos supletivos e pré-universitário e assemelhados' },
      { cod: 'E-2', desc: 'Escola especial', exemplos: 'Escolas de artes e artesanato, de línguas, de cultura geral, de cultura estrangeira, escolas religiosas e assemelhados' },
      { cod: 'E-3', desc: 'Espaço para cultura física', exemplos: 'Locais de ensino e/ou práticas de artes marciais, natação, ginástica, esportes coletivos, sauna, casas de fisioterapia e assemelhados. Sem arquibancadas' },
      { cod: 'E-4', desc: 'Centro de treinamento profissional', exemplos: 'Escolas profissionais em geral' },
      { cod: 'E-5', desc: 'Pré-escola', exemplos: 'Creches, escolas maternais, jardins de infância' },
      { cod: 'E-6', desc: 'Escola para portadores de deficiências', exemplos: 'Escolas para excepcionais, deficientes visuais e auditivos e assemelhados' },
    ],
  },
  {
    codigo: 'F',
    nome: 'Local de Reunião de Público',
    divisoes: [
      { cod: 'F-1', desc: 'Local onde há objeto de valor inestimável', exemplos: 'Museus, centro de documentos históricos, galerias de arte, bibliotecas e assemelhados' },
      { cod: 'F-2', desc: 'Local religioso e velório', exemplos: 'Igrejas, capelas, sinagogas, mesquitas, templos, cemitérios, crematórios, necrotérios, salas de funerais e assemelhados' },
      { cod: 'F-3', desc: 'Centro esportivo e de exibição', exemplos: 'Arenas em geral, estádios, ginásios, piscinas, rodeios, autódromos, sambódromos, pista de patinação e assemelhados. Todos com arquibancadas' },
      { cod: 'F-4', desc: 'Estação e terminal de passageiro', exemplos: 'Estações rodoferroviárias e marítimas, portos, metrô, aeroportos, heliponto, estações de transbordo em geral e assemelhados' },
      { cod: 'F-5', desc: 'Arte cênica e auditório', exemplos: 'Teatros em geral, cinemas, óperas, auditórios de estúdios de rádio e televisão, auditórios em geral e assemelhados' },
      { cod: 'F-6', desc: 'Clube social e diversão', exemplos: 'Boates, clubes em geral, salões de baile, restaurantes dançantes, clubes sociais, bingo, bilhares, tiro ao alvo, boliche e assemelhados' },
      { cod: 'F-7', desc: 'Construção provisória', exemplos: 'Circos e assemelhados' },
      { cod: 'F-8', desc: 'Local para refeição', exemplos: 'Restaurantes, lanchonetes, bares, cafés, refeitórios, cantinas e assemelhados' },
      { cod: 'F-9', desc: 'Recreação pública', exemplos: 'Jardim zoológico, parques recreativos e assemelhados' },
      { cod: 'F-10', desc: 'Exposição de objetos ou animais', exemplos: 'Salões e salas para exposição de objetos ou animais. Edificações permanentes' },
    ],
  },
  {
    codigo: 'G',
    nome: 'Serviço Automotivo e Assemelhados',
    divisoes: [
      { cod: 'G-1', desc: 'Garagem sem acesso de público e sem abastecimento', exemplos: 'Garagens automáticas, garagens com manobristas' },
      { cod: 'G-2', desc: 'Garagem com acesso de público e sem abastecimento', exemplos: 'Garagens coletivas sem automação, em geral, sem abastecimento (exceto veículos de carga e coletivos)' },
      { cod: 'G-3', desc: 'Local dotado de abastecimento de combustível', exemplos: 'Postos de abastecimento e serviço, garagens (exceto veículos de carga e coletivos)' },
      { cod: 'G-4', desc: 'Serviço de conservação, manutenção e reparos', exemplos: 'Oficinas de conserto de veículos, borracharia (sem recauchutagem), oficinas e garagens de veículos de carga e coletivos, máquinas agrícolas e rodoviárias, retificadoras de motores' },
      { cod: 'G-5', desc: 'Hangares', exemplos: 'Abrigos para aeronaves com ou sem abastecimento' },
    ],
  },
  {
    codigo: 'H',
    nome: 'Serviço de Saúde e Institucional',
    divisoes: [
      { cod: 'H-1', desc: 'Hospital veterinário e assemelhados', exemplos: 'Hospitais, clínicas e consultórios veterinários e assemelhados (inclui-se alojamento com ou sem adestramento)' },
      { cod: 'H-2', desc: 'Local onde pessoas requerem cuidados especiais por limitações físicas ou mentais', exemplos: 'Asilos, orfanatos, abrigos geriátricos, hospitais psiquiátricos, reformatórios, tratamento de dependentes de drogas, álcool e assemelhados. Todos sem celas' },
      { cod: 'H-3', desc: 'Hospital e assemelhado', exemplos: 'Hospitais, casa de saúde, prontos-socorros, clínicas com internação, ambulatórios e postos de atendimento de urgência, postos de saúde e puericultura e assemelhados com internação' },
      { cod: 'H-4', desc: 'Edificações das forças armadas e policiais', exemplos: 'Quartéis, delegacias, postos policiais e assemelhados' },
      { cod: 'H-5', desc: 'Local onde a liberdade das pessoas sofre restrições', exemplos: 'Hospitais psiquiátricos, manicômios, reformatórios, prisões em geral e instituições assemelhadas. Todos com celas' },
      { cod: 'H-6', desc: 'Clínica e consultório médico e odontológico', exemplos: 'Clínicas médicas, consultórios em geral, unidades de hemodiálise, ambulatórios e assemelhados. Todos sem internação' },
    ],
  },
  {
    codigo: 'I',
    nome: 'Indústria',
    divisoes: [
      { cod: 'I-1', desc: 'Indústria com baixo potencial de incêndio (carga de incêndio até 300 MJ/m²)', exemplos: 'Aço, aparelhos de rádio e som, armas, artigos de metal, gesso, esculturas de pedra, ferramentas, joias, relógios, sabão, serralheria, suco de frutas, louças, máquinas' },
      { cod: 'I-2', desc: 'Indústria com médio potencial de incêndio (carga de incêndio entre 300 e 1.200 MJ/m²)', exemplos: 'Artigos de vidro, automóveis, bebidas destiladas, instrumentos musicais, móveis, alimentos, marcenarias, fábricas de caixas' },
      { cod: 'I-3', desc: 'Indústria com alto potencial de incêndio (carga de incêndio superior a 1.200 MJ/m²)', exemplos: 'Atividades industriais que envolvam inflamáveis, materiais oxidantes, ceras, espuma sintética, grãos, tintas, borracha, processamento de lixo' },
    ],
  },
  {
    codigo: 'J',
    nome: 'Depósito',
    divisoes: [
      { cod: 'J-1', desc: 'Depósito de material incombustível', exemplos: 'Edificações sem processo industrial que armazenam tijolos, pedras, areias, cimentos, metais e outros materiais incombustíveis. Todos sem embalagem' },
      { cod: 'J-2', desc: 'Todo tipo de depósito (carga de incêndio até 300 MJ/m²)', exemplos: 'Depósitos com carga de incêndio até 300 MJ/m²' },
      { cod: 'J-3', desc: 'Todo tipo de depósito (carga de incêndio entre 300 e 1.200 MJ/m²)', exemplos: 'Depósitos com carga de incêndio entre 300 e 1.200 MJ/m²' },
      { cod: 'J-4', desc: 'Todo tipo de depósito (carga de incêndio superior a 1.200 MJ/m²)', exemplos: 'Depósitos onde a carga de incêndio ultrapassa 1.200 MJ/m²' },
    ],
  },
  {
    codigo: 'L',
    nome: 'Explosivo',
    divisoes: [
      { cod: 'L-1', desc: 'Comércio', exemplos: 'Comércio em geral de fogos de artifício e assemelhados' },
      { cod: 'L-2', desc: 'Indústria', exemplos: 'Indústria de material explosivo' },
      { cod: 'L-3', desc: 'Depósito', exemplos: 'Depósito de material explosivo' },
    ],
  },
  {
    codigo: 'M',
    nome: 'Especial',
    divisoes: [
      { cod: 'M-1', desc: 'Túnel', exemplos: 'Túnel rodoferroviário e marítimo, destinados a transporte de passageiros ou cargas diversas' },
      { cod: 'M-2', desc: 'Líquido ou gás inflamáveis ou combustíveis', exemplos: 'Edificação destinada a produção, manipulação, armazenamento e distribuição de líquidos ou gases inflamáveis ou combustíveis' },
      { cod: 'M-3', desc: 'Central de comunicação e energia', exemplos: 'Central telefônica, centros de comunicação, centrais de transmissão ou de distribuição de energia e assemelhados' },
      { cod: 'M-4', desc: 'Propriedade em transformação', exemplos: 'Locais em construção ou demolição e assemelhados' },
      { cod: 'M-5', desc: 'Silos', exemplos: 'Armazéns de grãos e assemelhados' },
      { cod: 'M-6', desc: 'Terra selvagem', exemplos: 'Floresta, reserva ecológica, parque florestal e assemelhados' },
      { cod: 'M-7', desc: 'Pátio de contêineres', exemplos: 'Área aberta destinada a armazenamento de contêineres' },
    ],
  },
];

export function getGrupo(codigo: string): GrupoOcupacao | undefined {
  return TABELA_1_OCUPACOES.find((g) => g.codigo === codigo);
}

export function getDivisao(cod: string): { grupo: GrupoOcupacao; divisao: DivisaoOcupacao } | undefined {
  for (const grupo of TABELA_1_OCUPACOES) {
    const divisao = grupo.divisoes.find((d) => d.cod === cod);
    if (divisao) return { grupo, divisao };
  }
  return undefined;
}
