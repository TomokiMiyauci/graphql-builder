export function evolve<
  T extends object,
  E extends { [k in keyof T]: unknown } = T,
>(
  data: T,
  mapper: Mapper<T, E>,
): E {
  const out: T = { ...data };

  for (const [key, value] of Object.entries(mapper)) {
    if (key in out) {
      if (typeof value === "function") {
        out[key] = value(data[key]);
      }
    }
  }

  return out as any;
}

export type Mapper<
  Input extends object,
  Output extends { [k in keyof Input]: unknown },
> =
  & {
    [k in keyof Input]?: (arg: Input[k]) => Output[k];
  }
  & {
    [k in keyof Input as Input[k] extends Output[k] ? never : k]: unknown;
  };
