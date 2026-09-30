window.__ModuleLoader__.load({
	id: "dsh-attach-picker",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");
		const jsxRuntime = require("react/jsx-runtime");
		const jsx = jsxRuntime.jsx;
		const jsxs = jsxRuntime.jsxs;

		/** Build marker: lets a run be identified from the DOM (`data-dsh-attach-picker`). */
		const BUILD_ID = "0.1.2";

		//#region style
		const CSS = [
			".dshAttachPicker{display:inline-flex;align-items:center;gap:6px}",
			".dshAttachPicker_file{display:none}",
			".dshAttachPicker_btn{background:var(--dsw-specific-selector);width:28px;height:28px;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:999px;flex:none;place-items:center;display:grid;padding:0}",
			".dshAttachPicker_btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-solid)}",
			".dshAttachPicker_btn:focus-visible{outline:2px solid var(--dsw-alias-label-secondary);outline-offset:2px}",
			".dshAttachPicker_btn:disabled{opacity:.5;cursor:default}",
			".dshAttachPicker_note{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
		].join("");
		const TAG_ID = "dsh-attach-picker/style";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(TAG_ID) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-attach-picker";
			tag.dataset.pluginCss = TAG_ID;
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region helpers
		/** Human-readable byte size for a limit message. */
		function sizeText(bytes) {
			if (typeof bytes !== "number" || !isFinite(bytes)) return "";
			const mb = bytes / (1024 * 1024);
			return (mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10) + " MB";
		}

		/** How the current build reaches the composer's draft-attachment rail. */
		function pipelineOf(conversation, inputActions, addFiles) {
			const documents = conversation !== undefined
				&& typeof conversation.createDrafts === "function"
				&& inputActions !== undefined
				&& typeof inputActions.addAttachments === "function";
			if (documents) return "drafts";
			if (typeof addFiles === "function") return "addFiles";
			if (inputActions !== undefined && typeof inputActions.addImages === "function") return "legacy";
			return "none";
		}

		/** Picture glyph matching the composer's 14px icon chrome. */
		function PickerIcon() {
			return jsxs("svg", {
				width: 15,
				height: 15,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				children: [
					jsx("rect", { x: 2.2, y: 3.2, width: 11.6, height: 9.6, rx: 2.2, stroke: "currentColor", strokeWidth: 1.35 }),
					jsx("circle", { cx: 5.9, cy: 6.5, r: 1.05, fill: "currentColor" }),
					jsx("path", { d: "M3 11.6 6.1 8.6l2.2 2.1 2.1-1.9 2.6 2.5", stroke: "currentColor", strokeWidth: 1.35, strokeLinecap: "round", strokeLinejoin: "round" })
				]
			});
		}
		//#endregion

		//#region plugin
		/** Required services: the composer slot registry plus the conversation service that owns draft attachments. */
		const inject = ["slots", "conversation"];

		/**
		 * Client plugin body: put a native file-picker button in the composer tool row.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			/**
			 * Composer tool-row entry: opens the OS file dialog and feeds the chosen
			 * files into the same draft-attachment rail that drag-and-drop fills.
			 *
			 * The slot's published contract (`conversation.input.left`: list, session
			 * scope, no owner props) hands a renderer the standard kit — `useInput`,
			 * `inputActions`, `sessionId`, `useProjection` — so the draft rail is filled
			 * with `conversation.createDrafts(sessionId, files)` followed by
			 * `inputActions.addAttachments(ids)`. The parent composer bar's own
			 * `addFiles` verb is used only as a fallback when that pair is absent, and the
			 * legacy `createDraftImages` / `addImages` pair covers the 0.1 host.
			 *
			 * @param props - the session standard kit.
			 */
			function AttachPicker(props) {
				const addFiles = props.addFiles;
				const sessionId = props.sessionId;
				const inputActions = props.inputActions;
				const useInput = props.useInput;
				const useProjection = props.useProjection;
				const state = props.input;
				const fileRef = react.useRef(null);
				const timerRef = react.useRef(0);
				const [notice, setNotice] = react.useState(null);
				react.useEffect(() => () => {
					if (timerRef.current !== 0) clearTimeout(timerRef.current);
				}, []);
				const limits = typeof useProjection === "function" ? useProjection("imageLimits") : undefined;
				const projectedInput = typeof useInput === "function" && state === undefined ? useInput((s) => s) : undefined;
				const live = state !== undefined ? state : projectedInput;
				const conversation = ctx.get("conversation");
				const pipeline = pipelineOf(conversation, inputActions, addFiles);
				const busy = live !== undefined && typeof live.phase === "string" && live.phase !== "plain";
				const disabled = pipeline === "none" || busy;

				const flash = (text) => {
					setNotice(text);
					if (timerRef.current !== 0) clearTimeout(timerRef.current);
					timerRef.current = setTimeout(() => setNotice(null), 4000);
				};

				const openPicker = () => {
					const el = fileRef.current;
					if (el === null) return;
					el.value = "";
					el.click();
				};

				const onChange = (event) => {
					const files = Array.prototype.slice.call(event.target.files || []);
					event.target.value = "";
					if (files.length === 0) return;
					if (pipeline === "none") {
						flash("当前 DSH 版本不支持该操作");
						return;
					}
					if (limits !== undefined) {
						const types = Array.isArray(limits.mediaTypes) ? limits.mediaTypes : [];
						const badType = files.find((file) => !types.includes(file.type));
						if (badType !== undefined) {
							flash("不支持的图片格式：" + (badType.type || badType.name));
							return;
						}
						const heldIds = live !== undefined && Array.isArray(live.attachmentIds) ? live.attachmentIds : [];
						const held = live !== undefined && Array.isArray(live.attachments) ? live.attachments : [];
						const heldImages = held.filter((attachment) => attachment !== null && typeof attachment === "object" && attachment.kind === "image");
						const currentImages = heldImages.length > 0 ? heldImages.length : heldIds.length;
						if (typeof limits.maxImagesPerMessage === "number" && currentImages + files.length > limits.maxImagesPerMessage) {
							flash("一条消息最多 " + limits.maxImagesPerMessage + " 张图片");
							return;
						}
						const tooBig = files.find((file) => file.size > limits.maxImageBytes);
						if (tooBig !== undefined) {
							flash("单张图片不能超过 " + sizeText(limits.maxImageBytes));
							return;
						}
					}
					try {
						// DSH 0.2 public path: draft descriptors from the conversation service,
						// then the shell action that owns draft admission.
						if (pipeline === "drafts") {
							const drafts = conversation.createDrafts(sessionId, files);
							if (!inputActions.addAttachments(drafts.map((draft) => draft.id))) {
								conversation.releaseDraftAttachments(drafts);
								flash("当前状态无法添加图片，请稍后再试");
							}
							return;
						}
						// Fallback: the parent composer entry's own intake.
						if (pipeline === "addFiles") {
							const rejected = addFiles(files, new Set());
							if (typeof rejected === "string" && rejected !== "") flash(rejected);
							return;
						}
						// Legacy 0.1 path.
						if (conversation === undefined || typeof conversation.createDraftImages !== "function") {
							flash("当前 DSH 版本不支持该操作");
							return;
						}
						const images = conversation.createDraftImages(files);
						if (!inputActions.addImages(images.map((image) => image.id))) {
							if (typeof conversation.releaseDraftImages === "function") conversation.releaseDraftImages(images);
							flash("当前状态无法添加图片，请稍后再试");
						}
					} catch (error) {
						flash(error instanceof Error ? error.message : String(error));
					}
				};
				const types = limits !== undefined && Array.isArray(limits.mediaTypes) ? limits.mediaTypes : [];
				const accept = types.length > 0 ? types.join(",") : "image/*";

				return jsxs("span", {
					className: "dshAttachPicker",
					"data-dsh-attach-picker": BUILD_ID + ":" + pipeline,
					children: [
						jsx("input", {
							ref: fileRef,
							type: "file",
							accept: accept,
							multiple: true,
							className: "dshAttachPicker_file",
							tabIndex: -1,
							onChange: onChange
						}),
						jsx("button", {
							type: "button",
							className: "dshAttachPicker_btn",
							disabled: disabled,
							title: "选择图片上传（也可继续拖拽或粘贴）",
							"aria-label": "选择图片上传",
							onMouseDown: (event) => event.preventDefault(),
							onClick: openPicker,
							children: jsx(PickerIcon, {})
						}),
						notice === null ? null : jsx("span", {
							className: "dshAttachPicker_note",
							role: "status",
							title: notice,
							children: notice
						})
					]
				});
			}

			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "attach-picker",
				order: -50,
				label: "选择图片上传"
			}, AttachPicker));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
