const generateMessage = (id,username,text) => {
    return {
        id,
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (id,username,latitude,longitude) => {
    return {
        id,
        username,
        url:`https://www.google.com/maps?q=${latitude},${longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}