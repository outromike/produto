
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

export type ReturnSchedule = {
    id: string; // Unique identifier, can be a timestamp or UUID
    date: string; // From 'DATA' - ISO 8601 format (e.g., "2024-07-29")
    carrier: string; // From 'TRANSPORTADORA'
    outgoingShipment: string; // From 'REMESSA DE SAIDA'
    salesNote: string; // From 'NOTA VENDA'
    nfd: string; // From 'NFD'
    customer: string; // From 'CLIENTE'
    bdv: string; // From 'BDV'
    ov: string; // From 'OV'
    returnReason: string; // From 'MOTIVO DA DEVOLUÇÃO'
    productState: string; // From 'ESTADO DO PRODUTO'
    invoiceVolume: number; // From 'VOL.NF.'
    createdAt: string; // Timestamp of creation
};

export type ConferenceEntry = {
    id: string; // Unique identifier
    scheduleId: string; // Links to the ReturnSchedule
    nfd: string; // From the schedule
    productSku: string;
    productDescription: string;
    receivedVolume: number;
    allocatedVolume: number; // New field to track allocated items
    productState: 'Produto Bom' | 'Descarte' | 'Avariado' | 'Recusado' | 'Recusa Total';
    observations: string;
    conferenceTimestamp: string; // ISO 8601 format
};

export type StorageEntry = {
    id: string; // uuid
    building: string;
    level: string;
    nfd: string;
    salesNote: string;
    shipment: string;
    productSku: string;
    productDescription: string;
    quantity: number;
    status: string;
    allocatedAt: string; // ISO 8601 format
};

export type AllocationEntry = {
    conferenceId: string;
    building: string;
    level: string;
    nfd: string;
    salesNote: string;
    shipment: string;
    productSku: string;
    productDescription: string;
    quantity: number;
    status: string;
}

// This type is no longer needed with the table format.
// We are storing individual entries now.
export type StorageLocation = {
    id: string; // e.g., "111-6" for column 111, level 6
    entries: StorageEntry[];
    status: 'empty' | 'partial' | 'full' | 'blocked';
    capacity: number; // Max volume or items
};
