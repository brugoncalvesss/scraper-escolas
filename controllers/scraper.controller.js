const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const {
  scrapeEscolaToExcel,
  scrapeLoteParaExcel
} = require('../services/scraper.service');
const codesList = require('../utils/codesList');

async function scrapeIndividual(req, res) {
  const codesc = req.body.codesc;

  if (!codesc) {
    return res.status(400).send('Código da escola é obrigatório!');
  }

  try {
    const { filePath, fileName } = await scrapeEscolaToExcel(codesc);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Erro no download:', err);
        res.status(500).send('Erro ao enviar arquivo.');
      }
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao extrair dados.');
  }
}

async function scrapeLote(req, res) {
  try {
    const { filePath, fileName } = await scrapeLoteParaExcel(codesList);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Erro ao enviar Excel:', err);
        res.status(500).send('Erro ao enviar arquivo.');
      }
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    console.error('Erro no lote:', err);
    res.status(500).send('Erro ao processar lote de escolas.');
  }
}

module.exports = {
  scrapeIndividual,
  scrapeLote
};
