const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const spawn = require('child_process').spawn;

app.use(express.static('./'))

io.on('connection', function(client){
  const sh = spawn('bash');
  console.log('a client connected! -- ' + client.id);
  // console.log(client.id + ": " + client.handshake.headers['user-agent']);


  sh.stdout.on('data', function(data) {
    client.emit('message', data);
  });

  sh.stderr.on('data', function(data) {
    client.emit('message', data);
  });

  sh.on('exit', function (code) {
    client.emit('exit', '** Shell exited: '+code+' **');
  });

  client.on('message', function(data){
    sh.stdin.write(data+"\n");
    client.emit('cmd_message', new Buffer("> "+data));
  });

  client.on('disconnect', function(){
    console.log('a client disconnected -- ' + client.id);
    sh.kill('SIGINT');
  })
});

server.listen(process.argv[2] || 8080, function(){
  console.log('server started');
})
