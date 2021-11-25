const router = require('koa-router')()
const { getList, newBoard, delBoard, reorder } = require('../controller/board')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require ('../middleware/loginCheck')

router.prefix('/api/board')

router.get('/list', loginCheck, async function (ctx, next) {
  const projectId = ctx.query.projectId || ''
  const listData = await getList(projectId)
  ctx.body = new SuccessModel(listData)
})

// router.get('/:id', async function (ctx, next) {
//   const data = await getDetail(ctx.params.id)
//   ctx.body = new SuccessModel(data)
// })

router.post('/', loginCheck, async function (ctx, next) {
  const data = await newBoard(ctx.request.body)
  ctx.body = new SuccessModel(data)
})

// router.patch('/:id', loginCheck, async function (ctx, next) {
//   const val = await updateProject(ctx.params.id, ctx.request.body)
//   if (val) {
//     ctx.body = new SuccessModel()    
//   } else {
//     ctx.body = new ErrorModel('project update failed')
//   }
// })

router.delete('/:id', loginCheck, async function (ctx, next) {
  const val = await delBoard(ctx.params.id)
  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('project del failed')
  }
})

router.patch('/reorder', loginCheck, async function (ctx, next) {
  const val = await reorder(ctx.request.body)
  if (val) {
    ctx.body = new SuccessModel()    
  } else {
    ctx.body = new ErrorModel('reorder board failed')
  }
})

module.exports = router
