/**
 * An immutable Set for value objects that use toString() as identity key.
 * Unlike native Set which uses reference equality, ValueSet compares
 * elements by their string representation, enabling correct behavior
 * with value objects like LayoutId, CollectionId, etc.
 */
export class ValueSet<T extends { toString(): string }> {
  private readonly inner: Map<string, T>;

  constructor(values: Iterable<T>) {
    const map = new Map<string, T>();
    for (const value of values) {
      map.set(value.toString(), value);
    }
    this.inner = map;
  }

  has(value: T): boolean {
    return this.inner.has(value.toString());
  }

  get size(): number {
    return this.inner.size;
  }

  values(): MapIterator<T> {
    return this.inner.values();
  }

  [Symbol.iterator](): MapIterator<T> {
    return this.inner.values();
  }
}
