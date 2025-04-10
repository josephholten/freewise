'use server';

const BASE_URL = 'https://open.er-api.com/v6/latest';

export type ExchangeRates = {
  rates: { [key: string]: number };
  base: string;
  lastUpdated: Date;
};

export async function getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}/${baseCurrency}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    return {
      rates: data.rates,
      base: data.base_code,
      lastUpdated: new Date(data.time_last_update_unix * 1000)
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return { error: 'Failed to fetch exchange rates' };
  }
}

export function convertAmount(amount: number, fromCurrency: string, toCurrency: string, rates: { [key: string]: number }): number {
  if (fromCurrency === toCurrency) return amount;
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    throw new Error('Invalid currency code');
  }

  // Convert to USD first (as base), then to target currency
  const inUSD = amount / rates[fromCurrency];
  return inUSD * rates[toCurrency];
} 