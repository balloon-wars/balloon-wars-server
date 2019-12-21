
//const io = require('socket.io-client')

function getSock() {
	let socket = io('http://0.0.0.0:8080')
	socket.disconnect()
	return socket
}

let s1 = getSock()
let s2 = getSock()
let s3 = getSock()

let sockets = [s1, s2, s3]

function disconnectAll() {
	sockets.forEach((sock) => sock.disconnect())
}

function verboseConnect(sock, i) {
	console.log("Connecting", i)
	sock.connect()
}

function connectAll() {
	sockets.forEach((sock) => sock.connect())
	sockets.forEach((sock) => console.log(sock.id))
}

