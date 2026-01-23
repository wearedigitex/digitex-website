"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface LoadingScreenProps {
    onLoadingComplete: () => void
}

export const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
    const [isExitStarted, setIsExitStarted] = useState(false)
    const letters = "DIGITEX".split("")

    useEffect(() => {
        // Wait for the animation sequence to finish before calling onLoadingComplete
        // Letters take (letters.length * 0.05) + 0.5 second to finish initial reveal
        const timer = setTimeout(() => {
            setIsExitStarted(true)
            // Small buffer after exit animation starts to let parent know
            setTimeout(onLoadingComplete, 500)
        }, 1000)

        return () => clearTimeout(timer)
    }, [onLoadingComplete, letters.length])

    const containerVariants = {
        exit: {
            opacity: 0,
            scale: 1.1,
            filter: "blur(20px)",
            transition: {
                duration: 0.4,
                ease: "easeInOut" as const
            }
        }
    }

    const letterVariants = {
        initial: {
            y: 20,
            opacity: 0,
            filter: "blur(10px)"
        },
        animate: (i: number) => ({
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                delay: i * 0.05,
                duration: 0.5,
                ease: [0.2, 0.65, 0.3, 0.9] as any,
            }
        }),
    }

    return (
        <motion.div
            variants={containerVariants}
            exit="exit"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
        >
            {/* Background radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,130,158,0.15)_0%,transparent_70%)]" />

            <div className="relative flex flex-col items-center">
                <div className="flex space-x-2 md:space-x-4">
                    {letters.map((letter, i) => (
                        <motion.span
                            key={i}
                            variants={letterVariants}
                            initial="initial"
                            animate="animate"
                            custom={i}
                            className="text-6xl md:text-8xl font-black tracking-tighter text-white select-none"
                            style={{
                                textShadow: "0 0 20px rgba(40,130,158,0.5), 0 0 40px rgba(40,130,158,0.2)"
                            }}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                    className="h-[1px] bg-gradient-to-r from-transparent via-teal-500 to-transparent mt-4"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-teal-500/60 font-mono text-xs md:text-sm mt-4 tracking-[0.5em] uppercase"
                >
                    Initializing Experience
                </motion.p>
            </div>
        </motion.div>
    )
}
