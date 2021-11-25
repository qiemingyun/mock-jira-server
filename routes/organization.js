const router = require('koa-router')()
const { getList } = require('../controller/organization')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require ('../middleware/loginCheck')

router.prefix('/api/organization')

router.get('/list', loginCheck, async function (ctx, next) {
  const listData = await getList()
  ctx.body = new SuccessModel(listData)
})

module.exports = router
