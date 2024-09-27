import { capitalise } from "./lib.js"

export const colours = Array(100).fill(null).map((_,index) => {
    const r = (((index+0) * 6) + 160) % 16
    const g = (((index+1) * 6) + 160) % 16
    const b = (((index+2) * 6) + 160) % 16
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
})
const nameParts = ['dop','dorp','dip','dap','rap','ford','dig','lang','song','wap','snap','cap','lap','rap','oat','fear','leap','mike','tom','flop','flip','flap','snap','crackle','pop']
const randomNames = Array(100).fill(null).map(() => capitalise(nameParts[Math.floor(nameParts.length*Math.random())]+nameParts[Math.floor(nameParts.length*Math.random())]))

export const names = [
    'Flaxom',
    'Dorkus',
    'Mayborne',
    'Dillport',
    'Mador',
    'Crompus',
    'Fliddle',
    'Maxum',
    'Discle',
    'Popper',
    'Nuggie',
    'Rambo',
    'Dianne',
    'Phil',
    'Mr',
    'Alfred',
    'Martin',
    'Jungo',
    'Rancid',
    'Fort',
    'Ample',
    'Green',
    'Simple',
    'Actual',
    'Poor',
    'Gentle',
    'Marvin',
    'Alakazam',
    'Awkward',
    'Fart',
    'Knuckle',
    'Jimbo',
    'Jambo',
    'Jumbo',
    'Reep',
    'Fork',
    'Hunter',
].concat(randomNames)