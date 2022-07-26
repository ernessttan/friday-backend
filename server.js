const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

// Create a new express application instance
const app = express();

// Configure express application
app.use(express.json()); // for parsing json data

// Configure middleware
const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  };
app.use(cors(corsOptions)); // for allowing cross-origin requests


// Start the server
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => console.log(`Listening on port ${port}`));
}).catch((err) => {
    console.log(err);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});



