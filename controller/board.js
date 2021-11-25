const { exec } = require('../db/mysql')
const xss = require('xss')
const mysql = require('mysql')
const { delAllTasksOfBoard } = require('./task')

const getList = async (projectId)=>{
  // let sql = `select p.id as projectId, p.name as projectName, p.principalId, p.organizationId, p.createTime, og.name as organizationName from projects p left join organizations og on p.organizationId=og.id where 1=1 `
  let sql = `select * from boards where 1=1 `

  if (projectId) {
    sql += `and projectId='${projectId}' `
  }
  // if (keyword) {
  //   sql += `and p.name like '%${keyword}%' `
  // }
  sql += `order by orderNum;`
  return await exec(sql)
}

// const getDetail = async (id) => {
//   let sql = `select p.id as projectId, p.name as projectName, p.principalId, p.organizationId, p.createTime from projects p where id='${id}'`
//   const rows = await exec(sql)
//   return rows[0]
// }

const newBoard = async (board = {}) => {
  const name = escape(xss(board.name))
  const projectId = board.projectId
  const createTime = Date.now()

  const searchSql = `select count(*)+1 as nextOrderNum from boards where projectId = ${projectId}`

  const maxOrder = await exec(searchSql)
  const orderNum = maxOrder[0].nextOrderNum

  const sql = `
    insert into boards (name, projectId, createTime, orderNum)
    values ('${name}' , '${projectId}' , '${createTime}', '${orderNum}')
  `
  const insertData = await exec(sql)
  
  return {
    id: insertData.insertId
  }
  
}

// const updateProject = async (id, project = {}) => {
//   const name = escape(xss(project.projectName))
//   const principalId = project.principalId
//   const organizationId = project.organizationId

//   const sql = `
//     update projects set name='${name}', principalId='${principalId}', organizationId='${organizationId}' where id='${id}'
//   `

//   const updateData = await exec(sql)
  
//   if(updateData.affectedRows > 0) {
//     return true
//   }
//   return false
// }

const delBoard = async (id) => {
  let delOrderNum = -1
  let projectId = -1
  const selSql = `select projectId, orderNum from boards where id=${id}`
  const delItem = await exec(selSql)
  if ( delItem?.length > 0 ){
    delOrderNum = delItem[0].orderNum
    projectId = delItem[0].projectId
  }
  
  if (delOrderNum === -1 || projectId === -1){
    return false
  }

  const selOrdersSql = `select id, orderNum-1 as orderNum from boards where projectId = ${projectId} and orderNum > ${delOrderNum}`
  const orders = await exec(selOrdersSql)
  if (orders?.length>0){
    const formatSql = 'update boards set orderNum = ? where id = ? '
    let insertSql = ''
    orders.forEach(order => {
      const id = order.id
      const orderNum = order.orderNum
      insertSql += mysql.format(formatSql,[orderNum,id]) + ';'
    });

    const isReplace = await exec(insertSql)
    if (!isReplace) {
      return false
    }
  }

  const delBoardSql = `delete from boards where id='${id}'`
  const deleteData = await exec(delBoardSql)

  if(deleteData.affectedRows > 0){
    const val = await delAllTasksOfBoard(id)
    return val    
  }
  return false
}

const reorder = async ( sort={} ) => {
  const fromId = sort.fromId
  const referenceId = sort.referenceId

  let projectId = 0
  let fromOrder = 0
  let toOrder = 0

  const selFromOrder = `select orderNum, projectId from boards where id = ${fromId}`
  const selFromOrderResult = await exec(selFromOrder)

  if(selFromOrderResult?.length > 0){
    fromOrder = selFromOrderResult[0].orderNum
    projectId = selFromOrderResult[0].projectId
  }

  const selReferOrder = `select orderNum from boards where id = ${referenceId}`
  const selReferOrderResult = await exec(selReferOrder)

  if(selReferOrderResult?.length > 0){
    toOrder = selReferOrderResult[0].orderNum
  }

  if (projectId === 0 || fromOrder === 0 || toOrder === 0) {
    return false
  }
  
  let selOrderNumsSql = `select id, orderNum from boards where projectId = ${projectId} and orderNum `
  if (fromOrder < toOrder) {
    selOrderNumsSql += `between ${fromOrder} and ${toOrder}`
  } else { 
    selOrderNumsSql += `between ${toOrder} and ${fromOrder}`
  }
  const orders = await exec(selOrderNumsSql)
  if (orders?.length>0){
    const formatSql = 'update boards set orderNum = ? where id = ? '
    let insertSql = ''
    orders.forEach(order => {
      const id = order.id
      let orderNum = order.orderNum
      if (fromOrder < toOrder) {
        orderNum = orderNum - 1
      } else { 
        orderNum = orderNum + 1
      }

      insertSql += mysql.format(formatSql,[orderNum,id]) + ';'
    });

    const isReplace = await exec(insertSql)
    if (!isReplace) {
      return false
    }
  }

  const setSelectOrderSql = `update boards set orderNum = ${toOrder} where id = ${fromId}`
  const isSetSelectOrder = await exec(setSelectOrderSql)
  if (!isSetSelectOrder){
    return false
  }
  
  return true
}

module.exports = {
  getList,
  newBoard,
  delBoard,
  reorder
}
