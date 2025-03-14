import NoStoreDialog from '@/components/general/noStoreDialog/NoStoreDialog'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import './load-data-dialog.scss'
import DataObjectItem from './DataObjectItem'
import { allMapDataArray, openLoadDataDialog } from '@/redux/reducers/mapEditor'

const LoadDataDialog = () => {
  const dispatch = useStoreDispatch()
  const isOpened = useStoreSelector((state) => state.mapEditor.loadDataDialogOpened)

  return (
    <NoStoreDialog
      className='load-data-dialog'
      dialogTitle='Load Map Data'
      isOpened={isOpened}
      onClose={() => dispatch(openLoadDataDialog(false))}
    >
      <ul className="object-list">
        {
          Object.values(allMapDataArray).map((mapData, i) => {
            return (
              <DataObjectItem mapData={mapData} key={i} />
            )
          })
        }
      </ul>
    </NoStoreDialog>
  )
}

export default LoadDataDialog