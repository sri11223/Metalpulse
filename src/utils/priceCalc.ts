/**
 * priceCalc — Derived price calculations
 */

import { TROY_OZ_PER_KG } from '../constants/metals';

/**
 * Price per gram from price per troy oz
 * 1 troy oz = 31.1035 g
 */
export function gramPrice(pricePerOz: number): number {
  return pricePerOz / 31.1035;
}

/**
 * Price per kg from price per troy oz
 */
export function kgPrice(pricePerOz: number): number {
  return pricePerOz * TROY_OZ_PER_KG;
}

/**
 * INR price per 10 grams (gold: typically 24k gram price × 10 × rate)
 */
export function inrPer10Gram(pricePerGram: number, usdToInr: number): number {
  return pricePerGram * 10 * usdToInr;
}

/**
 * INR price per troy oz
 */
export function inrPerOz(pricePerOz: number, usdToInr: number): number {
  return pricePerOz * usdToInr;
}

/**
 * Calculate purity-adjusted gram price
 * @param price24k Price per gram at 24K
 * @param karat Target karat (e.g. 22, 18, 14)
 */
export function karatGramPrice(price24k: number, karat: number): number {
  return price24k * (karat / 24);
}
