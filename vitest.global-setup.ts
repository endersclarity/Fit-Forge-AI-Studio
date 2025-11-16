export default async function globalSetup() {
  if (!Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'resizable')) {
    Object.defineProperty(ArrayBuffer.prototype, 'resizable', {
      configurable: true,
      enumerable: false,
      get() {
        return false;
      },
    });
  }

  if (typeof globalThis.SharedArrayBuffer === 'undefined') {
    class SharedArrayBufferPolyfill {
      constructor(_length = 0) {}
    }
    // @ts-expect-error - assign to Node global
    globalThis.SharedArrayBuffer = SharedArrayBufferPolyfill;
  }

  const sabPrototype = globalThis.SharedArrayBuffer.prototype as Record<string, unknown>;

  if (!Object.getOwnPropertyDescriptor(sabPrototype, 'growable')) {
    Object.defineProperty(sabPrototype, 'growable', {
      configurable: true,
      enumerable: false,
      get() {
        return false;
      },
    });
  }

  if (!Object.getOwnPropertyDescriptor(sabPrototype, 'byteLength')) {
    Object.defineProperty(sabPrototype, 'byteLength', {
      configurable: true,
      enumerable: false,
      get() {
        return 0;
      },
    });
  }
}
