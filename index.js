const express = require('express'),
  fs = require('fs'),
  morgan = require('morgan');

const app = express();
const port = 8080;

const topmovies = require('./topmovies.js');

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

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
