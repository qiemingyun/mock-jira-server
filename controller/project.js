const { exec } = require('../db/mysql')
const xss = require('xss')

const getList = async (principalId, keyword)=>{
  let sql = `select p.id as projectId, p.name as projectName, p.principalId, p.organizationId, p.createTime, og.name as organizationName from projects p left join organizations og on p.organizationId=og.id where 1=1 `
  if (principalId) {
    sql += `and p.principalId='${principalId}' `
  }
  if (keyword) {
    sql += `and p.name like '%${keyword}%' `
  }
  sql += `;`
  return await exec(sql)
}

const getDetail = async (id) => {
  let sql = `select p.id as projectId, p.name as projectName, p.principalId, p.organizationId, p.createTime from projects p where id='${id}'`
  const rows = await exec(sql)
  return rows[0]
}

const newProject = async (project = {}) => {
  const name = escape(xss(project.projectName))
  const principalId = project.principalId
  const organizationId = project.organizationId
  const createTime = Date.now()

  const sql = `
    insert into projects (name, principalId, organizationId, createTime)
    values ('${name}' , '${principalId}' , '${organizationId}', '${createTime}')
  `
  const insertData = await exec(sql)
  
  return {
    id: insertData.insertId
  }
  
}

const updateProject = async (id, project = {}) => {
  const name = escape(xss(project.projectName))
  const principalId = project.principalId
  const organizationId = project.organizationId

  const sql = `
    update projects set name='${name}', principalId='${principalId}', organizationId='${organizationId}' where id='${id}'
  `

  const updateData = await exec(sql)
  
  if(updateData.affectedRows > 0) {
    return true
  }
  return false
}

const delProject = async (id) => {
  const sql = `delete from projects where id='${id}'`
  const deleteData = await exec(sql)

  if(deleteData.affectedRows > 0){
    return true
  }
  return false
  
}

module.exports = {
  getList,
  getDetail,
  newProject,
  updateProject,
  delProject
}
