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
let net = require('net');
const io = require('socket.io')(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"]
  }
});

// WebSocket connection from web client
io.on('connection', (socket) => {
  console.log('a user connected');
  const client = new net.Socket();

  client.connect(58901, '127.0.0.1', function() {
    console.log('Connected');
    client.write('ArrowUp, ');
  });

  client.on('data', function(data) {
    console.log('Received: ' + data);
    io.emit(data);
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

server.listen(3000, () => {
  console.log('listening on localhost:3000');
});