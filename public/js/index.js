const socket = io()
let allRooms = []
// Elements
const $roomFeild = document.querySelector('#room-field')
const $joinBtn = document.querySelector('#join__btn')

// Templates
const newRoomTemplate = document.querySelector('#new-room-template').innerHTML
const existingRoomTemplate = document.querySelector('#existing-room-template').innerHTML
const noRoomTemplate = document.querySelector('#no-room-template').innerHTML

socket.on('rooms', (rooms) => {
    allRooms = rooms
})

const handleOptionSelect = (el) => {

    // Select all checkboxes by class
    const checkboxesList = document.getElementsByClassName("checkOption");
    for (let i = 0; i < checkboxesList.length; i++) {
        checkboxesList.item(i).checked = false; // Uncheck all checkboxes
    }
    el.checked = true; // Checked clicked checkbox

    if (el.id === 'new-room') {
        $joinBtn.disabled = false
        const newRoomHtml = Mustache.render(newRoomTemplate)
        $roomFeild.innerHTML = newRoomHtml
    } else if (el.id === 'existing-room') {
        if (allRooms.length > 0) {
            $joinBtn.disabled = false
            const existingRoomHtml = Mustache.render(existingRoomTemplate, {
                rooms: allRooms
            })
            $roomFeild.innerHTML = existingRoomHtml
        } else {
            const noRoomHtml = Mustache.render(noRoomTemplate)
            $roomFeild.innerHTML = noRoomHtml
            $joinBtn.disabled = true
        }
    }
}