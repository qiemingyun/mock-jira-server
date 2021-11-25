const router = require('koa-router')()
const { getList, newTaskGroup, delTaskGroup } = require('../controller/group')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require ('../middleware/loginCheck')

router.prefix('/api/group')

router.get('/list', loginCheck, async function (ctx, next) {
  const projectId = ctx.query.projectId || ''
  const listData = await getList(projectId)
  ctx.body = new SuccessModel(listData)
})

router.post('/', loginCheck, async function (ctx, next) {
  const data = await newTaskGroup(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.delete('/:id', loginCheck, async function (ctx, next) {
  const val = await delTaskGroup(ctx.params.id)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('project del failed') 
  }
})

module.exports = router
