import { combineReducers } from '@reduxjs/toolkit'
import animator from './animator'
import mapEditor from './mapEditor'
import dialog from '@/redux/reducers/dialog'
import auth from '@/redux/reducers/auth'
import route from '@/redux/reducers/route'
import update from '@/redux/reducers/update'
import fileManager from '@/redux/reducers/fileManager'
import boxOpening from '@/redux/reducers/boxOpening'
import gameData from '@/redux/reducers/gameData'

const rootReducer = combineReducers({
  animator,
  dialog,
  auth,
  route,
  update,
  fileManager,
  boxOpening,
  gameData,
  mapEditor
})

export default rootReducer
