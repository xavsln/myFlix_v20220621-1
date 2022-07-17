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

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

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
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // res.json(topmovies.topMoviesList);

    Movies.find()
      .then(movies => {
        res.status(201).json(movies);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ - Return data about a single movie by title to the user
app.get(
  '/movies/:movieTitle',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  }
);

// READ - Return a list of ALL Users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let user = req.user;
    // res.send(user.Role);
    if (user.Role == 'admin') {
      // res.send('You are an Admin');
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
    } else {
      res.status(403).send('Not authorized.');
    }

    // Users.find()
    //   .then(users => {
    //     if (!users) {
    //       res.status(400).send('No User in the database.');
    //     } else {
    //       res.status(201).json(users);
    //     }
    //   })
    //   .catch(err => {
    //     console.error(err);
    //     res.status(500).send('Error: ' + err);
    //   });
  }
);

// READ - Return data about a User by name
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then(user => {
        res.json(user);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ - Return data about a Director by name
app.get(
  '/directors/:directorName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find({ 'Director.Name': req.params.directorName })
      .then(filmWithDirector => {
        if (!filmWithDirector) {
          res.status(400).send('No such Director in the database.');
        } else {
          res.status(200).json(filmWithDirector);
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// READ - Return data about a Genre by name
app.get(
  '/genres/:genreName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
      .then(filmWithGenre => {
        if (!filmWithGenre) {
          res.status(400).send('No such a Genre in the database.');
        } else {
          res.status(200).json(filmWithGenre.Genre.Description);
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// =============
// POST requests
// =============

// CREATE - Allow new User to register (Add a new user to the usersList)
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then(user => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
          Role: req.body.Role
        })
          .then(user => {
            res.status(201).json(user);
          })
          .catch(error => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// ADD new movie to the user list of favorite movies
app.post(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $addToSet: { favoriteMovies: req.params.MovieID }
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// =============
// DELETE requests
// =============

// DELETE a movie from the user list of favorite movies
app.delete(
  '/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { favoriteMovies: req.params.MovieID }
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// DELETE a User from the user list
app.delete(
  '/users/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ _id: req.params.id })
      .then(user => {
        if (!user) {
          res.status(400).send(req.params.id + ' was not found');
        } else {
          res.status(200).send(req.params.id + ' was deleted.');
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// =============
// PUT requests
// =============

// UPDATE - Allow an existing User to update its details (Update User name in the usersList)
app.put(
  '/users/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
