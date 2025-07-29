import React from "react";
import { Badge } from "./badge";
import { Button } from "./button";

interface PrimaryImageBadgeProps {
  isPrimary: boolean;
  onClick: () => void;
  className?: string;
  [key: string]: any; // allow data-testid and other props
}

export function PrimaryImageBadge({ isPrimary, onClick, className, ...props }: PrimaryImageBadgeProps) {
  // Always render as a button for accessibility and testability
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={props["data-testid"]}
      className={
        isPrimary
          ? `inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-[color,box-shadow] overflow-hidden border-transparent bg-yellow-200 text-yellow-900 ${className || ''}`
          : `inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all rounded-md border px-2 py-0.5 text-xs w-fit gap-1 bg-white text-gray-900 hover:bg-yellow-100 ${className || ''}`
      }
    >
      {isPrimary ? '🌟 Primary' : 'Set as Primary'}
    </button>
  );
} 