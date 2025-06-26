import { motion } from 'motion/react';

function BouncingLoader() {
  return (
    <div className="h-screen flex items-center justify-center gap-4">
      {[...Array(3)].map((_, index) => (
        <motion.div
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={index}
          className="bg-primary h-8 w-8 rounded-full"
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
}
export default BouncingLoader;
