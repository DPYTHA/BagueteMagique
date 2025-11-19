const express = require('express');
const https = require('https');
const http = require('http');
const app = express();

// Middleware pour parser les données
app.use(express.urlencoded({ extended: true }));

// Page d'accueil
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
        <title>🔮 Ma Baguette Magique PROXY</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .magic-box {
                background: white;
                padding: 30px;
                border-radius: 15px;
                color: black;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 600px;
                margin: 0 auto;
            }
            input {
                width: 80%;
                padding: 12px;
                font-size: 16px;
                border: 2px solid #667eea;
                border-radius: 8px;
                margin: 10px;
            }
            button {
                background: #667eea;
                color: white;
                padding: 12px 30px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
            }
            button:hover {
                background: #764ba2;
            }
            .warning {
                color: red;
                font-size: 14px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="magic-box">
            <h1>🔮 Proxy Magique</h1>
            <p>Entre l'adresse de n'importe quel site :</p>
            <form action="/proxy" method="get">
                <input type="text" name="url" placeholder="https://example.com" required>
                <br>
                <button type="submit">✨ Accéder au Site !</button>
            </form>
            <p><small>Exemple: https://www.google.com</small></p>
            <div class="warning">
                ⚠️ Cette version utilise un vrai proxy depuis Railway !
            </div>
        </div>
    </body>
    </html>
  `);
});

// Proxy magique - version améliorée
app.get('/proxy', (req, res) => {
  let targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.redirect('/');
  }
  
  // Nettoyage de l'URL
  if (!targetUrl.startsWith('http')) {
    targetUrl = 'https://' + targetUrl;
  }
  
  console.log('🔮 Requête proxy vers:', targetUrl);
  
  try {
    const parsedUrl = new URL(targetUrl);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const proxyReq = protocol.request(options, (proxyRes) => {
      // Transférer les headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // Transférer les données
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error('❌ Erreur proxy:', err);
      res.status(500).send('Erreur lors de l\'accès au site: ' + err.message);
    });
    
    proxyReq.end();
    
  } catch (error) {
    console.error('❌ URL invalide:', error);
    res.status(400).send('URL invalide');
  }
});

// Route pour afficher le contenu dans un iframe (alternative)
app.get('/view', (req, res) => {
  let url = req.query.url;
  
  if (!url) {
    return res.redirect('/');
  }
  
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  
  res.send(`
    <html>
    <head>
        <title>Visionneuse - ${url}</title>
        <style>
            body { margin: 0; padding: 0; }
            iframe { width: 100%; height: 100vh; border: none; }
            .header { 
                background: #667eea; 
                color: white; 
                padding: 10px; 
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="header">
            🔮 Affichage de: ${url} 
            <a href="/" style="color: white; margin-left: 20px;">← Retour</a>
        </div>
        <iframe src="/proxy?url=${encodeURIComponent(url)}" sandbox="allow-scripts allow-forms allow-same-origin allow-popups"></iframe>
    </body>
    </html>
  `);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🔮 Proxy magique activé sur le port ${port}`);
});