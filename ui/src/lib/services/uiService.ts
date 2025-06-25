import { readonly, writable } from "svelte/store";

type UiTab = "nodes" | "bluetooth" | "debug";

class UiService {
  private readonly UI_TAB_KEY = "sw_ui_tab";

  private readonly _tab = writable<UiTab>(this.getSavedTab());
  public readonly tab = readonly(this._tab);

  private getSavedTab(): UiTab {
    const tab = localStorage.getItem(this.UI_TAB_KEY);
    if (typeof tab === "string" && ["nodes", "simulation", "bluetooth", "debug"].includes(tab)) return tab as UiTab;
    return "nodes";
  }

  public changeTab(newTab: UiTab): void {
    if (newTab) localStorage.setItem(this.UI_TAB_KEY, newTab);
    else localStorage.removeItem(this.UI_TAB_KEY);
    this._tab.set(newTab);
  }

  public alertInfo(message: string): void {
    console.log("[INFO]", message);
  }

  public alertError(message: string): void {
    console.log("[ERROR]", message);
    window.alert(message);
  }
}

export const uiService = new UiService();
export const uiTab = uiService.tab;
