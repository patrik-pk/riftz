import React from 'react'
import './input.scss'
import ClearIcon from '@/components/icons/clear.svg'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'primary' | 'secondary'
  label?: string
  showClear?: boolean
  onClear?: ()=> void
}

const Input: React.FC<InputProps> = ({ variant = 'primary', label, className, showClear, onClear, children, ...rest }) => {
  const classArray = ['input-container', className, variant]

  return (
    <label className={classArray.join(' ')}>
      {label && <p className='input-label'>{label}</p>}
      <input className='input' {...rest} />
      {
        showClear && <div className="clear-btn" onClick={onClear}>
          <ClearIcon />
        </div>
      }
      { children }
    </label>
  )
}

export default Input
