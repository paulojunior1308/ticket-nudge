export const PREDEFINED_LOCATIONS = [
  "Auditório",
  "Comedoria",
  "Sala de Reunião 1",
  "Sala de Reunião 2",
  "Sala de Reunião 3",
  "Espaço de Tecnologias",
  "Área de Convivência",
  "Teatro"
] as const;

export type PredefinedLocation = typeof PREDEFINED_LOCATIONS[number];

export interface Laptop {
  id: string;
  model: string;
  serialNumber: string;
  isAvailable: boolean;
}

export interface LaptopLoan {
  id: string;
  laptopId: string;
  userName: string;
  registrationNumber: string; // chapa
  location: string;
  hasPointer: boolean;
  signature: string; // URL da assinatura no Firebase Storage
  loanDate: string;
  returnDate?: string;
  isReturned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const LAPTOPS: Laptop[] = [
  { id: "351752", model: "351752", serialNumber: "351752", isAvailable: true },
  { id: "323817", model: "323817", serialNumber: "323817", isAvailable: true },
  { id: "351751", model: "351751", serialNumber: "351751", isAvailable: true },
  { id: "351749", model: "351749", serialNumber: "351749", isAvailable: true },
  { id: "351750", model: "351750", serialNumber: "351750", isAvailable: true },
  { id: "323818", model: "323818", serialNumber: "323818", isAvailable: true },
]; 