import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast])
  const showError = useCallback((msg) => addToast(msg, 'error'), [addToast])
  const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast])

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      {/* Dynamic-Island style pill toast */}
      <div className="toast-wrapper">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => (
            <motion.div
              key={id}
              className={`toast toast-${type}`}
              initial={{ opacity: 0, scale: 0.7, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              {type === 'success' && <CheckCircle size={15} />}
              {type === 'error' && <XCircle size={15} />}
              {type === 'info' && <Info size={15} />}
              {message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
