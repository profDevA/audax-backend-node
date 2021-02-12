const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/users/register', async (req, res) => {
    // Create a new user
    try {
        const exist = await User.findOne({ "email": req.body.email });

        if (!exist) {
            const user = new User(req.body)
            await user.save()
            const token = await user.generateAuthToken()
            res.status(201).send({ error: false, user, token })
        } else {
            res.status(400).send({error: true, errorMessage: 'The email already exists!'})
        }

    } catch (error) {
        res.status(400).send({ error: true, errorMessage: error.errmsg })
    }
})

router.post('/users/login', async (req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({ error: true, errorMessage: 'Login failed! Check authentication credentials' })
        }
        const token = await user.generateAuthToken()
        res.send({ error: false, user, token })
    } catch (error) {
        res.status(400).send({ error: true, errorMessage: error.message })
    }

})

router.get('/users/me', auth, async (req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send({ error: false })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router