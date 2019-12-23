const removeArrayItem = (arr, itemToRemove) => {
  return arr.filter(item => item !== itemToRemove)
}


class Position {

	constructor(x, y) {
		this.x = Number(x)
		this.y = Number(y)
	}

}

class Needle {
	constructor(position) {
		console.log("Creating needle", position)
		this.position = position
		this.offset = new Position(0, 0)
		this.accDeltaTime = 0
		this.isAttacking = false
		this.movementLenght = 100
		this.movementDuration = 2000
		// this.radius = 20
	}

	resetNeedle() {
		this.accDeltaTime = 0
		this.offset = new Position(0, 0)
		this.isAttacking = false
	}

	update(timeDelta, player) {
		// console.log("Setting position to", position)
		let position = player.getNeedlePosition()
		if(!this.isAttacking){
			this.position = position
			return 
		}

		if (this.accDeltaTime > this.movementDuration) {
			this.resetNeedle()
			return
		}

		this.position = this.getAttackingNeedlePosition(player)
		this.accDeltaTime += timeDelta
	}

	getNeedleOffset() {

		if (this.accDeltaTime < (this.movementDuration / 2)) {
			return this.movementLenght * (this.accDeltaTime / (this.movementDuration / 2))
			return this.movementLenght - (1 - (this.accDeltaTime / (this.movementDuration / 2)))
		}

		return ((this.accDeltaTime / this.movementDuration) - 0.5 ) * (-1 * this.movementLenght)

		return - this.movementLenght - (1 - ((this.accDeltaTime - 0.5) / (this.movementDuration / 2)))
		// let multiplier = this.accDeltaTime / (this.movementDuration / 2)
		// if (multiplier > 0.5) {
		// 	// multiplier -= 0.5
		// 	multiplier *= -1
		// } 
		// multiplier = 1 - multiplier



		return this.movementLenght * multiplier

	}

	getAttackingNeedlePosition(player) {
		let offset = this.getNeedleOffset()

		console.log("Offset is", offset)
		let needleX = player.getNeedlePosition().x + offset * Math.cos(player.direction)
		let needleY = player.getNeedlePosition().y + offset * Math.sin(player.direction)

		// console.log("Completion is", completion, needleX, needleY)

		return new Position(needleX, needleY)
	}

}

class Player {
	constructor(id, position) {
		this.id = id
		this.position = position
		this.direction = (Math.PI) / 2 //0
		this.speed = 0 //0.05
		this.diameter = 200
		this.radius = 100
		// let needlePos = new Position(position.x, position.y + this.radius / 2)
		// let needlePos = new Position(0, 0)
		let needlePos = this.getNeedlePosition()
		this.needle = new Needle(needlePos)
	
	}

	calcSpaceDelta(timeDelta, s0) {
		return  this.speed*timeDelta
	}

	updatePosition(timeDelta) {

		let newX = this.calcSpaceDelta(timeDelta, this.position.x)
		let newY = this.calcSpaceDelta(timeDelta, this.position.y)

		this.position.x += newX * Math.cos(this.direction)
		this.position.y += newX * Math.sin(this.direction)
	}

	update(timeDelta) {
		this.updatePosition(timeDelta)
		this.needle.update(timeDelta, this)
	}

	attack() {
		this.needle.isAttacking = true
	}

	getNeedlePosition() {
		// return this.getNeedleBaseOffset()
		// return new Position(0, 0)
		// console.log("NEEDLE POSITION", this.position.x, this.radius, Math.cos(this.direction), this.position.y, this.radius , Math.sin(this.direction) )
		return new Position(this.position.x + (this.radius * Math.cos(this.direction) ) , this.position.y + (this.radius * Math.sin(this.direction)) )
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

	updatePlayerAttack(playerId) {
		this.players.forEach(function (player) {
			// console.log("DD", player.id, playerId)
			if( player.id === playerId) {
				// console.log("DD", playerId, to)
				player.attack()
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
			return val
    		return val.toFixed ? Number(val.toFixed(6)) : (val);
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

	playerAttacked(id) {
		console.log(id, "attacked")
		this.game.updatePlayerAttack(id)
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

	clientSocket.on('startAttack', (msg) => {
		game.playerAttacked(newPlayerId)
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