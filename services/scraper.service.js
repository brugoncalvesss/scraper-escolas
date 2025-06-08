const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function scrapeEscolaToExcel(codesc) {
  const url = `https://transparencia.educacao.sp.gov.br/Home/DetalhesEscola?codesc=${codesc}`;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  const nomeEscola = await page.$eval('#nome-escola', (el) =>
    el.innerText.trim()
  );

  const gestores = await page.$$eval('#myTable2 tbody tr', (rows) =>
    rows.map((row) => {
      const cols = row.querySelectorAll('td');
      return {
        Funcao: cols[0]?.innerText.trim(),
        Nome: cols[1]?.innerText.trim()
      };
    })
  );

  let docentes = [];

  while (true) {
    await page.waitForSelector('.info-docentes #myTable tbody tr');

    const pageData = await page.$$eval(
      '.info-docentes #myTable tbody tr',
      (rows, nomeEscola) =>
        rows.map((row) => {
          const cols = row.querySelectorAll('td');
          return {
            Funcao: cols[0]?.innerText.trim(),
            Disciplina: cols[1]?.innerText.trim(),
            Modulo: cols[2]?.innerText.trim(),
            Nome: cols[3]?.innerText.trim(),
            NomeEscola: nomeEscola
          };
        }),
      nomeEscola
    );

    docentes.push(...pageData);

    const nextDisabled = await page.$eval('#myTable_next', (el) =>
      el.classList.contains('disabled')
    );

    if (nextDisabled) break;

    await Promise.all([
      page.click('#myTable_next'),
      new Promise((resolve) => setTimeout(resolve, 1000))
    ]);
  }

  await browser.close();

  const workbook = new ExcelJS.Workbook();

  const sheet1 = workbook.addWorksheet('Gestores');
  sheet1.columns = [
    { header: 'Função', key: 'Funcao', width: 30 },
    { header: 'Nome', key: 'Nome', width: 40 }
  ];
  sheet1.addRows(gestores);

  const sheet2 = workbook.addWorksheet('Docentes');
  sheet2.columns = [
    { header: 'Função', key: 'Funcao', width: 20 },
    { header: 'Disciplina', key: 'Disciplina', width: 30 },
    { header: 'Módulo', key: 'Modulo', width: 15 },
    { header: 'Nome', key: 'Nome', width: 40 },
    { header: 'Nome da escola', key: 'NomeEscola', width: 40 }
  ];
  sheet2.addRows(docentes);

  const now = new Date();
  const timestamp = now
    .toISOString()
    .slice(0, 16)
    .replace('T', '_')
    .replace(':', '-');
  const fileName = `escola_${codesc}_${timestamp}.xlsx`;
  const filePath = path.join(__dirname, '..', fileName);

  await workbook.xlsx.writeFile(filePath);

  return { filePath, fileName };
}

async function scrapeLoteParaExcel(ids) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  let allGestores = [];
  let allDocentes = [];

  for (const id of ids) {
    const url = `https://transparencia.educacao.sp.gov.br/Home/DetalhesEscola?codesc=${id}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    let nomeEscola;

    try {
      nomeEscola = await page.$eval('#nome-escola', (el) =>
        el.innerText.trim()
      );
    } catch (err) {
      console.warn(`Escola não encontrado para id ${id}.`);
      continue;
    }

    const gestores = await page.$$eval(
      '#myTable2 tbody tr',
      (rows, nomeEscola) =>
        rows.map((row) => {
          const cols = row.querySelectorAll('td');
          return {
            Funcao: cols[0]?.innerText.trim(),
            Nome: cols[1]?.innerText.trim(),
            NomeEscola: nomeEscola
          };
        }),
      nomeEscola
    );
    allGestores.push(...gestores);

    let docentes = [];
    while (true) {
      await page.waitForSelector('.info-docentes #myTable tbody tr');

      const pageData = await page.$$eval(
        '.info-docentes #myTable tbody tr',
        (rows, nomeEscola) =>
          rows.map((row) => {
            const cols = row.querySelectorAll('td');
            return {
              Funcao: cols[0]?.innerText.trim(),
              Disciplina: cols[1]?.innerText.trim(),
              Modulo: cols[2]?.innerText.trim(),
              Nome: cols[3]?.innerText.trim(),
              NomeEscola: nomeEscola
            };
          }),
        nomeEscola
      );

      docentes.push(...pageData);

      const nextDisabled = await page.$eval('#myTable_next', (el) =>
        el.classList.contains('disabled')
      );

      if (nextDisabled) break;

      await Promise.all([
        page.click('#myTable_next'),
        new Promise((resolve) => setTimeout(resolve, 1000))
      ]);
    }

    allDocentes.push(...docentes);
  }

  await browser.close();

  const workbook = new ExcelJS.Workbook();

  const sheet1 = workbook.addWorksheet('Gestores');
  sheet1.columns = [
    { header: 'Função', key: 'Funcao', width: 30 },
    { header: 'Nome', key: 'Nome', width: 40 },
    { header: 'Nome da escola', key: 'NomeEscola', width: 40 }
  ];
  sheet1.addRows(allGestores);

  const sheet2 = workbook.addWorksheet('Docentes');
  sheet2.columns = [
    { header: 'Função', key: 'Funcao', width: 20 },
    { header: 'Disciplina', key: 'Disciplina', width: 30 },
    { header: 'Módulo', key: 'Modulo', width: 15 },
    { header: 'Nome', key: 'Nome', width: 40 },
    { header: 'Nome da escola', key: 'NomeEscola', width: 40 }
  ];
  sheet2.addRows(allDocentes);

  const now = new Date();
  const timestamp = now
    .toISOString()
    .slice(0, 16)
    .replace('T', '_')
    .replace(':', '-');
  const fileName = `escolas_lote_${timestamp}.xlsx`;
  const filePath = path.join(__dirname, '..', fileName);

  await workbook.xlsx.writeFile(filePath);

  return { filePath, fileName };
}

module.exports = {
  scrapeEscolaToExcel,
  scrapeLoteParaExcel
};
