var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://0.0.0.0:5000';

var options ={
    transports: ['websocket'],
      'force new connection': true
};

var user1 = {'name':'Dana'};
var user2 = {'name':'Sally'};
var user3 = {'name':'Tom'};

describe("Auction Server",function(){

});

