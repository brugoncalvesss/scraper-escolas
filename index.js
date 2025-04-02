const express = require('express');
const path = require('path');
const { scrapeEscolaToExcel } = require('./scraper');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.post('/scrape', async (req, res) => {
  const codesc = req.body.codesc;

  if (!codesc) {
    return res.status(400).send('Código da escola é obrigatório!');
  }

  try {
    const { filePath, fileName } = await scrapeEscolaToExcel(codesc);

    res.download(filePath, fileName, err => {
      if (err) {
        console.error('Erro no download:', err);
        res.status(500).send('Erro ao enviar arquivo.');
      }
      fs.unlink(filePath, () => {}); // remove o arquivo temporário
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao extrair dados.');
  }
});

app.listen(port, () => {
  console.log(`🟢 Interface disponível em: http://localhost:${port}`);
});
