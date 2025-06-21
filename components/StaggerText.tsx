"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface StaggeredTextProps {
  text: string
  className?: string
  once?: boolean
}

export default function StaggeredText({
  text = "Staggered 3D Text Animation",
  className = "",
  once = false,
}: StaggeredTextProps) {
  const [replay, setReplay] = useState(false)

  const words = text.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      x: -20,
      y: 10,
      rotateX: -40,
      rotateY: 20,
      scale: 1.2,
    },
  }

  useEffect(() => {
    if (!once) {
      const intervalId = setInterval(() => {
        setReplay(true)
        setTimeout(() => setReplay(false), 100)
      }, 8000)

      return () => clearInterval(intervalId)
    }
  }, [once])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`overflow-hidden font-bold text-center ${className}`} style={{ perspective: "800px" }}>
        {words.map((word, wordIndex) => (
          <motion.div
            key={wordIndex}
            style={{ display: "inline-block", marginRight: "0.5rem" }}
            variants={container}
            initial="hidden"
            animate={replay ? "hidden" : "visible"}
            className="inline-block"
          >
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={charIndex}
                style={{
                  display: "inline-block",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
                variants={child}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
