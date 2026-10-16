'use client';
import type { ReactNode } from 'react';
import type { RatesFile } from '@/lib/rates';
import { CALC_REGISTRY } from './registry';
import { S } from './strings';
import type { CalcContext, DisclaimerProps, SourceLink } from './types';

export interface CalcLoaderProps {
  slug: string;
  rates: RatesFile;
  /** provider data keyed by data/providers file basename: invoicing, clearing, business-banking */
  providers?: Record<string, unknown[]>;
  /** DISC-CALC-<CLASS>: `content` is a pre-rendered server node (legal text rendered verbatim, never retyped here) */
  disclaimer: DisclaimerProps;
  /** ISO date (YYYY-MM-DD) of the rates file */
  ratesUpdated: string;
  sourceLinks: SourceLink[];
  /** optional CALC-RESULT-CTA slot, rendered after the result region (outside the inputs) */
  resultCta?: ReactNode;
  /** optional first-render input values (raw strings keyed by input name), e.g. parsed from a shared link by the page */
  initialValues?: Record<string, string>;
}

export function CalcLoader({ slug, rates, providers, disclaimer, ratesUpdated, sourceLinks, resultCta, initialValues }: CalcLoaderProps) {
  const Calc = CALC_REGISTRY[slug];
  if (!Calc) {
    return (
      <p role="alert" className="font-bold text-danger">
        {S.errorGeneric}
      </p>
    );
  }
  const ctx: CalcContext = { rates, providers, disclaimer, ratesUpdated, sourceLinks, resultCta, initialValues };
  return <Calc slug={slug} ctx={ctx} />;
}

export default CalcLoader;
