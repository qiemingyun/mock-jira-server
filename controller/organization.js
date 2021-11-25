const { exec } = require('../db/mysql')
const xss = require('xss')

const getList = async ()=>{
  let sql = `select * from organizations order by name desc;`
  return await exec(sql)
}

module.exports = {
  getList
}
