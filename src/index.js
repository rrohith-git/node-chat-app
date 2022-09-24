const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser, getRooms } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
app.use(express.json())

io.on('connection', (socket) => {

    io.emit('rooms',getRooms())

    socket.on('join', (options, cb) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return cb(error)
        }
        // join method can only be invoked on server side and it allows use to join a room and also us to join multiple rooms
        // by default it allows to join the room with same as our id
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Admin', `Welcome ${user.username}`)) // emiting event only to current client connected
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin','Admin', `${user.username} has joined the chat`)) // emiting events to all the clients except to the current one in specific room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        cb()
    })

    socket.on('sendMessage', (message, cb) => {
        const user = getUser(socket.id)
        if (!user.id) {
            return
        }
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return cb('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.id,user.username, message)) // emiting event to all the clients connected to this server
        cb()
    })

    socket.on('sendLocation', ({ latitude, longitude }, cb) => {
        const user = getUser(socket.id)
        if (!user.id) {
            return
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.id,user.username, latitude, longitude))
        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (!user.id) {
            return
        }
        io.to(user.room).emit('message', generateMessage('Admin','Admin', `${user.username} has left the chat`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})


// Websockets allow a full duplex (bi-directional communication), low-latency and event based communication
// Websockets is separate protocol then HTTP
// Websockets establishes persistent connection between server and client
// Different ways to emit the messages for particular client and all the clients 
// socket.emit('message', generateMessage('Welcome!')) // emiting event only to current client connected
// socket.broadcast.emit('message', generateMessage('A new user is joined!'))  // emiting event to all the clients except to the current one
// io.emit('message', generateMessage(message)) // emiting event to all the clients connected to this server
