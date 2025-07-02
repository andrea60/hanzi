import {
  FieldValue,
  WithFieldValue,
  PartialWithFieldValue,
} from "firebase/firestore";

// Custom guard since Firestore doesn’t export one officially
function isFirestoreFieldValue(value: unknown): value is FieldValue {
  return typeof value === "object" && value !== null && "_methodName" in value;
}

// T = App type (e.g., with Date)
// F = Firestore type (e.g., with Timestamp)
export function safeToFirestore<T extends object, F extends object>(
  input: WithFieldValue<T> | PartialWithFieldValue<T>,
  transformers: Partial<{ [K in keyof F]: (value: T) => F[K] }>
): F {
  const output = {} as Partial<F>;

  for (const key in input) {
    const value = input[key as keyof typeof input];

    if (value === undefined || isFirestoreFieldValue(value)) continue;

    const transform = transformers[key as keyof typeof transformers];
    output[key as keyof F] = transform
      ? transform(value as any)
      : (value as any);
  }

  return output as F;
}
