# AMAVI — Catálogo Online

Front-end do catálogo virtual da **Amavi**, desenvolvido a partir do projeto de
extensão (ADS 4AN, 2026) e do protótipo Figma da marca. Este pacote contém
**apenas o front-end** — não há back-end nem banco de dados ainda, conforme
solicitado. Os dados (produtos e sessão do admin) ficam salvos no
`localStorage` do navegador, através de uma camada de API simulada que já
está pronta para ser trocada por chamadas HTTP reais.

## O que está incluído

- **Vitrine pública**
  - Catálogo com busca, filtro por categoria e por tamanho
  - Página de produto com seleção de tamanho/cor e produtos relacionados
  - Carrinho de compras (drawer lateral + página completa), com alteração de
    quantidade e remoção de itens
  - Finalização do pedido: botão que **abre o WhatsApp** já com a lista de
    itens, tamanhos, cores e o total do pedido preenchidos na mensagem, e
    botão alternativo que leva ao **Instagram** da loja
- **Painel administrativo** (`/admin`)
  - Login protegido (`/admin/login`)
  - Listagem de produtos com edição e exclusão
  - Formulário de cadastro/edição com nome, descrição, categoria, preço,
    estoque, tamanhos, cores e upload de múltiplas fotos
  - Tudo o que é cadastrado aparece **imediatamente** na vitrine pública

## Credenciais de demonstração

```
E-mail: admin@amavi.com.br
Senha:  amavi123
```

Definidas em `src/api/authApi.js`. Troque antes de publicar o site, e — assim
que o back-end existir — substitua esse login mockado por autenticação real.

## Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org) 18 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Para gerar a versão de produção (arquivos estáticos prontos para qualquer
hospedagem — Vercel, Netlify, um servidor Apache/Nginx etc.):

```bash
npm run build
```

Os arquivos finais ficam em `dist/`.

## Configurações rápidas

Edite `src/config/store.js` para ajustar, sem tocar em nenhum componente:

- `whatsappNumber` — número do WhatsApp da loja (DDI + DDD + número, só dígitos)
- `instagramUrl` / `instagramHandle` — perfil do Instagram
- `CATEGORIES` — categorias de produto disponíveis no filtro e no cadastro
- `SIZES` — tamanhos disponíveis no filtro e no cadastro
- `freeShippingThreshold` — valor mínimo para a mensagem de frete grátis

## Estrutura do projeto

```
src/
  api/            # Camada de "API" — hoje simulada com localStorage
    httpClient.js #   helpers de leitura/escrita + simulação de latência
    productsApi.js#   CRUD de produtos (listar, criar, editar, excluir)
    authApi.js    #   login/logout/sessão do admin
  config/
    store.js      # nome da loja, WhatsApp, Instagram, categorias, tamanhos
  context/        # Providers React (carrinho, produtos, autenticação)
  components/     # Header, Footer, ProductCard, CartDrawer, Layout...
  pages/          # Home, ProductDetail, Cart
    admin/        # AdminLogin, AdminLayout, AdminDashboard, AdminProductForm
  utils/
    whatsapp.js   # monta a mensagem/link de checkout (wa.me)
    files.js      # converte upload de imagem em base64 (sem back-end)
  data/
    seedProducts.js # produtos de demonstração (substituíveis pelo admin)
```

## Como plugar o back-end real depois

Este front foi estruturado propositalmente para que a troca por um back-end
de verdade (PHP/Python + MySQL/MongoDB, conforme o projeto de extensão) seja
localizada:

1. Em `src/api/productsApi.js` e `src/api/authApi.js`, troque o corpo de cada
   função por chamadas `fetch` para os endpoints reais (`GET /produtos`,
   `POST /produtos`, `POST /admin/login` etc.) — a assinatura das funções
   (parâmetros e retorno) pode continuar igual, então nenhuma tela precisa
   mudar.
2. Em `src/utils/files.js`, troque a conversão para base64 por um upload real
   (`multipart/form-data`) para o servidor/serviço de imagens, salvando a URL
   retornada.
3. Adicione variáveis de ambiente (`VITE_API_URL` etc.) conforme necessário.

## Observações

- As fotos de produto dos itens de demonstração são placeholders gerados
  localmente (SVG), sem depender de nenhum serviço externo — substitua pelos
  produtos reais pelo painel admin.
- Todo o carrinho e o cadastro de produtos usam `localStorage`, então os
  dados são **por navegador** até a chegada do back-end — nada é
  compartilhado entre dispositivos diferentes ainda.
