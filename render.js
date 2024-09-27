import { colours } from "./data.js"
import { radius } from "./lib.js"


const renderPiece = (context, renderOffset) => ({ position, size }) => {
    const logSize = Math.log(size)/Math.log(2)
    context.beginPath()
    context.arc(position.x + renderOffset.x, position.y + renderOffset.y, radius(size), 0, Math.PI*2)
    context.fillStyle = colours[logSize-1]
    context.fill()

    context.fillStyle = '#000'
    context.font = `${logSize+9}px sans-serif`
    context.fillText(size, position.x + renderOffset.x, position.y + renderOffset.y)
}
export const render = ($canvas, state) => {
    const context = $canvas.getContext('2d')

    context.textAlign = 'center'
    context.textBaseline = 'middle'
    const renderCenter = {
        x: $canvas.width / 2,
        y: $canvas.height / 2
    }
    const playerPosition = state.actors[0].pieces[0].position

    const renderOffset = {
        x: renderCenter.x - playerPosition.x,
        y: renderCenter.y - playerPosition.y,
    }
    const rend = renderPiece(context, renderOffset)

    context.clearRect(0,0,$canvas.width,$canvas.height)

    context.fillStyle = '#000'
    context.fillRect(0,0,$canvas.width,$canvas.height)
    context.fillStyle = '#bbb'
    context.fillRect(renderOffset.x, renderOffset.y, state.width, state.height)

    state.actors.forEach((actor, index) => {
        actor.pieces.forEach(rend)
    })

    state.pieces.forEach(rend)

    state.actors.slice(1).forEach((actor) => {
        const head = actor.pieces[0]
        const logSize = Math.log(head.size)/Math.log(2)
        context.fillStyle = '#000'
        context.font = `${logSize+5}px sans-serif`
        context.fillText(actor.name, head.position.x + renderOffset.x, head.position.y + renderOffset.y - radius(head.size))
    })

    const player = state.actors[0]
    const playerPrimary = player.pieces[0]


    const boardSize = 13
    context.fillStyle = '#000'
    context.fillRect($canvas.width-(12*boardSize),0,(12*boardSize), (10*boardSize))
    state.sortedActors.slice(0,10).forEach(({ name, size }, index) => {
        if (name === 'You')
            context.fillStyle = '#f55'
        else
            context.fillStyle = '#fff'
        context.font = `${boardSize-1}px sans-serif`
        context.fillText(name, $canvas.width-(4.5*boardSize), (boardSize/2)+(index * boardSize))
        context.fillText(size, $canvas.width-(10*boardSize), (boardSize/2)+(index * boardSize))
    })

    const mapSize = 2
    context.fillStyle = '#000'
    const mapWidth = state.map.length
    const mapHeight = state.map[0]?state.map[0].length:0
    context.fillRect(0,0, mapSize*mapWidth, mapSize*mapHeight)
    context.fillStyle = '#fff'
    state.map.forEach((column, x) => {
        column.forEach((cell, y) => {
            if (!cell) return
            const offset = Math.max(0, cell * mapSize / 8)
            context.fillRect((x*mapSize)-(offset/2), (y*mapSize)-(offset/2), mapSize+offset, mapSize+offset)
        })
    })
    context.fillStyle = '#f00'
    context.fillRect(
        Math.floor(playerPrimary.position.x*mapSize*mapWidth/state.width)-2,
        Math.floor(playerPrimary.position.y*mapSize*mapHeight/state.height)-2,
        mapSize+4, mapSize+4
    )
    
    context.fillStyle = '#000'
    context.font = `32px sans-serif`
    const mins = ('00'+Math.floor(state.realtime / 1000 / 60).toString(10)).slice(-2)
    const secs = ('00'+(Math.floor(state.realtime / 1000) % 60).toString(10)).slice(-2)
    context.fillText(`${mins}:${secs}`, $canvas.width / 2, 16)
}
