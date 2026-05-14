const jwt = require('jsonwebtoken');

const token = process.argv[2];
if(!token) {
    console.log("No token provided");
    process.exit(1);
}
const decoded = jwt.decode(token);
console.log("Decoded token:", decoded);
