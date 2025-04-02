# 📊 Scraper de Escolas - Portal da Transparência da Educação

Este projeto é uma API com interface web que realiza scraping de informações públicas do Portal da Transparência da Educação do Estado de São Paulo. A aplicação permite consultar os **dados de gestores e docentes** de uma escola pelo código `codesc`, e exportar os resultados em formato **Excel (.xlsx)**.

---

## 🚀 Funcionalidades

- 🧑‍🏫 Extrai informações da tabela de **Gestores** e **Docentes** da escola.
- 📄 Gera um arquivo Excel (.xlsx) com duas abas: `Gestores` e `Docentes`.
- 🌐 Interface web simples e responsiva.
- 📥 Download automático do arquivo gerado.

---

## 💻 Tecnologias utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Puppeteer](https://pptr.dev/)
- [ExcelJS](https://github.com/exceljs/exceljs)
- HTML, CSS e JavaScript (Vanilla)

---

## 📦 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/scraper-escolas.git
cd scraper-escolas
```

2. Instale as dependências:

```bash
npm install
```

---

## ▶️ Como usar

### Modo local

1. Inicie o servidor:

```bash
node index.js
```

2. Acesse a interface web:

```
http://localhost:3000
```

3. Digite o **código da escola** (ex: `015748`) e clique em **Baixar Excel**.

---

## 🔎 Exemplo de uso via API

Você também pode usar a API diretamente via `POST`:

```
POST http://localhost:3000/scrape
Content-Type: application/x-www-form-urlencoded

codesc=015748
```

A resposta será o arquivo `.xlsx` para download automático.

---

## 📁 Estrutura de pastas

```
/scraper-api
│-- index.js            # Servidor Express e rotas
│-- scraper.js          # Lógica do Puppeteer e geração do Excel
│-- public/
│   └── index.html      # Interface do usuário (formulário)
```

---

## 📌 Observações

- A tabela de docentes é paginada, e o script clica automaticamente em "Próximo" até o final.
- O nome do arquivo inclui **data e hora** no formato:
  ```
  escola_<codesc>_YYYY-MM-DD_HH-MM.xlsx
  ```
- O arquivo é excluído automaticamente após o download ser enviado.

---

## 📄 Licença

MIT © [Seu Nome ou Organização]
