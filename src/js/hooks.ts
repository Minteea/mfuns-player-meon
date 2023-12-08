import { PlayerHookMap } from "./types";

type MaybePromise<T> = T | Promise<T>;

export type HookFunction<T> = (ctx: T) => MaybePromise<void | boolean>;

export default class Hooks {
  protected hooks: Record<string, HookFunction<any>[]> = {};

  readonly customEventList: string[] = [];

  /** 注册钩子 */
  register<T extends keyof PlayerHookMap>(
    name: T,
    func: HookFunction<PlayerHookMap[T]>,
    before = false
  ) {
    let hook = this.hooks[name];
    if (!hook) {
      hook = [];
      this.hooks[name] = hook;
    }
    before ? hook.unshift(func) : hook.push(func);
  }

  /** 移除钩子 */
  unregister<T extends keyof PlayerHookMap>(name: T, func: HookFunction<PlayerHookMap[T]>) {
    let hook = this.hooks[name];
    if (!hook) {
      hook = [];
      this.hooks[name] = hook;
    }
    const index = hook.indexOf(func);
    if (index > -1) hook.splice(index, 1);
  }

  call<T extends keyof PlayerHookMap>(
    name: PlayerHookMap[T] extends void ? T : never,
    ctx: void
  ): Promise<boolean>;
  call<T extends keyof PlayerHookMap>(name: T, ctx: PlayerHookMap[T]): Promise<boolean>;
  /** 调用钩子函数 */
  async call<T extends keyof PlayerHookMap>(name: T, ctx: PlayerHookMap[T]) {
    const hook = this.hooks[name];
    if (hook?.length) {
      for (const f of hook) {
        const res = await f(ctx);
        if (res == true) {
          console.log(`钩子提前结束调用: ${name}`);
          console.log(f);
          return true;
        } else if (res == false) {
          console.log(`钩子被拦截: ${name}`);
          console.log(f);
          return false;
        }
      }
    }
    console.log(`钩子调用完毕: ${name}`);
    console.log(ctx);
    return true;
  }
}
