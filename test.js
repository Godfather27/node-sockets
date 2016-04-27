var should = require('should');
var io = require('socket.io-client');
var app = require('./index');

var socketURL = 'http://0.0.0.0:5000';

var options ={
    transports: ['websocket'],
      'force new connection': true
};

describe("Auction Server",function(){
  it('Should echo chat massages back to user', function(done){
    var client1 = io.connect(socketURL, options);

    client1.on('connect', function(data){
      client1.emit('chat message', 'hello world');
      client1.on('chat message', function(data){
        console.log('got back ' + data);
        data.should.equal('hello world');
        client1.disconnect();
        done();
      });
    });
  });
  it('Should broadcast chat massages to all users', function(done){
    var client1 = io.connect(socketURL, options);

    client1.on('connect', function(data){
      var client2 = io.connect(socketURL, options);

      client2.on('connect', function(data){
        client2.emit('chat message', 'hello world');
      });

      client1.on('chat message', function(data){
        data.should.equal('hello world');
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });
  });

});

