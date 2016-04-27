const 
  express = require('express'),
  http = require('http'),
  socket_io = require('socket.io'),
  port = process.env.PORT || 5000;

const app = express();
const io = socket_io(http);

http.Server(app);

app.use(express.static('public'));

app.listen(port, function () {
  console.log(`Server running at http://127.0.0.1:${port}`);
});

io.on('connection', function(socket){
  console.log('a websocket connected');
});

