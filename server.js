const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
require('dotenv').config();


// connect to database
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log(" DB is Connected"));



// import routes 
const authRoutes = require('./routes/auth')


//app middleware
app.use(morgan('dev')) // it tells the api
app.use(bodyParser.json())

// app.use(cors()) // allows all request origins

if(process.env.NODE_ENV ='development'){
  app.use(cors({origin: `http://localhost:3000`}))
}


// middleware 
app.use('/api',authRoutes)

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(` server is running on ${port} - ${process.env.NODE_ENV } `);
});
