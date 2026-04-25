import { useState, useEffect } from 'react'
import axios from 'axios'

export function useApiStatus() {
  const [online, setOnline] = useState(false)

  useEffect(() => {
    axios.get('/api/')
      .then(() => setOnline(true))
      .catch(() => setOnline(false))
  }, [])

  return online
}
