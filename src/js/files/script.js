// Подключение функционала "Чертогов Фрилансера"
import { isMobile } from "./functions.js";
// Подключение списка активных модулей
import { flsModules } from "./modules.js";

import { initSimpleSelect } from "./forms/simple-select.js";
import { initDrawersControl } from "../libs/drawers.js";
import { initRadioCheckTracking, initContextOpen } from "./forms/focus-class-for-parent.js";
import { initImgView } from "../libs/img-view.js";


window.addEventListener("DOMContentLoaded", onLoaded);

let nativeLangSelectElem;

function onLoaded() {
	nativeLangSelectElem = initLanguageSelect();
	initDrawerNavLangSelect();
	setDefaultLanguage();
	initDrawersControl();
	initRadioCheckTracking();
	initContextOpen();
	initPriceSelect();
	const imgView = initImgView("#map-view");
	if (imgView) imgView.scrollTo(70);
	initAccordions();
	initRequestController();
	scrollToSectionByRequest();
	initMainNav();
	initCallbackRequest();
	initSubscriptionRequest();
	initServiceRequest();
}

function initCallbackRequest() {
	const endpoint = location.origin + "/sendmail/callback-request.php";
	const formElem = document.forms["callback"];
	if (!formElem) return;
	const successMsgElem = formElem.querySelector(".contacts-card__callback-form-msg");
	
	const btnElem = formElem.querySelector(".contacts-card__callback-form-btn");
	const inputElemsMap = {};

	[].forEach.call(formElem.elements, elem => {
		const inputName = elem.getAttribute("name");
		inputElemsMap[inputName] = elem;
	});

	formElem.addEventListener("submit", event => {
		event.preventDefault();
		btnElem.disabled = true;
		const queryString = `?name=${inputElemsMap.name.value}&phone=${inputElemsMap.phone.value}`;
		fetch(endpoint + queryString, {
			method: 'POST',
		})
		.then(response => {
			btnElem.disabled = false;
			if (true || response.ok) {
				successMsgElem.classList.add("show");
				inputElemsMap.name.value = '';
				inputElemsMap.phone.value = '';
				setTimeout(() => {
					successMsgElem.classList.remove("show");
				}, 3000);
			} else {
				response.text().then((result) => { throw new Error(result) });
			}
		})
		.catch(reason => {
			btnElem.disabled = false;
			console.log("reason: " + reason);
		});
	});
}
function initSubscriptionRequest() {
	const endpoint = location.origin + "/sendmail/subscribe.php";
	const formElem = document.forms["subscribe"];
	const successMsgElem = formElem.querySelector(".subscribe__msg");
	const btnElem = formElem.querySelector(".subscribe__btn");
	const inputElemsMap = {};

	[].forEach.call(formElem.elements, elem => {
		const inputName = elem.getAttribute("name");
		inputElemsMap[inputName] = elem;
	});

	formElem.addEventListener("submit", event => {
		event.preventDefault();
		btnElem.disabled = true;
		const queryString = `?email=${inputElemsMap.email.value}`;
		fetch(endpoint + queryString, {
			method: 'POST',
		})
		.then(response => {
			btnElem.disabled = false;
			if (true || response.ok) {
				successMsgElem.classList.add("show");
				inputElemsMap.email.value = '';
				setTimeout(() => {
					successMsgElem.classList.remove("show");
				}, 3000);
			} else {
				response.text().then((result) => { throw new Error(result) });
			}
		})
		.catch(reason => {
			btnElem.disabled = false;
			console.log("reason: " + reason);
		});
	});
}
function initServiceRequest() {
	const containerElem = document.querySelector("#contact-form");
	
	
	
	const formElem = document.forms["contact"];
	const successMsgElem = formElem.querySelector(".contact-form__msg");
	const btnElem = formElem.querySelector(".contact-form__btn");
	const inputElemsMap = {};

	[].forEach.call(formElem.elements, elem => {
		const inputName = elem.getAttribute("name");
		inputElemsMap[inputName] = elem;
	});

	formElem.addEventListener("submit", event => {
		event.preventDefault();
		btnElem.disabled = true;
		let endpoint, queryString;
		if (containerElem.getAttribute("data-type") === "audit-request") {
			endpoint = location.origin + "/sendmail/audit-request.php";
			queryString = `?name=${inputElemsMap.name.value}&phone=${inputElemsMap.phone.value}&comment=${inputElemsMap.comment.value}`;
		} else {
			endpoint = location.origin + "/sendmail/package-order.php";
			const packageType = containerElem.getAttribute("data-package-type");
			const packagePeriod = containerElem.getAttribute("data-package-period");
			queryString = `?name=${inputElemsMap.name.value}&phone=${inputElemsMap.phone.value}&comment=${inputElemsMap.comment.value}&package-type=${packageType}&period=${packagePeriod}`;
		}
		
		fetch(endpoint + queryString, {
			method: 'POST',
		})
		.then(response => {
			btnElem.disabled = false;
			if (true || response.ok) {
				successMsgElem.classList.add("show");
				inputElemsMap.name.value = '';
				inputElemsMap.phone.value = '';
				inputElemsMap.comment.value = '';
				setTimeout(() => {
					successMsgElem.classList.remove("show");
				}, 3000);
			} else {
				response.text().then((result) => { throw new Error(result) });
			}
		})
		.catch(reason => {
			btnElem.disabled = false;
			console.log("reason: " + reason);
		});
	});
}

function scrollToSectionByRequest() {
	const request = new URLSearchParams(window.location.search);
	const sectionName = request.get("section");
	const sectionElem = getSectionElem(sectionName);
	if (sectionElem) {
		scrollToSection(sectionElem);
	}
}
function getSectionElem(sectionName) {
	return document.querySelector(`section.${sectionName}`);
}
function scrollToSection(sectionElem) {
	const headerElem = document.querySelector(`header`);
	if (!sectionElem) return false;
	const sectionBcr = sectionElem.getBoundingClientRect();
	const newScrollPos = sectionBcr.top + window.scrollY - headerElem.offsetHeight;
	window.scrollTo({ top: newScrollPos, behavior: 'smooth' });
	return true;
}
function initMainNav() {
	const scrollToElems = document.querySelectorAll("[data-scroll-to]");
	scrollToElems.forEach(elem => {
		elem.addEventListener("click", event => {
			event.preventDefault();
			const sectionName = event.currentTarget.getAttribute("data-scroll-to");
			const sectionElem = getSectionElem(sectionName);
			if (!sectionElem) {
				location.assign(`${location.origin}/?section=${sectionName}&lang=${getSelectedLang()}`);
			} else {
				const drawerElem = elem.closest(".drawer");
				if (drawerElem) {
					document.dispatchEvent(new CustomEvent("closeDrawer", { detail: drawerElem.getAttribute("data-drawer") }));
					setTimeout(() => {
						scrollToSection(sectionElem);
					}, 500);
				} else {
					scrollToSection(sectionElem);
				}
			}
		});
	});
}
function getSelectedLang() {
	return nativeLangSelectElem.value;
}
function initRequestController() {
	const contactFormElem = document.querySelector("#contact-form");
	const packageRequestTitleElems = document.querySelectorAll("#package-request-title > [data-lang]");
	const packageRequestTitleContext = {};
	const formInputs = document.forms["contact"].querySelectorAll("input, textarea");

	packageRequestTitleElems.forEach(elem => {
		const titleLang = elem.getAttribute("data-lang");
		packageRequestTitleContext[titleLang] = {
			elem,
			template: elem.innerHTML
		}
	});
	const auditRequestHandler = (event => {
		event.preventDefault();
		contactFormElem.setAttribute("data-type", "audit-request");
		const drawerElem = event.target.closest(".drawer");
		if (drawerElem) {
			document.dispatchEvent(new CustomEvent("closeDrawer", { detail: drawerElem.getAttribute("data-drawer") }));
			setTimeout(() => {
				flsModules.popup.open("#contact-form");
			}, 300);
		} else {
			flsModules.popup.open("#contact-form");
		}
	});
	const packageRequestSubmitHandler = (event) => {
		event.preventDefault();
		const selectedLang = getSelectedLang();
		const packageName = event.target.name.startsWith("lite") ? "LITE" : "PRO";
		const period = event.target.period.value;
		const newTitle = packageRequestTitleContext[selectedLang].template.replace(/\{\{(\w+)(?::(\{[^\{\}]+\}))?\}\}/g, (match, g1, g2) => {
			switch(g1) {
				case "packageName":
					return packageName;
				case "period":
					return period;
				case "monthMap":
					try {
						const map = JSON.parse(g2);
						return map[period];
					} catch(e) {
						alert("Прописан неверный шаблон в HTML, для дописывания слова 'месяцев/месяца' в зависимости от выбранного периода");
					}
			}
		});
		packageRequestTitleContext[selectedLang].elem.innerHTML = newTitle;
		contactFormElem.setAttribute("data-type", "package-request");
		contactFormElem.setAttribute("data-package-period", period);
		contactFormElem.setAttribute("data-package-type", packageName);
		flsModules.popup.open("#contact-form");
	}
	document.forms["lite-package-request"]?.addEventListener("submit", packageRequestSubmitHandler);
	document.forms["pro-package-request"]?.addEventListener("submit", packageRequestSubmitHandler);

	const auditRequestBtnElems = document.querySelectorAll('[data-audit-request]');
	auditRequestBtnElems.forEach(elem => {
		elem.addEventListener("click", auditRequestHandler);
	});

	document.addEventListener("beforePopupClose", (popup) => {
		formInputs.forEach(inputElem => {
			inputElem.disabled = false;
			inputElem.value = '';
		});
	});
	document.forms["contact"]?.addEventListener("submit", event => {
		event.preventDefault();
		// Send email
	});
}
function initDrawerNavLangSelect() {
	const mainLangControl = document.querySelector("#lang-select");
	const drawerLangControl = document.querySelectorAll("input[name='drawer-lang-select'");
	drawerLangControl.forEach(elem => {
		elem.addEventListener("change", event => {
			if (event.__initByLangControl) return;
			mainLangControl.value = elem.value;
			const changeEvent = new Event("change");
			changeEvent.__initByDrawerControl = true;
			mainLangControl.dispatchEvent(changeEvent);
		});
	});
}
function setDefaultLanguage() {
	const checkList =["ua", "ru", "en"];
	const searchQuery = new URLSearchParams(window.location.search);
	const defaultLang = searchQuery.get("lang") || getSelectedLang();
	if (defaultLang && checkList.indexOf(defaultLang) != -1) {
		const nativeSelectElem = document.querySelector("#lang-select");
		nativeSelectElem.value = defaultLang;
		nativeSelectElem.dispatchEvent(new Event("change"));
	}
}
function setLanguage(lang) {
	document.querySelector("html").setAttribute("lang", lang);
	// Set placeholders
	const inputElems = document.querySelectorAll("[data-placeholder-src]");
	inputElems.forEach(elem => {
		const srcName = elem.getAttribute("data-placeholder-src");
		const sourceElem = elem.parentElement.querySelector(`[data-lang-src="${srcName}"][data-lang="${lang}"]`);
		elem.setAttribute("placeholder", sourceElem.textContent);
	});
	
	const mapSourceElem = document.querySelector(".geography__map-img source");
	if (mapSourceElem) {
		const mapImgPath = mapSourceElem.getAttribute("srcset").replace(/\w{2}\.webp$/, `${lang}.webp`);
		mapSourceElem.setAttribute("srcset", mapImgPath);
	}
	const mapImgElem = document.querySelector(".geography__map-img img");
	if (mapImgElem) {
		const mapImgPath = mapImgElem.getAttribute("src").replace(/\w{2}\.png$/, `${lang}.png`);
		mapImgElem.setAttribute("src", mapImgPath);
	}
}
function initLanguageSelect() {
	const nativeSelectElem = document.querySelector("#lang-select");
	const langSelectOptions = {
		removeSelected: true,
		rootClass: "lang-select",
		arrowSvgIcon: "@img/icons/icons.svg#arrow-down",
	};
	initSimpleSelect("#lang-select", langSelectOptions);
	const drawerLangControlElems = document.querySelectorAll("input[name='drawer-lang-select']");
	nativeSelectElem.addEventListener("change", (event) => {
		setLanguage(nativeSelectElem.value);
		if (!event.__initByDrawerControl) {
			const selectedLangElem = [].find.call(drawerLangControlElems, elem => {
				return elem.value === nativeSelectElem.value;
			});
			const changeEvent = new Event("change");
			changeEvent.__initByLangControl = true;
			selectedLangElem.checked = true;
			selectedLangElem.dispatchEvent(changeEvent);
		}
	});
	return nativeSelectElem;
}
function initPriceSelect() {
	const elems = document.querySelectorAll('input[name="period"]');
	elems.forEach(elem => {
		if (elem.checked) {
			elem.form?.setAttribute("data-selected-period", elem.value);
		}
		elem.addEventListener("change", event => {
			elem.form?.setAttribute("data-selected-period", elem.value);
		});
	});
}
export function initAccordions(root = document, onlyOneItemOpen) {
	const resizeObserver = new ResizeObserver((entries) => {
		entries.forEach(entry => entry.target.dispatchEvent(new CustomEvent("resize")));
	});

	const rootElems = root.querySelectorAll(".accordion");
	rootElems.forEach(accordionElem => {
		const itemElems = accordionElem.querySelectorAll(".accordion__item");

		resizeObserver.observe(accordionElem);

		let openItemMemo, itemsMemo = [], pointerDown, pointerMove;

		accordionElem.addEventListener("resize", _.throttle(() => {
			itemsMemo.forEach(({ itemElem, bodyElem }) => {
				if (!itemElem.classList.contains("open")) {
					bodyElem.style.marginTop = `${-bodyElem.offsetHeight}px`;
				}
			});
		}), 20);

		itemElems.forEach((itemElem) => {
			const headerElem = itemElem.querySelector(".accordion__item-header");
			const bodyElem = itemElem.querySelector(".accordion__item-body");

			itemsMemo.push({ itemElem, bodyElem });

			if (itemElem.classList.contains("open")) {
				openItem({ itemElem, bodyElem });
			} else {
				closeItem({ itemElem, bodyElem });
			}

			headerElem.addEventListener("click", (event) => {
				toggleItem();
			});
			function toggleItem() {
				if (onlyOneItemOpen) {
					if (openItemMemo?.itemElem === itemElem) {
						closeItem(openItemMemo);
						openItemMemo = null;
					} else {
						openItemMemo = { itemElem, bodyElem };
					}
				} else {
					if (itemElem.classList.contains("open")) {
						closeItem({ itemElem, bodyElem });
					} else {
						openItem({ itemElem, bodyElem });
					}
				}
			}
			function closeItem({ itemElem, bodyElem }) {
				itemElem.classList.remove("open");
				bodyElem.style.marginTop = `${-bodyElem.offsetHeight}px`;
			}
			function openItem({ itemElem, bodyElem }) {
				itemElem.classList.add("open");
				bodyElem.style.marginTop = 0;
			}
		});
	});
}