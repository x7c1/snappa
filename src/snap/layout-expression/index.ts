/**
 * Layout Expression System
 *
 * Public API for parsing and evaluating layout expressions.
 *
 * @example
 * ```typescript
 * import { LayoutExpressionParser, LayoutExpressionEvaluator } from './layout-expression';
 *
 * const expr = LayoutExpressionParser.parse('1/3 + 10px');
 * const pixels = LayoutExpressionEvaluator.evaluate(expr, 300); // → 110
 * ```
 */

export { LayoutExpressionParser } from './parser';
export { LayoutExpressionEvaluator } from './evaluator';
export type { LayoutExpression, LayoutUnit } from './types';
