const express = require('express')
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const cors = require('cors')
const userRouter = require('./routers/user')
require('./db/db')

const port = process.env.PORT | 5000

const app = express()
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Accept, Content-Type, access-control-allow-origin, x-api-applicationid, authorization, X-Requested-With, access-control-allow-methods, access-control-allow-headers"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "OPITIONS, GET, PUT, PATCH, POST, DELETE"
    );
    next();
  });
  
app.use(userRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})