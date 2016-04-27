## try the demo

https://blooming-reef-48511.herokuapp.com/

## run locally

  npm install

before starting the app with


  node index.js


for testing, you need to also install mocha and should.js

  sudo npm -g install mocha
  sudo npm -g install should
  npm test


## deploy to heroku

  heroku create
  git push heroku master
  heroku open


## sources

This example inspired by

* http://socket.io/get-started/chat/
* http://liamkaufman.com/blog/2012/01/28/testing-socketio-with-mocha-should-and-socketio-client/
* http://stackoverflow.com/questions/18941736/ensuring-express-app-is-running-before-each-mocha-test#answer-19377023
* https://devcenter.heroku.com/articles/node-websockets
