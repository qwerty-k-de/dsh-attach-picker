# dsh-attach-picker

给 DeepSeek Harness Web 输入框工具栏加一个**图片按钮**：点击打开**系统文件选择器**挑一张或多张图片，不用拖拽也不用粘贴。选中的图片会进入和拖拽/粘贴相同的「草稿图片」栏，随消息一起发送，和普通附件完全一致。

## 功能

- 输入框工具栏一键图片按钮（挂在 `conversation.input.left` 槽）
- 原生系统文件选择器，支持多选，自动过滤宿主支持的图片格式
- 遵守宿主的 `imageLimits` 限制：图片格式、单条消息最大张数、单张大小上限，超限会有内联错误提示（如「一条消息最多 N 张图片」「单张图片不能超过 X MB」）
- 与拖拽使用同一条 `conversation.createDraftImages` / `inputActions.addImages` 管线，其它地方无需任何特殊处理
- 纯浏览器侧实现，零依赖，体积小

## 安装

npm 安装（推荐，免构建授权）：

```sh
dsh plugin --profile web add dsh-attach-picker
```

GitHub 安装：

```sh
dsh plugin --profile web add github:qwerty-k-de/dsh-attach-picker
```

重启 `dsh web`（或刷新页面，热更新时即时生效）。

## 使用

1. 在 DSH Web 里打开一个会话。
2. 点击输入框工具栏的图片按钮——系统文件选择器弹出。
3. 选择一张或多张图片，它们会出现在草稿图片栏。
4. 发送消息，图片与普通附件一样被发送。

请求进行中时按钮会自动禁用。

## 原理

- 通过 `package.json` 的 `dsh.client`（`platform: "web"`，`exports["./client"]`）注册为客户端插件。
- 注入到输入框槽 `conversation.input.left`，`order: -50`。
- 选中文件后：先从宿主投影 `imageLimits`（`mediaTypes`、`maxImagesPerMessage`、`maxImageBytes`）读取限制；成功后调用 `conversation.createDraftImages(files)` 再 `inputActions.addImages(...)`。
- Node 侧（`lib/index.js`）有意留空——全部逻辑在浏览器端。

## 截图

市场（如 [dsh-market](https://github.com/dsh-market/dsh-market#readme)）以 App Store 风格展示截图。请在本仓库声明：

```jsonc
// screenshots.json
["assets/screenshot-1.png", "assets/screenshot-2.png"]
```

（1–8 张；路径相对该文件、不得跳出本仓库。不声明时市场会退回到从本 README 提取图片。）

## 要求

- DSH Web（`dsh web`）需带标准 conversation / slots 客户端服务——当前 0.1.0-rc+ 版本均可。
- 无运行时依赖。

## 许可

MIT