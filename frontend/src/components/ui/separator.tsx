import * as React from "react"

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        height: '1px',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        margin: '16px 0',
        ...style
      }}
      {...props}
    />
  )
)
Separator.displayName = "Separator"

export { Separator }
