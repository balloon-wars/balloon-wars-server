const removeArrayItem = (arr, itemToRemove) => {
  return arr.filter(item => item !== itemToRemove)
}


class Position {

	constructor(x, y) {
		this.x = x
		this.y = y
	}

}

class Player {
	constructor(id, position) {
		this.id = id
		this.position = position
		this.direction = Math.random() * (Math.PI) * 2 //0
		this.speed = 0 //0.05
	}

	calcSpaceDelta(timeDelta, s0) {
		return  this.speed*timeDelta
	}

	updatePosition(timeDelta) {

		let newX = this.calcSpaceDelta(timeDelta, this.position.x)
		let newY = this.calcSpaceDelta(timeDelta, this.position.y)

		// console.log("NN", newY, newX, this.position.x, this.position.y, this.speed)

		this.position.x += newX * Math.cos(this.direction)
		this.position.y += newX * Math.sin(this.direction)
	}

	update(timeDelta) {
		this.updatePosition(timeDelta)
	}
}

class Game {

	constructor() {
		this.players = []
	}


	update(timeDelta) {
		this.players.forEach(function (player) {
			player.update(timeDelta)
		})


		this.players.forEach(function (player) {
			// console.log("Player is", player.id, player.position.x, player.position.y, player.direction)
		})

		// console.log("-----------------------------")
	}

	addPlayer(player) {
		this.players.push(player)
	}

	removePlayer(playerId){
		this.players = this.players.filter((p) => p.id !== playerId)
	}

	updatePlayerDirection(playerId, to) {
		this.players.forEach(function (player) {
			// console.log("DD", player.id, playerId)
			if( player.id === playerId) {
				// console.log("DD", playerId, to)
				player.direction = to
			}	
		})
	}

	updatePlayerSpeed(playerId, to) {
		// console.log("Updating speed")
		this.players.forEach(function (player) {
			if( player.id === playerId) {
				player.speed = to
				// console.log("SS", playerId, to)
			}	
		})
	}


}

class NetworkGame {

	constructor() {
		this.lastUpdate = new Date()
		this.game = new Game()
		// this.connections = {}
	}


	getUpdatedGame() {
		let newTime = new Date()
		let timeDelta = Math.abs(newTime - this.lastUpdate)
		this.game.update(timeDelta)

		// console.log("TT", newTime, timeDelta, this.lastUpdate)
		this.lastUpdate = newTime

		return this.parseGame()
	}

	parseGame() {
		return JSON.stringify(this, function(key, val) {
    		return val.toFixed ? Number(val.toFixed(6)) : val;
		}) 
	}

	playerJoined(socket) {
		console.log("CORNO 	ENTROU", socket.id)
		const newPlayer = new Player( socket.id, new Position(0, 0))

		this.game.addPlayer(newPlayer)
	}

	playerLeft(id) {
		this.game.removePlayer(id)
	}

	playerChangedDirection(id, to) {
		// console.log("Direction changed", to, id)
		this.game.updatePlayerDirection(id, to)
	}

	playerChangedSpeed(id, to) {
		// console.log("Direction changed", to, id)
		this.game.updatePlayerSpeed(id, to)
	}
}

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const express = require('express')
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const game = new NetworkGame()
const http = require('http'); 
const io = require('socket.io');
// const server = http.createServer();
// server.listen(80,'0.0.0.0');
const serverSocket = io(server);


serverSocket.on('connection', (clientSocket) => {
	let newPlayerId = clientSocket.id
	game.playerJoined(clientSocket)

	clientSocket.on('directionChanged', (msg) => {
		game.playerChangedDirection(newPlayerId, msg)
	});


	clientSocket.on('speedChanged', (msg) => {
		game.playerChangedSpeed(newPlayerId, msg)
	});

	clientSocket.on('disconnect', () => game.playerLeft(newPlayerId));

});



// setInterval(() => socket.emit('time', new Date().toTimeString()), 1000);

let updateFrequecy = 128
setInterval(updateGame, 1000 / updateFrequecy);


function updateGame() { 
	let newGame = game.getUpdatedGame()
	// console.log("New game is", newGame)
	serverSocket.emit('gameUpdate', newGame);
}