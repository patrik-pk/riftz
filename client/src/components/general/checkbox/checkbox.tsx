import React, { InputHTMLAttributes } from 'react'
import classNames from 'classnames'
import './checkbox.scss'
import Checkmark from '@/components/icons/checkmark.svg'

interface Props extends InputHTMLAttributes<HTMLDivElement> {
  label?: string
  isChecked?: boolean
  onChange?: () => void
}

const Checkbox: React.FC<Props> = ({ label, isChecked, onChange, children, className, ...rest }) => {
  const handleCheck = () => {
    onChange?.()
  }

  return (
    <div
      className={classNames('checkbox-container', { checked: isChecked }, className)}
      onClick={() => handleCheck()}
      onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
      {...rest}
    >
      <div className="checkbox" tabIndex={0}>
        {isChecked && <Checkmark />}
      </div>
      {label && <div className="checkbox-label">{label}</div>}
    </div>
  )
}

export default Checkbox
