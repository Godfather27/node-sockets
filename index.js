const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 5000;

app.use(express.static('public'));

http.listen(port, function(){
  console.log(`webserver listening on *:${port}`);
});


io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    console.log(`got message '${msg}', broadcasting to all`);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

// export app so we can test it
exports = module.exports = app;
