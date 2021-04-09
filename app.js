var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

var app = express();
app.use(cors()); // Allow cross-origin requests
const http = require('http');
const server = http.createServer(app);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// -------- Socket code --------
const PORT = 3000;
let net = require('net');
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

// WebSocket connection from web client
io.on('connection', (socket) => {
  console.log('Client Connected');
  const client = new net.Socket();

  client.connect(58901, '127.0.0.1', function() {
    console.log('Backend Connected');
    client.write('ArrowUp, \nArrowDown,');
  });

  client.on('data', function(data) {
    console.log('Received: ' + data);
    io.emit('example message', data);
  });

  client.on('close', function() {
    console.log('Backend connection closed');
  });

  socket.on('example message', (msg) => {
    console.log('message: ' + msg);
    client.write(msg);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    client.destroy();
  });
});
// -------- End Socket code --------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(PORT, () => {
  console.log('listening on localhost:' + PORT);
});