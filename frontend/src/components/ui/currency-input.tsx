import * as React from 'react';

import { Currency, formatCurrency } from '@/utils';

import { Input } from './input';

export interface CurrencyInputProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type'
> {
  value: number | undefined;
  onChange: (value: number) => void;
  locale?: Currency;
}

/**
 * CurrencyInput - Input component that displays formatted numbers (1,000,000)
 * while keeping the actual value as a number.
 *
 * @example
 * <Controller
 *   name="amount"
 *   control={form.control}
 *   render={({ field }) => (
 *     <CurrencyInput
 *       value={field.value}
 *       onChange={field.onChange}
 *       onBlur={field.onBlur}
 *       ref={field.ref}
 *     />
 *   )}
 * />
 */
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, locale = 'VND', ...props }, ref) => {
    const parseNumber = (str: string): number => {
      // Remove all non-digit characters
      const raw = str.replace(/\D/g, '');
      return raw ? Number(raw) : 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = parseNumber(e.target.value);
      onChange(numericValue);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={formatCurrency(value, locale)}
        onChange={handleChange}
        {...props}
      />
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
