import axios from 'axios'

export class Api {
  apiUrl: string

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  static handleError(url: string, err: any) {
    console.error(`API ERROR (${url})`)
    console.error(err)
  }

  async get<T = unknown>(path: string): Promise<T | undefined> {
    try {
      const response = await axios.get<T>(`${this.apiUrl}/${path}`)
      return response.data
    } catch (err: any) {
      Api.handleError(`${this.apiUrl}/${path}`, err)
      return
    }
  }

  async post<T = undefined>(path: string, data?: Record<string, unknown>): Promise<T | undefined> {
    try {
      const response = await axios.post<T>(`${this.apiUrl}/${path}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (err: any) {
      Api.handleError(`${this.apiUrl}/${path}`, err)
      return
    }
  }

  static async get<T = unknown>(url: string): Promise<T | undefined> {
    try {
      const response = await axios.get<T>(url)
      return response.data
    } catch (err: any) {
      Api.handleError(url, err)
      return
    }
  }

  static async post<T = Record<string, unknown>>(url: string, data?: T): Promise<T | undefined> {
    try {
      const response = await axios.post<T>(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (err: any) {
      Api.handleError(url, err)
      return
    }
  }
}
