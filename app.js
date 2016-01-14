var express=require('express'),
    app=express(),
    server=require('http').createServer(app),
    io=require('socket.io').listen(server),
    users={};

server.listen(4000);

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
     res.sendFile(__dirname+'/index.html');
});

io.sockets.on('connection',function(socket){

      socket.on('new user',function(data,callback){
        if(data in users){
          console.log("Username already taken");
          callback(false);
        }else{
          console.log("Username available");
          callback(true);
          socket.nickname=data;
          users[socket.nickname]=socket;
          //nicknames.push(socket.nickname);
          updateNicknames();
        }
      });

      function updateNicknames(){
        io.sockets.emit('usernames',Object.keys(users));
      }

      console.log("Connection Established");

      socket.on('send message',function(data,callback){
        var msg=data.trim();
        if(msg.substr(0,3) === '/w '){
          msg=msg.substr(3);
          var ind=msg.indexOf(' ');
          if(ind !== -1){
            var name=msg.substring(0,ind);
            var msg=msg.substring(ind+1);
             if(name in users){
                users[name].emit('whisper',{msg:msg,nick:socket.nickname});
                socket.emit('private',{msg:msg,nick:socket.nickname});
              console.log("Whispering !");
            }else{
              callback("Error Enter a valid user");
            }
          }else{
            callback("Please enter a message for your whisperer");
          }

        } else{
        console.log("Got Message :"+data)
        io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
           }
      });

      socket.on('disconnect',function(data){
            if(!socket.nickname) return;
            delete users[socket.nickname];
            //nicknames.splice(nicknames.indexOf(socket.nickname),1);
            updateNicknames();
      });

});
