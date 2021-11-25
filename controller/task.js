const { exec } = require('../db/mysql')
const xss = require('xss')
const mysql = require('mysql')

const getList = async (projectId, boardId, name, typeId, processorId)=>{
  let sql = `select * from tasks where 1=1 `
  if (projectId) {
    sql += `and projectId='${projectId}' `
  }
  if (boardId) {
    sql += `and boardId='${boardId}' `
  }
  if (name) {
    sql += `and name like '%${name}%' `
  }
  if (typeId) {
    sql += `and typeId='${typeId}' `
  }
  if (processorId) {
    sql += `and processorId='${processorId}' `
  }
  sql += `order by orderNum;`
  return await exec(sql)
}

const getDetail = async (id) => {
  let sql = `select * from tasks where id='${id}'`
  const rows = await exec(sql)
  return rows[0]
}

const getTaskTypes = async () => {
  let sql = `select * from taskTypes`
  const rows = await exec(sql)
  return rows
}

const newTask = async (task = {}) => {
  const name = escape(xss(task.name))
  const processorId = task.processorId || 0
  const projectId = task.projectId
  const groupId = task.groupId || 0
  const boardId = task.boardId
  const typeId = task.typeId || 0
  const note = task.note || ''
  const createTime = Date.now()

  const searchSql = `select count(*)+1 as nextOrderNum from tasks where boardId = ${boardId}`
  const maxOrder = await exec(searchSql)
  const orderNum = maxOrder[0].nextOrderNum

  const sql = `
    insert into tasks (name, processorId, projectId, groupId, boardId, typeId, note, createTime, orderNum)
    values ('${name}' , '${processorId}' , '${projectId}', '${groupId}', '${boardId}', '${typeId}', '${note}', '${createTime}' ,'${orderNum}')
  `
  const insertData = await exec(sql)
  
  return {
    id: insertData.insertId
  }
}

const insertTaskOrder = async (taskId, referenceId, boardId) => {
  let toOrder = 0

  // find to orderNum
  if(referenceId === undefined){
    const selCount = `select count(*) as nextOrderNum from tasks where boardId = ${boardId}`
    const maxOrder = await exec(selCount)
    toOrder = maxOrder[0].nextOrderNum
  } else {
    const selReferOrder = `select orderNum from tasks where id = ${referenceId}`
    const selReferOrderResult = await exec(selReferOrder)

    if(selReferOrderResult?.length > 0){
      toOrder = selReferOrderResult[0].orderNum
    }
  }

  if (toOrder === 0) {
    return false
  }
  
  let selOrderNumsSql = `select id, orderNum from tasks where boardId = ${boardId} and orderNum >= ${toOrder}`
  
  const orders = await exec(selOrderNumsSql)
  if (orders?.length>0){
    const formatSql = 'update tasks set orderNum = ? where id = ? '
    let insertSql = ''
    orders.forEach(order => {
      const id = order.id
      const orderNum = order.orderNum + 1
      insertSql += mysql.format(formatSql,[orderNum,id]) + ';'
    });

    const isReplace = await exec(insertSql)
    console.log('insertTaskOrder_insertSql, ',insertSql)
    if (!isReplace) {
      return false
    }
  }

  const setSelectOrderSql = `update tasks set orderNum = ${toOrder} where id = ${taskId}`
  const isSetSelectOrder = await exec(setSelectOrderSql)
  
  console.log('insertTaskOrder_setSelectOrderSql, ', setSelectOrderSql)
  return isSetSelectOrder
}

const updateTask = async (id, task = {}) => {
  const name = escape(xss(task.name))
  const processorId = task.processorId || 0
  const groupId = task.groupId || 0
  const typeId = task.typeId || 0
  const note = task.note || ''

  const sql = `
    update tasks set name='${name}', processorId='${processorId}', groupId='${groupId}', typeId='${typeId}' where id='${id}'
  `

  const updateData = await exec(sql)
  
  if(updateData.affectedRows > 0) {
    return true
  }
  return false
}

const moveTaskBoard = async (taskId, boardId) => {
  const sql = `
    update tasks set boardId='${boardId}' where id='${taskId}'
  `
  const updateData = await exec(sql)
  
  if(updateData.affectedRows > 0) {
    return true
  }
  return false
}

const delTask = async (id) => {
  const rmOrder = await removeTaskOrder(id)
  if (!rmOrder) {
    return false
  }

  const sql = `delete from tasks where id = ${id};`
  const deleteData = await exec(sql)
  if(deleteData.affectedRows > 0){
    return true
  }
  return false
}

const removeTaskOrder = async (taskId) => {
  let delTaskOrder = -1
  let boardId = -1
  const selSql = `select orderNum, boardId from tasks where id = ${taskId}`
  const delItem = await exec(selSql)
  if ( delItem?.length > 0 ){
    delTaskOrder = delItem[0].orderNum
    boardId = delItem[0].boardId
  }
  console.log('removeTaskOrder,order,board',delTaskOrder,boardId)
  if (boardId === -1 || delTaskOrder === -1){
    return false
  }

  const selOrdersSql = `select id, orderNum-1 as orderNum from tasks where boardId = ${boardId} and orderNum > ${delTaskOrder}`
  const tasks = await exec(selOrdersSql)
  if (tasks?.length>0){
    const formatSql = 'update tasks set orderNum = ? where id = ? '
    let insertSql = ''
    tasks.forEach(task => {
      const id = task.id
      const orderNum = task.orderNum
      insertSql += mysql.format(formatSql,[orderNum,id]) + ';'
    });

    const isReplace = await exec(insertSql)
    console.log('removeTaskOrder_insertSql, ',insertSql)
    return isReplace
  }
  return true
}

const delAllTasksOfBoard = async (id) => {
  const sql = `delete from tasks where boardId = ${id};`
  const deleteData = await exec(sql)
  return true
}

const reorder = async ( sort={} ) => {
  const fromId = sort.fromId
  const referenceId = sort.referenceId
  const fromBoardId = sort.fromBoardId
  const toBoardId = sort.toBoardId

  console.log('sort, ', sort)

  if (fromBoardId === toBoardId) {
    return reorderTasksOfBoard(fromId, referenceId, fromBoardId)
  } else {
    if(removeTaskOrder(fromId, fromBoardId)){
      if(moveTaskBoard(fromId, toBoardId)){
        return insertTaskOrder(fromId, referenceId, toBoardId)
      }
    }
  }
  
  return false
}

const reorderTasksOfBoard = async (fromId, referenceId, boardId) =>{
  let fromOrder = 0
  let toOrder = 0

  // find from orderNum
  const selFromOrder = `select orderNum from tasks where id = ${fromId}`
  const selFromOrderResult = await exec(selFromOrder)

  if(selFromOrderResult?.length > 0){
    fromOrder = selFromOrderResult[0].orderNum
  }
 
  // find to orderNum
  const selReferOrder = `select orderNum from tasks where id = ${referenceId}`
  const selReferOrderResult = await exec(selReferOrder)

  if(selReferOrderResult?.length > 0){
    toOrder = selReferOrderResult[0].orderNum
  }

  if (fromOrder === 0 || toOrder === 0) {
    return false
  }
  
  let selOrderNumsSql = `select id, orderNum from tasks where boardId = ${boardId} and orderNum `
  if (fromOrder < toOrder) {
    selOrderNumsSql += `between ${fromOrder} and ${toOrder}`
  } else { 
    selOrderNumsSql += `between ${toOrder} and ${fromOrder}`
  }
  
  const orders = await exec(selOrderNumsSql)
  if (orders?.length>0){
    const formatSql = 'update tasks set orderNum = ? where id = ? '
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

    console.log('insertSql, ', insertSql)
    const isReplace = await exec(insertSql)
    if (!isReplace) {
      return false
    }
  }

  const setSelectOrderSql = `update tasks set orderNum = ${toOrder} where id = ${fromId}`
  const isSetSelectOrder = await exec(setSelectOrderSql)
  return isSetSelectOrder
}

module.exports = {
  getList,
  getDetail,
  newTask, 
  updateTask, 
  delTask, 
  delAllTasksOfBoard,
  getTaskTypes,
  reorder
}
