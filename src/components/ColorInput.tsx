import { useId } from 'react';
import type { Ref } from 'react';
import { parseHex, rgbToHex } from '../lib/color/parse';
import type { ColorFieldState } from '../lib/colorPair';

interface ColorInputProps {
  readonly inputRef?: Ref<HTMLInputElement>;
  readonly label: string;
  readonly description: string;
  readonly value: ColorFieldState;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
}

export function ColorInput({
  inputRef,
  label,
  description,
  value,
  onChange,
  onBlur,
}: ColorInputProps) {
  const id = useId();
  const invalid = parseHex(value.input) === null;
  const hex = rgbToHex(value.color);

  return (
    <fieldset className="color-field">
      <legend>
        {label} <span>{description}</span>
      </legend>
      <div className="color-input-row">
        <div className="picker-control">
          <label htmlFor={`${id}-picker`}>Color picker</label>
          <input
            id={`${id}-picker`}
            type="color"
            value={hex.toLowerCase()}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
          />
        </div>
        <div className="hex-control">
          <label htmlFor={`${id}-hex`}>Hex value</label>
          <input
            id={`${id}-hex`}
            ref={inputRef}
            type="text"
            value={value.input}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="characters"
            aria-invalid={invalid}
            aria-describedby={`${id}-hint${invalid ? ` ${id}-error` : ''}`}
          />
        </div>
      </div>
      <p id={`${id}-hint`} className="input-hint">
        3 or 6 hex digits. The # is optional.
      </p>
      <p id={`${id}-error`} className="input-error" aria-live="polite">
        {invalid
          ? 'Enter a valid hex color, such as #123 or #123ABC. Keeping the last valid color.'
          : ''}
      </p>
    </fieldset>
  );
}
