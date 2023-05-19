// Create an Express web server
// 1.Initialize npm and install Express
// 2.Setup a new Express server
// - Serve up the public directory
// - Listen on port 3000
// 3.Create index.html and render "Chat App" to the screen
// 4.Test the work

const path = require('path'); //node module no need to install
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage}= require('./utils/messages');
const{addUser, removeUser, getUser, getUserInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app); // allows us to create a new web server
const io = socketio(server); // creating instance, configure websokets to work with our server

 const port = process.env.PORT || 3000
// process.env.PORT means the PORT number you manually set. 3000 is the default port. If you havent set it manually then it will listen to 3000
const publicDirectoryPath = path.join(__dirname, '../public');

// adds a middleware for serving static files to your Express app
app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on('connection',(socket)=>{  //print a message to terminal when client connects
// Connection is going to fire whenever the SocketIO server gets a new connection
console.log('New WebSocket Connection');

socket.on('join',(options, callback)=>{
    const {error, user} = addUser({id: socket.id, ...options});
    if(error){
        return callback(error);
    }
    socket.join(user.room);
    
    socket.emit('message', generateMessage('Admin', 'Welcome!'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
    io.to(user.room).emit('roomData',{
        room: user.room,
        users:getUserInRoom(user.room)
    })
    callback()
 //io.to.emit - emits an event to specific room
 //socket.broadcast.to.emit -limiting to specific chatroom
})
socket.on('sendMessage', (message, callback) =>{
    const user = getUser(socket.id);
    const filter = new Filter();
    if(filter.isProfane(message)){
        return callback("Profanity is not allowed!");
    }
    io.to(user.room).emit('message',generateMessage(user.username, message));
    callback();
})
socket.on('sendLocation',(coords, callback) =>{
    const user = getUser(socket.id);
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    //callback();
})
socket.on('disconnect', () =>{
   const user= removeUser(socket.id);
   if(user){
    io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
    io.to(user.room).emit('roomData',{
        room: user.room,
        users: getUserInRoom(user.room)
    })
}    
})
})
// socket.emit('countUpdated',count);
// //sending an event to server and reciving  that event on client side

// socket.on('increment',() =>{
//     count++;
//    // socket.emit('countUpdated', count) -- emitting the event to a particular connection 
//     io.emit // the event going to emit to every single connection that's currently available
// })
// })
// socket is an object contains information about that new connection
server.listen(port, () => { //start the server up
    console.log(`Server is up on part ${port}!`);
})
// Assignments
// Setup scripts in package.json
// 1. create a "start" script to start the app using Node
// 2. Install nodemon and a development dependency
// 3. create a 'dev' script to start the app using nodemon 
// 4. Run both scripts to test work

// Send a welcome message to new users 
// 1. Have server emit "message" when new client connects
//  - send "welcome!" as the event data 
//  2. Have client listen for "message" event and print to console
//  3. Test your work

// Allow clients to send messages 
// 1. Create a form with an input and button
//  - similar to the weather form 
//  2. Setup event listener for form submissions
//  - Emit "sendMessage" with input string as message data 
//  3. Have server listen for "sendMessage"
//  - send message to all connected clients 
//  4. test work

//Installing nodemon --save-dev 
// save that as a development dependency because it's something we're only ever gonna need
// when we're running the application locally on our machines.
// npm run dev - start it up using development script
