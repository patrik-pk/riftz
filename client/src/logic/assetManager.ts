interface Asset {
  name: string
  path: string
  imgElement: HTMLImageElement
  downloadingPromise: Promise<void> | null
}

class AssetManager {
  assets: Record<string, Asset> = {} // key = assets name

  public async downloadAsset(name: string, path: string, isPathComplete?: boolean): Promise<void> {
    // if assets exists and has been downloaded - simply resolve
    if (this.assets[name] && !this.assets[name].downloadingPromise) {
      return Promise.resolve()
    }

    // if assets exists and is currently being downloaded - return download promise
    if (this.assets[name] && this.assets[name].downloadingPromise !== null) {
      return this.assets[name].downloadingPromise as Promise<void>
    }

    // else add asset and create and return download promise
    const imgElement = new Image()
    const assetPath = isPathComplete ? path : `http://localhost:5000/${path}`
    imgElement.src = assetPath
    imgElement.crossOrigin = 'anonymous'

    const asset: Asset = {
      name: name,
      path: assetPath,
      imgElement,
      downloadingPromise: null
    }

    const downloadPromise = new Promise<void>((resolve, reject) => {
      imgElement.onload = () => {
        console.log(`Downloaded asset: ${assetPath}`)
        this.assets[name].downloadingPromise = null
        resolve()
      }
      imgElement.onerror = () => {
        // handle error
        reject(new Error(`Failed to download asset: ${assetPath}`))
      }
    })

    asset.downloadingPromise = downloadPromise
    this.assets[name] = asset
    return downloadPromise
  }
}

export const assetManager = new AssetManager()
