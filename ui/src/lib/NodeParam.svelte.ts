import { isUnsignedShort } from "$lib/utils";

export class NodeParam {
  protected _value: number = $state(0);

  constructor(
    public readonly name: string,
    public readonly min: number,
    public readonly max: number,
    public readonly defaultValue: number,
  ) {
    if (!isUnsignedShort(min)) throw new Error("min is not u16");
    if (!isUnsignedShort(max)) throw new Error("max is not u16");
    if (!isUnsignedShort(defaultValue)) throw new Error("default_value is not u16");
    if (defaultValue < min || defaultValue > max) throw new Error("default_value is out of range");
    this._value = defaultValue;
  }

  public get value(): number {
    return this._value;
  };

  public set value(value: number) {
    if (!isUnsignedShort(value)) throw new Error("value is not u16");
    if (value < this.min || value > this.max) throw new Error("value is out of range");
    this._value = value;
  }
}
