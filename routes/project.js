const router = require('koa-router')()
const { getList, getDetail, newProject, updateProject, delProject } = require('../controller/project')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require ('../middleware/loginCheck')

router.prefix('/api/project')

router.get('/list', loginCheck, async function (ctx, next) {
  const principalId = ctx.query.principalId || ''
  const keyword = ctx.query.keyword || ''
  const listData = await getList(principalId,keyword)
  ctx.body = new SuccessModel(listData)
})

router.get('/:id', async function (ctx, next) {
  const data = await getDetail(ctx.params.id)
  ctx.body = new SuccessModel(data)
})

router.post('/', loginCheck, async function (ctx, next) {
  const data = await newProject(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

router.patch('/:id', loginCheck, async function (ctx, next) {
  const val = await updateProject(ctx.params.id, ctx.request.body)
  if (val) {
    ctx.body = new SuccessModel()    
  } else {
    ctx.body = new ErrorModel('project update failed')
  }
})

router.delete('/:id', loginCheck, async function (ctx, next) {
  const val = await delProject(ctx.params.id)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('project del failed')
  }
})

module.exports = router
