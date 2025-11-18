import { logBus } from "$lib/bus/log.bus";
import { LogMessageType } from "$lib/model/log.model";
import type { UiToolbars } from "$lib/model/ui.model";
import { uiStorePrivate as store } from "$lib/store/ui.store";

class UiService {
  private readonly UI_TOOLBARS_KEY = "sw_toolbars";

  constructor() {
    // Load saved toolbar state
    const toolbars = localStorage.getItem(this.UI_TOOLBARS_KEY);
    if (toolbars) {
      try {
        store.set(new Set(JSON.parse(toolbars)));
      } catch {
        localStorage.removeItem(this.UI_TOOLBARS_KEY);
      }
    }

    // Save toolbar state changes
    store.subscribe(toolbars => {
      localStorage.setItem(this.UI_TOOLBARS_KEY, JSON.stringify([...toolbars.keys()]));
    });

    // Log messages from bus
    logBus.subscribe(() => {
      for (const logMessage of logBus.consume()) {
        if (logMessage.type <= LogMessageType.DEBUG) this.logDebug(logMessage.message);
        else if (logMessage.type <= LogMessageType.INFO) this.alertInfo(logMessage.message);
        else this.alertError(logMessage.message);
      }
    });
  }

  public setToolbar(toolbar: UiToolbars, visible: boolean): void {
    store.update(toolbars => {
      if (visible) toolbars.add(toolbar);
      else toolbars.delete(toolbar);
      return toolbars;
    });
  }

  public async confirm(message: string): Promise<boolean> {
    return window.confirm(message);
  }

  private logDebug(message: string): void {
    const [from, ...text] = message.split(": ");
    console.debug(
      `%c${from}%c ${text.join(": ")}`,
      "background: #444; color: #ddd; border-radius: 0.3em; font-size: 0.9em; padding: 0 0.3em; font-family: sans-serif; font-weight: 700",
      "color: #999",
    );
  }

  private alertInfo(message: string): void {
    const [from, ...text] = message.split(": ");
    console.info(
      `%c${from}%c ${text.join(": ")}`,
      "background: #38a; color: #fff; border-radius: 0.3em; font-size: 0.9em; padding: 0 0.3em; font-family: sans-serif; font-weight: 700",
      "",
    );
  }

  private alertError(message: string): void {
    const [from, ...text] = message.split(": ");
    console.log(
      `%c${from}%c ${text.join(": ")}`,
      "background: #a33; color: #fff; border-radius: 0.3em; font-size: 0.9em; padding: 0 0.3em; font-family: sans-serif; font-weight: 700",
      "color: #f99",
    );
    window.alert(message);
  }
}

export const uiService = new UiService();
