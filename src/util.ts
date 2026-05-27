export class UnoverwriteableMap<T, U> extends Map<T, U> {
  override set(key: T, value: U): this {
    if (this.has(key)) {
      throw new Error("key already exists");
    }

    return super.set(key, value);
  }
}
