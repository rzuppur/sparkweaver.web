import { readonly, writable } from "svelte/store";

type UiToolbars = "bluetooth" | "simulation" | "debug";

export class UiService {
  private readonly UI_TOOLBARS_KEY = "sw_toolbars";

  private readonly _toolbarsVisible = writable<Set<UiToolbars>>(new Set(["bluetooth", "simulation"]));
  public readonly toolbarsVisible = readonly(this._toolbarsVisible);

  public inject(): void {
  }

  public init(): void {
    const toolbars = localStorage.getItem(this.UI_TOOLBARS_KEY);
    if (toolbars) {
      try {
        this._toolbarsVisible.set(new Set(JSON.parse(toolbars)));
      } catch {
        localStorage.removeItem(this.UI_TOOLBARS_KEY);
      }
    }
    this._toolbarsVisible.subscribe(toolbars => {
      localStorage.setItem(this.UI_TOOLBARS_KEY, JSON.stringify([...toolbars.keys()]));
    });
  }

  public setToolbar(toolbar: UiToolbars, visible: boolean): void {
    this._toolbarsVisible.update(toolbars => {
      if (visible) toolbars.add(toolbar);
      else toolbars.delete(toolbar);
      return toolbars;
    });
  }

  public alertInfo(message: string): void {
    console.log("[INFO]", message);
  }

  public alertError(message: string): void {
    console.log("[ERROR]", message);
    window.alert(message);
  }
}
