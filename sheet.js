// Vercel Serverless Function
// Busca os dados da planilha do Google Sheets NO SERVIDOR e devolve JSON limpo.
// Isso evita que o navegador de cada visitante precise carregar um <script>
// de docs.google.com diretamente (o que alguns firewalls/adblockers bloqueiam).

const SHEET_ID = '1D8Nm-fg8854eiPFxpvTDdtdy_ZbmKdPwZdGOtOQSQqk';

module.exports = async (req, res) => {
  try {
    const gid = req.query.gid;
    const name = req.query.name;

    let url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    if (name) {
      url += `&sheet=${encodeURIComponent(name)}`;
    } else {
      url += `&gid=${gid || '0'}`;
    }
    url += `&headers=1`;

    const upstream = await fetch(url, {
      headers: {
        // Alguns pedidos sem cara de navegador levam o Google a devolver
        // uma página de erro/aviso em vez do JSON. Isso evita esse caso.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/plain, */*',
      }
    });
    const text = await upstream.text();

    if (!upstream.ok) {
      res.status(502).json({
        status: 'error',
        errors: [{ reason: 'upstream_http_' + upstream.status, message: `O Google respondeu com HTTP ${upstream.status}.` }],
        upstream_snippet: text.slice(0, 400)
      });
      return;
    }

    // A resposta do Google vem embrulhada em algo como:
    // /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
    const jsonStr = match ? match[1] : text;

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseErr) {
      res.status(502).json({
        status: 'error',
        errors: [{ reason: 'parse_failed', message: 'A resposta do Google não veio no formato esperado (pode ser bloqueio, redirecionamento de login, ou a aba não existe).' }],
        upstream_snippet: text.slice(0, 400)
      });
      return;
    }

    if (data.status === 'error') {
      res.status(200).json(data); // repassa o erro real do Google (ex: aba inexistente) sem mascarar
      return;
    }

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ status: 'error', errors: [{ reason: 'server_error', message: e.message }] });
  }
};
