import * as React from "react"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        color: '#fff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        ...style
      }}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{ display: 'flex', flexDirection: 'column', padding: '32px', paddingBottom: '24px', ...style }}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ style, className, ...props }, ref) => (
    <h3
      ref={ref}
      className={className}
      style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', lineHeight: 1, ...style }}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ style, className, ...props }, ref) => (
    <p
      ref={ref}
      className={className}
      style={{ opacity: 0.5, fontSize: '13px', margin: 0, ...style }}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, className, ...props }, ref) => (
    <div ref={ref} className={className} style={{ padding: '0 32px 32px 32px', ...style }} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
