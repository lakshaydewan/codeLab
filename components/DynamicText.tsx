"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface StaggeredTextProps {
  texts: string[]
  className?: string
  interval?: number
  once?: boolean
}

export default function StaggeredText({
  texts = ["Staggered 3D Text Animation"],
  className = "",
  interval = 4000,
  once = false,
}: StaggeredTextProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [replay, setReplay] = useState(false)

  const words = texts[currentTextIndex].split(" ")

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
      filter: "blur(0px)",
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
      filter: "blur(8px)",
    },
    exit: {
      opacity: 0,
      filter: "blur(10px)",
      transition: { duration: 0.3 },
    },
  }

  useEffect(() => {
    if (!once && texts.length > 1) {
      // Set up interval to change text
      const textChangeInterval = setInterval(() => {
        setReplay(true)

        // Short timeout to allow exit animation to play
        setTimeout(() => {
          setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length)
          setReplay(false)
        }, 500)
      }, interval)

      return () => clearInterval(textChangeInterval)
    }
  }, [once, texts, interval])

  return (
    <div className="flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTextIndex}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.5 }}
          className={`overflow-hidden font-bold text-center ${className}`}
          style={{ perspective: "800px" }}
        >
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
        </motion.div>
      </AnimatePresence>

      {!once && (
        <motion.button
          onClick={() => {
            setReplay(true)
            setTimeout(() => {
              setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length)
              setReplay(false)
            }, 500)
          }}
          className="mt-8 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next Text
        </motion.button>
      )}
    </div>
  )
}
