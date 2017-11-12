/**
 * Generate an unique identifier for annotations.
 *
 * @return {String}
 */

const ID_LENGTH = 8

const BASE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const BASE_LEN = BASE.length

export default function uuid () {

    let id = ''
    for (let i = 0; i < ID_LENGTH; i++) {
        id += BASE[ Math.floor(Math.random() * BASE_LEN) ]
    }
    return id
}
