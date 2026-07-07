import React, { useState } from 'react';
import { Flame, Building, FileText } from 'lucide-react';

const TRRFCalculator = () => {
  const [grupo, setGrupo] = useState('');
  const [divisao, setDivisao] = useState('');
  const [profundidade, setProfundidade] = useState('');
  const [altura, setAltura] = useState('');
  const [resultado, setResultado] = useState(null);

  const grupos = {
    'A': { nome: 'Residencial', divisao: ['A-1 a A-3'] },
    'B': { nome: 'Serviços de hospedagem', divisao: ['B-1 e B-2'] },
    'C': { nome: 'Comercial varejista', divisao: ['C-1', 'C-2', 'C-3'] },
    'D': { nome: 'Serviços profissionais, pessoais e técnicos', divisao: ['D-1 a D-3'] },
    'E': { nome: 'Educacional e cultura física', divisao: ['E-1 a E-6'] },
    'F': { nome: 'Locais de reunião de público', divisao: ['F-1, F-2, F-3, F-6, F-8 e F-10', 'F-4, F-5, F-7 e F-9'] },
    'G': { nome: 'Serviços automotivos', divisao: ['G-1 e G-2 não abertos', 'G-1 e G-2 abertos', 'G-3, G-4 e G-5'] },
    'H': { nome: 'Serviços de saúde e institucional', divisao: ['H-1 e H-4', 'H-2, H-3 e H-5'] },
    'I': { nome: 'Industrial', divisao: ['I-1', 'I-2', 'I-3'] },
    'J': { nome: 'Depósitos', divisao: ['J-1', 'J-2', 'J-3', 'J-4'] },
    'L': { nome: 'Explosivos', divisao: ['L-1, L-2 e L-3'] },
    'M': { nome: 'Especial', divisao: ['M-1', 'M-2', 'M-3'] }
  };

  const profundidadeOpcoes = [
    { label: 'h > 10m', value: 'S2' },
    { label: 'h ≤ 10m', value: 'S1' },
    { label: 'h ≤ 6m', value: 'P1' }
  ];

  const alturaOpcoes = [
    { label: '6m < h ≤ 12m', value: 'P2_6_12' },
    { label: '12m < h ≤ 23m', value: 'P2_12_23' },
    { label: '23m < h ≤ 30m', value: 'P3_23_30' },
    { label: '30m < h ≤ 80m', value: 'P4_30_80' },
    { label: '80m < h ≤ 120m', value: 'P5_80_120' },
    { label: '120m < h ≤ 150m', value: 'P6_120_150' },
    { label: '150m < h ≤ 250m', value: 'P7_150_250' }
  ];

  const tabelaTRRF = {
    'A': {
      'A-1 a A-3': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 30, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 120, 'P6_120_150': 150, 'P7_150_250': 180
      }
    },
    'B': {
      'B-1 e B-2': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 150, 'P6_120_150': 180, 'P7_150_250': 180
      }
    },
    'C': {
      'C-1': {
        'S2': 90, 'S1': 60, 'P1': 60,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 150, 'P6_120_150': 150, 'P7_150_250': 180
      },
      'C-2': {
        'S2': 90, 'S1': 60, 'P1': 60,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 150, 'P6_120_150': 150, 'P7_150_250': 180
      },
      'C-3': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 120, 'P6_120_150': 150, 'P7_150_250': 180
      }
    },
    'D': {
      'D-1 a D-3': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 120, 'P6_120_150': 150, 'P7_150_250': 180
      }
    },
    'E': {
      'E-1 a E-6': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 30, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 120, 'P6_120_150': 150, 'P7_150_250': 180
      }
    },
    'F': {
      'F-1, F-2, F-3, F-6, F-8 e F-10': {
        'S2': 90, 'S1': 60, 'P1': 60,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 150, 'P6_120_150': 180, 'P7_150_250': null
      },
      'F-4, F-5, F-7 e F-9': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      }
    },
    'G': {
      'G-1 e G-2 não abertos': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 120, 'P6_120_150': 150, 'P7_150_250': 180
      },
      'G-1 e G-2 abertos': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 30, 'P2_12_23': 30, 'P3_23_30': 30,
        'P4_30_80': 60, 'P5_80_120': 120, 'P6_120_150': 150, 'P7_150_250': 150
      },
      'G-3, G-4 e G-5': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 120, 'P6_120_150': 150, 'P7_150_250': 180
      }
    },
    'H': {
      'H-1 e H-4': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 150, 'P6_120_150': 180, 'P7_150_250': 180
      },
      'H-2, H-3 e H-5': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': 150, 'P6_120_150': 180, 'P7_150_250': 180
      }
    },
    'I': {
      'I-1': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 30, 'P2_12_23': 30, 'P3_23_30': 60,
        'P4_30_80': 120, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      },
      'I-2': {
        'S2': 120, 'S1': 90, 'P1': 30,
        'P2_6_12': 30, 'P2_12_23': 60, 'P3_23_30': 90,
        'P4_30_80': 120, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      },
      'I-3': {
        'S2': 120, 'S1': 90, 'P1': 60,
        'P2_6_12': 60, 'P2_12_23': 90, 'P3_23_30': 120,
        'P4_30_80': 120, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      }
    },
    'J': {
      'J-1': {
        'S2': 60, 'S1': 30, 'P1': null,
        'P2_6_12': null, 'P2_12_23': 30, 'P3_23_30': 30,
        'P4_30_80': 60, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      },
      'J-2': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 30, 'P2_12_23': 30, 'P3_23_30': 30,
        'P4_30_80': 60, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      },
      'J-3': {
        'S2': 90, 'S1': 60, 'P1': 30,
        'P2_6_12': 60, 'P2_12_23': 60, 'P3_23_30': 120,
        'P4_30_80': 120, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      },
      'J-4': {
        'S2': 120, 'S1': 90, 'P1': 60,
        'P2_6_12': 60, 'P2_12_23': 90, 'P3_23_30': 120,
        'P4_30_80': 120, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      }
    },
    'L': {
      'L-1, L-2 e L-3': {
        'S2': 120, 'S1': 120, 'P1': 120,
        'P2_6_12': 120, 'P2_12_23': 120, 'P3_23_30': 120,
        'P4_30_80': null, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      }
    },
    'M': {
      'M-1': {
        'S2': 120, 'S1': 120, 'P1': 120,
        'P2_6_12': null, 'P2_12_23': null, 'P3_23_30': null,
        'P4_30_80': null, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      },
      'M-2': {
        'S2': 120, 'S1': 90, 'P1': 60,
        'P2_6_12': 60, 'P2_12_23': 90, 'P3_23_30': 120,
        'P4_30_80': null, 'P5_80_120': null, 'P6_120_150': null, 'P7_150_250': null
      },
      'M-3': {
        'S2': 120, 'S1': 90, 'P1': 90,
        'P2_6_12': 90, 'P2_12_23': 120, 'P3_23_30': 120,
        'P4_30_80': 120, 'P5_80_120': 150, 'P6_120_150': null, 'P7_150_250': null
      }
    }
  };

  const calcularTRRF = () => {
    if (!grupo || !divisao || !profundidade || !altura) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const chaveDimensao = profundidade === 'P1' ? profundidade : altura;
    const trrf = tabelaTRRF[grupo][divisao][chaveDimensao];

    setResultado({
      grupo: grupos[grupo].nome,
      divisao: divisao,
      profundidade: profundidadeOpcoes.find(p => p.value === profundidade)?.label || '',
      altura: alturaOpcoes.find(a => a.value === altura)?.label || '',
      trrf: trrf
    });
  };

  const resetar = () => {
    setGrupo('');
    setDivisao('');
    setProfundidade('');
    setAltura('');
    setResultado(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Flame className="text-red-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Calculadora TRRF</h1>
              <p className="text-sm text-gray-600">Tempo Requerido de Resistência ao Fogo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline mr-2" size={16} />
                Grupo de Ocupação
              </label>
              <select
                value={grupo}
                onChange={(e) => { setGrupo(e.target.value); setDivisao(''); }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Selecione o grupo...</option>
                {Object.entries(grupos).map(([key, val]) => (
                  <option key={key} value={key}>{key} - {val.nome}</option>
                ))}
              </select>
            </div>

            {grupo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Divisão</label>
                <select
                  value={divisao}
                  onChange={(e) => setDivisao(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione a divisão...</option>
                  {grupos[grupo].divisao.map((div) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profundidade do Subsolo</label>
              <select
                value={profundidade}
                onChange={(e) => setProfundidade(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {profundidadeOpcoes.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {profundidade !== 'P1' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Altura da Edificação</label>
                <select
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {alturaOpcoes.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={calcularTRRF}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Calcular TRRF
              </button>
              <button
                onClick={resetar}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {resultado && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Resultado da Classificação</h2>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Grupo de Ocupação</p>
                <p className="text-lg font-semibold text-gray-800">{resultado.grupo}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Divisão</p>
                <p className="text-lg font-semibold text-gray-800">{resultado.divisao}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Dimensões</p>
                <p className="text-lg font-semibold text-gray-800">
                  {resultado.profundidade}
                  {resultado.altura && ` • ${resultado.altura}`}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-lg text-white">
                <p className="text-sm opacity-90">Tempo Requerido de Resistência ao Fogo (TRRF)</p>
                <p className="text-4xl font-bold mt-2">
                  {resultado.trrf !== null ? `${resultado.trrf} minutos` : 'Não aplicável'}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Observação:</strong> Este cálculo é baseado no Decreto Estadual nº 16.302/2015. 
                Para edificações de madeira, verificar item 5.30 do decreto. Consulte sempre um profissional 
                habilitado para orientações específicas ao seu projeto.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TRRFCalculator;