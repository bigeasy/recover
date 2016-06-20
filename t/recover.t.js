require('proof')(4, require('cadence')(prove))

function prove (async, assert) {
    var Rescue = new require('..')
    var cadence = require('cadence')

    var rescuer = new Rescue(/^EPIPE$/)

    assert(rescuer, 'require')

    async(function () {
        var count = 0
        rescuer.rescue(cadence(function (async) {
            if (count++ == 1) {
                throw new Error('badness')
            } else {
                var error = new Error
                error.code = 'EPIPE'
                throw error
            }
        }))(async())
    }, function () {
        rescuer.rescue(cadence(function (async) {
            return 1
        }))(async())
    }, function (one) {
        assert(one, 1, 'return')
        new Rescue(function (context, error) {
            assert(context, 'context', 'context')
            assert(error.message, 'message', 'error message')
        }).rescue('context', cadence(function (async) { throw new Error('message') }))(async())
    }, function () {
        return [ async.break ]
        var count = 0
        new Rescue(function (error) {
            if (count == 2) {
                return false
            } else {
                return count++
            }
        }).rescue(cadence(function () { throw new Error('message') }))(async())
        console.log('here')
    }, function () {
        var rescuer = new Rescue(864e6)
        rescuer.rescue(cadence(function () { throw new Error('message') }))(function () {})
        rescuer.scram()
    })
}
