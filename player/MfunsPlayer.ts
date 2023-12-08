import Player from "@/index";
import { PlayerOptions } from "@/types";
import DanmakuList from "../plugins/danmakuList";
import DanmakuBar from "@/plugins/danmakuBar";
import { ButtonWebfull } from "@/plugins/controls";
import Danmaku from "@/plugins/danmaku";
import ButtonDanmakuToggle from "@/plugins/controls/button/ButtonDanmakuToggle";
import ButtonDanmakuSettings from "@/plugins/controls/button/ButtonDanmakuSettings";
import Hotkeys from "@/plugins/panels/hotkeys";
import About from "@/plugins/panels/about";
import { presetBasic } from "../plugins/presets";
import AutoPart from "@/plugins/playSettings/autoPart";
import AutoPlay from "@/plugins/playSettings/autoPlay";
import Theme from "@/plugins/theme";
import Part from "@/plugins/part";
import Seamless from "@/plugins/seamless";
import PartList from "@/plugins/panels/partList";
import ButtonDanmakulist from "@/plugins/controls/button/ButtonDanmakulist";
import ButtonQuality from "@/plugins/controls/button/ButtonQuality";
import Quality from "@/plugins/quality";

/** 预设插件 */
const plugins = [
  Part,
  Seamless,
  Danmaku,
  DanmakuBar,
  DanmakuList,
  AutoPlay,
  AutoPart,
  Theme,
  Quality,
];
const controls = [
  ButtonWebfull,
  ButtonDanmakuToggle,
  ButtonDanmakuSettings,
  ButtonDanmakulist,
  ButtonQuality,
];
const panels = [About, Hotkeys, PartList];

/** MfunsPlayer 标准版播放器
 *
 * 插件功能：快捷键、右键菜单、弹幕栏、弹幕列表
 */
export default class MfunsPlayer extends Player {
  constructor(config: PlayerOptions) {
    super(
      presetBasic({
        autoPart: true,
        ...config,
        plugins: [...plugins, ...panels, ...controls, ...(config.plugins || [])],
      })
    );
  }
}
