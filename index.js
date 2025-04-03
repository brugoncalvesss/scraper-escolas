const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { scrapeEscolaToExcel } = require('./scraper');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Rota individual (já existente)
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
      fs.unlink(filePath, () => {});
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao extrair dados.');
  }
});

// 🆕 Rota para múltiplos códigos
app.post('/scrape-lote', async (req, res) => {
  const codesList = require('./codesList');

  const tempFiles = [];

  try {
    for (const code of codesList) {
      const { filePath } = await scrapeEscolaToExcel(code);
      tempFiles.push(filePath);
    }

    const zipPath = path.join(__dirname, 'escolas_lote.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    tempFiles.forEach(file => {
      const fileName = path.basename(file);
      archive.file(file, { name: fileName });
    });

    await archive.finalize();

    output.on('close', () => {
      res.download(zipPath, 'escolas_lote.zip', err => {
        if (err) {
          console.error('Erro ao enviar ZIP:', err);
          res.status(500).send('Erro ao enviar arquivo ZIP.');
        }

        // Limpa os arquivos após envio
        fs.unlink(zipPath, () => {});
        tempFiles.forEach(f => fs.unlink(f, () => {}));
      });
    });
  } catch (err) {
    console.error('Erro no lote:', err);
    res.status(500).send('Erro ao processar lote de escolas.');
  }
});

app.listen(port, () => {
  console.log(`🟢 Servidor rodando: http://localhost:${port}`);
});
