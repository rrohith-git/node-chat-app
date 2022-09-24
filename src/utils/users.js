const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => user.room === room && user.username === username)

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const userIndex = users.findIndex(user => user.id === id)

    if (userIndex != -1) {
        return users.splice(userIndex, 1)[0]
    }

    return {
        error: 'User not found!'
    }
}

const getUser = (id) => {
    const user = users.find(user => user.id === id)
    if (!user) {
        return {
            error: 'User not found!'
        }
    }

    return user
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const roomUsers = users.filter(user => user.room === room)
    roomUsers.forEach(user => {
        user['userIcon'] =  user.username.charAt(0)+' '+user.username.charAt(user.username.length -1)
    })
    return roomUsers
}


const getRooms = () => {
    return users.map(user => user.room).filter((value, index, self) => self.indexOf(value) === index)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
}