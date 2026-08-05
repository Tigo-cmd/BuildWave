import { motion } from "framer-motion";

interface AnimatedLoaderProps {
  message?: string;
  submessage?: string;
}

export const AnimatedLoader = ({
  message = "Loading...",
  submessage = "Preparing your BuildWave experience",
}: AnimatedLoaderProps) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing pulsing ring */}
        <motion.div
          className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 opacity-30 blur-lg"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Spinning gradient ring */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-transparent border-t-purple-600 border-r-indigo-500 border-b-cyan-400"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner brand emblem/dot */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-md"
          animate={{ scale: [0.8, 1.1, 0.8] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.h3
        className="text-lg font-semibold text-foreground tracking-wide"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {message}
      </motion.h3>

      {submessage && (
        <motion.p
          className="text-sm text-muted-foreground mt-1 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {submessage}
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedLoader;
