import { IVector2 } from 'riftz-shared'

interface CustomStroke {
  
}

interface DrawSvgParams {
  ctx: CanvasRenderingContext2D
  svgPath: string
  position?: IVector2
  scale?: IVector2
  fillStyle?: CanvasRenderingContext2D['fillStyle']
  customStroke?: CustomStroke
  defaultStroke?: boolean
}

export const drawSvg = (params: DrawSvgParams) => {
  const { ctx, svgPath, position, scale, fillStyle, defaultStroke } = params
  const path = new Path2D(svgPath)
  
  ctx.save()

  if (position) ctx.translate(position.x, position.y)
  if (scale) ctx.scale(scale.x, scale.y)
  ctx.fillStyle = fillStyle ?? 'red'
  ctx.fill(path)
  
  if (defaultStroke) {
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 0.3
    ctx.stroke(path)
  }

  ctx.restore()
}