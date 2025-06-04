
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const socketIo = require('socket.io'); 
const http = require('http');
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.use(express.static(path.join(__dirname, 'public' )));

app.set('views', path.join(__dirname, 'public' ));

app.engine('html', ejs.renderFile);

app.use('/', (req, resp) => {
    resp.render('index.html');
});


function conectDB() {
    let dbURL = "mongodb+srv://xikkaya:capetinhadomau@cluster0.98hlf.mongodb.net/xivid"

    mongoose.connect(dbURL);

    mongoose.connection.on('error', console.error.bind(console, 'connection error: '));
    mongoose.connection.once('open', function() {
        console.log('ATLAS MONGODB CONECTADO!!');
    });
}

conectDB();


let Postagem = mongoose.model('post', {titulo:String, post:String, data_hora:String});



let posts = [];

Postagem.find({})
    .then(docs=>{
        posts = docs
    }).catch(error=>{
        console.log(error)
    });


io.on('connection', socket=>{

    Postagem.find({})
    .then(docs=>{
        socket.emit('previousMessage', docs);
    })

    socket.on('sendMessage', data=>{

        let post = new Postagem(data);

        post.save()
            .then(() => {
                socket.broadcast.emit('recivedMessage', data)
            }).catch(error=>{
                console.log(error)
            });
    });

});

server.listen(3000, ()=>{console.log(" Rodando em http://localhost:3000")});