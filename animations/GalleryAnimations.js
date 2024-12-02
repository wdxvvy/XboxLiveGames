/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    WinJS.Namespace.define("MS.Entertainment.Animations.Gallery", {
        animateListExpandCollapse: function animateListExpandCollapse(unused1, unused2, affectedItems, inserted) {
            var promises = [];
            var view = null;
            var itemKeys = Object.keys(affectedItems);
            if (itemKeys && itemKeys.length > 0)
                view = MS.Entertainment.Utilities.findParentElementByClassName(affectedItems[itemKeys[0]].element, "win-viewport");
            for (var item in affectedItems)
                promises.push(MS.Entertainment.Animations.Gallery.slideElement(affectedItems[item].element, affectedItems[item]));
            for (item in inserted)
                inserted[item].element.style.opacity = 1.0;
            if (view)
                view.animationPromise = WinJS.Promise.join(promises);
            return {getCompletionPromise: function getCompletionPromise() {
                        return WinJS.Promise.join(promises)
                    }}
        }, slide: function slide(element, className) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var slideInEnd = function(event) {
                        element.removeEventListener("animationend", slideInEnd, false);
                        WinJS.Utilities.removeClass(element, className);
                        WinJS.Utilities.addClass(element, "visible");
                        completion()
                    };
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    element.addEventListener("animationend", slideInEnd, false);
                    var delay = 0;
                    if (element.parentElement !== null && element.parentElement.offsetParent !== null) {
                        var delayBase = 100;
                        var leftOffSet = element.parentElement.offsetParent.offsetLeft;
                        var itemIndex = leftOffSet / (element.clientWidth + 10);
                        delay = itemIndex * delayBase;
                        if (element.parentElement.offsetParent.offsetTop > 0)
                            delay += delayBase
                    }
                    element.style.msAnimationDelay = delay + "ms";
                    WinJS.Utilities.addClass(element, className)
                }
                else {
                    WinJS.Utilities.addClass(element, "visible");
                    completion()
                }
                return promise
            }, slideIn: function slideIn(element) {
                return MS.Entertainment.Animations.Gallery.slide(element, "thumbnailButtonFadeIn")
            }, slideOut: function slideOut(element) {
                return MS.Entertainment.Animations.Gallery.slide(element, "thumbnailButtonFadeOut")
            }, loadImage: function loadImage(element, container, animationTarget) {
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    container.appendChild(element);
                    if (animationTarget)
                        WinJS.UI.Animation.fadeIn(animationTarget)
                }
                else {
                    container.appendChild(element);
                    if (animationTarget)
                        animationTarget.style.opacity = 1
                }
            }, enableTextContainerFade: function enableTextContainerFade(textContainer) {
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled)
                    WinJS.UI.Animation.enterContent(textContainer, null)
            }, fadeInTextContainer: function fadeInTextContainer(textContainer) {
                return MS.Entertainment.Animations.Gallery._fadeOutTextContainer(textContainer, true)
            }, fadeOutTextContainer: function fadeOutTextContainer(textContainer) {
                return MS.Entertainment.Animations.Gallery._fadeOutTextContainer(textContainer, false)
            }, _fadeOutTextContainer: function _fadeOutTextContainer(textContainer, fadeIn) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var transitionEnd = function(event) {
                        textContainer.removeEventListener("transitionend", transitionEnd, false);
                        completion()
                    };
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled)
                    if (fadeIn && WinJS.Utilities.hasClass(textContainer, "fadeOut")) {
                        WinJS.Utilities.removeClass(textContainer, "fadeOut");
                        textContainer.addEventListener("transitionend", transitionEnd, false);
                        WinJS.Utilities.addClass(textContainer, "fadeIn")
                    }
                    else if (!fadeIn && WinJS.Utilities.hasClass(textContainer, "fadeIn")) {
                        WinJS.Utilities.removeClass(textContainer, "fadeIn");
                        textContainer.addEventListener("transitionend", transitionEnd, false);
                        WinJS.Utilities.addClass(textContainer, "fadeOut")
                    }
                    else
                        completion();
                else {
                    if (fadeIn)
                        WinJS.Utilities.removeClass(textContainer, "hidden");
                    else
                        WinJS.Utilities.addClass(textContainer, "hidden");
                    completion()
                }
                return promise
            }, slideElement: function slideElement(element, destination) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                function animationEnd(event) {
                    if (event.srcElement === element) {
                        element.removeEventListener("transitionend", animationEnd, false);
                        element.animationEnd = null;
                        WinJS.Utilities.removeClass(element, "listViewElementTransition");
                        element.style.msTransform = "";
                        element.style.left = destination.left + "px";
                        element.style.top = destination.top + "px";
                        element.animating = false;
                        completion()
                    }
                }
                {};
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    if (!element.animating) {
                        element.style.left = destination.oldLeft + "px";
                        element.style.top = destination.oldTop + "px";
                        element.animating = true
                    }
                    else {
                        element.removeEventListener("transitionend", element.animationEnd, false);
                        element.animationEnd = null
                    }
                    element.animationEnd = animationEnd;
                    element.addEventListener("transitionend", animationEnd, false);
                    window.getComputedStyle(listView._viewport);
                    requestAnimationFrame(function() {
                        WinJS.Utilities.addClass(element, "listViewElementTransition");
                        var translate = "";
                        if (destination.left !== destination.oldLeft)
                            translate += "translateX(" + (destination.left - destination.oldLeft) + "px) ";
                        if (destination.top !== destination.oldTop)
                            translate += "translateY(" + (destination.top - destination.oldTop) + "px)";
                        element.style.msTransform = translate
                    })
                }
                else {
                    element.style.left = destination.left + "px";
                    element.style.top = destination.top + "px";
                    completion()
                }
                return promise
            }, scrollListView: function scrollListView(listView, destinationOffset) {
                var completion;
                var animationComplete = false;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                function animationEnd(event) {
                    if (event.srcElement === listView._viewport) {
                        listView._viewport.removeEventListener("transitionend", animationEnd, false);
                        listView.animationEnd = null;
                        animationComplete = true;
                        cleanupStrip()
                    }
                }
                {};
                function cleanupStrip() {
                    if (!animationComplete)
                        return;
                    WinJS.Utilities.removeClass(listView._viewport, "listViewScrollTransition");
                    listView._viewport.style.msTransform = "";
                    listView._viewport.style.overflow = "";
                    listView.scrollPosition = destinationOffset;
                    listView.animating = false;
                    animationComplete = false;
                    completion()
                }
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    if (!listView.animating) {
                        var offset = listView.scrollPosition;
                        listView._viewport.style.overflow = "visible";
                        listView._viewport.style.msTransform = "translateX(-" + offset + "px)";
                        listView.animating = true
                    }
                    else {
                        listView._viewport.removeEventListener("transitionend", listView.animationEnd, false);
                        listView.animationEnd = null
                    }
                    listView.animationEnd = animationEnd;
                    listView._viewport.addEventListener("transitionend", animationEnd, false);
                    window.getComputedStyle(listView._viewport);
                    requestAnimationFrame(function() {
                        WinJS.Utilities.addClass(listView._viewport, "listViewScrollTransition");
                        listView._viewport.style.msTransform = "translateX(-" + destinationOffset + "px)"
                    })
                }
                else {
                    listView._viewport.scrollLeft = destinationOffset;
                    completion()
                }
                return promise
            }, _simpleAnimateIn: function simpleAnimate(element, animationClass, hiddenClass) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var animationEnd = function(event) {
                        if (event.srcElement === element) {
                            element.removeEventListener("animationend", animationEnd, false);
                            WinJS.Utilities.removeClass(element, animationClass);
                            completion()
                        }
                    };
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    element.addEventListener("animationend", animationEnd, false);
                    WinJS.Utilities.removeClass(element, hiddenClass);
                    WinJS.Utilities.addClass(element, animationClass)
                }
                else
                    completion();
                return promise
            }, _simpleAnimateOut: function simpleAnimateOut(element, animationClass, hiddenClass) {
                var completion;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c
                    });
                var animationEnd = function(event) {
                        if (event.srcElement === element) {
                            element.removeEventListener("animationend", animationEnd, false);
                            WinJS.Utilities.removeClass(element, animationClass);
                            WinJS.Utilities.addClass(element, hiddenClass);
                            completion()
                        }
                    };
                if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                    element.addEventListener("animationend", animationEnd, false);
                    WinJS.Utilities.addClass(element, animationClass)
                }
                else
                    completion();
                return promise
            }, fadeInActionButtons: function fadeInActionButtons(element) {
                return MS.Entertainment.Animations.Gallery._simpleAnimateIn(element, "detailsActionButtonFadeIn", "inlineDetailsHidden")
            }, fadeOutActionButtons: function fadeOutActionButtons(element) {
                return MS.Entertainment.Animations.Gallery._simpleAnimateOut(element, "detailsActionButtonFadeOut", "inlineDetailsHidden")
            }, fadeInActionText: function fadeInActionText(element) {
                return MS.Entertainment.Animations.Gallery._simpleAnimateIn(element, "detailsActionTextFadeIn", "inlineDetailsHidden")
            }, fadeOutActionText: function fadeOutActionText(element) {
                return MS.Entertainment.Animations.Gallery._simpleAnimateOut(element, "detailsActionTextFadeOut", "inlineDetailsHidden")
            }
    })
})()
