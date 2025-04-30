import type { MainModule } from "../assets/core";

declare module "../assets/core" {
  export interface EmbindModule {
    tick(): Uint8Array;
  }
}
