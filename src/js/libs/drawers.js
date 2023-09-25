const { lock, unlock } = bodyScrollLock;

export function initDrawersControl() {
	const zIndex = 190;
	const drawersRootElem = document.querySelector(".drawers");
	const controlElems = document.querySelectorAll("[data-drawer-open], [data-drawer-close]");
	const drawerElems = document.querySelectorAll("[data-drawer]");
	const movableDrawerBodyElems = document.querySelectorAll("[data-drawer-owner]");
	const mbpMobile = window.matchMedia("(max-width: 767.98px)");
	let openDrawers = [];
	let nextZIndex = zIndex;

	const drawersContext = {};

	const mutableDrawersContext = Array.prototype.map.call(movableDrawerBodyElems, (elem => {
			const drawerName = elem.getAttribute("data-drawer-owner");
			const bodyHolderElem = drawersRootElem.querySelector(`[data-drawer-body="${drawerName}"]`);
			return {
				drawerName,
				bodyElem: elem,
				bodyStubElem: createDrawerBodyStub(drawerName),
				initialParentElem: elem.parentElement,
				bodyHolderElem,
			};
		}));

	let drawersState = "initial";
	const mbpHandler = (state) => {
		// Move to drawers only place, to prevent fixed inside fixed'
		if(state.matches && drawersState === "initial") {
				console.log("Move drawers");
			drawersState = "moved";
			mutableDrawersContext.forEach(({ bodyElem, bodyHolderElem, bodyStubElem }) => {
				bodyElem.replaceWith(bodyStubElem);
				bodyHolderElem.appendChild(bodyElem);
			});
			drawersState = "replaced";
		} else if (!state.matches && drawersState === "replaced") {
			console.log("Return drawers");
			drawersState = "moved";
			mutableDrawersContext.forEach(({ bodyElem, bodyStubElem, drawerName }) => {
				drawersContext[drawerName].elem?.classList.remove("open");
				drawersContext[drawerName].openBtnElem?.classList.remove("checked");
				bodyStubElem.replaceWith(bodyElem);
			});
			drawersState = "initial";
		}
	};

	if (window.innerWidth < 767.98) {
		mbpHandler({ matches: true });
	}
	mbpMobile.addListener(mbpHandler);

	// Handle close on underlay click
	document.addEventListener("poinerdown", (e) => {
		if (e.__drawerOpen || e.__drawerClose) return;
		if (!openDrawers.length) return;
		const closest = e.target.closest('[data-drawer]');
		if (!closest) {
			openDrawers = openDrawers.reduce((result, elem, idx, initial) => {
				if (true) { // ask the user if he want to close the drawer
					elem.classList.remove("open");
					const drawerName = elem.getAttribute("data-drawer");
					drawersContext[drawerName].openBtnElem?.classList.remove("checked");
					const otherCouldStayOpen = result.length || idx < initial.length - 1;
					bodyUnlock(elem, !otherCouldStayOpen, 300);
				} else {
					result.push(elem);
				}
				return result;
			}, []);
		}
	});

	// Handle close on outside click4
	drawerElems.forEach((elem) => {
		const drawerName = elem.getAttribute("data-drawer");
		drawersContext[drawerName] = { elem };
		elem.addEventListener("click", event => {
			if (event.touches && event.touches.length > 1) return;
			if (event.target !== elem) return;
			drawersContext[drawerName].openBtnElem?.classList.remove("checked");
			closeDrawer(event, elem);
		});
	})
	
	document.addEventListener("closeDrawer", (event) => {
		const drawerName = event.detail;
		drawersContext[drawerName].openBtnElem?.classList.remove("checked");
		closeDrawer(event, drawersContext[drawerName].elem);
	});

	controlElems.forEach((elem) => {
		if (elem.hasAttribute("data-drawer-open")) {
			addClickHander("open", "add")
		} else if (elem.hasAttribute("data-drawer-close")) {
			addClickHander("close", "remove");
		}

		function addClickHander(type, method) {
			const targetDrawerName = elem.getAttribute("data-drawer-" + type);
			
			let targetDrawerElem = Array.prototype.find.call(drawerElems, elem => elem.getAttribute("data-drawer") === targetDrawerName);
			const closeHandler = (event) => {
				if (event.touches && event.touches.length > 1) return;
				drawersContext[targetDrawerName].openBtnElem?.classList.remove("checked");
				closeDrawer(event, targetDrawerElem);
			};
			const openHandler = (event) => {
				if (event.touches && event.touches.length > 1) return;
				drawersContext[targetDrawerName].openBtnElem?.classList.add("checked");
				event.__drawerOpen = true;
				bodyLock(targetDrawerElem);
				targetDrawerElem.style.zIndex = nextZIndex++;
				targetDrawerElem.classList.add("open");
				openDrawers.push(targetDrawerElem);
			};
			if (targetDrawerElem) {
				if (type == "open") {
					drawersContext[targetDrawerName].openBtnElem = elem;
					elem.addEventListener("pointerdown", openHandler);
				} else {
					elem.addEventListener("pointerdown", closeHandler);
				}
			}
		}
	});
	function closeDrawer(event, elem) {
		event.__drawerClose = true;
		const memoIdx = openDrawers.indexOf(elem);
		if (memoIdx > -1) {
			openDrawers.splice(memoIdx, 1);
		}
		elem.classList.remove("open");
		elem.style.zIndex = undefined;
		nextZIndex--;
		bodyUnlock(elem, !openDrawers.length, 300);
	}
	function createDrawerBodyStub(name) {
		const stubElem = document.createElement("span");
		stubElem.setAttribute("data-drawer-stub", name);
		stubElem.classList.add("drawer-stub");
		return stubElem;
	}
}
function bodyLock(targetElem) {
	const bodyElem = document.querySelector("body");
	bodyElem.classList.add("lock");
	const scrollableElems = targetElem.querySelectorAll("[data-scrollable]");
	scrollableElems.forEach(elem => lock(elem));
}
function bodyUnlock(targetElem, removeUnderlay = true, delay = 300) {
	const bodyElem = document.querySelector("body");
	setTimeout(() => {
		if (removeUnderlay) {
			bodyElem.classList.remove("lock");
		}
		const scrollableElems = targetElem.querySelectorAll("[data-scrollable]");
		scrollableElems.forEach(elem => unlock(elem));
	}, delay);
}