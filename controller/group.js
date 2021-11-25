const { exec } = require('../db/mysql')
const xss = require('xss')

const getList = async (projectId)=>{
  let sql = `select * from taskGroups where projectId='${projectId}' order by name desc`
  console.log('getGroupList, ', sql)
  return await exec(sql)
}

const newTaskGroup = async (task = {}) => {
  const name = escape(xss(task.name))
  const projectId = task.projectId
  const createTime = Date.now()

  const sql = `
    insert into taskGroups (name, projectId, createTime)
    values ('${name}', '${projectId}', '${createTime}')
  `
  const insertData = await exec(sql)
  
  return {
    id: insertData.insertId
  }
  
}

const delTaskGroup = async (id) => {
  const sql = `delete from taskGroups where id='${id}'`
  const deleteData = await exec(sql)

  if(deleteData.affectedRows > 0){
    return true
  }
  return false
  
}

module.exports = {
  getList,
  newTaskGroup,
  delTaskGroup
}
