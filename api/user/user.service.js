import fs from 'fs'
import { makeId, readJsonFile, writeJsonFile } from '../../services/utils.js'
let users = readJsonFile('data/user.json')

export const userService = {
  query,
  getById,
  remove,
  save,
  getByUsername,
}

function query() {
  return Promise.resolve(users)
}

function getById(userId) {
  const user = users.find((user) => user._id === userId)
  if (!user) return Promise.reject('User not found!')
  return Promise.resolve(user)
}

function remove(userId) {
  users = users.filter((user) => user._id !== userId)
  return _saveUsersToFile()
}

function save(user) {
  let savedUser = user
  if (savedUser._id) {
    const idx = users.findIndex((user) => user._id === savedUser._id)
    users.splice(idx, 1, savedUser)
    return _saveUsersToFile().then(() => user)
  }

  user._id = makeId()
  users.push(user)
  return _saveUsersToFile().then(() => user)
}

function _saveUsersToFile() {
  return new Promise((resolve, reject) => {
    const usersStr = JSON.stringify(users, null, 2)
    fs.writeFile('data/user.json', usersStr, (err) => {
      if (err) {
        return console.log(err)
      }
      resolve()
    })
  })
}

async function getByUsername(username) {
  try {
    const user = users.find((user) => user.username === username)
    return user
  } catch (err) {
    loggerService.error('userService[getByUsername] : ', err)
    throw err
  }
}
