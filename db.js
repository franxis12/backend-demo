const mysql = require("mysql2")
const { createPool } = require("mysql2/promise")

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Forever1993@",
    database: "notes_app"
})

module.exports = pool.promise();