export class Uint8Vector {
  private buffer;
  private _length = 0;
  public get length(): number { return this._length; }

  constructor(value: Array<number> = []) {
    this.buffer = new Uint8Array(Math.max(value.length, 8));
    this.buffer.set(value);
    this._length = value.length;
  }

  public at(index: number): number {
    if (index < 0 || index >= this.length) throw new RangeError(`Invalid vector index: ${index}, length ${this.length}`);
    return this.buffer.at(index)!;
  }

  public get(): Uint8Array {
    return this.buffer.subarray(0, this._length);
  }

  public pushBack(element: number): void {
    if (this.buffer.length === this._length) {
      const buffer = new Uint8Array(this.buffer.length * 2);
      buffer.set(this.buffer);
      this.buffer = buffer;
    }
    this.buffer[this._length++] = element;
  }

  public clear(): void {
    this._length = 0;
  }

  public toString(): string {
    return btoa(String.fromCharCode(...this.get()));
  }

  public toJSON(): string {
    return this.toString();
  }

  public static fromString(string: string): Uint8Vector {
    return new Uint8Vector([...atob(string)].map(c => c.charCodeAt(0)));
  }

  public equalTo(other: Uint8Vector): boolean {
    if (this.length !== other.length) return false;
    for (let i = 0; i < this.length; i++) {
      if (this.at(i) !== other.at(i)) return false;
    }
    return true;
  }

  public clone(): Uint8Vector {
    return new Uint8Vector([...this.get()]);
  }
}
