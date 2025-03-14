import config from '@/config'
import axios from 'axios'

axios.defaults.withCredentials = true

class Api {
  apiUrl: string

  constructor() {
    this.apiUrl = config.API_URL
  }

  handleError(path: string, err: any) {
    const errorMessage = err.response ? err.response.data.message : err
    console.error(`API ERROR (${path}): ${errorMessage}`)
  }

  async get<T = unknown>(path: string): Promise<T | undefined> {
    try {
      const response = await axios.get<T>(`${this.apiUrl}/api/${path}`)
      return response.data
    } catch (err: any) {
      this.handleError(path, err)
      return
    }
  }

  async post<T = undefined>(path: string, data?: Record<string, unknown>): Promise<T | undefined> {
    try {
      const response = await axios.post<T>(`${this.apiUrl}/api/${path}`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (err: any) {
      this.handleError(path, err)
      return
    }
  }
}

export default new Api()
