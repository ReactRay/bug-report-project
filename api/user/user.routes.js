import express from 'express'
import { getUser, getUsers, deleteUser, updateUser } from './user.controller.js'
import {
  requireAdmin,
  requireAuth,
} from '../../middlewares/require-auth.middleware.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/', requireAuth, updateUser)
router.post('/', requireAuth, updateUser)
router.delete('/:id', requireAuth, deleteUser)

export const userRoutes = router
