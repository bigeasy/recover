var ok = require('assert').ok,
    __slice = [].slice

function Rescue () {
    this.seen = []
}

Rescue.prototype.validator = function (callback, janitor) {
    var rescue = this
    return function (forward) {
        return rescue.validate(callback, forward, janitor)
    }
}

Rescue.prototype.validate = function (callback, forward, janitor) {
    ok(typeof forward == 'function', 'no forward function')
    ok(typeof callback == 'function','no callback function')

    var rescue = this

    delete rescue.thrown
    rescue.seen.length = 0

    return function (error) {
        if (error) {
            cleanup(error)
        } else {
            try {
                forward.apply(null, __slice.call(arguments, 1))
            } catch (error) {
                cleanup(error)
            }
        }
    }

    function cleanup (error) {
        if (janitor) {
            if (!rescue.seen.filter(function (seen) { return seen === janitor }).pop()) {
                rescue.seen.push(janitor)
                janitor(error)
                if (janitor.length) return
            }
        }

        if (rescue.thrown === error) {
            throw error
        }

        rescue.callback(callback, error)
    }
}

Rescue.prototype.callback = function (callback) {
    try {
        callback.apply(null, __slice.call(arguments, 1))
    } catch (error) {
        this.thrown = error
        throw error
    }
}

module.exports = Rescue
