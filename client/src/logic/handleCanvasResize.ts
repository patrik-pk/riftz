const handleCanvasResize = (ctx: CanvasRenderingContext2D) => {
  const resizeCanvas = () => {
    if (!ctx) {
      return
    }

    // additional code prevent "canvas resize flicking"
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = ctx.canvas.width
    tempCanvas.height = ctx.canvas.height
    const tempContext = tempCanvas.getContext('2d')
    if (!tempContext) {
      return
    }

    tempContext.drawImage(ctx.canvas, 0, 0)

    ctx.canvas.width = ctx.canvas.clientWidth
    ctx.canvas.height = ctx.canvas.clientHeight

    ctx.drawImage(tempCanvas, 0, 0)
  }

  resizeCanvas()
  new ResizeObserver(() => {
    resizeCanvas()
  }).observe(ctx.canvas)
}

export default handleCanvasResize
