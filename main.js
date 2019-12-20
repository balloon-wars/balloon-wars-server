const removeArrayItem = (arr, itemToRemove) => {
  return arr.filter(item => item !== itemToRemove)
}


class Position {
	constructor(x, y) {
		this._x = x
		this._y = y
	}
}

class Player {
	constructor(id, position) {
		this._id = id
		this._position = position
	}
}

class Game {

	constructor() {
		this.players = []
	}


	update() {
		console.log("Players are", this.players)
		// this.players.forEach((item, index, arr) => )
	}

	addPlayer(player) {
		this.players.push(player)
	}

	removePlayer(player){
		this.players = this.players.filter((p) => p._id !== player._id)
	}

}

class NetworkGame {

	constructor() {
		this.lastUpdate = new Date()
		this.game = new Game()
		this.connections = {}
		this.currentPlayerId = 0
	}


	getUpdatedGame() {
		this.game.update()

		console.log("Connections are", this.connections)
	}

	parseGame() {

	}

	playerJoined(socket) {
		console.log("CORNO 	ENTROU")
		const newPlayer = new Player(this.currentPlayerId, new Position(0, 0))

		this.game.addPlayer(newPlayer)

		this.currentPlayerId += 1

		return newPlayer._id
	
}
	playerLeft(id) {
		console.log("CORNO 	SAIU", id)
		const leftPlayer = this.connections.socket

		this.game.players.forEach( (player, index, _) => {
			if(player._id === id) {
				console.log("Brow to saindo fora")
				this.game.removePlayer(player)

			}
		}
		)


	}
}

const game = new NetworkGame()
const http = require('http'); 
const io = require('socket.io');
const server = http.createServer();
server.listen(8080, '0.0.0.0');
const serverSocket = io(server);


serverSocket.on('connection', (clientSocket) => {
	let newPlayerId = game.playerJoined(clientSocket)
	clientSocket.on('disconnect', () => game.playerLeft(newPlayerId));
});

serverSocket.on('directionChanged', (clientSocket) => {

});

// setInterval(() => socket.emit('time', new Date().toTimeString()), 1000);


setInterval(updateGame, 1000);


function updateGame() {
	game.getUpdatedGame()
	serverSocket.emit('time', new Date().toTimeString());
}