import { motion } from 'framer-motion'

/**
 * Reusable glass card with spring hover tilt effect (Wallet style).
 * Props: children, className, style, goldBorder, onClick
 */
export default function GlassCard({ children, className = '', style = {}, goldBorder = false, onClick, tilt = false }) {
  const cardClass = `${goldBorder ? 'glass-card-gold' : 'glass-card'} ${className}`

  if (tilt) {
    return (
      <motion.div
        className={cardClass}
        style={{ ...style, perspective: 1000 }}
        onClick={onClick}
        whileHover={{ rotateX: 2, rotateY: 3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cardClass}
      style={style}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      {children}
    </motion.div>
  )
}
