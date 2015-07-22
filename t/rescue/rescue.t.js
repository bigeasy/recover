require('proof')(2, require('cadence/redux')(prove))

function prove (async, assert) {
    var Rescue = new require('../..')

    function Service () {
    }

    var error = new Error
    error.code = 'EPIPE'
    Service.prototype.run = function (callback) {
        if (error) {
            callback(error)
            error = null
        } else {
            callback()
        }
    }

    Service.prototype.rescue = function () {
    }

    var service = new Service
    var rescue

    async(function () {
        rescue = new Rescue({
            operation: { object: service, method: 'run' },
            rescue: /^EPIPE$/
        })
        rescue.run(async())
    }, [function () {
        error = new Error('thrown')
        rescue = new Rescue({
            operation: { object: service, method: 'run' },
            rescue: /^EPIPE$/
        })
        rescue.run(async())
    }, function (error) {
        assert(error.message, 'thrown', 'regex thrown')
    }], [function () {
        error = new Error('thrown')
        rescue = new Rescue({
            operation: { object: service, method: 'run' },
            rescue: function () { return false }
        })
        rescue.run(async())
    }, function (error) {
        assert(error.message, 'thrown', 'function thrown')
    }])
}
