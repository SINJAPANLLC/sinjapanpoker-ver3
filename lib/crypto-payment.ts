/**
 * 仮想通貨決済システム
 * Cryptocurrency Payment Integration
 * 
 * 対応通貨: BTC, ETH, USDT, USDC, LTC
 */

export type CryptoCurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'LTC';

export interface CryptoPaymentRequest {
  userId: string;
  amount: number;
  currency: CryptoCurrency;
  description?: string;
}

export interface CryptoInvoice {
  id: string;
  userId: string;
  amount: number;
  currency: CryptoCurrency;
  address: string;
  qrCodeUrl: string;
  expiresAt: Date;
  status: 'pending' | 'confirming' | 'completed' | 'expired' | 'failed';
  confirmations: number;
  requiredConfirmations: number;
  txHash?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CryptoTransaction {
  id: string;
  invoiceId: string;
  userId: string;
  amount: number;
  currency: CryptoCurrency;
  txHash: string;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  chipAmount: number;
}

export interface ExchangeRate {
  currency: CryptoCurrency;
  usdRate: number;
  jpyRate: number;
  lastUpdated: Date;
}

export class CryptoPaymentService {
  private invoices: Map<string, CryptoInvoice> = new Map();
  private transactions: Map<string, CryptoTransaction> = new Map();
  private exchangeRates: Map<CryptoCurrency, ExchangeRate> = new Map();
  
  private readonly CHIP_TO_USD_RATE = 1;
  private readonly REQUIRED_CONFIRMATIONS = {
    BTC: 3,
    ETH: 12,
    USDT: 12,
    USDC: 12,
    LTC: 6,
  };

  constructor() {
    this.initializeExchangeRates();
  }

  private initializeExchangeRates() {
    const now = new Date();
    this.exchangeRates.set('BTC', { currency: 'BTC', usdRate: 45000, jpyRate: 6750000, lastUpdated: now });
    this.exchangeRates.set('ETH', { currency: 'ETH', usdRate: 2500, jpyRate: 375000, lastUpdated: now });
    this.exchangeRates.set('USDT', { currency: 'USDT', usdRate: 1, jpyRate: 150, lastUpdated: now });
    this.exchangeRates.set('USDC', { currency: 'USDC', usdRate: 1, jpyRate: 150, lastUpdated: now });
    this.exchangeRates.set('LTC', { currency: 'LTC', usdRate: 85, jpyRate: 12750, lastUpdated: now });
  }

  async createInvoice(request: CryptoPaymentRequest): Promise<CryptoInvoice> {
    const invoiceId = this.generateInvoiceId();
    const address = this.generateCryptoAddress(request.currency);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const invoice: CryptoInvoice = {
      id: invoiceId,
      userId: request.userId,
      amount: request.amount,
      currency: request.currency,
      address,
      qrCodeUrl: this.generateQRCodeUrl(address, request.amount, request.currency),
      expiresAt,
      status: 'pending',
      confirmations: 0,
      requiredConfirmations: this.REQUIRED_CONFIRMATIONS[request.currency],
      createdAt: new Date(),
    };

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  getInvoice(invoiceId: string): CryptoInvoice | null {
    return this.invoices.get(invoiceId) || null;
  }

  async checkInvoiceStatus(invoiceId: string): Promise<CryptoInvoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return null;

    if (invoice.status === 'pending' && new Date() > invoice.expiresAt) {
      invoice.status = 'expired';
      this.invoices.set(invoiceId, invoice);
    }

    return invoice;
  }

  async processWebhook(payload: {
    invoiceId: string;
    txHash: string;
    confirmations: number;
  }): Promise<boolean> {
    const invoice = this.invoices.get(payload.invoiceId);
    if (!invoice) return false;

    invoice.confirmations = payload.confirmations;
    invoice.txHash = payload.txHash;

    if (payload.confirmations >= invoice.requiredConfirmations) {
      invoice.status = 'completed';
      invoice.completedAt = new Date();
      
      const chipAmount = this.calculateChipAmount(invoice.amount, invoice.currency);
      
      const transaction: CryptoTransaction = {
        id: this.generateTransactionId(),
        invoiceId: invoice.id,
        userId: invoice.userId,
        amount: invoice.amount,
        currency: invoice.currency,
        txHash: payload.txHash,
        confirmations: payload.confirmations,
        status: 'confirmed',
        timestamp: new Date(),
        chipAmount,
      };

      this.transactions.set(transaction.id, transaction);
    } else if (payload.confirmations > 0) {
      invoice.status = 'confirming';
    }

    this.invoices.set(invoice.id, invoice);
    return true;
  }

  calculateCryptoAmount(usdAmount: number, currency: CryptoCurrency): number {
    const rate = this.exchangeRates.get(currency);
    if (!rate) throw new Error(`Exchange rate not found for ${currency}`);
    
    return usdAmount / rate.usdRate;
  }

  calculateChipAmount(cryptoAmount: number, currency: CryptoCurrency): number {
    const rate = this.exchangeRates.get(currency);
    if (!rate) throw new Error(`Exchange rate not found for ${currency}`);
    
    const usdAmount = cryptoAmount * rate.usdRate;
    return Math.floor(usdAmount / this.CHIP_TO_USD_RATE);
  }

  getExchangeRate(currency: CryptoCurrency): ExchangeRate | null {
    return this.exchangeRates.get(currency) || null;
  }

  async updateExchangeRates(): Promise<void> {
    this.initializeExchangeRates();
  }

  getUserTransactions(userId: string): CryptoTransaction[] {
    return Array.from(this.transactions.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private generateInvoiceId(): string {
    return `INV-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  private generateTransactionId(): string {
    return `TX-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  private generateCryptoAddress(currency: CryptoCurrency): string {
    const prefixes = {
      BTC: '1',
      ETH: '0x',
      USDT: '0x',
      USDC: '0x',
      LTC: 'L',
    };

    const prefix = prefixes[currency];
    const length = currency === 'BTC' || currency === 'LTC' ? 34 : 42;
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    
    let address = prefix;
    for (let i = prefix.length; i < length; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return address;
  }

  private generateQRCodeUrl(address: string, amount: number, currency: CryptoCurrency): string {
    const paymentUri = this.createPaymentURI(address, amount, currency);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUri)}`;
  }

  private createPaymentURI(address: string, amount: number, currency: CryptoCurrency): string {
    const schemes = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      USDT: 'ethereum',
      USDC: 'ethereum',
      LTC: 'litecoin',
    };

    const scheme = schemes[currency];
    return `${scheme}:${address}?amount=${amount}`;
  }
}

export const cryptoPaymentService = new CryptoPaymentService();
