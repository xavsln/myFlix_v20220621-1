const express = require('express'),
  fs = require('fs'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();
const port = 8080;

const topmovies = require('./topmovies.js');

let usersList = [
  {
    id: 1,
    name: 'Martin',
    favoriteMovies: ['Arizona Dream']
  },
  {
    id: 2,
    name: 'Jean',
    favoriteMovies: ['Kagemusha']
  }
];

// Setup body-parser
app.use(bodyParser.json());

// Setup the logger
app.use(morgan('common'));

// =============
// GET requests
// =============
app.use(express.static('public'));

// READ - Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  // res.json(topmovies.topMoviesList);

  Movies.find()
    .then(movies => {
      res.status(201).json(movies);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ - Return data about a single movie by title to the user
app.get('/movies/:movieTitle', (req, res) => {
  Movies.findOne({ Title: req.params.movieTitle })
    .then(movie => {
      if (movie) {
        res.status(200).json(movie);
      } else {
        res.status(400).send('No such a movie in the database.');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ - Return a list of ALL Users
app.get('/users', (req, res) => {
  Users.find()
    .then(users => {
      if (!users) {
        res.status(400).send('No User in the database.');
      } else {
        res.status(201).json(users);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ - Return data about a User by name
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ - Return data about a Director by name
app.get('/directors/:directorName', (req, res) => {
  const name = req.params.directorName;
  const filmWithDirector = topmovies.topMoviesList.find(
    movie => movie.director.name === name
  );

  if (filmWithDirector) {
    res.status(200).json(filmWithDirector.director);
  } else {
    res.status(400).send('No such a Director name in the database.');
  }
});

// READ - Return data about a Genre by name
app.get('/genres/:genreName', (req, res) => {
  const name = req.params.genreName;
  const filmWithGenre = topmovies.topMoviesList.find(
    movie => movie.genre.name === name
  );

  if (filmWithGenre) {
    res.status(200).json(filmWithGenre.genre);
  } else {
    res.status(400).send('No such a Genre name in the database.');
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

// ADD new movie to the user list of favorite movies
app.post('/users/:id/:movieTitle', (req, res) => {
  const id = req.params.id;
  const favoriteMovieToAdd = req.params.movieTitle;

  // const { id, favoriteMovieToAdd } = req.params;   // Not working. favoriteMovieToAdd would be undefined

  let user = usersList.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(favoriteMovieToAdd);
    // res.status(200).json(user);
    res
      .status(200)
      .send(
        `Movie ${favoriteMovieToAdd} was successfully added to the list of favorite movies of user ${user.id}.`
      );
  } else {
    res.status(400).send('No such user in the database.');
  }
});

// =============
// DELETE requests
// =============

// DELETE a movie from the user list of favorite movies
app.delete('/users/:id/:movieTitle', (req, res) => {
  const id = req.params.id;
  const favoriteMovieToDelete = req.params.movieTitle;

  let user = usersList.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      title => title !== favoriteMovieToDelete
    );
    // res.status(200).json(user);
    res
      .status(200)
      .send(
        `Movie ${favoriteMovieToDelete} was successfully deleted from the list of favorite movies of user ${user.id}.`
      );
  } else {
    res.status(400).send('No such user in the database.');
  }
});

// DELETE a User from the user list
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;

  let user = usersList.find(user => user.id == id);

  if (user) {
    usersList = usersList.filter(user => user.id !== id);
    // res.status(200).json(user);
    res
      .status(200)
      .send(`User ${id} was successfully deleted from the list of Users.`);
  } else {
    res.status(400).send('No such user in the database.');
  }
});

// =============
// PUT requests
// =============

// UPDATE - Allow an existing User to update its name (Updaye User name in the usersList)
app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;

  let user = usersList.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('No such user in the database.');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
