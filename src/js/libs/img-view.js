
// размер контейнера

import _ from "lodash";
import { addDragController } from "./drag-controller.js";

const resizeEntryHandler = _.throttle(entry => {
	entry.target.dispatchEvent(new CustomEvent("resize"));
}, 500);
const resizeObserver = new ResizeObserver((entries) => {
	entries.forEach(resizeEntryHandler);
});

export function initImgView(selector) {
	const elem = document.querySelector(selector);
	if (!elem) return 0;
	const containerElem = elem.firstElementChild;
	const imgElem = containerElem.querySelector(".img-view__img-wrapper");
	const scrollXElem = elem.lastElementChild;
	const scrollXThumbElem = scrollXElem.firstElementChild;
	let imgDiff, scrollXDiff;

	resizeObserver.observe(elem);
	elem.addEventListener("resize", (event) => {
		recalc();
	});

	recalc();
	initHorizontalScroll();
	initImgDrag();

	function calcImgDiff() {
		return {
			x: imgElem.offsetWidth - containerElem.clientWidth,
			y: imgElem.offsetHeight - containerElem.clientHeight,
		};
	}
	function initImgDrag() {
		let initialPosition;
		const move = _.throttle(({ touchStart, touchMove }) => {
			let newPosition = {
				x: initialPosition.x + touchMove.pageX - touchStart.pageX,
			}
			if (newPosition.x > 0) {
				newPosition.x = 0;
			} else if (newPosition.x < -imgDiff.x) {
				newPosition.x = -imgDiff.x;
			}
			scrollTo(newPosition.x / -imgDiff.x * 100);
		}, 20);

		addDragController(imgElem, {
			start: () => {
				initialPosition = {
					x: parsePx(imgElem.style.left) || 0,
				}
			},
			move
		});
	}
	function initHorizontalScroll() {
		let thumbInitialPosition;

		const move = _.throttle(({ touchStart, touchMove }) => {
			let newPosition = thumbInitialPosition + touchMove.pageX - touchStart.pageX;
			if (newPosition > scrollXDiff) {
				newPosition = scrollXDiff;
			} else if (newPosition < 0) {
				newPosition = 0;
			}
			scrollTo(newPosition / scrollXDiff * 100);
		}, 20);

		addDragController(scrollXThumbElem, {
			start: () => {
				thumbInitialPosition = parsePx(scrollXThumbElem.style.left) || 0;
			},
			move
		});
	}
	function recalc() {
		// No scroll needed
		imgDiff = calcImgDiff();
		const thumbWidth = containerElem.clientWidth / imgElem.offsetWidth * scrollXElem.clientWidth;
		scrollXThumbElem.style.maxWidth = `${thumbWidth}px`;
		scrollXDiff = scrollXElem.clientWidth - scrollXThumbElem.offsetWidth;

		if (containerElem.clientWidth >= imgElem.offsetWidth) {
			scrollXElem.style.display = "none";
			scrollTo();
		} else {
			scrollXElem.style.display = "";
			const defaultScroll = elem.getAttribute("data-default-scroll");
			if (defaultScroll) {
				const [defaultScrollX, defaultScrollY] = defaultScroll.match(/(\d{1,3})(?:\s+(\d{1,3}))?/g);
				scrollTo(defaultScrollX, defaultScrollY);
			}
		}
	}
	function scrollTo(x = 0, y = 0) {
		const imgNewX = x === 0 ? x : -imgDiff.x / 100 * x;
		const imgNewY = y === 0 ? y : -imgDiff.y / 100 * y;
		const thumbNewX = x === 0 ? x : scrollXDiff / 100 * x;
		//const thumbNewY = y === 0 ? y : -imgDiff.y / 100 * y;
		imgElem.style.left = `${imgNewX}px`;
		imgElem.style.top = `${imgNewY}px`;
		scrollXThumbElem.style.left = `${thumbNewX}px`;
	}
	return {
		scrollTo,
	}
}

function parsePx(value) {
	return parseInt(value, 10);
}