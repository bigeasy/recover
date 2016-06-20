var cadence = require('cadence')
var Operation = require('operation')
var slice = [].slice

function Rescue (operation) {
    if (operation instanceof RegExp) {
        this._rescue = new Operation(function (error) {
            return operation.test(error.code || error.message)
        })
    } else if (typeof operation == 'number') {
        this._rescue = new Operation(function () { return operation })
    } else {
        this._rescue = new Operation(operation)
    }
    this._backoff = 0
    this._timeouts = []
}

Rescue.prototype.rescue = function () {
    var rescue = this._rescue,
        rescueVargs = slice.call(arguments),
        operation = new Operation(rescueVargs.pop())
    return cadence(function (async) {
        var vargs = slice.call(arguments, 1)
        var timeout
        var loop = async([function () {
            async(function () {
                if (this._backoff) {
                    timeout = setTimeout(async(), this._backoff)
                    timeout.unref()
                    this._timeouts.push(timeout)
                }
            }, function () {
                if (timeout) {
                    var index = this._timeouts.indexOf(timeout)
                    this._timeouts.splice(index, 1)
                }
                operation.apply(vargs.concat(async()))
            }, function () {
                this._backoff = 0
            })
        }, function (error) {
            var rescued = rescue.apply(rescueVargs.concat(error))
            if (rescued != null) {
                if (typeof rescued == 'number') {
                    this._backoff = rescued
                    rescued = true
                }
            }
            if (rescued) {
                return [ loop.continue ]
            } else {
                return [ loop.break ]
            }
        }], [], function (vargs) {
            return [ loop.break ].concat(vargs)
        })()
    }).bind(this)
}

// TODO Scream is essentially `unref`, and is outgoing.
Rescue.prototype.scram = function () {
    this._timeouts.forEach(clearTimeout)
    this._timeouts.length = 0
}

module.exports = Rescue
