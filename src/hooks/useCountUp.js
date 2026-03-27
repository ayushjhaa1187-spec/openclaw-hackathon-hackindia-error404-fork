import { useState, useEffect } from 'react'
import { animate } from 'framer-motion'

export default function useCountUp(targetValue, duration = 1.5) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controls = animate(0, targetValue, {
      duration,
      onUpdate: (value) => setCount(Math.floor(value)),
      ease: "easeOut"
    })

    return () => controls.stop()
  }, [targetValue, duration])

  return count
}
