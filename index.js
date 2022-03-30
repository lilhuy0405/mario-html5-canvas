// Load Node modules
var express = require('express');
// Initialise Express
var app = express();
// Render static files
app.use(express.static('.'));
// Port website will run on
const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log("Server started at http://localhost:"+PORT);