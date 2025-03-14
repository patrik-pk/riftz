import NoStoreDialog from '@/components/general/noStoreDialog/NoStoreDialog'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import { openAssetDialog, setNodeAsset } from '@/redux/reducers/animator'
import './change-asset-dialog.scss'
import Tooltip from '@/components/general/tooltip/Tooltip'

const ChangeAssetDialog = () => {
  const dispatch = useStoreDispatch()
  const assetImages = useStoreSelector((data) => data.animator.assetImages)
  const assetDialogOpened = useStoreSelector((data) => data.animator.assetDialogOpened)

  return (
    <NoStoreDialog
      className='cha-dialog'
      dialogTitle='Change Asset'
      isOpened={assetDialogOpened}
      onClose={() => dispatch(openAssetDialog(false))}
    >
      <div className='cha-list'>
        {assetImages.map((item, i) => {
          return (
            <div className='cha-item' key={i}>
              <p className='cha-item-title'>{item.category}</p>
              <div className='cha-item-assets'>
                {item.assets.map((asset, j) => {
                  return (
                    <div
                      className='cha-item-asset'
                      key={j}
                      onClick={() => {
                        dispatch(setNodeAsset(asset.url))
                        dispatch(openAssetDialog(false))
                      }}
                    >
                      <img src={asset.url} alt='' />
                      <Tooltip position='bottom'>{asset.name.replace(/\.[^/.]+$/, '')}</Tooltip>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </NoStoreDialog>
  )
}

export default ChangeAssetDialog
