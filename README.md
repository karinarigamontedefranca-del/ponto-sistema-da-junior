# Pulso — Dashboard de Ponto (v4 — busca via servidor)

Agora os dados são buscados no **servidor** (função serverless do Vercel em
`/api/sheet.js`), não mais direto no navegador de quem acessa. Isso evita
bloqueios de firewall/adblock que impedem carregar scripts de docs.google.com
dentro de outro site.

## Estrutura
- `index.html` — o dashboard
- `api/sheet.js` — função serverless que busca a planilha e devolve JSON limpo
- `vercel.json` — configuração mínima

## Antes de publicar
1. Planilha → Compartilhar → Acesso geral → **"Qualquer pessoa com o link" → Leitor**.
2. (Opcional) crie uma aba **Setores** com colunas **Nome** e **Setor**.

## Publicar no Vercel via GitHub
1. Suba TODOS os arquivos desta pasta (incluindo a pasta `api/` inteira) para
   o repositório no GitHub — a estrutura de pastas importa aqui, `api/sheet.js`
   precisa ficar exatamente nesse caminho.
2. No Vercel: Add New → Project → importe o repositório → Deploy (não precisa
   mudar nenhuma configuração de build, o Vercel detecta a função automaticamente).
3. Depois do deploy, teste abrindo `https://SEU-PROJETO.vercel.app/api/sheet?gid=0`
   direto no navegador — deve aparecer um JSON com os dados da planilha.
   Se aparecer isso, o dashboard vai funcionar.

## Se quiser atualizar depois
Edite os arquivos no GitHub (ou suba de novo) — o Vercel republica sozinho a
cada commit. Os dados da planilha em si atualizam sozinhos, sem precisar
mexer em nada aqui.
