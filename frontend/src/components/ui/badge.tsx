import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline';
}

function Badge({ variant = 'default', style, className, ...props }: BadgeProps) {
  const isOutline = variant === 'outline';
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        padding: '2px 10px',
        fontSize: '11px',
        fontWeight: '600',
        transition: 'background-color 0.2s',
        border: isOutline ? '1px solid rgba(255,255,255,0.2)' : 'none',
        backgroundColor: isOutline ? 'transparent' : 'rgba(255,255,255,0.1)',
        color: '#fff',
        ...style
      }}
      {...props}
    />
  )
}

export { Badge }
