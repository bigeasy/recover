var cadence = require('cadence/redux')
var Operation = require('operation')

function Rescue (options) {
    this._operation = new Operation(options.operation)
    if (options.rescue instanceof RegExp) {
        this._rescue = new Operation(function (error) {
            return options.rescue.test(error.code || error.message)
        })
    } else {
        this._rescue = new Operation(options.rescue)
    }
    this._vargs = options.vargs || []
}

Rescue.prototype.run = cadence(function (async) {
    var stats = this.stats = {
        error: null,
        start: null,
        duration: null,
        iteration: -1
    }
    var loop = async([function () {
        stats.iteration++
        stats.start = Date.now()
        this._operation.apply(this._vargs.concat(async()))
    }, function (error) {
        stats.error = error
        stats.duration = Date.now() - stats.start
        if (this._rescue.apply([ error ])) {
            return [ loop() ]
        }
        throw error
    }], function () {
        return [ loop ]
    })()
})

module.exports = Rescue
