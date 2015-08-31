var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8080);

function handler (req, res) {
  var url = req.url;
  if (req.url === '/') {
    url = '/index.html';
  }

  fs.readFile(__dirname + url,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var t = null;
var k = null;

io.on('connection', function (socket) {
  if(!t) {
    t = socket;
    socket.emit('id', {id: 't'});
    console.log('Toury connected');
  } else if(!k) {
    k = socket;
    socket.emit('id', {id: 'k'});
    console.log('Koch connected');
  } else {
    socket.emit('error', {code: 1});
  } 

  if(t && k) {
    io.emit('countdown', {value: 10});
    setTimeout(function() { io.emit('start'); }, 10000);
  }

  socket.on('position', function(data) {
    socket.broadcast.emit('position', {x: data.x});
  });

  socket.on('victory', function() {
    if(socket == t)  {
      io.emit('end', {who: 't'});
      console.log('Toury wins');
    } else if(socket == k) {
      io.emit('end', {who : 'k'});
      console.log('Koch wins');
    }
  });

  socket.on('disconnect', function(){
    if(socket == t) {
      t = null;
      socket.broadcast.emit('logout');
      console.log('Toury disconnected');
    } else if (socket == k) {
      k = null;
      socket.broadcast.emit('logout');
      console.log('Koch disconnected');
    } else {
      console.log('Allah disconnected');
    }
  });
});
