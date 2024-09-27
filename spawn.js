import { names } from "./data.js"
import { withinBounds } from "./lib.js"

export const newPieces = (state, count = 10) => {
    const playerSizeLog = Math.log(state.actors[0].pieces[0].size) / Math.log(2)
    const maxSize = Math.min(playerSizeLog, 8)
    const within = withinBounds(state)
    return Array(count).fill(null).map(() => within({
        position: {
            x: Math.random() * state.width,
            y: Math.random() * state.height,
        },
        size: 2 ** (1 + Math.floor(Math.random()*maxSize)),
        alive: false,
    }))
}
export const newActors = (state, count = 10) => {
    const playerSizeLog = Math.log(state.actors[0].pieces[0].size) / Math.log(2)
    const maxSize = Math.max(4, playerSizeLog - 5)
    const minSize = Math.max(1, maxSize-4)
    const within = withinBounds(state)
    return Array(count).fill(null).map(() => ({
        name: names[Math.floor(names.length*Math.random())] + names[Math.floor(names.length*Math.random())],
        pieces: [
            within({
                position: {
                    x: Math.random() * state.width,
                    y: Math.random() * state.height,
                },
                size: 2 ** (minSize + Math.floor(Math.random()*(maxSize-minSize))),
                alive: true,
            })
        ],
        speed: 0.9 + (Math.random()*0.2),
        thinkOffset: Math.floor(100*Math.random()),
        thinkDelay: 100,
        velocity: {x:0,y:0},
        direction: Math.random() * 2 * Math.PI
    }))
}
export const newState = () => {
    let state = {
        width: 1000,
        height: 1000,
        timer: 0,
        realtime: 0,
        pieces: [],
        map: [],
        sortedActors: [],
        actors: [
            {
                name: 'You',
                pieces: [
                    {
                        position: {
                            x: 500,
                            y: 500
                        },
                        size: 32,
                        alive: true,
                    }
                ],
                speed: 1.2,
                velocity: {x:0,y:0},
                direction: 0
            },
        ],
    }

    state.pieces = newPieces(state, 40)
    state.actors = state.actors.concat(newActors(state, 10))
    return state
}