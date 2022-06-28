const express = require('express'),
  fs = require('fs'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();
const port = 8080;

const topmovies = require('./topmovies.js');
let usersList = [];

// Setup body-parser
app.use(bodyParser.json());

// Setup the logger
app.use(morgan('common'));

// GET requests
app.use(express.static('public'));

// READ - Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  res.json(topmovies.topMoviesList);
});

// READ - Return data about a single movie by title to the user
app.get('/movies/:movieTitle', (req, res) => {
  const title = req.params.movieTitle;
  const movie = topmovies.topMoviesList.find(movie => movie.title === title);

  if (movie) {
    res.status(201).json(movie);
  } else {
    res.status(400).send('No such a movie in the database.');
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// =============
// POST requests
// =============

// CREATE - Allow new User to register (Add a new user to the usersList)
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    usersList.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('User needs name');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
