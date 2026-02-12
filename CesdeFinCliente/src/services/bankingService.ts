// Banking service for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Transaction {
  id?: string;
  tipo: string;
  valor?: number;
  monto: number;
  comision?: number;
  neto?: number;
  metodo?: string;
  descripcion?: string;
  detalle?: string;
  fecha: Date | string;
  saldo?: number;
}

export interface DepositResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
  error?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
  withdrawalCode?: string;
  error?: string;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
  error?: string;
}

export interface BalanceResponse {
  success: boolean;
  balance: number;
  error?: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  data?: {
    transactions: Transaction[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

export interface TransactionFilters {
  type?: string;
  date?: string;
  limit?: number;
  offset?: number;
}

// Get transaction history
export const getTransactionHistory = async (filters: TransactionFilters = {}): Promise<TransactionHistoryResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.date) params.append('date', filters.date);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await fetch(`${API_BASE_URL}/banking/transactions?${params}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error al obtener historial de transacciones'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Transaction history error:', error);
    return {
      success: false,
      error: 'Error de conexión al servidor'
    };
  }
};

// Export transactions to CSV
export const exportTransactionsToCSV = (transactions: Transaction[]): string => {
  const headers = ['Fecha', 'Tipo', 'Monto', 'Comisión', 'Método', 'Detalle', 'Saldo'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      new Date(t.fecha).toLocaleString('es-CO'),
      t.tipo,
      (t.valor || t.monto).toString(),
      t.comision?.toString() || '0',
      t.metodo || '',
      `"${t.detalle || t.descripcion || ''}"`,
      t.saldo?.toString() || ''
    ].join(','))
  ].join('\n');

  return csvContent;
};

// Bank deposit
export const bankDeposit = async (banco: string, monto: number): Promise<DepositResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/banking/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        amount: monto,
        method: 'banco',
        detail: banco
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al realizar depósito bancario',
        error: data.error || 'Error al realizar depósito bancario'
      };
    }

    return {
      success: true,
      message: data.message || 'Depósito bancario realizado exitosamente',
      transaction: data.data?.transaction
    };
  } catch (error) {
    console.error('Bank deposit error:', error);
    return {
      success: false,
      message: 'Error de conexión al servidor',
      error: 'Error de conexión al servidor'
    };
  }
};

// Card deposit
export const cardDeposit = async (
  numeroTarjeta: string,
  nombreTarjeta: string,
  fechaExpiracion: string,
  cvv: string,
  monto: number
): Promise<DepositResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/banking/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        amount: monto,
        method: 'tarjeta',
        detail: `Tarjeta ****${numeroTarjeta.slice(-4)}`
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al realizar depósito con tarjeta',
        error: data.error || 'Error al realizar depósito con tarjeta'
      };
    }

    return {
      success: true,
      message: data.message || 'Depósito con tarjeta realizado exitosamente',
      transaction: data.data?.transaction
    };
  } catch (error) {
    console.error('Card deposit error:', error);
    return {
      success: false,
      message: 'Error de conexión al servidor',
      error: 'Error de conexión al servidor'
    };
  }
};

// Cash deposit
export const cashDeposit = async (monto: number): Promise<DepositResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/banking/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        amount: monto,
        method: 'efectivo'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al realizar depósito en efectivo',
        error: data.error || 'Error al realizar depósito en efectivo'
      };
    }

    return {
      success: true,
      message: data.message || 'Depósito en efectivo realizado exitosamente',
      transaction: data.data?.transaction
    };
  } catch (error) {
    console.error('Cash deposit error:', error);
    return {
      success: false,
      message: 'Error de conexión al servidor',
      error: 'Error de conexión al servidor'
    };
  }
};

// Withdrawal
export const withdraw = async (monto: number): Promise<WithdrawalResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/banking/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ amount: monto }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al realizar retiro',
        error: data.error || 'Error al realizar retiro'
      };
    }

    return {
      success: true,
      message: data.message || 'Retiro realizado exitosamente',
      transaction: data.data?.transaction,
      withdrawalCode: data.data?.withdrawalCode
    };
  } catch (error) {
    console.error('Withdrawal error:', error);
    return {
      success: false,
      message: 'Error de conexión al servidor',
      error: 'Error de conexión al servidor'
    };
  }
};

// Transfer
export const transfer = async (usuarioDestino: string, monto: number): Promise<TransferResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/banking/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    // server expects { targetUser, amount }
    body: JSON.stringify({ targetUser: usuarioDestino, amount: monto }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al realizar transferencia',
        error: data.error || 'Error al realizar transferencia'
      };
    }

    return {
      success: true,
      message: data.message || 'Transferencia realizada exitosamente',
      transaction: data.transaction
    };
  } catch (error) {
    console.error('Transfer error:', error);
    return {
      success: false,
      message: 'Error de conexión al servidor',
      error: 'Error de conexión al servidor'
    };
  }
};

// Get balance
export const getBalance = async (): Promise<BalanceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/banking/balance`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        balance: 0,
        error: data.error || 'Error al obtener saldo'
      };
    }

    return {
      success: true,
      balance: data.data?.saldo || 0
    };
  } catch (error) {
    console.error('Get balance error:', error);
    return {
      success: false,
      balance: 0,
      error: 'Error de conexión al servidor'
    };
  }
};

// Calculate commission for different deposit methods
export const calculateCommission = (monto: number, metodo: 'bank' | 'card' | 'cash'): number => {
  switch (metodo) {
    case 'bank':
      return Math.round(monto * 0.01); // 1% commission
    case 'card':
      return Math.round(monto * 0.025); // 2.5% commission
    case 'cash':
      return 0; // No commission for cash
    default:
      return 0;
  }
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Validate amount
export const validateAmount = (amount: string): { isValid: boolean; error: string } => {
  if (!amount) {
    return { isValid: false, error: 'El monto es obligatorio' };
  }

  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'El monto debe ser un número válido' };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'El monto debe ser mayor a cero' };
  }

  if (numAmount > 10000000) {
    return { isValid: false, error: 'El monto máximo permitido es $10.000.000' };
  }

  return { isValid: true, error: '' };
};

// Validate card number
export const validateCardNumber = (cardNumber: string): { isValid: boolean; error: string } => {
  if (!cardNumber) {
    return { isValid: false, error: 'El número de tarjeta es obligatorio' };
  }

  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (cleaned.length !== 16) {
    return { isValid: false, error: 'El número de tarjeta debe tener 16 dígitos' };
  }

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'El número de tarjeta solo debe contener dígitos' };
  }

  return { isValid: true, error: '' };
};

// Validate CVV
export const validateCVV = (cvv: string): { isValid: boolean; error: string } => {
  if (!cvv) {
    return { isValid: false, error: 'El CVV es obligatorio' };
  }

  if (!/^\d{3}$/.test(cvv)) {
    return { isValid: false, error: 'El CVV debe tener 3 dígitos' };
  }

  return { isValid: true, error: '' };
};

// Validate expiry date
export const validateExpiryDate = (expiryDate: string): { isValid: boolean; error: string } => {
  if (!expiryDate) {
    return { isValid: false, error: 'La fecha de expiración es obligatoria' };
  }

  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiryDate)) {
    return { isValid: false, error: 'Formato inválido. Use MM/AA' };
  }

  const [month, year] = expiryDate.split('/');
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return { isValid: false, error: 'La tarjeta ha expirado' };
  }

  return { isValid: true, error: '' };
};
