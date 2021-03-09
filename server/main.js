var app = require('express')();
var http = require('http').createServer(app);
var path = require('path');
var io = require('socket.io')(http);

const users = new Map();
var nextId = 1;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
  console.log(req.method, req.headers.host, req.url);
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
  console.log(req.method, req.headers.host, req.url);
});

app.get('/frame', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/frame.html'));
  console.log(req.method, req.headers.host, req.url);
});

io.on('connection', (socket) => {
  // begin: critical section
  var userId = nextId;
  users.set(userId, 0);
  nextId += 1;
  // end: critical section
  console.log('User', userId, 'connected');
  socket.on('disconnect', () => {
    console.log('User', userId, 'disconnected.');
    users.delete(userId);
  });
  socket.on('chat message', (message) => {
    console.log('chat message from user:', userId, 'message:', message);
    users.set(userId, users.get(userId)+1);
    socket.broadcast.emit('chat message', {
      user: userId,
      message: msg,
    });
  });
  socket.on('video event', (event) => {
    console.log('video event from user:', userId, 'event:', event);
    socket.broadcast.emit('video event', {
      user: userId,
      event: event,
    });
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
