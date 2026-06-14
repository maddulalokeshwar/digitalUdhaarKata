import { useState, useEffect, useCallback } from 'react'
import axiosInstance from '../services/axiosInstance'
import useDebounce from './useDebounce'

const useCustomers = (initialPage = 1, limit = 20) => {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const debouncedSearch = useDebounce(search, 400)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError('')
    if (debouncedSearch) {
      const res = await axiosInstance.get(`/customer-api/search?q=${debouncedSearch}`).catch(() => null)
      if (res) { setCustomers(res.data.payload); setTotal(res.data.payload.length) }
      else setError('Search failed')
    } else {
      const res = await axiosInstance.get(`/customer-api/?page=${page}&limit=${limit}`).catch(() => null)
      if (res) { setCustomers(res.data.payload); setTotal(res.data.total) }
      else setError('Failed to load customers')
    }
    setLoading(false)
  }, [page, debouncedSearch, limit])

  useEffect(() => { fetch() }, [fetch])

  return { customers, total, page, setPage, search, setSearch, loading, error, refetch: fetch }
}

export default useCustomers