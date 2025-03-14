import React from 'react'
import './button.scss'

type ElementSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'other'
  icon?: React.ReactElement
  iconSize?: ElementSize
  activeEffect?: boolean
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  iconSize = 'md',
  className,
  children,
  activeEffect = true,
  type,
  ...rest
}) => {
  const classArray = ['button', variant, className]
  if (icon) {
    classArray.push('icon')
  }
  if (icon && iconSize) {
    classArray.push(iconSize)
  }
  if (activeEffect) {
    classArray.push('active-effect')
  }

  return (
    <button className={classArray.join(' ')} type={type ?? 'button'} {...rest}>
      {icon} {children}
    </button>
  )
}

export default Button
