const Turnstile = require('turnstile')

const events = require('events')

class Eject extends events.EventEmitter {
    constructor (turnstile) {
        super()
        this._turnstile = turnstile
    }

    get health () {
        return this._turnstile.health
    }

    get size () {
        return this._turnstile.size
    }

    unqueue (entry) {
        return this._turnstile.unqueue(entry)
    }

    drain () {
        return this._turnstile.drain()
    }

    enter (...vargs) {
        let index = 0
        const entry = Turnstile.options(vargs)
        const { object, worker } = entry
        entry.object = null
        entry.worker = async work => {
            try {
                await worker.call(object, work)
            } catch (error) {
                this.emit('error', error)
            }
        }
        return this._turnstile.enter.apply(this._turnstile, Turnstile.vargs(entry))
    }
}

module.exports = Eject
