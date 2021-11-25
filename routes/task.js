const router = require('koa-router')()
const { getList, getDetail, newTask, updateTask, delTask, getTaskTypes, reorder} = require('../controller/task')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require ('../middleware/loginCheck')

router.prefix('/api/task')

router.get('/list', loginCheck, async function (ctx, next) {
  const projectId = ctx.query.projectId || ''
  const boardId = ctx.query.boardId || ''
  const name = ctx.query.name || ''
  const typeId = ctx.query.typeId || ''
  const processorId = ctx.query.processorId || ''
  const listData = await getList(projectId, boardId, name, typeId, processorId)
  ctx.body = new SuccessModel(listData)
})

router.get('/types', async function (ctx, next) {
  const data = await getTaskTypes()
  ctx.body = new SuccessModel(data)
})

router.get('/:id', async function (ctx, next) {
  const data = await getDetail(ctx.params.id)
  ctx.body = new SuccessModel(data)
})

router.post('/', loginCheck, async function (ctx, next) {
  const data = await newTask(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.patch('/reorder', loginCheck, async function (ctx, next) {
  const val = await reorder(ctx.request.body)
  if (val) {
    ctx.body = new SuccessModel()    
  } else {
    ctx.body = new ErrorModel('reorder board failed')
  }
})

router.patch('/:id', loginCheck, async function (ctx, next) {
  const val = await updateTask(ctx.params.id, ctx.request.body)
  if (val) {
    ctx.body = new SuccessModel()    
  } else {
    ctx.body = new ErrorModel('project update failed')
  }
})

router.delete('/:id', loginCheck, async function (ctx, next) {
  const val = await delTask(ctx.params.id)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('project del failed')
  }
})

module.exports = router
