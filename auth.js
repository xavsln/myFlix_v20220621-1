const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file

let generateJWTToken = user => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
};

/* POST login. */
module.exports = router => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      // console.log('Check Req.body data from auth.js: ', req.body.Username);

      console.log('User data from auth.js: ', user);

      console.log('Error data from auth.js: ', error);

      console.log('Info data from auth.js: ', info);

      if (error || !user) {
        console.log(user);
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }

      req.login(user, { session: false }, error => {
        if (error) {
          res.send(error, info);
        }
        let customUserForToken = {
          _id: user._id,
          Username: user.Username,
          Role: user.Role // Define the Role to allow only Admin to access all User's data
        };
        console.log(customUserForToken);
        let token = generateJWTToken(customUserForToken);
        return res.json({ user, token });
      });
    })(req, res);
  });
};
