 const http = require('http'); 

  console.log('a');
var io = require('socket.io');
var server = http.createServer();
server.listen(8080, 'localhost');
var socket = io(server);

var ioServer = socket

ioServer.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});


  console.log('a');
setInterval(() => ioServer.emit('time', new Date().toTimeString()), 1000);
  console.log('a');