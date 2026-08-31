const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const config = require('config');

const { initDb } = require('./db/database');

const indexRouter = require('./routes/index');
const solutionsRouter = require('./routes/solutions');
const a01Router = require('./routes/a01');
const a02Router = require('./routes/a02');
const a03Router = require('./routes/a03');
const a04Router = require('./routes/a04');
const a05Router = require('./routes/a05');
const a06Router = require('./routes/a06');
const a07Router = require('./routes/a07');
const a08Router = require('./routes/a08');
const a09Router = require('./routes/a09');
const a10Router = require('./routes/a10');

// La base de datos se reinicia con datos de práctica en cada arranque:
// es un laboratorio, no un sistema con datos que deban persistir.
initDb();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: config.get('session.secret'),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: config.get('session.cookieMaxAgeMs') }
}));

// Mensajes flash minimalistas basados en sesión (sin dependencia externa).
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.use('/', indexRouter);
app.use('/solutions', solutionsRouter);
app.use('/a01', a01Router);
app.use('/a02', a02Router);
app.use('/a03', a03Router);
app.use('/a04', a04Router);
app.use('/a05', a05Router);
app.use('/a06', a06Router);
app.use('/a07', a07Router);
app.use('/a08', a08Router);
app.use('/a09', a09Router);
app.use('/a10', a10Router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler global — a10 demuestra deliberadamente el ANTI-patrón
// de exponer detalles internos; este handler global es la referencia
// de buena práctica para el resto de la aplicación.
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
