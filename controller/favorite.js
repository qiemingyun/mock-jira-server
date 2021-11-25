const { exec } = require('../db/mysql')
const xss = require('xss')

const getList = async (userId)=>{
  let sql = `select * from favorites where userId='${userId}';`
  return await exec(sql)
}

const pin = async (userId, projectId, project = {}) => {
  const b_pin = project.pin
  const pin = b_pin? 1 : 0

  const sql = `
      select * from favorites where projectId='${projectId}' and userId='${userId}'
    `
  const rows = await exec(sql)

  if (rows?.length > 0) {

    const updateSql = `
          update favorites set pin='${pin}' where id='${rows[0].id}'
        `
    const updateData = await exec(updateSql)
  
    if(updateData.affectedRows > 0) {
      return true
    }
    
  } else {

    const sql = `
      select * from projects where id='${projectId}'
    `
    const rows = await exec(sql)

    if (rows?.length > 0) {
      const createTime = Date.now()
      const insertSql = `insert into favorites (userId, projectId, pin, createTime)
      values ('${userId}' , '${projectId}' , '${pin}', '${createTime}')`

      const insertData = await exec(insertSql)
    
      if(insertData.insertId) {
        return true
      }
    }
  }
  return false
}

module.exports = {
  getList,
  pin
}
