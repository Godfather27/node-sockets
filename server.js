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

let user = []


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
			let winner = getWinner(products[i].bets);
			if (winner === -1)
				winner = "no winner"
			else
				winner = products[i].bets[winner].user
			io.sockets.emit('end', {product: products[i].id, user: winner})
			products[i].expired = true
		}
	}

  socket.on('login', function(username){
		if(findByUsername(user, username) !== -1 && user[findByUsername(user, username)].loggedout === true){
			user[findByUsername(user, username)].loggedout = false
			console.log(`${username} logged back in`);
			user[findByUsername(user, username)].id = socket;
			socket.emit('authenticated', {msg: true, products: products});
		}
		else if(findByUsername(user, username) === -1){
			console.log(`${username} logged in | new username`);
			user.push({username: username, id: socket})
			user[findByUsername(user, username)].loggedout = false
			socket.emit('authenticated', {msg: true, products: products});
		}
		else if(findByUsername(user, username) !== -1 && user[findByUsername(user, username)].loggedout === false){
			console.log(`${username} didn't log in ${user[findByUsername(user, username)].loggedout}`);
			socket.emit('authenticated', {msg: false})
		}
		else {
			console.log(`${username} darf ned rein`)
			socket.emit('authenticated', {msg: false})
		}
		
  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
    if(user[findById(user,socket)] != undefined)
	    user[findById(user,socket)].loggedout = true
  })
});

setInterval(function(){
	for(var i = 0; i < products.length; i+=1){
		if(new Date(products[i].endTime) < new Date() && products[i].expired === false){
			let winner = getWinner(products[i].bets);
			if (winner === -1)
				winner = "no winner"
			else
				winner = products[i].bets[winner].user
			io.sockets.emit('end', {product: products[i].id, user: winner})
			products[i].expired = true
		}
	}
},1000)

function getWinner(bets){
	bets.sort()
	if(bets[0] != bets[1])
		return 0;
	if(bets[bets.length-1] != bets[bets.length-2])
		return bets.length-1
	for(var i = 1; i < bets.length-1; i+=1){
		if(bets[i-1] != bets[i] && bets[i] != bets[i+1]){
			return i
		}
	}
	return -1
}

function findById(source, id) {
  for (var i = 0; i < source.length; i++) {
    if (source[i].id === id) {
      return i;
    }
  }
  return -1;
}

function findByUsername(source, username) {
  for (var i = 0; i < source.length; i++) {
    if (source[i].username === username) {
      return i;
    }
  }
  return -1;
}


// export app so we can test it
exports = module.exports = app;
