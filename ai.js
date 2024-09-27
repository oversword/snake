import { radius, withinBounds } from "./lib.js"



export const actorAI = state => (actor, index) => {
    if (state.timer % actor.thinkDelay !== actor.thinkOffset) return actor;
    // Find closest edible and go toward
    const otherPieces = state.actors.flatMap((otherActor, otherIndex) => otherIndex === (index+1) ? [] : otherActor.pieces)
    // console.log(otherPieces)
    const within = withinBounds(state)
    const head = actor.pieces[0]
    const bestDir = state.pieces.concat(otherPieces).reduce((closest, piece) => {
        const distance = ((head.position.x - piece.position.x) ** 2) +
                         ((head.position.y - piece.position.y) ** 2)
        if (distance > (radius(head.size) * 15) ** 2)
            return closest
        if ((!piece.alive && piece.size > head.size) || piece.alive && piece.size === head.size)
            return closest
        if ((!closest) || ((closest.size / closest.distance) < (piece.size / distance))) {
            return {
                ...piece,
                // Run away
                position: (piece.alive && piece.size > head.size) ? {
                    x: (head.position.x*2)-piece.position.x,
                    y: (head.position.y*2)-piece.position.y,
                } : piece.position,
                distance,
            }
        }
        return closest
    }, null)
    // console.log(bestDir)
    if (!bestDir)
        return {
            direction: actor.direction+Math.random()-0.5,
            ...actor
        }
    const bestWithin = within(bestDir)
    return {
        ...actor,
        direction: Math.atan2(
            bestWithin.position.y - head.position.y,
            bestWithin.position.x - head.position.x
        )
    }
}