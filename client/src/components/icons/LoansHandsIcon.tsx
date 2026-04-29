import React from 'react';
import { Handshake } from 'lucide-react';

interface LoansHandsIconProps {
  className?: string;
}

/** Apretón de manos — Lucide `Handshake`. */
export const LoansHandsIcon: React.FC<LoansHandsIconProps> = ({ className = 'h-5 w-5' }) => (
  <Handshake className={className} strokeWidth={1.75} aria-hidden />
);
