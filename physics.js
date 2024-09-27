import { actorAI } from "./ai.js"
import { radius, resolveSizes, withinBounds } from "./lib.js"
import { newActors, newPieces, newState } from "./spawn.js"

const reduce_actorPieces = actor => (accum, {position,size}, index) => {
    if (index === 0) {
        accum.push({position:{
            x: position.x + (Math.cos(actor.direction) * actor.speed) + actor.velocity.x,
            y: position.y + (Math.sin(actor.direction) * actor.speed) + actor.velocity.y,
        },size,alive:true})
        return accum
    }
    const thisRad = radius(size)
    const thatRad = radius(accum[index-1].size)
    const distance = thisRad + thatRad
    let direction = actor.direction
    if (position) {
        direction = Math.atan2(
            accum[index-1].position.y - position.y,
            accum[index-1].position.x - position.x
        )
    } else if (index >= 2) {
        direction = Math.atan2(
            accum[index-2].position.y - accum[index-1].position.y,
            accum[index-2].position.x - accum[index-1].position.x
        )
    }
    accum.push({position:{
        x: accum[index-1].position.x - (distance * Math.cos(direction)),
        y: accum[index-1].position.y - (distance * Math.sin(direction)),
    },size,alive:true})
    return accum
}

const actorStep = state => actor => {
    const within = withinBounds(state)
    const pieces = actor.pieces.reduce(reduce_actorPieces(actor), []).map(within)
    return {
        ...actor,
        velocity: {x:actor.velocity.x*0.9,y:actor.velocity.y*0.9},
        pieces
    }
}

const reduce_pieceCollisions = ({collisions,remaining,actors}, piece) => {
    const pieceRadius = radius(piece.size)
    for (let a in actors) {
        const head = actors[a].pieces[0]
        if (head.size < piece.size) continue;
        const headRadius = radius(head.size)
        const deltaSq = ((head.position.x - piece.position.x) ** 2) + 
                        ((head.position.y - piece.position.y) ** 2)
        const radSq = (pieceRadius + headRadius) ** 2
        if (deltaSq <= radSq) {
            collisions[a] = collisions[a] || 0
            collisions[a] += piece.size
            return {collisions,remaining,actors}
        }
    }
    remaining.push(piece)
    return {collisions,remaining,actors}
}
const reduce_actorCollisions = (accum, actor, a, actors) => {
    const { collisions, remaining, dead, bonks, cuts } = accum
    for (let p=0; p<actor.pieces.length; p++) {
        const piece = actor.pieces[p]
        const pieceRadius = radius(piece.size)
        for (let b=0; b<actors.length; b++) {
            if (a===b) continue;
            if (dead.includes(b)) continue;

            const head = actors[b].pieces[0]
            if (head.size < piece.size) continue;
            const headRadius = radius(head.size)
            const delta = {
                x: head.position.x - piece.position.x,
                y: head.position.y - piece.position.y,
            }
            const deltaSq = (delta.x ** 2) + 
                            (delta.y ** 2)
            const radSq = (pieceRadius + headRadius) ** 2
            if (deltaSq <= radSq) {
                if (head.size === piece.size && p === 0) {
                    // head-on-head collision
                    const recoil = {x:delta.x*0.5,y:delta.y*0.5}
                    return {
                        ...accum,
                        bonks: [...bonks,{a,b,recoil}]
                    }
                }
                return {
                    ...accum,
                    collisions: {
                        ...collisions,
                        [b]: (collisions[b] || 0) + piece.size
                    },
                    remaining: remaining.concat(actor.pieces.slice(p+1).map(pc => ({...pc,alive:false}))),
                    cuts: [...cuts, {a,p}],
                    dead: p === 0 ? [...dead,a] : dead
                }
            }
        }
    }
    return accum
}



const collisions = (input) => {
    const state = {...input}
    const pieceCollisions = state.pieces.reduce(reduce_pieceCollisions, {collisions:{},remaining:[],actors:state.actors})
    const collisions = state.actors.reduce(reduce_actorCollisions, {...pieceCollisions,dead:[],bonks:[],cuts:[]})
    
    if (collisions.dead.includes(0)) {
        return newState()
    }

    const actors = [...state.actors]
    for (let cut of collisions.cuts) {
        actors[cut.a] = {
            ...actors[cut.a],
            pieces: actors[cut.a].pieces.slice(0, cut.p)
        }
    }
    for (let bonk of collisions.bonks) {
        actors[bonk.a] = {
            ...actors[bonk.a],
            velocity: {x:-bonk.recoil.x,y:-bonk.recoil.y}
        }
        actors[bonk.b] = {
            ...actors[bonk.b],
            velocity: bonk.recoil
        }
    }
    for (let a in collisions.collisions) {
        const sizes = resolveSizes([...actors[a].pieces.map(({size}) => size), collisions.collisions[a]])
        actors[a] = {
            ...actors[a],
            pieces: sizes.map((size, index) => {
                const existingPiece = actors[a].pieces[index]
                return {
                    size,
                    position: existingPiece ? existingPiece.position: false
                }
            })
        }
    }

    collisions.dead.reverse().forEach((index) => {
        actors.splice(index, 1)
    })

   return {
        ...state,
        actors,
        pieces: collisions.remaining,
    }
}
const movement = state => ({
    ...state,
    actors: state.actors.map(actorStep(state)),
})

const newEntities = state => {
    const playerSizeLog = Math.log(state.actors[0].pieces[0].size) / Math.log(2)
    const wantedPieces = (20*Math.pow(2, playerSizeLog/10))
    return {
        ...state,
        actors: state.actors.length < 10 ? state.actors.concat(newActors(state, 5)): state.actors,
        pieces: state.pieces.length < wantedPieces ? state.pieces.concat(newPieces(state, 20)) : state.pieces,
    }
}

const gameSize = (state) => {
    const playerSizeLog = Math.log(state.actors[0].pieces[0].size) / Math.log(2)
    const gameSize = Math.floor(1000*Math.pow(2, playerSizeLog/10))
    return {
        ...state,
        width: state.width < gameSize ? state.width+0.25 : gameSize,
        height: state.height < gameSize ? state.height+0.25 : gameSize
    }
}
const AI = state => ({
    ...state,
    actors: [state.actors[0], ...state.actors.slice(1).map(actorAI(state))],
})
const incrementTimer = state => ({...state, timer:state.timer+1})



const physicsProcess = [
    collisions,
    movement,
    newEntities,
    gameSize,
    AI,
    incrementTimer
]
export const physicsStep = state =>
    physicsProcess.reduce((state, process) => process(state), state)


