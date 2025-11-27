/**
 * Layout Expression Evaluator
 *
 * Evaluates parsed layout expressions (AST) to pixel values.
 * Takes container size as context and resolves all units to pixels.
 */

import type { LayoutExpression, LayoutUnit } from './types';

export class LayoutExpressionEvaluator {
	/**
	 * Evaluate expression to pixel value
	 * @param expr - Parsed expression AST
	 * @param containerSize - Container size in pixels (miniature display width or height)
	 * @returns Resolved pixel value (rounded to nearest integer)
	 */
	static evaluate(expr: LayoutExpression, containerSize: number): number {
		const result = this.evaluateRecursive(expr, containerSize);
		return Math.round(result);
	}

	/**
	 * Recursive evaluation helper
	 */
	private static evaluateRecursive(expr: LayoutExpression, containerSize: number): number {
		switch (expr.type) {
			case 'zero':
			case 'fraction':
			case 'percentage':
			case 'pixel':
				return this.resolveUnit(expr, containerSize);

			case 'add': {
				const left = this.evaluateRecursive(expr.left, containerSize);
				const right = this.evaluateRecursive(expr.right, containerSize);
				return left + right;
			}

			case 'subtract': {
				const left = this.evaluateRecursive(expr.left, containerSize);
				const right = this.evaluateRecursive(expr.right, containerSize);
				return left - right;
			}

			default: {
				// TypeScript exhaustiveness check
				const _exhaustive: never = expr;
				throw new Error(`Unknown expression type: ${JSON.stringify(_exhaustive)}`);
			}
		}
	}

	/**
	 * Resolve single unit to pixels
	 */
	private static resolveUnit(unit: LayoutUnit, containerSize: number): number {
		switch (unit.type) {
			case 'zero':
				return 0;

			case 'fraction':
				return (containerSize * unit.numerator) / unit.denominator;

			case 'percentage':
				return containerSize * unit.value;

			case 'pixel':
				return unit.value;

			default: {
				// TypeScript exhaustiveness check
				const _exhaustive: never = unit;
				throw new Error(`Unknown unit type: ${JSON.stringify(_exhaustive)}`);
			}
		}
	}
}
