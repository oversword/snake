

export const radius = size => 2*(2+Math.floor(Math.log(size) / Math.log(2)))

export const resolveSizes = sizes => {
    // const sorted = [...sizes].sort((a,b) => b-a)
    // console.log(sorted)
    const sum = sizes.reduce((sum, size) => sum+size, 0)
    let remainder = sum
    let ret = []
    for (let i=Math.floor(Math.log(sum) / Math.log(2)); i>0; i--) {
        const pow = 2 ** i
        if (remainder >= pow) {
            ret.push(pow)
            remainder = remainder % (2 ** i)
            if (remainder === 0) break;
        }
    }
    // console.log(ret, sum, sizes)
    return ret
}

export const partition = (list, predicate, initial = [[],[]]) => list.reduce((current, item, index, list) => {
    const key = predicate(item, index, list)
    current[key] = current[key] || []
    current[key].push(item)
    return current
}, initial)


export const withinBounds = (state) => ({ position, size, ...rest }) => ({
    position: {
        x: Math.min(state.width - radius(size), Math.max(radius(size), position.x)),
        y: Math.min(state.height - radius(size), Math.max(radius(size), position.y)),
    },
    size,
    ...rest
})
export const capitalise = str => str[0].toUpperCase()+str.slice(1)
