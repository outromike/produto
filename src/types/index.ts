

export type Product = {
  sku: string;
  item: string; // From 'Item'
  description: string; // From 'Descrição'
  category: string; // From 'Des Categoria'
  netWeight: number; // From 'Peso Liquido'
  grossWeight: number; // From 'Peso Bruto SKU'
  volume: number; // From 'Volume m3'
  dimensions: string; // From 'Altura'x'Largura'x'Comprimento'
  palletization: { // From 'Qtd. CX Altura' and 'Qtd. CX Lastro'
    height: number;
    base: number;
  };
  barcode: string; // From 'Cod. Barras'
  packaging: string; // From 'Caixa'
  measurementUnit: string; // From 'Unid Med'
  quantity: number; // From 'Qtd. Itens'
  classification: 'A' | 'B' | 'C' | string; // From 'Clasificação ABC'
  unit: 'ITJ' | 'JVL'; // Determined by origin file
};

export type ReturnSchedule = {
    data: string;
    transportadora: string;
    remessaSaida: string;
    notaVenda: string;
    nfd: string;
    cliente: string;
    bdv: string;
    ov: string;
    motivoDevolucao: string;
    estadoProduto: string;
    volNf: string;
    status: string;
    destArmazenagem: string;
    recebido: string;
    estadoRecebido: string;
    observacoesRecebimento: string;
}

export type User = {
  username: string;
  password?: string;
  role: 'admin' | 'user';
};

export type SessionPayload = {
  user: {
    username: string;
    role: 'admin' | 'user';
  };
  expires: Date;
};
