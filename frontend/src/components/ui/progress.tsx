import * as React from "react"
import { motion } from "framer-motion"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorColor?: string;
  isEmpty?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, indicatorColor = "#fff", isEmpty = false, style, className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '7px',
        overflow: 'hidden',
        borderRadius: '9999px',
        backgroundColor: isEmpty ? 'transparent' : 'rgba(255,255,255,0.06)',
        border: isEmpty ? '1px dashed rgba(255,255,255,0.2)' : 'none',
        ...style
      }}
      {...props}
    >
      {!isEmpty && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            height: '100%',
            backgroundColor: indicatorColor,
            borderRadius: '9999px',
            boxShadow: `0 0 10px ${indicatorColor}80`
          }}
        />
      )}
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
