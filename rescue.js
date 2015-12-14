var cadence = require('cadence')
var Operation = require('operation')
var slice = [].slice

function Rescue (operation) {
    if (operation instanceof RegExp) {
        this._rescue = new Operation(function (error) {
            return operation.test(error.code || error.message)
        })
    } else {
        this._rescue = new Operation(operation)
    }
}

Rescue.prototype.rescue = function () {
    var rescue = this._rescue,
        rescueVargs = slice.call(arguments),
        operation = new Operation(rescueVargs.pop())
    return cadence(function (async) {
        var vargs = slice.call(arguments, 1)
        var loop = async([function () {
            operation.apply(vargs.concat(async()))
        }, function (error) {
            if (rescue.apply(rescueVargs.concat(error))) {
                return [ loop.continue ]
            } else {
                return [ loop.break ]
            }
        }], [], function (vargs) {
            return [ loop.break ].concat(vargs)
        })()
    })
}

module.exports = Rescue
