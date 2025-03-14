import { useState, useEffect } from 'react'
import NoStoreDialog from '@/components/general/noStoreDialog/NoStoreDialog'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { loadData, openLoadDataDialog, selectNode, setSelectedAnimationId } from '@/redux/reducers/animator'
import './load-data-dialog.scss'
import { allGameObjectData } from '../../gameObjectRenderer'
import DataObjectItem from './DataObjectItem'

const LoadDataDialog = () => {
  const dispatch = useStoreDispatch()
  const isOpened = useStoreSelector((state) => state.animator.loadDataDialogOpened)

  return (
    <NoStoreDialog
      className='load-data-dialog'
      dialogTitle='Load Data'
      isOpened={isOpened}
      onClose={() => dispatch(openLoadDataDialog(false))}
    >
      <ul className="object-list">
        {
          Object.values(allGameObjectData).map((dataObj, i) => {
            return (
              <DataObjectItem dataObj={dataObj} key={i} />
            )
          })
        }
      </ul>
    </NoStoreDialog>
  )
}

export default LoadDataDialog