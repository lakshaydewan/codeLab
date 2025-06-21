import React, { useState, useRef } from 'react'

const HoldToDeleteButton = ({ onHoldComplete }: { onHoldComplete: () => void }) => {
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startHold = () => {
    setHolding(true)
    let count = 0
    timerRef.current = setInterval(() => {
      count += 10
      setProgress(count)
      if (count >= 2000) {
        clearInterval(timerRef.current!)
        onHoldComplete()
        setHolding(false)
        setProgress(0)
      }
    }, 10)
  }

  const cancelHold = () => {
    setHolding(false)
    setProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      className="relative w-full py-5 cursor-pointer bg-red-500 font-mono tracking-tighter transition rounded-md text-white font-medium overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 h-full bg-red-950 opacity-30"
        style={{ width: `${(progress / 2000) * 100}%` }}
      />
      {holding ? 'Hold to Delete...' : 'Delete Template'}
    </button>
  )
}

export default HoldToDeleteButton
