'use client';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { S } from './strings';
import type { CalcProps } from './types';

// Each calculator is code-split; ssr stays enabled so the form markup is part of the server render.
const loading = () => (
  <p role="status" className="text-muted">
    {S.loading}
  </p>
);

export const CALC_REGISTRY: Record<string, ComponentType<CalcProps>> = {
  'atzmai-net': dynamic(() => import('./calculators/AtzmaiNet'), { loading }),
  'employee-vs-freelancer-calculator': dynamic(() => import('./calculators/EmployeeVsFreelancer'), { loading }),
  'clearing-fees': dynamic(() => import('./calculators/ClearingFees'), { loading }),
  'invoicing-cost': dynamic(() => import('./calculators/InvoicingCost'), { loading }),
  vat: dynamic(() => import('./calculators/Vat'), { loading }),
  'salary-net': dynamic(() => import('./calculators/SalaryNet'), { loading }),
  'keren-hishtalmut': dynamic(() => import('./calculators/KerenHishtalmut'), { loading }),
  'pension-self-employed': dynamic(() => import('./calculators/PensionSelfEmployed'), { loading }),
  severance: dynamic(() => import('./calculators/Severance'), { loading }),
  unemployment: dynamic(() => import('./calculators/Unemployment'), { loading }),
  'osek-patur-threshold': dynamic(() => import('./calculators/OsekPaturThreshold'), { loading }),
  'compound-interest-mortgage': dynamic(() => import('./calculators/CompoundInterestMortgage'), { loading }),
  'freelancer-hourly-rate': dynamic(() => import('./calculators/FreelancerHourlyRate'), { loading }),
  'payslip-decoder': dynamic(() => import('./calculators/PayslipDecoder'), { loading }),
  'business-setup-cost-calculator': dynamic(() => import('./calculators/BusinessSetupCost'), { loading }),
  'business-structure-quiz': dynamic(() => import('./calculators/BusinessStructureQuiz'), { loading }),
  'tax-calendar': dynamic(() => import('./calculators/TaxCalendar'), { loading }),
  'bank-fee-checker': dynamic(() => import('./calculators/BankFeeChecker'), { loading }),
  'tax-refund-estimator': dynamic(() => import('./calculators/TaxRefundEstimator'), { loading }),
};
