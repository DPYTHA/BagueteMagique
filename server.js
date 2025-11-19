const express = require('express');
const app = express();

// Page d'accueil avec la baguette magique
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
        <title>🔮 Ma Baguette Magique</title>
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
                max-width: 500px;
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
        </style>
    </head>
    <body>
        <div class="magic-box">
            <h1>🔮 Ma Baguette Magique</h1>
            <p>Entre l'adresse de n'importe quel site :</p>
            <form action="/magie" method="get">
                <input type="text" name="url" placeholder="https://example.com" required>
                <br>
                <button type="submit">✨ Ouvrir le Site !</button>
            </form>
            <p><small>Exemple: https://www.youtube.com</small></p>
        </div>
    </body>
    </html>
  `);
});

// La magie qui redirige vers n'importe quel site
app.get('/magie', (req, res) => {
  let url = req.query.url;
  
  // Petit nettoyage magique
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  
  console.log('🔮 Redirection vers:', url);
  res.redirect(url);
});

// Écoute sur le port de Railway
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🔮 Baguette magique activée sur le port ${port}`);
});