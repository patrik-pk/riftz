import { IPlayerMovement } from 'riftz-shared'
import { socket } from './socket'

// TODO:
// - throtle/debounce mouse move
// - test cz keyboard 1-9 inputs
// - also handle capslock
// - determine which is better - key or keycode

type KeyboardAction = 'MOVE_UP' | 'MOVE_DOWN' | 'MOVE_LEFT' | 'MOVE_RIGHT'

type IKeyboardActionMap = Record<KeyboardAction, string>

const keyboardActionMap: IKeyboardActionMap = {
  MOVE_UP: 'w',
  MOVE_DOWN: 's',
  MOVE_LEFT: 'a',
  MOVE_RIGHT: 'd'
}

interface IKeyboardMovement {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

class InputManager {
  movement: IPlayerMovement
  keyboardMovement: IKeyboardMovement = InputManager.getEmptyKeyboardMovement()
  realTimeDirection: number

  private isAlive: boolean

  constructor() {
    this.movement = InputManager.emptyMovement()
    this.isAlive = false
    this.realTimeDirection = 0

    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
  }

  static emptyMovement(): IPlayerMovement {
    return {
      horizontal: 0,
      vertical: 0
    }
  }

  handleInputsBasedOnIsAlive(isAlive: boolean) {
    if (isAlive === this.isAlive) {
      return
    }

    this.isAlive = isAlive

    if (this.isAlive) {
      this.movement = InputManager.emptyMovement()
      this.keyboardMovement = InputManager.getEmptyKeyboardMovement()
      this.startCapturingInGameInput()
      return
    }

    this.stopCapturingInGameInput()
  }

  startCapturingInGameInput() {
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
    document.addEventListener('mousedown', this.handleMouseDown)
    document.addEventListener('mouseup', this.handleMouseUp)
  }

  stopCapturingInGameInput() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
    document.removeEventListener('mousedown', this.handleMouseDown)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }

  handleKeyDown(e: KeyboardEvent) {
    this.handleKey(e, true)
  }

  handleKeyUp(e: KeyboardEvent) {
    this.handleKey(e, false)
  }

  handleKey(e: KeyboardEvent, pressed: boolean) {
    this.handleMovement(e, pressed)
    this.handleItemUse(e, pressed)

    if (e.key === 'k' && pressed) {
      socket.emit('testTrigger')
    }

    if (e.key === 'f' && pressed) {
      socket.emit('devAddXp', 50)
    }
  }

  handleMovement(e: KeyboardEvent, pressed: boolean) {
    switch (e.key) {
      case keyboardActionMap['MOVE_UP']:
        this.keyboardMovement.up = pressed
        break
      case keyboardActionMap['MOVE_DOWN']:
        this.keyboardMovement.down = pressed
        break
      case keyboardActionMap['MOVE_LEFT']:
        this.keyboardMovement.left = pressed
        break
      case keyboardActionMap['MOVE_RIGHT']:
        this.keyboardMovement.right = pressed
        break
      default:
        return // break out of this method if movement is neither of above - need to test
    }

    if (e.key === keyboardActionMap['MOVE_UP'] || e.key === keyboardActionMap['MOVE_DOWN']) {
      if (this.keyboardMovement.up && this.keyboardMovement.down) {
        this.movement.vertical = 0
      } else if (this.keyboardMovement.up) {
        this.movement.vertical = -1
      } else if (this.keyboardMovement.down) {
        this.movement.vertical = 1
      } else {
        this.movement.vertical = 0
      }
    }

    if (e.key === keyboardActionMap['MOVE_LEFT'] || e.key === keyboardActionMap['MOVE_RIGHT']) {
      if (this.keyboardMovement.left && this.keyboardMovement.right) {
        this.movement.horizontal = 0
      } else if (this.keyboardMovement.left) {
        this.movement.horizontal = -1
      } else if (this.keyboardMovement.right) {
        this.movement.horizontal = 1
      } else {
        this.movement.horizontal = 0
      }
    }

    if (
      e.key === keyboardActionMap['MOVE_UP'] ||
      e.key === keyboardActionMap['MOVE_DOWN'] ||
      e.key === keyboardActionMap['MOVE_LEFT'] ||
      e.key === keyboardActionMap['MOVE_RIGHT']
    ) {
      socket.emit('setPlayerMovement', this.movement)
    }
  }

  handleItemUse(e: KeyboardEvent, pressed: boolean) {
    if (!pressed || !(e.key >= '0' && e.key <= '9')) {
      return
    }

    const itemIndex = e.key === '0' ? 9 : Number(e.key) - 1
    socket.emit('useItem', itemIndex)
  }

  handleMouseMove(e: MouseEvent) {
    if (!this.isAlive) {
      return
    }

    const direction = Math.atan2(e.clientY - window.innerHeight / 2, e.clientX - window.innerWidth / 2)

    this.realTimeDirection = direction
    socket.emit('setPlayerDirection', this.realTimeDirection)
  }

  handleMouseDown() {
    socket.emit('setIsUsingItem', true)
  }

  handleMouseUp() {
    socket.emit('setIsUsingItem', false)
  }

  static getEmptyKeyboardMovement(): IKeyboardMovement {
    return {
      up: false,
      down: false,
      left: false,
      right: false
    }
  }
}

export const inputManager = new InputManager()
