import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center rounded-ds-button font-body text-ds-base font-semibold transition-colors',
        size === 'sm' ? 'px-[12px] py-[5px] text-ds-small' : 'px-[16px] py-[7px]',
        disabled && 'cursor-not-allowed bg-li-tag-bg text-li-text-disabled',
        !disabled && variant === 'primary' && 'bg-li-blue text-white hover:bg-li-blue-dark',
        !disabled && variant === 'secondary' && 'border border-li-border-emphasis bg-transparent text-li-text-secondary hover:bg-li-bg-hover',
        !disabled && variant === 'ghost' && 'bg-transparent text-li-text-secondary hover:bg-li-bg-hover',
        !disabled && variant === 'danger' && 'bg-[#CC1016] text-white hover:bg-[#A00D12]',
        className
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
