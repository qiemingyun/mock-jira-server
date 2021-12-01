const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const { REDIS_CONF } = require('./conf/db')
const project = require('./routes/project')
const user = require('./routes/user')
const organization = require('./routes/organization')
const favorite = require('./routes/favorite')
const task = require('./routes/task')
const board = require('./routes/board')
const group = require('./routes/group')
const cors = require('koa2-cors');

// error handler
onerror(app)

app.use(cors({
  credentials: true,
  origin: ['https://qiemingyun.github.io', 'http://localhost:3000'],
  methods: ‘GET,HEAD,PUT,PATCH,DELETE’,
}))
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

app.keys = ['HDASHd9_32ijs']
app.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: 'none'
  },
  store: redisStore({
    all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
  })
}))

// logger
app.use(async (ctx, next) => {
  // ctx.set("Access-Control-Allow-Origin", "http://localhost:3000")
  ctx.set("Access-Control-Allow-Credentials", true)
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(user.routes(), user.allowedMethods())
app.use(project.routes(), project.allowedMethods())
app.use(organization.routes(), organization.allowedMethods())
app.use(favorite.routes(), favorite.allowedMethods())
app.use(task.routes(), task.allowedMethods())
app.use(board.routes(), board.allowedMethods())
app.use(group.routes(), group.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
