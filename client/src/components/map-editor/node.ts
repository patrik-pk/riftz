import { MapGenerator } from '@/components/map-editor/map'
import { IVector2 } from 'riftz-shared'

// Continue: https://www.youtube.com/watch?v=yOgIncKp0BE 15:00

interface ControlNodes<T = ControlNode> {
  topLeft: T
  topRight: T
  bottomLeft: T
  bottomRight: T
}

interface Nodes {
  centerTop: Node
  centerBottom: Node
  centerLeft: Node
  centerRight: Node
}

export class SquareGrid {
  squares: Square[]

  constructor(map: MapGenerator) {
    const totalMapWidth = map.mapWidth * map.tileSize
    const totalMapHeight = map.mapHeight * map.tileSize

    const controlNodes: ControlNode[] = []

    for (let y = 0; y < map.mapHeight; y++) {
      for (let x = 0; x < map.mapWidth; x++) {
        const positionX = -totalMapWidth / 2 + x * map.tileSize + map.tileSize / 2
        const positionY = -totalMapHeight / 2 + y * map.tileSize + map.tileSize / 2
        const tileIndex = map.getTileIndex(x, y)
        if (tileIndex === null) continue
        const tileValue = map.tiles[tileIndex]

        controlNodes[tileIndex] = new ControlNode({ x: positionX, y: positionY }, tileValue === 0, map.tileSize)
      }
    }

    const squares: Square[] = []

    for (let y = 0; y < map.mapHeight - 1; y++) {
      for (let x = 0; x < map.mapWidth - 1; x++) {
        const tileIndex = map.getTileIndex(x, y)
        if (tileIndex === null) continue

        const controlNodeIndices: ControlNodes<number | null> = {
          topLeft: map.getTileIndex(x, y + 1),
          topRight: map.getTileIndex(x + 1, y + 1),
          bottomLeft: map.getTileIndex(x, y),
          bottomRight: map.getTileIndex(x + 1, y)
        }

        squares[tileIndex] = new Square({
          topLeft: controlNodes[controlNodeIndices.topLeft as number],
          topRight: controlNodes[controlNodeIndices.topRight as number],
          bottomLeft: controlNodes[controlNodeIndices.bottomLeft as number],
          bottomRight: controlNodes[controlNodeIndices.bottomRight as number]
        })
      }
    }

    this.squares = squares
  }

  triangulateSquare() {}
}

export class Square {
  controlNodes: ControlNodes
  nodes: Nodes
  configurationIndex: number

  constructor(controlNodes: ControlNodes) {
    this.controlNodes = controlNodes

    this.nodes = {
      centerTop: this.controlNodes.topLeft.right,
      centerBottom: this.controlNodes.bottomLeft.right,
      centerLeft: this.controlNodes.bottomLeft.above,
      centerRight: this.controlNodes.bottomRight.above
    }

    this.configurationIndex = this.getConfigurationIndex()
  }

  getConfigurationIndex(): number {
    let result = 0
    if (this.controlNodes.topLeft.active) result += 8
    if (this.controlNodes.topRight.active) result += 4
    if (this.controlNodes.bottomRight.active) result += 2
    if (this.controlNodes.bottomLeft.active) result += 1

    return result
  }
}

export class Node {
  posisiton: IVector2
  vertexIndex: number = -1

  constructor(position: IVector2) {
    this.posisiton = position
  }
}

export class ControlNode extends Node {
  active: boolean
  above: Node
  right: Node

  constructor(position: IVector2, active: boolean, squareSize: number) {
    super(position)
    this.active = active

    const nodeIncrement = squareSize / 2
    this.above = new Node({ x: position.x, y: position.y + nodeIncrement })
    this.right = new Node({ x: position.x + nodeIncrement, y: position.y })
  }
}
