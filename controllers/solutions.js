const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const SOL_DIR = path.join(__dirname, '..', 'solutions');

function show(req, res, next) {
  const lab = req.params.lab;
  if (!/^a(0[1-9]|10)$/.test(lab)) return next();
  const filePath = path.join(SOL_DIR, `${lab}.md`);
  if (!fs.existsSync(filePath)) return next();
  const raw = fs.readFileSync(filePath, 'utf8');
  const html = marked.parse(raw);
  res.render('solution', { title: `Solución: ${lab.toUpperCase()}`, lab: lab.toUpperCase(), content: html });
}

module.exports = { show };
