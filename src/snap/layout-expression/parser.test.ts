/**
 * Layout Expression Parser Tests
 */

import { describe, it, expect } from 'vitest';
import { LayoutExpressionParser } from './parser';

describe('LayoutExpressionParser', () => {
	describe('Basic terms', () => {
		it('parses zero', () => {
			expect(LayoutExpressionParser.parse('0')).toEqual({ type: 'zero' });
		});

		it('parses integer fraction', () => {
			expect(LayoutExpressionParser.parse('1/3')).toEqual({
				type: 'fraction',
				numerator: 1,
				denominator: 3,
			});
		});

		it('parses fraction with larger numbers', () => {
			expect(LayoutExpressionParser.parse('5/12')).toEqual({
				type: 'fraction',
				numerator: 5,
				denominator: 12,
			});
		});

		it('rejects decimal fraction', () => {
			expect(() => LayoutExpressionParser.parse('0.5/3')).toThrow(
				'Fractions must use integers',
			);
		});

		it('rejects division by zero', () => {
			expect(() => LayoutExpressionParser.parse('1/0')).toThrow('Division by zero');
		});

		it('parses percentage', () => {
			expect(LayoutExpressionParser.parse('50%')).toEqual({
				type: 'percentage',
				value: 0.5,
			});
		});

		it('parses decimal percentage', () => {
			expect(LayoutExpressionParser.parse('33.33%')).toEqual({
				type: 'percentage',
				value: 0.3333,
			});
		});

		it('parses 100%', () => {
			expect(LayoutExpressionParser.parse('100%')).toEqual({
				type: 'percentage',
				value: 1.0,
			});
		});

		it('parses pixel', () => {
			expect(LayoutExpressionParser.parse('300px')).toEqual({
				type: 'pixel',
				value: 300,
			});
		});

		it('parses decimal pixel', () => {
			expect(LayoutExpressionParser.parse('10.5px')).toEqual({
				type: 'pixel',
				value: 10.5,
			});
		});
	});

	describe('Operations', () => {
		it('parses addition', () => {
			expect(LayoutExpressionParser.parse('50% + 10px')).toEqual({
				type: 'add',
				left: { type: 'percentage', value: 0.5 },
				right: { type: 'pixel', value: 10 },
			});
		});

		it('parses subtraction', () => {
			expect(LayoutExpressionParser.parse('100% - 300px')).toEqual({
				type: 'subtract',
				left: { type: 'percentage', value: 1.0 },
				right: { type: 'pixel', value: 300 },
			});
		});

		it('parses fraction addition', () => {
			expect(LayoutExpressionParser.parse('1/3 + 10px')).toEqual({
				type: 'add',
				left: { type: 'fraction', numerator: 1, denominator: 3 },
				right: { type: 'pixel', value: 10 },
			});
		});

		it('parses complex expression (left-to-right)', () => {
			expect(LayoutExpressionParser.parse('100% - 300px + 10px')).toEqual({
				type: 'add',
				left: {
					type: 'subtract',
					left: { type: 'percentage', value: 1.0 },
					right: { type: 'pixel', value: 300 },
				},
				right: { type: 'pixel', value: 10 },
			});
		});

		it('parses multiple operations', () => {
			expect(LayoutExpressionParser.parse('1/2 - 10px + 5px - 2px')).toEqual({
				type: 'subtract',
				left: {
					type: 'add',
					left: {
						type: 'subtract',
						left: { type: 'fraction', numerator: 1, denominator: 2 },
						right: { type: 'pixel', value: 10 },
					},
					right: { type: 'pixel', value: 5 },
				},
				right: { type: 'pixel', value: 2 },
			});
		});
	});

	describe('Whitespace handling', () => {
		it('handles whitespace variations', () => {
			const withSpaces = LayoutExpressionParser.parse('100% - 300px');
			const withoutSpaces = LayoutExpressionParser.parse('100%-300px');
			const extraSpaces = LayoutExpressionParser.parse(' 100%  -  300px ');

			expect(withoutSpaces).toEqual(withSpaces);
			expect(extraSpaces).toEqual(withSpaces);
		});

		it('handles whitespace in complex expressions', () => {
			expect(LayoutExpressionParser.parse('1/3+10px-5px')).toEqual(
				LayoutExpressionParser.parse('1/3 + 10px - 5px'),
			);
		});
	});

	describe('Error cases', () => {
		it('throws on empty string', () => {
			expect(() => LayoutExpressionParser.parse('')).toThrow('Empty expression');
		});

		it('throws on whitespace only', () => {
			expect(() => LayoutExpressionParser.parse('   ')).toThrow('Empty expression');
		});

		it('throws on invalid syntax', () => {
			expect(() => LayoutExpressionParser.parse('abc')).toThrow('Invalid term');
		});

		it('throws on incomplete expression', () => {
			expect(() => LayoutExpressionParser.parse('100% - ')).toThrow(
				'Incomplete expression',
			);
		});

		it('throws on incomplete expression (operator only)', () => {
			expect(() => LayoutExpressionParser.parse('100% +')).toThrow(
				'Incomplete expression',
			);
		});

		it('throws on invalid percentage', () => {
			expect(() => LayoutExpressionParser.parse('abc%')).toThrow('Invalid percentage');
		});

		it('throws on invalid pixel', () => {
			expect(() => LayoutExpressionParser.parse('abcpx')).toThrow('Invalid pixel value');
		});

		it('throws on invalid fraction format', () => {
			expect(() => LayoutExpressionParser.parse('1/2/3')).toThrow('Invalid fraction');
		});
	});

	describe('Edge cases', () => {
		it('parses zero pixel', () => {
			expect(LayoutExpressionParser.parse('0px')).toEqual({
				type: 'pixel',
				value: 0,
			});
		});

		it('parses zero percentage', () => {
			expect(LayoutExpressionParser.parse('0%')).toEqual({
				type: 'percentage',
				value: 0,
			});
		});

		it('parses 1/1 fraction', () => {
			expect(LayoutExpressionParser.parse('1/1')).toEqual({
				type: 'fraction',
				numerator: 1,
				denominator: 1,
			});
		});
	});
});
