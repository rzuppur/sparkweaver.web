export class ArrayReader {
  private head: number = 0;

  constructor(
    private readonly bytes: Uint8Array,
  ) {}

  public position(): number { return this.head; }
  public hasByte(): boolean { return this.head < this.bytes.length; }
  public hasShort(): boolean { return this.head + 1 < this.bytes.length; }
  public hasBytes(count: number): boolean { return this.head + count - 1 < this.bytes.length; }

  public readByte() {
    if (!this.hasByte()) return 0;
    return this.bytes[this.head++];
  }

  public readShort() {
    if (!this.hasShort()) return 0;
    const lsb = this.readByte();
    const msb = this.readByte();
    return (msb << 8) | lsb;
  }
}
