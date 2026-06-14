import { useState, useEffect, useCallback } from 'react'
import axiosInstance from '../services/axiosInstance'

const useTransactions = (customerId) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetch = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    setError('')
    const res = await axiosInstance.get(`/transaction-api/customer/${customerId}`).catch(() => null)
    if (res) setTransactions(res.data.payload)
    else setError('Failed to load transactions')
    setLoading(false)
  }, [customerId])

  useEffect(() => { fetch() }, [fetch])

  const settle = async (txId) => {
    const res = await axiosInstance.patch(`/transaction-api/${txId}/settle`).catch(() => null)
    if (res) setTransactions(prev => prev.map(t => t._id === txId ? { ...t, isSettled: true } : t))
    return !!res
  }

  const remove = async (txId) => {
    const res = await axiosInstance.delete(`/transaction-api/${txId}`).catch(() => null)
    if (res) setTransactions(prev => prev.filter(t => t._id !== txId))
    return !!res
  }

  return { transactions, setTransactions, loading, error, settle, remove, refetch: fetch }
}

export default useTransactions