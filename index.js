const express = require('express'),
  fs = require('fs');

const app = express();

const topmovies = require('./topmovies.js');

// GET requests
app.get('/movies', (req, res) => {
  res.json(topmovies.topMoviesList);
});

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.listen(8080, () => {
  console.log('App is running on port 8080');
});
