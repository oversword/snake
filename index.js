import { physicsStep } from "./physics.js"
import { render } from "./render.js"
import { newState } from "./spawn.js"





const $canvas = document.createElement('canvas')
document.body.appendChild($canvas)
$canvas.width = window.innerWidth
$canvas.height = window.innerHeight
window.onresize = () => {
    $canvas.width = window.innerWidth
    $canvas.height = window.innerHeight
}


let state = newState()
const handleMove = (ev) => {
    const center = ev.touches ? ev.touches[0] : ev
    const renderCenter = {
        x: $canvas.width / 2,
        y: $canvas.height / 2
    }
    const delta = {
        x: center.clientX - renderCenter.x,
        y: center.clientY - renderCenter.y
    }
    state.actors[0].direction = Math.atan2(delta.y, delta.x)
}
$canvas.addEventListener('mousemove', handleMove)
$canvas.addEventListener("touchmove", handleMove);

document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
        if (gameLoopTimeout) stopGame()
        else startGame()
    }
})

let realtime = 0
let startTime

let gameLoopTimeout = null
let renderLoopTimeout = null
const gameLoop = () => {
    state = physicsStep(state)
    if (state.timer % 50 === 1) {
        const mapScale = 50
        const map = state.pieces.reduce((grid, { position, size }) => {
            const x = Math.floor(mapScale * position.x / state.width)
            const y = Math.floor(mapScale * position.y / state.height)
            grid[x][y] += Math.log(size) / Math.log(2)
            return grid
        }, Array(mapScale).fill(null).map(() => Array(mapScale).fill(0)))
        state.map = map
        state.sortedActors = state.actors.map(({ pieces: [{size}], name }) => ({ size, name })).sort((a,b) => b.size - a.size)
        state.realtime = realtime + (Date.now() - startTime)
    }
    gameLoopTimeout = setTimeout(gameLoop, 10)
}
const stopGame = () => {
    cancelAnimationFrame(renderLoopTimeout)
    clearTimeout(gameLoopTimeout)
    realtime += Date.now() - startTime
    gameLoopTimeout = null
    renderLoopTimeout = null
    const context = $canvas.getContext('2d')
    context.font = "60px sans-serif"
    context.fillText('Paused', $canvas.width / 2, $canvas.height / 2)
}
const startGame = () => {
    startTime = Date.now()
    gameLoop()
    renderLoop()
}
const renderLoop = () => {
    render($canvas, state)
    renderLoopTimeout = requestAnimationFrame(renderLoop)
}

startGame()
window.stopGame = stopGame