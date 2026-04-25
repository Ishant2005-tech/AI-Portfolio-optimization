import { useState } from 'react'
import axios from 'axios'
import type { OptimizeRequest, OptimizeResponse } from '../types/portfolio'

export function useOptimize() {
  const [data, setData]       = useState<OptimizeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function run(req: OptimizeRequest) {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post<OptimizeResponse>('/api/optimize', req)
      setData(res.data)
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Server error')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, run }
}
