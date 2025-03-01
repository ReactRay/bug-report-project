import { userService } from './user.service.js'
export async function getUser(req, res) {
  try {
    const user = await userService.getById(req.params.id)
    res.send(user)
  } catch (err) {
    loggerService.error('Failed to get user', err)
    res.status(400).send({ err: 'Failed to get user' })
  }
}

export async function getUsers(req, res) {
  try {
    const filterBy = {
      txt: req.query.txt || '',
      minBalance: +req.query.minBalance || 0,
    }
    const users = await userService.query(filterBy)
    res.send(users)
  } catch (err) {
    res.status(400).send({ err: 'Failed to get users' })
  }
}

export async function deleteUser(req, res) {
  try {
    await userService.remove(req.params.id)
    res.send({ msg: 'Deleted successfully' })
  } catch (err) {
    res.status(400).send({ err: 'Failed to delete user' })
  }
}

export async function updateUser(req, res) {
  try {
    console.log(req.body, ' lets see the body')
    const user = req.body
    const savedUser = await userService.save(user)
    res.send(savedUser)
  } catch (err) {
    console.log(err, ' error !')
    res.status(400).send({ err: 'Failed to update user' })
  }
}
