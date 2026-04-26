export type CsvRow = {
  payee?: string;
  amount?: string;
  message?: string;
  label?: string;
  size?: string;
};

export type PaymentRow = {
  payee: string;
  amount: number;
  message: string;
  label?: string;
  size: number;
};
