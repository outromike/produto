export type Product = {
  sku: string;
  description: string;
  category: string;
  weight: number;
  volume: number;
  dimensions: string;
  barcode: string;
  packaging: 'UNIDADE' | 'MASTER';
  classification: 'A' | 'B' | 'C';
  unit: 'ITJ' | 'JVL';
};

export type User = {
  username: string;
  password?: string;
};

export type SessionPayload = {
  user: User;
  expires: Date;
};
