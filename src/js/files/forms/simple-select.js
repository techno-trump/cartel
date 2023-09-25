import _ from "lodash";

const rootClass = "simple-select";
const generateClasses = (rootClass) => {
	return {
		root: rootClass,
		mainBtn: `${rootClass}__main-btn`,
		caption: `${rootClass}__caption`,
		arrowIcon: `${rootClass}__arrow-icon`,
		options: `${rootClass}__dropdown`,
		optionsList: `${rootClass}__options-list`,
		option: `${rootClass}__option`,
		optionBtn: `${rootClass}__option-btn`,
	};
};
const defaultOptions = {
	removeSelected: false,
	rootClass,
	classes: generateClasses(rootClass),
};

const combineOptions = (userOptions) => {
	let options = {
		...defaultOptions,
		...userOptions,
	};
	if (userOptions.rootClass) {
		options.classes = generateClasses(userOptions.rootClass);
	}
	if (userOptions.classes) {
		Object.assign(options.classes, userOptions.classes);
	}
	return options;
}

export function initSimpleSelect() {
	let componentOptions, selector;
	if (arguments.length === 0) {
		componentOptions = defaultOptions;
		selector = 'select';
	} else if (arguments.length === 1) {
		if (typeof arguments[0] === "string") {
			selector = arguments[0];
			componentOptions = defaultOptions;
		} else {
			selector = arguments[1];
			componentOptions = combineOptions(arguments[0]);
		}
	} else {
		selector = arguments[0];
		componentOptions = combineOptions(arguments[1]);
	}

	let { classes } = componentOptions;

	const elements = document.querySelectorAll(selector);

	elements.forEach(init);

	function init(selectNativeElem) {
		const { options, selectedIndex } = selectNativeElem;
		const selectCustomElem = document.createElement("div");
		const nativeSelectedElem = options[selectedIndex];
		const mainBtnElem = createMainBtnElem(nativeSelectedElem.innerText);
		const dropdownElem = document.createElement("div");
		const listElem = document.createElement("ul");

		let selectedOptionElem;
		const nativeSelectClasses = selectNativeElem.classList.toString().split(" ");
		selectCustomElem.classList.add.apply(selectCustomElem.classList, [classes.root, ...nativeSelectClasses]);
		
		dropdownElem.classList.add(classes.options);
		dropdownElem.setAttribute("role", "listbox");
		dropdownElem.appendChild(listElem);

		dropdownElem.classList.add(classes.optionsList);
		listElem.setAttribute("role", "presentation");

		let selectHandlers = {};
		const optionElems = Array.prototype.map.call(options, option => {
			const [optionElem, processSelection] = createOptionElem(option.value, option.innerText, option.selected);
			listElem.appendChild(optionElem);
			return optionElem;
		});
		selectNativeElem.addEventListener("change", (event) => {
			if (event.__operatedBySimpleSelect) return;
			selectHandlers[selectNativeElem.value]();
		});

		selectNativeElem.replaceWith(selectCustomElem);
		selectCustomElem.appendChild(selectNativeElem);
		selectCustomElem.appendChild(mainBtnElem);
		selectCustomElem.appendChild(dropdownElem);

		function close() {
			selectCustomElem.classList.remove(`${classes.root}_open`);
			selectCustomElem.setAttribute("aria-expanded", "false");
		}
		function open() {
			selectCustomElem.classList.add(`${classes.root}_open`);
			selectCustomElem.setAttribute("aria-expanded", "true");
			setTimeout(() => {
				document.addEventListener("pointerdown", (event) => {
					if (event.__closeSimpleSelect || event.__openSimpleSelect || event.__simpleOptionSelect) return;
					if (event.touches && event.touches.length > 1) return;
					if (event.buttons !== undefined && event.buttons !== 1) return;
					close();
				}, { once: true });
			}, 0);
		}
		function createMainBtnElem(selectedOption) {
			const buttonElem = document.createElement("button");
			const buttonCaptionElem = document.createElement("span");
			buttonElem.classList.add(classes.mainBtn);
			buttonElem.setAttribute("type", "button");
			buttonElem.setAttribute("aria-haspopup", "true");
			buttonElem.setAttribute("aria-expanded", "false");
			buttonElem.setAttribute("role", "combobox");
			buttonElem.setAttribute("title", selectedOption);

			buttonCaptionElem.innerText = selectedOption;
			buttonCaptionElem.classList.add(classes.caption);
			
			buttonElem.appendChild(buttonCaptionElem);
		
			if (componentOptions.arrowSvgIcon) {
				buttonElem.appendChild(createSvgIconElem());
			}
	
			const handleClick = (event) => {
				if (event.touches && event.touches.length > 1) return;
				if (selectCustomElem.classList.contains(`${classes.root}_open`)) {
					event.__closeSimpleSelect = true;
					close();
				} else {
					event.__openSimpleSelect = true;
					open();
				}
			}
	
			buttonElem.addEventListener("pointerdown", handleClick);
	
			return buttonElem;
		}
		function createOptionElem(value, name, selected) {
			const optionElem = document.createElement("li");
			const buttonElem = document.createElement("button");

			optionElem.setAttribute("role", "option");
			optionElem.setAttribute("tabindex", "0");
			optionElem.classList.add(classes.option);
			if (selected) {
				selectedOptionElem = optionElem;
				optionElem.setAttribute("aria-selected", "true");
				optionElem.classList.add(`${classes.option}_selected`);
			}
			
			buttonElem.setAttribute("type", "button");
			buttonElem.classList.add(classes.optionBtn);
			buttonElem.innerText = name;
			optionElem.appendChild(buttonElem);
			const processSelection = (event) => {
				if (selectedOptionElem !== optionElem) {
					selectNativeElem.value = value;
					const changeEvent = new Event("change");
					changeEvent.__operatedBySimpleSelect = true;
					selectNativeElem.dispatchEvent(changeEvent);

					optionElem.classList.add(`${classes.option}_selected`);
					optionElem.setAttribute("aria-selected", "true");
					
					selectedOptionElem.classList.remove(`${classes.option}_selected`);
					selectedOptionElem.setAttribute("aria-selected", "false");

					if (componentOptions.removeSelected) {
						optionElem.setAttribute("aria-hidden", "true");
						selectedOptionElem.setAttribute("aria-hidden", "false");
					}
					
					mainBtnElem.setAttribute("title", name);
					mainBtnElem.firstElementChild.textContent = name;

					selectedOptionElem = optionElem;
				}
			}
			selectHandlers[value] = processSelection;
			const handleClick = (event) => {
				if (event.touches && event.touches.length > 1) return;
				if (event.buttons !== undefined && event.buttons !== 1) return;
				event.__simpleOptionSelect = true;

				// const detail = {
				// 	value,
				// 	name,
				// };
				
				processSelection();
				close();
			}
	
			buttonElem.addEventListener("pointerdown", handleClick);
	
			return [optionElem, processSelection];
		}
		function createSvgIconElem() {
			const rootElem = createSvgElem("svg");
			const useElem = createSvgElem("use");
			rootElem.classList.add(classes.arrowIcon);
			useElem.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', componentOptions.arrowSvgIcon);

			rootElem.appendChild(useElem);
				console.log(rootElem);
			return rootElem;
		}
		function createSvgElem(tagName) {
			return document.createElementNS('http://www.w3.org/2000/svg', tagName);
		}
	}
}

{/* <div class="simple-select">
	<button class="simple-select__field">
		<div class="simple-select__selected-option"></div>
	</button>
	<div class="simple-select__dropdown">
		<ul class="simple-select__dropdown-list">
			<li class="simple-select__dropdown-item">
				<button type="button" class="simple-select__option">UA</button>
			</li>
		</ul>
	</div>
</div> */}