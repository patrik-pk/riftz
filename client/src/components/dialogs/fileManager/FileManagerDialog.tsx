import Dialog from '@/components/general/dialog/Dialog'
import React from 'react'
import './file-manager-dialog.scss'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import Button from '@/components/general/button/Button'
import { Route, routes, setCurrentRoute } from '@/redux/reducers/fileManager'
import Navigation from '@/components/dialogs/fileManager/nav/Navigation'

// sections:
// - user assets
// - riftz assets
// - upload
//  - img input, name input, upload button

// - upload button

// - select image (to use)
// - delete image
// - rename image (?)

const FileManagerDialog: React.FC = () => {
  const dispatch = useStoreDispatch()
  const currentRoute = useStoreSelector((state) => state.fileManager.currentRoute)

  const setRoute = (route: Route) => {
    dispatch(setCurrentRoute(route))
  }

  return (
    <Dialog id='file-manager' dialogTitle='Asset manager'>
      <>
        <Navigation />

        <ul className='assets'>
          {(() => {
            const result = []

            for (let i = 0; i < 20; i++) {
              result.push(
                <li className='asset-x' key={i}>
                  <div className='asset-x-img'>
                    <img src='https://taming.io/img/creature/baby-wolf-head.png' alt='' />
                  </div>
                  <div className='asset-x-info'>
                    <p className='asset-x-name'>asset name</p>
                  </div>
                </li>
              )
            }
            return result
          })()}
        </ul>
      </>
    </Dialog>
  )
}

export default FileManagerDialog
