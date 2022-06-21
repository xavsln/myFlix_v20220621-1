// Import Node.js modules
const http = require('http'),
  url = require('url'),
  fs = require('fs');

const port = 8080;

// Create a server Object using the built in http Node.js module
http
  .createServer(function(req, res) {
    let addr = req.url;
    let q = url.parse(addr, true);
    let filePath = '';
    console.log('Pathname: ', filePath);

    fs.appendFile(
      'log.txt',
      `URL: ${addr}
      Timestamp: ${new Date()} \n\n`,
      function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Added to log.');
        }
      }
    );

    if (q.pathname.includes('documentation')) {
      console.log('Addess includes documentation');
      filePath = __dirname + '/documentation.html';
    } else {
      console.log('Addess does not include Document');
      filePath = 'index.html';
    }

    fs.readFile(filePath, function(err, data) {
      if (err) {
        throw err;
      } // Why no else statement here ?
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(data); // Write a response to the Client
      res.end();
    });
  })
  .listen(port); // The server will listen to port 8080

// console.log("Server is running on port" + port);
console.log('Server is running on port');
