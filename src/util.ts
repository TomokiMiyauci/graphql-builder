export function memo<T, V>(
  originalGetter: () => V,
  context: ClassGetterDecoratorContext<T, V>,
) {
  const cacheKey = Symbol(`memo_${String(context.name)}`);

  return function (this: any): V {
    if (cacheKey in this) {
      return this[cacheKey];
    }

    const result = originalGetter.call(this);

    this[cacheKey] = result;

    return result;
  };
}
