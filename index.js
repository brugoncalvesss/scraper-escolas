const express = require('express');
const path = require('path');
const {
  scrapeIndividual,
  scrapeLote
} = require('./controllers/scraper.controller');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.post('/scrape', scrapeIndividual);
app.post('/scrape-lote', scrapeLote);

app.listen(port, () => {
  console.log(`🟢 Servidor rodando: http://localhost:${port}`);
});
