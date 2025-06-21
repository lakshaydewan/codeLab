
'use client'
import { motion } from "framer-motion";

export default function ShimmerText({ text }: { text: string }) {
    return (
        <div className={"relative inline-block text-lg font-sans font-semibold bg-clip-text text-transparent bg-gradient-to-b from-neutral-700 to-neutral-500 dark:from-neutral-500 dark:to-neutral-400"}> 
            {text}
            <motion.div
                className="absolute inset-0 text-transparent bg-clip-text [background-image:linear-gradient(to_right,_transparent_0%,_transparent_35%,_black_50%,_transparent_65%,_transparent_100%)] dark:[background-image:linear-gradient(to_right,_transparent_0%,_transparent_35%,_white_50%,_transparent_65%,_transparent_100%)]"
                style={{ backgroundSize: "200% 100%" }}
                animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
            >
                {text}
            </motion.div>
        </div>
    );
}
  