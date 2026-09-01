/**
 * Node 半边：本插件只贡献浏览器 UI，宿主侧留一个空 apply，
 * 浏览器半边通过 package.json 的 exports["./client"] + dsh.client 提供。
 */
export function apply() {}
