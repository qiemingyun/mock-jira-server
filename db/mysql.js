const mysql = require('mysql')
const { MYSQL_CONF } = require('../conf/db')

const con = mysql.createConnection(MYSQL_CONF)

con.connect()

function exec(sql, values) {
  const promise = new Promise((resolve, reject) => {
    con.query(sql, [values], (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
  return promise
}

module.exports = {
  exec,
  escape: mysql.escape
}
