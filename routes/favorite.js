const router = require('koa-router')()
const { getList, pin } = require('../controller/favorite')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require ('../middleware/loginCheck')

router.prefix('/api/favorite')

router.get('/list', loginCheck, async function (ctx, next) {
  const listData = await getList(ctx.session.userId)
  ctx.body = new SuccessModel(listData)
})

router.post('/:projectId', loginCheck, async function (ctx, next) {
  const val = await pin(ctx.session.userId, ctx.params.projectId, ctx.request.body)
  if (val) {
    ctx.body = new SuccessModel()    
  } else {
    ctx.body = new ErrorModel('Add to favorites failed')
  }
})

module.exports = router
