const express = require('express');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const zlib = require('zlib');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Page d'accueil simplifiée
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>🔮 Proxy Ultime - Accédez à tous les sites</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                color: #333;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                color: white;
            }
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }
            .proxy-box {
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            }
            .url-input {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            .url-input input {
                flex: 1;
                padding: 15px;
                font-size: 16px;
                border: 2px solid #ddd;
                border-radius: 8px;
                outline: none;
                transition: border-color 0.3s;
            }
            .url-input input:focus {
                border-color: #667eea;
            }
            .url-input button {
                padding: 15px 30px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.3s;
            }
            .url-input button:hover {
                background: #764ba2;
            }
            .examples {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 20px;
            }
            .example-btn {
                padding: 10px;
                background: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 6px;
                cursor: pointer;
                text-align: center;
                transition: all 0.3s;
            }
            .example-btn:hover {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }
            .info {
                background: #e7f3ff;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin-top: 20px;
                border-radius: 4px;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            .feature {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔮 Proxy Ultime</h1>
                <p>Accédez à n'importe quel site web, sans restrictions</p>
            </div>
            
            <div class="proxy-box">
                <div class="url-input">
                    <input type="text" id="urlInput" placeholder="https://exemple.com" autofocus>
                    <button onclick="navigateToSite()">🚀 Accéder au Site</button>
                </div>
                
                <div class="info">
                    <strong>💡 Comment ça marche :</strong> 
                    Toutes les requêtes passent par les serveurs Railway (hors de votre pays), 
                    contournant ainsi toutes les restrictions.
                </div>

                <div class="features">
                    <div class="feature">✅ Support HTTPS complet</div>
                    <div class="feature">✅ Cookies et sessions</div>
                    <div class="feature">✅ JavaScript activé</div>
                    <div class="feature">✅ Formulaires fonctionnels</div>
                </div>

                <h3 style="margin: 20px 0 10px 0;">Sites de test :</h3>
                <div class="examples">
                    <div class="example-btn" onclick="setUrl('https://www.youtube.com')">YouTube</div>
                    <div class="example-btn" onclick="setUrl('https://www.facebook.com')">Facebook</div>
                    <div class="example-btn" onclick="setUrl('https://twitter.com')">Twitter</div>
                    <div class="example-btn" onclick="setUrl('https://www.instagram.com')">Instagram</div>
                    <div class="example-btn" onclick="setUrl('https://www.reddit.com')">Reddit</div>
                    <div class="example-btn" onclick="setUrl('https://www.wikipedia.org')">Wikipedia</div>
                    <div class="example-btn" onclick="setUrl('https://www.google.com')">Google</div>
                    <div class="example-btn" onclick="setUrl('https://github.com')">GitHub</div>
                </div>
            </div>
        </div>

        <script>
            function setUrl(url) {
                document.getElementById('urlInput').value = url;
            }

            function navigateToSite() {
                let url = document.getElementById('urlInput').value.trim();
                if (!url) return;
                
                if (!url.startsWith('http')) {
                    url = 'https://' + url;
                }
                
                const encodedUrl = encodeURIComponent(url);
                window.location.href = '/browse?url=' + encodedUrl;
            }

            document.getElementById('urlInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    navigateToSite();
                }
            });
        </script>
    </body>
    </html>
  `);
});

// PROXY ULTIME
app.use('/browse', async (req, res) => {
  try {
    let targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.redirect('/');
    }

    targetUrl = decodeURIComponent(targetUrl);
    
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    console.log('🌐 Requête proxy vers:', targetUrl);

    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        'host': parsedUrl.hostname,
        'origin': parsedUrl.origin,
        'referer': parsedUrl.origin,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'cache-control': 'no-cache',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'upgrade-insecure-requests': '1'
      },
      rejectUnauthorized: false,
      timeout: 15000
    };

    delete options.headers['if-none-match'];
    delete options.headers['if-modified-since'];

    const protocol = isHttps ? https : http;

    const proxyReq = protocol.request(options, (proxyRes) => {
      console.log(`📡 Réponse reçue: ${proxyRes.statusCode} pour ${targetUrl}`);
      
      const responseHeaders = { ...proxyRes.headers };
      
      if (responseHeaders.location) {
        responseHeaders.location = rewriteUrl(responseHeaders.location, parsedUrl.origin);
      }
      
      if (responseHeaders['set-cookie']) {
        responseHeaders['set-cookie'] = rewriteCookies(responseHeaders['set-cookie']);
      }
      
      let encoding = proxyRes.headers['content-encoding'];
      let shouldUnzip = encoding === 'gzip' || encoding === 'deflate' || encoding === 'br';
      
      res.writeHead(proxyRes.statusCode, responseHeaders);
      
      let chunks = [];
      
      proxyRes.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      proxyRes.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        if (shouldUnzip) {
          try {
            zlib.unzip(buffer, (err, decompressed) => {
              if (err) {
                console.log('❌ Erreur décompression:', err);
                const rewritten = rewriteContent(buffer.toString(), targetUrl);
                res.end(rewritten);
              } else {
                const rewritten = rewriteContent(decompressed.toString(), targetUrl);
                res.end(rewritten);
              }
            });
          } catch (e) {
            console.log('❌ Erreur traitement décompression:', e);
            const rewritten = rewriteContent(buffer.toString(), targetUrl);
            res.end(rewritten);
          }
        } else {
          const rewritten = rewriteContent(buffer.toString(), targetUrl);
          res.end(rewritten);
        }
      });
    });

    proxyReq.on('error', (err) => {
      console.error('❌ Erreur proxy:', err);
      res.status(500).send(`
        <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h2>❌ Erreur de connexion</h2>
          <p>Impossible d'accéder au site: ${targetUrl}</p>
          <p>Erreur: ${err.message}</p>
          <a href="/" style="color: #667eea;">← Retour à l'accueil</a>
        </body>
        </html>
      `);
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      res.status(504).send('Timeout - Le site met trop de temps à répondre');
    });

    if (req.method === 'POST' && req.body) {
      const postData = JSON.stringify(req.body);
      proxyReq.write(postData);
    }

    proxyReq.end();

  } catch (error) {
    console.error('💥 Erreur générale:', error);
    res.status(500).send(`
      <html>
      <body style="font-family: Arial; padding: 40px; text-align: center;">
        <h2>❌ Erreur interne</h2>
        <p>${error.message}</p>
        <a href="/" style="color: #667eea;">← Retour à l'accueil</a>
      </body>
      </html>
    `);
  }
});

function rewriteContent(content, baseUrl) {
  if (!content || typeof content !== 'string') return content;
  
  try {
    const base = new URL(baseUrl);
    const baseOrigin = base.origin;
    const proxyBase = '/browse?url=';
    
    content = content.replace(
      /(href|src|action)=["'](https?:\/\/[^"']+)["']/gi,
      (match, attr, url) => {
        return `${attr}="${proxyBase}${encodeURIComponent(url)}"`;
      }
    );
    
    content = content.replace(
      /(href|src|action)=["'](\/[^"']*)["']/gi,
      (match, attr, path) => {
        const fullUrl = baseOrigin + path;
        return `${attr}="${proxyBase}${encodeURIComponent(fullUrl)}"`;
      }
    );
    
    content = content.replace(
      /url\(["']?(https?:\/\/[^"')]+)["']?\)/gi,
      (match, url) => {
        return `url("${proxyBase}${encodeURIComponent(url)}")`;
      }
    );
    
    content = content.replace(
      /url\(["']?(\/[^"')]+)["']?\)/gi,
      (match, path) => {
        const fullUrl = baseOrigin + path;
        return `url("${proxyBase}${encodeURIComponent(fullUrl)}")`;
      }
    );
    
    content = content.replace(
      /window\.location\.href\s*=\s*["'](https?:\/\/[^"']+)["']/gi,
      (match, url) => {
        return `window.location.href = "${proxyBase}${encodeURIComponent(url)}"`;
      }
    );
    
    return content;
  } catch (error) {
    console.log('⚠️ Erreur réécriture contenu:', error);
    return content;
  }
}

function rewriteUrl(url, baseOrigin) {
  try {
    if (url.startsWith('http')) {
      return '/browse?url=' + encodeURIComponent(url);
    } else if (url.startsWith('/')) {
      const fullUrl = baseOrigin + url;
      return '/browse?url=' + encodeURIComponent(fullUrl);
    }
    return url;
  } catch (error) {
    return url;
  }
}

function rewriteCookies(cookies) {
  if (Array.isArray(cookies)) {
    return cookies.map(cookie => 
      cookie.replace(
        /(domain|Domain)=[^;]+;/gi, 
        ''
      ).replace(
        /(secure|Secure);/gi,
        ''
      )
    );
  }
  return cookies;
}

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🔮 PROXY ULTIME activé sur le port ${port}`);
  console.log(`🌍 Accédez à: http://localhost:${port}`);
  console.log(`🚀 Prêt à contourner toutes les restrictions!`);
});