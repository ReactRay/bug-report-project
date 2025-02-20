import { authService } from '../api/auth/auth.service.js'

export function requireAuth(req, res, next) {
  // const loggedinUser = JSON.parse(req.cookies.loginToken)
  const loggedinUser = authService.validateToken(req.cookies.loginToken)

  if (!loggedinUser) return res.status(401).send('Login first!')
  req.loggedinUser = loggedinUser
  next()
}

export function requireAdmin(req, res, next) {
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  console.log(loggedinUser, 'check if is it admin')
  if (!loggedinUser.isAdmin) res.status(401).send('only admin can do this!')
  next()
}

// export function requireAuth(req, res, next) {
//   try {
//     const loggedinUser = JSON.parse(req.cookies.loginToken)

//     console.log(loggedinUser, 'check chekc check')
//     if (!loggedinUser) return res.status(401).send('Login first!')
//     req.loggedinUser = loggedinUser
//     next()
//   } catch (error) {
//     return res.status(401).send('Invalid login token')
//   }
// }
