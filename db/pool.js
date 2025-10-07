const {Pool} = require("pg");
require("dotenv").config();
const path = require("node:path");
const fs = require("node:fs");



module.exports = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        require: true,
        ca: fs.readFileSync(path.join(__dirname, "../ca.pem")).toString()
    }
});