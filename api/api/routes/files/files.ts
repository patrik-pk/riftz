import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import util from 'util'

const storage = multer.memoryStorage()
const upload = multer({ storage })

const router = express.Router()

// Upload Image
router.post('/upload-image', upload.single('image'), (req, res) => {
  console.log('UPLOAD IMAGE', req.file)

  res.json({ msg: 'good' })
})

// Get Asset Contents
interface AssetEndpointResultItem {
  category: string
  assets: string[]
}

router.get('/get-assets', async (req, res) => {
  const folderPath = path.join(__dirname, '../../../assets') // Change 'assets' to your folder name
  const data: AssetEndpointResultItem[] = []

  const readdir = util.promisify(fs.readdir)
  const categoryFolders = await readdir(folderPath)

  await Promise.all(
    categoryFolders.map(async (categoryFolder) => {
      const assets = await readdir(path.join(folderPath, categoryFolder))
      data.push({
        category: categoryFolder,
        assets,
      })
    })
  )

  res.json(data)
})

export default router
