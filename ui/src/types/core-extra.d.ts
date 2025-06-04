// noinspection ES6UnusedImports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { MainModule } from "$assets/core";

declare module "../assets/core" {
  export interface EmbindModule {
    tick(): Uint8Array;
  }
}
