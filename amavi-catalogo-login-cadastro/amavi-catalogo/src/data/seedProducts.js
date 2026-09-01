// Produtos de demonstração. Servem apenas para o catálogo não nascer vazio —
// a administradora pode editar/excluir tudo isso pelo painel admin, e novos
// produtos cadastrados por lá persistem independentemente desta lista.

// Gera uma imagem de placeholder 100% local (SVG em data-URI), sem depender
// de nenhum serviço externo. Quando a administradora cadastra um produto de
// verdade pelo painel admin, a foto enviada substitui esse placeholder.
function placeholder(label, bg, fg = '3A3532') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
      <rect width="600" height="750" fill="#${bg}" />
      <text x="300" y="375" font-family="Georgia, serif" font-size="30" fill="#${fg}"
        text-anchor="middle" dominant-baseline="middle">${label}</text>
    </svg>
  `.trim()
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const seedProducts = [
  {
    id: 'p-001',
    name: 'Blusa Cetim Manga Longa',
    description:
      'Blusa de cetim com caimento fluido e manga longa. Peça versátil, do trabalho ao happy hour, pensada para valorizar diferentes tipos de corpo.',
    category: 'Blusas',
    price: 189.9,
    stock: 14,
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Off White'],
    isNew: true,
    images: [placeholder('Blusa Cetim', 'F7D9D4'), placeholder('Blusa Cetim 2', 'E4DDD9')],
  },
  {
    id: 'p-002',
    name: 'Vestido Midi Floral',
    description:
      'Vestido midi em viscose leve, estampa floral exclusiva Amavi. Alças reguláveis e forro interno.',
    category: 'Vestidos',
    price: 259.0,
    stock: 8,
    sizes: ['PP', 'P', 'M', 'G'],
    colors: ['Rosa', 'Azul'],
    isNew: true,
    images: [placeholder('Vestido Floral', 'F1C4BD')],
  },
  {
    id: 'p-003',
    name: 'Calça Alfaiataria Wide Leg',
    description:
      'Calça de alfaiataria com modelagem wide leg, cintura alta e elastano para maior conforto no dia a dia.',
    category: 'Calças',
    price: 219.9,
    stock: 20,
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    colors: ['Bege', 'Preto'],
    isNew: false,
    images: [placeholder('Calça Wide Leg', 'D6CDC8')],
  },
  {
    id: 'p-004',
    name: 'Saia Midi Plissada',
    description: 'Saia midi plissada em tecido leve, ótima para compor looks casuais ou mais elegantes.',
    category: 'Saias',
    price: 159.9,
    stock: 11,
    sizes: ['PP', 'P', 'M', 'G'],
    colors: ['Verde', 'Terracota'],
    isNew: false,
    images: [placeholder('Saia Plissada', 'F7D9D4')],
  },
  {
    id: 'p-005',
    name: 'Conjunto Blazer + Short Alfaiataria',
    description: 'Conjunto de blazer estruturado e short de alfaiataria, ideal para eventos e reuniões de trabalho.',
    category: 'Conjuntos',
    price: 349.9,
    stock: 6,
    sizes: ['P', 'M', 'G'],
    colors: ['Preto'],
    isNew: true,
    images: [placeholder('Conjunto Alfaiataria', 'E4DDD9')],
  },
  {
    id: 'p-006',
    name: 'Cinto de Couro Ecológico',
    description: 'Cinto em couro ecológico com fivela dourada, acabamento premium.',
    category: 'Acessórios',
    price: 79.9,
    stock: 25,
    sizes: ['Único'],
    colors: ['Caramelo', 'Preto'],
    isNew: false,
    images: [placeholder('Cinto Couro', 'C2B7B1')],
  },
]
