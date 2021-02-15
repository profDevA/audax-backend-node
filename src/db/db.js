const mongoose = require('mongoose')
const CONSTANTS = require('../constants')

mongoose.connect(CONSTANTS.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
})
