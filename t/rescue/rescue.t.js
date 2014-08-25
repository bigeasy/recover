require('proof')(6, function (assert) {
    var rescue = new (require('../..')), callback

    callback = rescue.validate(function () {
    }, function (result) {
        assert(result, 1, 'forward');
    })
    callback(null, 1);

    callback = rescue.validator(function () {
    })(function (result) {
        assert(result, 1, 'validator');
    })
    callback(null, 1);

    callback = rescue.validate(function (error) {
        assert(error.message, 'error', 'forwarded error')
    }, function () {
    })
    callback(new Error('error'))

    function janitor () {
        assert(1, 'janitor called once')
    }

    callback = rescue.validate(function () {
    }, function (result) {
        rescue.validate(function (error) {
            throw error
        }, function () {
            throw new Error('error')
        }, janitor)()
    }, janitor)
    try {
        callback(null, 1)
    } catch (e) {
        assert(e.message, 'error', 'user thrown error')
    }

    function interceptor (error) {
        assert(error.message, 'error', 'intercepted error')
    }
    rescue.validate(function () {
    }, function () {
        throw new Error('error')
    }, interceptor)()
})
