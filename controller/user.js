const { exec } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')

const getList = async ()=>{
  let sql = `select * from users where 1=1 order by name desc;`
  return await exec(sql)
}

const getInfo = async (username)=>{

  const sql = `
    select id,name,email,title,organizationId from users where name='${username}';
  `
  const rows = await exec(sql)

  return rows[0] || {}
}

const register = async (username, password)=> {
  password = genPassword(password)
  username = escape(username)
  password = escape(password)

  const userSql = `select * from users where name='${username}';`
  const userRows = await exec(userSql)

  if ( userRows[0] ) {
    return {}
  } else {
    const sql = `
      insert into users (name, password) values ('${username}', '${password}');
    `
    const result = await exec(sql)

    const searchSql = `
      select id,name,email,title,organizationId from users where name='${username}';
    `
    console.log('searchSql', searchSql)
    const rows = await exec(searchSql)

    return rows[0] || {}
  }
}

const login = async (username, password)=> {
  password = genPassword(password)
  username = escape(username)
  password = escape(password)

  const sql = `
    select id,name,email,title,organizationId from users where name='${username}' and password='${password}'
  `
  const rows = await exec(sql)

  return rows[0] || {}
}

module.exports = {
  getList,
  register,
  login,
  getInfo
}
