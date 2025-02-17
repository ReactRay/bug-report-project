import express from 'express'
import {
  getBugs,
  getBug,
  addBug,
  removeBug,
  updateBug,
} from './bug.controller.js'

import { requireAuth } from '../../middlewares/require-auth.middleware.js'

import { bugsService } from './bugs.service.js'

const router = express.Router()

router.get('', getBugs)

router.put('/', requireAuth, updateBug)

router.post('/', requireAuth, addBug)

router.get('/:bugId', getBug)
router.delete('/:bugId', requireAuth, removeBug)

export const bugRoutes = router
