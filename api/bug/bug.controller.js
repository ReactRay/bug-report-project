import { bugsService } from './bugs.service.js'

export async function getBugs(req, res) {
  try {
    const filterBy = {
      txt: req.query.filterBy?.txt || '',
      minSeverity: +req.query.filterBy?.minSeverity || 0,
      labels: req.query.filterBy?.labels || [],
      pageIdx: req.query.filterBy?.pageIdx,
    }
    const sortBy = {
      by: req.query.sortBy?.by || '',
      sortDir: req.query.sortBy?.sortDir || '',
    }

    const bugs = await bugsService.query(filterBy, sortBy)
    res.status(200).json(bugs)
  } catch (err) {
    console.error('Error fetching bugs:', err)
    res.status(400).send({ error: "Couldn't get bugs", details: err.message })
  }
}

export async function getBug(req, res) {
  const userCookies = req.cookies
  const loggedinUser = req.cookies.loginToken

  const waitObject = {
    title: 'Please wait 4 seconds and try again',
    severity: 0,
    description: 'Please wait 4 seconds',
    _id: '999',
  }

  if (loggedinUser) {
    try {
      const data = await bugsService.getById(req.params.bugId)
      return res.send(data)
    } catch (error) {
      console.error('Error fetching bug:', error)
      return res.status(500).send({ error: 'Failed to fetch bug' })
    }
  }

  if (userCookies.waitTime) {
    return res.send(waitObject)
  }

  let visitedBugs = userCookies.visitedBugs
    ? JSON.parse(userCookies.visitedBugs)
    : []

  if (!visitedBugs.includes(req.params.bugId)) {
    visitedBugs.push(req.params.bugId)
  }

  if (visitedBugs.length >= 3) {
    res.cookie('waitTime', 'true', { maxAge: 4000, httpOnly: true })

    res.cookie('visitedBugs', JSON.stringify([]), {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
    })

    return res.send(waitObject)
  }

  res.cookie('visitedBugs', JSON.stringify(visitedBugs), {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
  })

  try {
    const data = await bugsService.getById(req.params.bugId)
    res.send(data)
  } catch (error) {
    console.error('Error fetching bug:', error)
    res.status(500).send({ error: 'Failed to fetch bug' })
  }
}

export async function addBug(req, res) {
  const loggedinUser = req.loggedinUser

  const bugToSave = { ...req.body }
  const savedBug = await bugsService.save(bugToSave, loggedinUser)

  res.send(savedBug)
}

export async function removeBug(req, res) {
  const loggedinUser = req.loggedinUser

  await bugsService.remove(req.params.bugId, loggedinUser)

  res.send(`car with id:${req.params.bugId} deleted`)
}

export async function updateBug(req, res) {
  const loggedinUser = req.loggedinUser

  const bugToSave = { ...req.body }
  const savedBug = await bugsService.save(bugToSave, loggedinUser)

  res.send(savedBug)
}
