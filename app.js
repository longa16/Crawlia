const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/performance-test', async (req, res) => {
  const url = req.body.url;
  try {
    const { ttfb, response } = await getTTFB(url);
    const seo = analyzeSEO(response.data);
    const deadlinks = await findDeadlinks(response.data);
    const report = { ttfb, seo, deadlinks };
    res.render('report', { report, url });
  } catch (error) {
    res.send('Erreur lors de l\'analyse de la page. Veuillez vérifier l\'URL et réessayer.');
  }
});

const getTTFB = async (url) => {
  const start = Date.now();
  const response = await axios.get(url);
  const ttfb = Date.now() - start;
  return { ttfb, response };
};

const analyzeSEO = (html) => {
  const $ = cheerio.load(html);
  return {
    metaDescription: !!$('meta[name="description"]').attr('content'),
    h1: !!$('h1').length,
    h2: !!$('h2').length,
    missingAltImages: $('img:not([alt])').map((i, el) => $(el).attr('src')).get()
  };
};

const findDeadlinks = async (html) => {
  const $ = cheerio.load(html);
  const links = $('a[href]').map((i, el) => $(el).attr('href')).get();
  const deadlinks = [];
  for (let link of links) {
    try {
      await axios.head(link);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        deadlinks.push(link);
      }
    }
  }
  return deadlinks;
};

app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
