import { isMobile as checkUserAgent } from "../files/functions.js";
const isMobile = checkUserAgent.any();

export function addDragController(elem, handlers) {
	let touchStart;
	let touchMove;
	let initialTouchId;

	if (isMobile) {
		elem.addEventListener("touchstart", touchStartHandler, { passive: false });
	} else {
		elem.addEventListener("pointerdown", pointerDownHandler);
	}

	function touchStartHandler(event) {
		if (initialTouchId) return;
		//event.preventDefault();
		initialTouchId = event.targetTouches[0].identifier;

		touchStart = {
			pageX: event.targetTouches[0].pageX,
		}

		document.addEventListener("touchmove", touchMoveHandler, { passive: false });
		document.addEventListener("touchend", touchEndHandler, { once: true });
		document.addEventListener("touchcancel", touchEndHandler, { once: true });

		if (handlers.start) handlers.start({ event, touchStart });
	}
	function touchMoveHandler(event) {
		const initialTouch = Array.prototype.find.call(event.changedTouches, (touch) => touch.identifier === initialTouchId);
		if (initialTouch) {
			touchMove = {
				pageX: initialTouch.pageX,
			};
			if (handlers.move) handlers.move({ event, touchStart, touchMove });
		}
	}
	function touchEndHandler(event) {
		const initialTouch = Array.prototype.find.call(event.changedTouches, (touch) => touch.identifier === initialTouchId);
		if (initialTouch) {
			initialTouchId = null;
			document.removeEventListener("touchmove", touchMoveHandler);
			touchMove = {
				pageX: initialTouch.pageX,
			};
			if (handlers.end) handlers.end({ event, touchStart, touchMove });
		}
	}
	function pointerDownHandler(event) {
		if (event.touches && event.touches.length > 1) return;
		if (event.buttons && event.buttons !== 1) return;
		if (event.targetTouches)
		event.preventDefault();
		touchStart = {
			pageX: event.pageX,
		}
		if (handlers.start) handlers.start({ event, touchStart });
		document.addEventListener("pointermove", pointerMoveHandler);
		document.addEventListener("pointerup", pointerUpHandler, { once: true });
	}
	function pointerMoveHandler(event) {
		touchMove = {
			pageX: event.pageX,
		}
		if (handlers.move) handlers.move({ event, touchStart, touchMove });
	}
	function pointerUpHandler(event) {
		document.removeEventListener("pointermove", pointerMoveHandler);
		touchMove = {
			pageX: event.pageX,
		}
		if (handlers.end) handlers.end({ event, touchStart, touchMove });
	}
}