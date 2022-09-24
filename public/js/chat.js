const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('#text-input')
const $messageFormSubmitButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $sideBar = document.querySelector('#sidebar')
const $message = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML
const adminMessageTemplate = document.querySelector('#admin-message-template').innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = (messageId,socketId) => {
    // New message element
    const $newMessage = $message.lastElementChild

    // Display current user message on right
    if(messageId === socketId){
        $newMessage.style.marginLeft = 'auto'
    }
    // Height of the new(last) message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom) + parseInt(newMessageStyles.marginLeft)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $message.offsetHeight

    // Height of messages container
    const containerHeight = $message.scrollHeight

    // How far have i scrolled?
    const srcollOffset = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight < srcollOffset){
        $message.scrollTop = $message.scrollHeight
    }

}

socket.on('message', (message) => {
    if(message.username === 'Admin'){
        const adminHtml = Mustache.render(adminMessageTemplate,{
            createdAt: moment(message.createdAt).format('hh:mm a'),
            message: message.text
        })
        $message.insertAdjacentHTML('beforeend',adminHtml)
    }else{
        const html = Mustache.render(messageTemplate, {
            username: message.username,
            createdAt: moment(message.createdAt).format('hh:mm a'),
            message: message.text
        })
        $message.insertAdjacentHTML('beforeend', html)
    }
    autoScroll(message.id,socket.id)
})

socket.on('locationMessage', (locationMessage) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: locationMessage.username,
        createdAt: moment(locationMessage.createdAt).format('hh:mm a'),
        locationUrl: locationMessage.url
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoScroll(locationMessage.id,socket.id)
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate,{
        roomIcon: room.charAt(0)+' '+room.charAt(room.length -1),
        room,
        users
    })
    $sideBar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // disable submit button
    $messageFormSubmitButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value || e.target['text-input'].value
    socket.emit('sendMessage', message, (error) => {
        // enable submit button
        $messageFormSubmitButton.removeAttribute('disabled')
        // reseting and focusing the input 
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.error(error)
        }
        // console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    // disable send location button
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const { coords: { latitude, longitude } } = position
        socket.emit('sendLocation', { latitude, longitude }, () => {
            // enable send location button
            $sendLocationButton.removeAttribute('disabled')
            // console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})