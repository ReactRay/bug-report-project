import { makeId, readJsonFile, writeJsonFile } from '../../services/utils.js'
import cookieParser from 'cookie-parser'

export const bugsService = {
  query,
  getById,
  remove,
  save,
}

const PAGE_SIZE = 3

const bugs = readJsonFile('./data/data.json')

async function query(filterBy = {}, sortBy = {}) {
  try {
    let bugsToReturn = [...bugs]

    if (filterBy._id) {
      const regExp = new RegExp(filterBy.txt, 'i')
      bugsToReturn = bugsToReturn.filter((bug) => regExp.test(bug._id))
    }

    if (filterBy.txt) {
      const regExp = new RegExp(filterBy.txt, 'i')
      bugsToReturn = bugsToReturn.filter((bug) => regExp.test(bug.title))
    }
    if (filterBy.minSeverity) {
      bugsToReturn = bugsToReturn.filter(
        (bug) => bug.severity >= +filterBy.minSeverity
      )
    }

    if (filterBy.labels && filterBy.labels.length) {
      bugsToReturn = bugsToReturn.filter((bug) =>
        filterBy.labels.every((label) => bug.labels.includes(label))
      )
    }

    // Sorting
    if (sortBy.by === 'severity') {
      const dir = sortBy.sortDir ? +sortBy.sortDir : 1
      bugsToReturn.sort((b1, b2) => (b1.severity - b2.severity) * dir)
    } else if (sortBy.by === 'title') {
      const dir = sortBy.sortDir ? +sortBy.sortDir : 1
      bugsToReturn.sort((b1, b2) => b1.title.localeCompare(b2.title) * dir)
    }

    // Pagination
    if (filterBy.pageIdx !== undefined) {
      const startIdx = +filterBy.pageIdx * PAGE_SIZE
      bugsToReturn = bugsToReturn.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return bugsToReturn
  } catch (err) {
    loggerService.error('Couldnt get bugs : ', err)
    throw err
  }
}

async function getById(bugId) {
  try {
    const bug = bugs.find((bug) => bug._id === bugId)
    return bug
  } catch (err) {
    throw new Error('Failed to get bug by ID')
  }
}

async function remove(bugId, loggedinUser) {
  const bugToRemove = await getById(bugId)
  try {
    if (bugToRemove?.owner?._id !== loggedinUser._id && !loggedinUser.isAdmin)
      throw new Error('failed to remove')

    const idx = bugs.findIndex((bug) => bug._id === bugId)
    bugs.splice(idx, 1)

    await writeJsonFile('./data/data.json', bugs)
  } catch (err) {
    throw new Error('Failed to remove bug')
  }
}

async function save(bugToSave, loggedinUser) {
  try {
    if (!loggedinUser) throw 'loggedinUser is required'

    if (bugToSave._id) {
      if (loggedinUser._id !== bugToSave.owner?._id && !loggedinUser.isAdmin)
        throw 'cant save bug'
      const idx = bugs.findIndex((bug) => bug._id === bugToSave._id)
      if (idx === -1) throw 'Bug not found'
      bugs.splice(idx, 1, bugToSave)
    } else {
      do {
        bugToSave._id = makeId()
      } while (bugs.some((bug) => bug._id === bugToSave._id))
      bugToSave.time = Date.now()
      bugToSave.owner = {
        _id: loggedinUser._id,
        fullname: loggedinUser.fullname,
      }
      bugs.push(bugToSave)
    }
    return bugToSave
  } catch (err) {
    console.error('Error saving bug:', err)
    throw err
  }
}
