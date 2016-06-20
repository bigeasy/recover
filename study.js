Service.prototype._attempt = cadence(function (async, value) {
    async([function () {
        this._ua.fetch({
            url: this._remote
        }, function () {
            url: '/dispatch',
            body: value
        }, async())
    }, function (error) {
        logger.error('dispatch', { stack: error.stack })
        throw error
    }])
})

Service.prototype._forward = cadence(function (async, timeout, value) {
    recoverable({
        operation: { object: this, method: '_attempt' },
        filter: /^bigeasy.vizsla;fetch$/,
        unref: true
    }).invoke(value, async())
})
