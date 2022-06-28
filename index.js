const express = require('express'),
  fs = require('fs'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();
const port = 8080;

const topmovies = require('./topmovies.js');

// Setup body-parser
app.use(bodyParser.json());

// Setup the logger
app.use(morgan('common'));

// GET requests
app.use(express.static('public'));

app.get('/movies', (req, res) => {
  res.json(topmovies.topMoviesList);
});

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
