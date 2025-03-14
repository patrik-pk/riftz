type EventCallback<T = any> = (payload: T) => void

class EventHandler {
  private events: Record<string, EventCallback<any>[]>

  constructor() {
    this.events = {}
  }

  emit<T>(eventName: string, payload?: T) {
    const callbacks = this.events[eventName]
    if (callbacks) {
      callbacks.forEach((callback) => callback(payload))
    }
  }

  on<T>(eventName: string, callback: EventCallback<T>) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(callback)
  }

  off(eventName: string /*, callback: EventCallback*/) {
    delete this.events[eventName]
    // const callbacks = this.events[eventName]
    // if (callbacks) {
    //   this.events[eventName] = callbacks.filter((cb) => cb !== callback)
    // }
  }
}

export const eventHandler = new EventHandler()
