import type { ReactNode } from 'react';
import type { RatesFile } from '@/lib/rates';

export interface DisclaimerProps {
  id: string;
  version: string;
  title: string;
  content: ReactNode;
}
export interface SourceLink {
  id: string;
  title: string;
  url: string;
}
export interface CalcContext {
  rates: RatesFile;
  providers?: Record<string, unknown[]>;
  disclaimer: DisclaimerProps;
  ratesUpdated: string;
  sourceLinks: SourceLink[];
  resultCta?: ReactNode;
  /** optional first-render input values (raw strings keyed by input name) */
  initialValues?: Record<string, string>;
}
export interface CalcProps {
  slug: string;
  ctx: CalcContext;
}
export interface BaseResult {
  assumptions: string[];
  warnings: string[];
}
