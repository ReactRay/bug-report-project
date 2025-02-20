import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'
import { userService } from '../user/user.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-123')

export const authService = {
  getLoginToken,
  validateToken,
  login,
  signup,
}

function getLoginToken(user) {
  const str = JSON.stringify(user)
  let encryptedStr = cryptr.encrypt(str)
  return encryptedStr
}

function validateToken(token) {
  try {
    const json = cryptr.decrypt(token)
    console.log(json, ' json or token')
    const loggedinUser = JSON.parse(json)
    console.log(loggedinUser, 'in validation')
    return loggedinUser
  } catch (err) {
    console.log('Invalid login token')
    return {}
  }
}

async function login(username, password) {
  var user = await userService.getByUsername(username)
  if (!user) throw 'Unknown username'

  //! un-comment for real login
  const match = await bcrypt.compare(password, user.password)
  if (!match) throw 'Invalid username or password'

  //* Removing passwords and personal data
  const miniUser = {
    _id: user._id,
    fullname: user.fullname,
    imgUrl: user.imgUrl,
    score: user.score,
    isAdmin: user.isAdmin,
  }
  return miniUser
}

async function signup({ username, password, fullname, imgUrl }) {
  const saltRounds = 10

  if (!username || !password || !fullname)
    throw 'Missing required signup information'

  const userExist = await userService.getByUsername(username)
  if (userExist) throw 'Username already taken'

  const hash = await bcrypt.hash(password, saltRounds)
  return userService.save({
    username,
    password: hash,
    fullname,
    imgUrl,
    score: 1000,
    isAdmin: false,
  })
}
