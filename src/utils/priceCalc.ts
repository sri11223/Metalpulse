import { TROY_OZ_PER_KG } from '../constants/metals';

export function gramPrice(pricePerOz: number): number {
  return pricePerOz / 31.1035;
}

export function kgPrice(pricePerOz: number): number {
  return pricePerOz * TROY_OZ_PER_KG;
}

export function inrPer10Gram(pricePerGram: number, usdToInr: number): number {
  return pricePerGram * 10 * usdToInr;
}

export function convertPrice(usdPrice: number, rate: number): number {
  return usdPrice * rate;
}
