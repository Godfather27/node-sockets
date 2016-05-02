'use strict'

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 5000;

app.use(express.static('public'));

http.listen(port, function(){
  console.log(`webserver listening on *:${port}`);
});


let products = [
									{
										name: 'iPhone6',
										id: '12345',
										endTime: "May 2, 2016 18:13:00"
									},
									{
										name: 'Samsung Galaxy',
										id: '12346',
										endTime: "May 2, 2016 18:13:00"
									},
									{
										name: 'Pokemon Firered',
										id: '12347',
										endTime: "May 2, 2016 14:45:00"
									},
									{
										name: 'Playstation 4',
										id: '12348',
										endTime: "May 2, 2016 18:13:00"
									},
									{
										name: 'Kartoffelsalat',
										id: '12349',
										endTime: "May 2, 2016 18:13:00"
									}
								]

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    console.log(`got message '${msg}', broadcasting to all`);
    io.emit('chat message', msg);
  });

  socket.on('login', function(username){
	console.log(`${username} logged in`);
	socket.emit('authenticated', {msg: true, products: products});
  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

// export app so we can test it
exports = module.exports = app;
