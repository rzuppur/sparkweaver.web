import { readonly, writable } from "svelte/store";

type ProjectTab = "nodes" | "bluetooth" | "debug";

export class UiService {
  private readonly UI_TAB_KEY = "sw_ui_tab";

  private readonly _tab = writable<ProjectTab>(this.getSavedTab());
  public readonly tab = readonly(this._tab);

  public inject(): void {
  }

  public init(): void {
  }

  private getSavedTab(): ProjectTab {
    const tab = localStorage.getItem(this.UI_TAB_KEY);
    if (typeof tab === "string" && ["nodes", "simulation", "bluetooth", "debug"].includes(tab)) return tab as ProjectTab;
    return "nodes";
  }

  public changeTab(newTab: ProjectTab): void {
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
