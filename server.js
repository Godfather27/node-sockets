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
										endTime: "May 3, 2016 11:13:00",
										expired: false,
										bets: []
									},
									{
										name: 'Samsung Galaxy',
										id: '12346',
										endTime: "May 3, 2016 16:31:00",
										expired: false,
										bets: []
									},
									{
										name: 'Pokemon Firered',
										id: '12347',
										endTime: "May 3, 2016 14:45:00",
										expired: false,
										bets: []
									},
									{
										name: 'Playstation 4',
										id: '12348',
										endTime: "May 3, 2016 18:13:00",
										expired: false,
										bets: []
									},
									{
										name: 'Kartoffelsalat',
										id: '12349',
										endTime: "May 2, 2016 21:04:00",
										expired: false,
										bets: []
									}
								]

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('setBet', function(obj){
		products[findById(products, obj.id)].bets.push(obj)
		console.log(products[findById(products, obj.id)].bets[0])
  });
	
	for(var i = 0; i < products.length; i+=1){
		if(new Date(products[i].endTime) < new Date() && products[i].expired === false){
			socket.emit('end', products[i].id)
			products[i].expired = true
		}
	}

  socket.on('login', function(username){
		console.log(`${username} logged in`);
		socket.emit('authenticated', {msg: true, products: products});
  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
  })
});

setInterval(function(){
	for(var i = 0; i < products.length; i+=1){
		if(new Date(products[i].endTime) < new Date() && products[i].expired === false){
			io.sockets.emit('end', products[i].id)
			products[i].expired = true
		}
	}
},1000)


function findById(source, id) {
  for (var i = 0; i < source.length; i++) {
    if (source[i].id === id) {
      return i;
    }
  }
  return -1;
}


// export app so we can test it
exports = module.exports = app;
