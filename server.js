'use strict'

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 5000;
const moment = require('moment');

app.use(express.static('public'));

http.listen(port, function(){
  console.log(`webserver listening on *:${port}`);
});

let users = {}

let auctions = {
	'12345' : {
		name: 'iPhone6',
		endTime: moment().toDate(),
		expired: true,
		bets: {}
	},
	'12346' : {
		name: 'Samsung Galaxy',
		endTime: moment().add(10, 'm').toDate(),
		expired: false,
		bets: {}
	},
	'12347' : {
		name: 'Pokemon Firered',
		endTime: moment().add(1, 'h').toDate(),
		expired: false,
		bets: {}
	},
	'12348' : {
		name: 'Playstation 4',
		endTime: moment().add(1, 'd').toDate(),
		expired: false,
		bets: {}
	},
	'12349' : {
		name: 'Kartoffelsalat',
		endTime: moment().add(10, 'w').toDate(),
		expired: false,
		bets: {}
	}
}

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('login', function(username){
		if(!alreadyLoggedIn(username)){
  		users[`${username}`] = {}
			users[`${username}`].status = true
			users[`${username}`].socket = socket

			console.log(`${username} logged in`)
		
			socket.emit('authenticate', {authenticated: true, username: username})
			socket.emit('auctions', auctions)
		} else {
			console.log(`${username} didn't log in`)
			socket.emit('authenticate', {authenticated: false, username: username})
		}
  })

  socket.on('place-bet', function(data){
  	var bet = {}
  	bet.username = data.username
  	bet.value = data.value
				
		if(auctions[data.id].bets[data.value] === undefined)
			auctions[data.id].bets[data.value] = []

		auctions[data.id].bets[data.value].push(data.username)
		console.log(auctions[data.id].bets[data.value])
		console.log(`bet set ${data.username}: € ${data.value}`)

		socket.emit('feedback', {id: data.id, value: data.value, unique: betIsUnique(data.id, data.value), best: isWinner(data.id, data.value, data.username)})
  })

  socket.on('logout', function(name){
  	console.log(name + " logged out")
		users[`${name}`].status = false
  })

  socket.on('setBet', function(obj){
  });

  socket.on('disconnect', function(){
  	console.log('disconnected')
  	if(Object.keys(users).length !== 0){
	  	users[findUser(socket)].status = false
	  	console.log(findUser(socket) + " logged out")
  	}
  })
    
});

function isWinner(id, value, username){
	// no one set a bet
	if(auctions[id].bets.length === 0)
		return false

	// check bets ascending after another if unique
	//if()
}

function betIsUnique(id, value){
	if(auctions[id].bets[value].length === 1)
		return true
	return false
}

function alreadyLoggedIn(username){
	for(let myUser in users){
		if (myUser === username){
			if (users[`${username}`].status === true){
				return true
			}
		}
	}
	return false
}

function findUser(socket){
	for(let myUser in users){
		if(users[`${myUser}`].socket === socket)
			return myUser
	}
	return undefined
}


// export app so we can test it
exports = module.exports = app;
