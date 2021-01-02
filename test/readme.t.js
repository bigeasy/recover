require('proof')(4, async okay => {
    const Destructible = require('destructible')
    const Turnstile = require('turnstile')
    const Ejector = require('..')

    {
        const destructible = new Destructible($ => $(), 'eject.t')
        const turnstile = new Turnstile(destructible.durable($ => $(), 'turnstile'))
        const ejector = new Ejector(turnstile)

        const errors = []
        ejector.on('error', error => errors.push(error.message))

        okay(ejector.health, turnstile.health, 'health is proxied')
        okay(ejector.size, turnstile.size, 'size is proxied')

        const gathered = []
        ejector.enter({ value: 1 }, async ({ value }) => {
            gathered.push(value)
        })
        const entry = ejector.enter({ value: 2 }, async ({ value }) => {
            gathered.push(value)
        })
        ejector.unqueue(entry)
        ejector.enter({ value: 1 }, async ({ value }) => {
            throw new Error('thrown')
        })

        await ejector.drain()

        okay(gathered, [ 1 ], 'successful work')
        okay(errors, [ 'thrown' ], 'errors gathered')
    }
})
