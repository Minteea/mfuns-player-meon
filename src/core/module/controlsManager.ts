import Player from "@/player";
import { ControlsPlugin, ControlsItem, UIOptionsItem } from "../plugin";
import { PlayerHookMap } from "../types";

export default class ControlsManager {
  protected list = new Map<string, ControlsItem>();
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }
  /** 注册控制组件 */
  register(name: string, controls: ControlsItem | (new (player: Player) => ControlsItem)) {
    this.list.set(name, typeof controls == "function" ? this.build(controls) : controls);
  }

  /** 移除控制组件 */
  unregister<T extends keyof PlayerHookMap>(name: T) {
    this.list.delete(name);
  }

  /** 获取控制组件 */
  get(item: UIOptionsItem<ControlsItem>): ControlsItem | undefined {
    let controls: ControlsItem | undefined;
    switch (typeof item) {
      case "object":
        controls = item;
        break;
      case "function":
        controls = this.build(item);
        break;
      default:
        controls = this.list.get(item);
        break;
    }
    return controls?.ignored ? undefined : controls;
  }

  /** 创建控制组件 */
  build(func: new (player: Player) => ControlsItem) {
    const controls = new func(this.player);
    controls.init?.(this.player);
    controls.ready?.(this.player);
    controls.mounted?.(this.player);
    return controls;
  }
}