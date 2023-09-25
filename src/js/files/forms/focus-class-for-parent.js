export function initInputFocusTracking(root = document) {
	const nodes = root.querySelectorAll("[data-focus-receiver]");
	nodes.forEach((node) => {
		const focusIndicator = node.closest("[data-focus-indicator]");
		if (focusIndicator) {
			node.addEventListener("focus", (e) => {
				focusIndicator.classList.add("focus");
			});
			node.addEventListener("blur", (e) => {
				focusIndicator.classList.remove("focus");
			});
		}
	});
}
export function initRadioCheckTracking(root = document) {
	const elems = root.querySelectorAll("[data-selectable]");
	let checked = {};
	elems.forEach((elem) => {
		const indicator = elem.closest("[data-selectable-indicator]");
		const formName = elem.form?.getAttribute("name") || "";
		const name = elem.name;
		if (indicator) {
			if (elem.checked) {
				indicator.classList.add("checked");
				checked[`${formName}__${name}`] = indicator;
			}
			elem.addEventListener("change", (event) => {
				if (event.currentTarget.checked) {
					indicator.classList.add("checked");
					if (checked[`${formName}__${name}`] === undefined) {
						checked[`${formName}__${name}`] = indicator;
					} else if (checked[`${formName}__${name}`] !== indicator) {
						checked[`${formName}__${name}`].classList.remove("checked");
						checked[`${formName}__${name}`] = indicator;
					}
				}
			});
		}
	});
}
export function initInputCheckTracking(root = document) {
	const nodes = root.querySelectorAll("[data-checkable]");
	nodes.forEach((node) => {
		const indicator = node.closest("[data-checkable-indicator]");
		if (indicator) {
			if (node.checked) {
				indicator.classList.add("checked");
			}
			node.addEventListener("change", (e) => {
				if (e.currentTarget.checked) {
					indicator.classList.add("checked");
				} else {
					indicator.classList.remove("checked");
				}
			});
		}
	});
}
export function initContextOpen(root = document) {
	const elems = root.querySelectorAll("[data-context-open]");
	elems.forEach((elem) => {
		const contextRootElem = elem.closest("[data-context]");
		let isOpenByClick = false;
		if (contextRootElem) {
			elem.addEventListener("pointerdown", (event) => {
				if (event.touches && event.touches.length > 1) return;
				if (event.buttons !== 1) return;
				contextRootElem.classList.toggle("open");
				if (contextRootElem.classList.contains("open")) isOpenByClick = true;
				addOutsideClickListener();
				event.__openContextWindow = true;
			});
			elem.addEventListener("mouseenter", (event) => {
				if (isOpenByClick) return;
				isOpenByClick = false;
				contextRootElem.classList.add("open");
				addOutsideClickListener();
			});
			elem.addEventListener("mouseleave", (event) => {
				if (!isOpenByClick) contextRootElem.classList.remove("open");
			});
		}
		function addOutsideClickListener() {
			document.addEventListener("pointerdown", function poinerDownHandler(event) {
				if (event.__openContextWindow) return;
				isOpenByClick = false;
				contextRootElem.classList.remove("open");
				document.removeEventListener("pointerdown", poinerDownHandler);
			})
		}
	});
	
}