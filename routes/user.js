const router = require('koa-router')()
const { getList, register, login, getInfo} = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require ('../middleware/loginCheck')

router.prefix('/api/user')

router.get('/list', loginCheck, async function (ctx, next) {
  const listData = await getList()
  ctx.body = new SuccessModel(listData)
})

router.get('/info', loginCheck, async function (ctx, next) {

  const data = await getInfo(ctx.session.username)
  
  if (data.name) {
    ctx.body = new SuccessModel(data)
    return
  } 
  ctx.body = new ErrorModel('get info failed')
})

router.post('/register', async function (ctx, next) {
  const { username, password } = ctx.request.body
  const data = await register(username,password)
  
  if (data.name) {
    ctx.session.username = data.name
    ctx.body = new SuccessModel(data)
    return
  } 
  ctx.body = new ErrorModel('username already be used')
})

router.post('/login', async function (ctx, next) {
  const { username, password } = ctx.request.body
  const data = await login(username,password)
  
  if (data.name) {
    // set session
    ctx.session.username = data.name
    ctx.session.userId = data.id
    ctx.body = new SuccessModel(data)
    return
  } 
  ctx.body = new ErrorModel('username or password is incorrect')
})

router.get('/logout', async function (ctx, next) {

  ctx.session = null 
  ctx.body = new SuccessModel()
  return
   
  ctx.body = new ErrorModel('logout failed')
})

module.exports = router
