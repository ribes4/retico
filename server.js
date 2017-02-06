var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', process.env.PORT || 3000);


app.use(express.static('public'));
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/chat', function (req, res) {
   res.sendFile( __dirname + "/public/" + "chat.html" );
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});