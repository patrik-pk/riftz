import React from 'react'
import './color-picker.scss'
import Input from '../input/Input'
import { Menu } from '../menu/Menu'
import { HexColorPicker } from 'react-colorful'

interface ColorPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  value: string | undefined
  onColorChange?: (color: string) => void
}

const isHexColor = (color: string): boolean => color.length === 7 && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, label, onColorChange, ...rest }) => {
  const classArray = ['color-picker']
  let throttleTimeout: ReturnType<typeof setTimeout> | null = null

  return (
    <div className={classArray.join(' ')} style={{ backgroundColor: value || '#ccc' }}>
      {label && <p className="color-picker-label">{label}</p>}
      <div className="color-picker-value">{value ?? 'not defined'}</div>

      <Menu>
        <div className="color-picker-menu">
          <div className="color-picker-menu-label">{label}</div>

          <HexColorPicker
            className="color-picker-field"
            color={value}
            onChange={(e) => {
              throttleTimeout !== null && clearTimeout(throttleTimeout)
              throttleTimeout = null
              throttleTimeout = setTimeout(() => {
                onColorChange?.(e)
              }, 100)
            }}
          />
          <Input
            className="color-picker-input"
            value={value ?? ''}
            label={label}
            variant="secondary"
            {...rest}
            onChange={(e) => {
              // TODO: store the value in useState and emit the update if it is correct
              if (isHexColor(e.target.value)) {
                onColorChange?.(e.target.value)
              }
            }}
          />
        </div>
      </Menu>
    </div>
  )
}
