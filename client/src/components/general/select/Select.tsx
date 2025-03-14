import React, { useState } from 'react'
import Expand from '@/components/icons/expand.svg'
import './select.scss'

export interface Option {
  label: string
  value: string
}

interface SelectProps extends React.HTMLProps<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'other'
  options: Option[]
  selectedOption: string | undefined | null
  onOptionSelect: (selectedOption: string)=> Promise<void> | void
}

const Select: React.FC<SelectProps> = ({
  options,
  className, 
  variant = 'secondary',
  onOptionSelect, 
  selectedOption, 
  ...rest 
}) => {
  const [expanded, setExpanded] = useState(false)

  const classArray = ['select-container', className, variant]

  return (
    <div className={classArray.join(' ')} {...rest}>
      <div className="select-main-element" onClick={() => setExpanded(!expanded)}>
        <span className='select-label'>{ selectedOption ? options.find(opt => opt.value === selectedOption)?.label : 'None' }</span>
        <div className="select-icon">
          <Expand />
        </div>
      </div>

      {
        expanded && <ul className="select-options">
          {
            options.map(option => {
              return (
                <li 
                  className={`select-option ${option.value === selectedOption ? 'selected' : ''}`} 
                  key={option.value}
                  onClick={async () => {
                    await onOptionSelect(option.value)
                    setExpanded(false)
                  }}
                >{ option.label }</li>
              )
            })
          }
        </ul>
      }
    </div>
  )
}

export default Select
