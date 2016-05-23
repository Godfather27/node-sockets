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
  timeIsExpired()
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
		endTime: moment().add(25, 's').toDate(),
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
  console.log(socket)
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
   console.log(`bet set ${data.username}: € ${data.value}`)

   updateBetStatus(data)
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

function isWinner(id, username){
	// check bets ascending after another if unique
	let keys = Object.keys(auctions[id].bets)
	keys.sort()

	for(let i = 0; i < keys.length; i+=1){
		if(auctions[id].bets[keys[i]].length === 1){
			console.log(auctions[id].bets[keys[i]][0])
			if(auctions[id].bets[keys[i]][0] === username){
				return true;
			}
			return false;
		}
	}
	return false;
}

function betsSet(id, value){
  return auctions[id].bets[value].length
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

// look if time is expired
function timeIsExpired() {
  // look if auctions are expired
  // if so, set expired to true

  // inform all users, if there is a winner
  // if so, inform winner and all others
  // if not, inform all that they had lost


  setInterval(function(){
    let keys = Object.keys(auctions)
    keys.sort()

    // Iterate through auctions
    for (var i = 0; i < keys.length; i++) {
      // if auction is not expired and its expired now
      if (!auctions[keys[i]].expired && moment().toDate() >= auctions[keys[i]].endTime) {
        auctions[keys[i]].expired = true
        let betKeys = Object.keys(auctions[keys[i]].bets)
        betKeys.sort()
        let hasWinner = false

        //iterate throw bets
        for (var j = 0; j < betKeys.length; j++) {
          let userNameArr = auctions[keys[i]].bets[betKeys[j]]

          if (userNameArr.length === 1) {
            let winner = users[userNameArr[0]]
            winner.socket.emit('expired', {id: keys[i], winner: true})
            winner.socket.broadcast.emit('expired', {id: keys[i], winner: false})
            hasWinner = true
            break
          }
        }

        if (!hasWinner) {
          io.sockets.emit('expired', {id: keys[i], winner: false})
        }
      }
    }
  }, 1000)
}

function updateBetStatus(data) {
  let id = data.id
  let user = data.username
  let value = data.value
  if (!auctions[id].expired && isWinner(id, user)) {
    users[user].socket.emit('feedback', {id: id, value: value, betsSet: betsSet(id, value), best: true})
    users[user].socket.broadcast.emit('feedback', {id: id, best: false})
  }
  else if (!auctions[id].expired) {
    users[user].socket.emit('feedback', {id: id, value: value, betsSet: betsSet(id, value), best: false})
  }
}


// export app so we can test it
exports = module.exports = app;
