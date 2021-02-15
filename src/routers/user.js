const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const CONSTANTS = require('../constants')
const zoomController = require('../controllers/zoomController')

const router = express.Router()

router.post('/users/register', async (req, res) => {
    console.log("Regster request")
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
        res.status(400).send({ error: true, errorMessage: error })
    }
})

router.post('/users/login', async (req, res) => {
    console.log("Login request")
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
    console.log("logout request")
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

router.get('/zoomlogin', function (req, res, next) {
    if (req.query.code) {
        let url = 'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=' + CONSTANTS.REDIRECT_URL;

        request.post(url, (error, response, body) => {

            // Parse response to JSON
            body = JSON.parse(body);

            // Logs your access and refresh tokens in the browser
            console.log(`access_token: ${body.access_token}`);
            console.log(`refresh_token: ${body.refresh_token}`);

            if (body.access_token) {

                // Step 4:  
                // We can now use the access token to authenticate API calls

                // Send a request to get your user information using the /me context
                // The `/me` context restricts an API call to the user the token belongs to
                // This helps make calls to user-specific endpoints instead of storing the userID

                // request.get('https://api.zoom.us/v2/users/me', (error, response, body) => {
                //     if (error) {
                //         console.log('API Response Error: ', error)
                //     } else {
                //         body = JSON.parse(body);
                //         // Display response in console
                //         console.log('API call ', body);
                //         // Display response in browser
                //         var JSONResponse = '<pre><code>' + JSON.stringify(body, null, 2) + '</code></pre>'
                //         res.send(`
                //             <style>
                //                 @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap');@import url('https://necolas.github.io/normalize.css/8.0.1/normalize.css');html {color: #232333;font-family: 'Open Sans', Helvetica, Arial, sans-serif;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;}h2 {font-weight: 700;font-size: 24px;}h4 {font-weight: 600;font-size: 14px;}.container {margin: 24px auto;padding: 16px;max-width: 720px;}.info {display: flex;align-items: center;}.info>div>span, .info>div>p {font-weight: 400;font-size: 13px;color: #747487;line-height: 16px;}.info>div>span::before {content: "👋";}.info>div>h2 {padding: 8px 0 6px;margin: 0;}.info>div>p {padding: 0;margin: 0;}.info>img {background: #747487;height: 96px;width: 96px;border-radius: 31.68px;overflow: hidden;margin: 0 20px 0 0;}.response {margin: 32px 0;display: flex;flex-wrap: wrap;align-items: center;justify-content: space-between;}.response>a {text-decoration: none;color: #2D8CFF;font-size: 14px;}.response>pre {overflow-x: scroll;background: #f6f7f9;padding: 1.2em 1.4em;border-radius: 10.56px;width: 100%;box-sizing: border-box;}
                //             </style>
                //             <div class="container">
                //                 <div class="info">
                //                     <img src="${body.pic_url}" alt="User photo" />
                //                     <div>
                //                         <span>Hello World!</span>
                //                         <h2>${body.first_name} ${body.last_name}</h2>
                //                         <p>${body.role_name}, ${body.company}</p>
                //                     </div>
                //                 </div>
                //                 <div class="response">
                //                     <h4>JSON Response:</h4>
                //                     <a href="https://marketplace.zoom.us/docs/api-reference/zoom-api/users/user" target="_blank">
                //                         API Reference
                //                     </a>
                //                     ${JSONResponse}
                //                 </div>
                //             </div>
                //         `);
                //     }
                // }).auth(null, null, true, body.access_token);

            } else {
                // Handle errors, something's gone wrong!
            }

        }).auth(CONSTANTS.ZOOM_CLIENT_ID, CONSTANTS.ZOOM_CLIENT_SECRET);

        return;
    } else {
        // If no authorization code is available, redirect to Zoom OAuth to authorize
        res.redirect('https://zoom.us/oauth/authorize?response_type=code&client_id=' + CONSTANTS.ZOOM_CLIENT_ID + '&redirect_uri=' + CONSTANTS.REDIRECT_URL)
    }
});

router.post('/zoom/get_token',auth,  zoomController.getAccessToken);

router.get('test', (req, res) => {
    res.send('OK server is working!')
})

module.exports = router