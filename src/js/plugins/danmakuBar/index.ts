import type { DanmakuSendItem } from "@/plugins/danmaku/types";
import { keyCode } from "@/utils/KeyCode.enum";
import { PlayerOptions } from "@/types";
import Player from "@/player";
import { classPrefix } from "@/config";
import { html, render } from "lit-html";
import ButtonDanmakuStyle from "./ButtonDanmakuStyle";
import Controller from "../ui/controller";
import { BasePlugin } from "@/plugin";
import { createElement } from "@/utils";
import Danmaku from "../danmaku";

const template = html`
  <div class="${classPrefix}-danmakubar">
    <div class="${classPrefix}-danmakubar-slot"></div>
    <div class="${classPrefix}-danmakubar-input-wrap">
      <div class="${classPrefix}-danmakubar-input-slot"></div>
      <input type="text" autocompleted="new-password" class="${classPrefix}-danmakubar-input" />
      <!-- 
      <div class="${classPrefix}-danmakubar-status-loading">弹幕功能加载中...</div>
      <div class="${classPrefix}-danmakubar-status-login">需要登录后才能发送弹幕哦~</div>
      -->
      <div class="${classPrefix}-danmakubar-send">发送</div>
    </div>
  </div>
`;

declare module "@/types" {
  interface PlayerOptions {
    /** 弹幕栏设置 */
    danmakuBar?: {
      /** 占位文本 */
      placeholder?: string;
      /** 选色列表 */
      colorList?: string[];
      /** 字号列表 */
      fontSizeList?: [number, string][];
      /** 弹幕模式列表 */
      modeList?: number[];
    };
  }
  interface PluginExports {
    danmakuBar?: DanmakuBar;
  }
}

export default class DanmakuBar extends BasePlugin {
  static pluginName = "danmakuBar";
  buttonDanmakuStyle: ButtonDanmakuStyle;

  $wrap: HTMLElement;
  $el: HTMLElement;

  $send: HTMLElement;
  $input: HTMLInputElement;
  $slot: HTMLElement;
  $inputSlot: HTMLElement;

  controller: Controller;
  danmaku: Danmaku;

  danmakuColor = 16777215;
  danmakuMode = 1;
  danmakuFontSize = 25;

  /** 冷却计时器 */
  coolDownTimer = 0;

  constructor(player: Player, options: PlayerOptions) {
    super(player);
    this.controller = this.plugin.controller!;
    this.danmaku = this.plugin.danmaku!;
    this.$wrap = this.player.$el.appendChild(
      createElement("div", { class: `${classPrefix}-danmakubar-wrap mpui-background` })
    );

    render(template, this.$wrap);
    this.$el = this.$wrap.querySelector(`.${classPrefix}-danmakubar`)!;
    this.$send = this.$el.querySelector(`.${classPrefix}-danmakubar-send`)!;
    this.$input = this.$el.querySelector(`.${classPrefix}-danmakubar-input`)!;
    this.$slot = this.$el.querySelector(`.${classPrefix}-danmakubar-slot`)!;
    this.$inputSlot = this.$el.querySelector(`.${classPrefix}-danmakubar-input-slot`)!;

    this.buttonDanmakuStyle = new ButtonDanmakuStyle(this, this.$inputSlot, options);

    this.player.on("fullscreen:exit", () => {
      this.moveToWrap();
    });
    this.player.on("webscreen:exit", () => {
      this.moveToWrap();
    });
    this.player.on("fullscreen:enter", () => {
      requestAnimationFrame(() => {
        this.moveToController();
      });
    });
    this.player.on("webscreen:enter", () => {
      requestAnimationFrame(() => {
        this.moveToController();
      });
    });
    this.$input.addEventListener("keydown", (e) => {
      if (e.keyCode == keyCode.Enter) {
        this.send();
      }
    });
    this.$send.onclick = () => {
      this.send();
    };

    this.setPlaceHolder(options.danmakuBar?.placeholder || defaultPlaceholder);
  }
  private moveToWrap() {
    this.$wrap.appendChild(this.$el);
    this.controller.$center.classList.remove("state-bar");
  }
  private moveToController() {
    this.controller.$center.appendChild(this.$el);
    this.controller.$center.classList.add("state-bar");
  }
  setPlaceHolder(placeholder: string) {
    this.$input.placeholder = placeholder;
  }
  /** 执行弹幕发送操作 */
  private send() {
    // 如果内容为空或只有空格，则不进行发送操作
    if (!this.$input.value.trim() || this.coolDownTimer) return;
    this.danmaku.operate.send(this.generateDanmaku());
    this.$input.value = "";
  }
  /** 设置弹幕发送冷却 */
  public setCoolDown(time: number) {
    if (this.coolDownTimer) {
      window.clearInterval(this.coolDownTimer);
    }
    let t = Math.round(time);
    this.$send.classList.add("state-disabled");
    this.$send.innerText = `${t}秒`;
    this.coolDownTimer = window.setInterval(() => {
      t -= 1;
      if (t) {
        this.$send.innerText = `${t}秒`;
      } else {
        this.$send.innerText = "发送";
        this.$send.classList.remove("state-disabled");
        window.clearInterval(this.coolDownTimer);
        this.coolDownTimer = 0;
      }
    }, 1000);
  }
  generateDanmaku(): DanmakuSendItem {
    return {
      time: this.player.time,
      content: this.$input.value,
      mode: this.danmakuMode,
      color: this.danmakuColor,
      size: this.danmakuFontSize,
    };
  }
}

const defaultPlaceholder = "发条弹幕吧~";