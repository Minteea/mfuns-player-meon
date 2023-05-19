import { PlayerOptions, VideoPart, VideoSource } from "@/types"
import MfunsPlayer from "@/player"
import VideoLoader from "./Loader"

export default class Video {
  /** 播放器主体 */
  player: MfunsPlayer
  /** video对象 */
  el: HTMLVideoElement
  /** 视频加载模块 */
  loader: VideoLoader
  /** 视频分P列表 */
  list: VideoPart[]
  /** 当前视频分P */
  private currentPart: number
  /** 视频宽高比 */
  scale: [number, number] | null = null

  constructor(player: MfunsPlayer, options: PlayerOptions) {
    this.player = player
    this.el = this.player.template.$video
    this.loader = new VideoLoader(this)
    this.list = options.video.list
    this.currentPart = options.video.part || 1

    this.initEvent()
  }

  /** 加载分P */
  async setPart(p: number, play = false) {
    this.currentPart = p
    const currentVideo = this.list[p - 1]
    // 目前播放器仅支持单一来源播放，故只选取第一个播放源
    this.loader.load(currentVideo.src[0])
    this.player.events.trigger("part_change", p)
    this.seek(0)
    if (play) {
      this.play()
    } else {
      this.player.template.el.classList.add("state-paused")
    }
  }

  /** 视频分P */
  get part() {
    return this.currentPart
  }

  /** 播放 */
  public play() {
    this.el.play()
  }

  /** 暂停 */
  public pause() {
    this.el.pause()
  }
  /** 上一P */
  public prev() {
    if (this.currentPart > 1) this.setPart(this.currentPart - 1, true)
  }
  /** 下一P */
  public next() {
    if (this.currentPart < this.list.length) this.setPart(this.currentPart + 1, true)
    this.play()
  }

  /** 跳转 */
  public seek(value: number) {
    this.el.currentTime = value > 0 ? (value < this.el.duration ? value : this.el.duration) : 0
  }

  /** 设置音量 */
  public setVolume(value: number) {
    this.el.volume = value > 0 ? (value < 1 ? value : 1) : 0
  }

  /** 设置倍速 */
  public setRate(value: number) {
    this.el.playbackRate = value
  }

  /** 设置循环播放 */
  public setLoop(flag: boolean) {
    this.el.loop = flag
    this.player.events.trigger(flag ? "loop" : "loop_off")
  }

  /** 静音 */
  public mute(flag = true) {
    this.el.muted = flag
  }

  /** 保持视频宽高比 */
  public rescale() {}

  get muted(): boolean {
    return this.el.muted
  }

  get rate(): number {
    return this.el.playbackRate
  }

  get loop(): boolean {
    return this.el.loop
  }

  get volume(): number {
    return this.el.volume
  }

  get paused(): boolean {
    return this.el.paused
  }

  get duration(): number {
    return this.el.duration
  }

  get buffered(): TimeRanges {
    return this.el.buffered
  }

  get currentTime(): number {
    return this.el.currentTime
  }

  /** 监听视频事件 */
  public on<K extends keyof HTMLVideoElementEventMap>(
    type: K,
    listener: (this: HTMLVideoElement, ev: HTMLVideoElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.el.addEventListener(type, listener, options)
  }

  /** 移除视频事件 */
  public off<K extends keyof HTMLVideoElementEventMap>(
    type: K,
    listener: (this: HTMLVideoElement, ev: HTMLVideoElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void {
    this.el.removeEventListener(type, listener, options)
  }

  private initEvent() {
    this.on("play", () => {
      this.player.events.trigger("play")
      this.player.template.el.classList.remove("state-paused")
    })
    this.on("pause", () => {
      this.player.events.trigger("pause")
      this.player.template.el.classList.add("state-paused")
    })
    this.on("volumechange", () => {
      this.player.events.trigger("volume_change", this.volume)
    })
    this.on("ratechange", () => {
      this.player.events.trigger("rate_change", this.rate)
    })
  }
}
