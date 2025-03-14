import React from 'react'
import './slider.scss'
import Input from '@/components/general/input/Input'
import classNames from 'classnames'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  min: number
  max: number
  showConstrains?: boolean
  variant?: 'primary' | 'secondary'
  onValueChange?: (value: number) => void
}

const Slider: React.FC<Props> = ({
  label,
  className,
  min,
  max,
  value,
  step,
  showConstrains = true,
  variant = 'primary',
  onValueChange,
  ...rest
}) => {
  const handleChange = (newValue: number) => {
    if (newValue > max || newValue < min) return
    onValueChange?.(newValue)
  }

  return (
    <div className={classNames('slider-wrapper', className, variant)}>
      <p className="slider-label">{label}</p>

      {showConstrains && (
        <div className="slider-constrain min" onClick={() => handleChange(min)}>
          {min}
        </div>
      )}

      <input
        className="slider-input"
        type="range"
        name="sliderValue"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
        {...rest}
      />
      {showConstrains && (
        <div className="slider-constrain max" onClick={() => handleChange(max)}>
          {max}
        </div>
      )}

      <Input
        className="slider-input-field"
        variant={variant}
        step={step}
        min={min}
        max={max}
        type="number"
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
      />
    </div>
  )
}

export default Slider
