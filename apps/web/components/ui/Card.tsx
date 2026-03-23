import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xl shadow-black/10 ${className}`}
      {...props}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-[var(--border)]">
          <h3 className="text-slate-200 font-semibold text-sm">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
