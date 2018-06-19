if (!window.jQuery || !window.$) console.warn('Focus State Manager requires jQuery');

// Include some helpful constant definitions
var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

// Include a few jQuery plugins

/*!
 * jQuery scrollintoview() plugin and :scrollable selector filter
 */
(function ($) {
    var converter = {
        vertical: { x: false, y: true },
        horizontal: { x: true, y: false },
        both: { x: true, y: true },
        x: { x: true, y: false },
        y: { x: false, y: true }
    };

    var settings = {
        duration: "slow",
        direction: "both"
    };

    var rootrx = /^(?:html)$/i;

    // gets border dimensions
    var borders = function (domElement, styles) {
        styles = styles || (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(domElement, null) : domElement.currentStyle);
        var px = document.defaultView && document.defaultView.getComputedStyle ? true : false;
        var b = {
            top: (parseFloat(px ? styles.borderTopWidth : $.css(domElement, "borderTopWidth")) || 0),
            left: (parseFloat(px ? styles.borderLeftWidth : $.css(domElement, "borderLeftWidth")) || 0),
            bottom: (parseFloat(px ? styles.borderBottomWidth : $.css(domElement, "borderBottomWidth")) || 0),
            right: (parseFloat(px ? styles.borderRightWidth : $.css(domElement, "borderRightWidth")) || 0)
        };
        return {
            top: b.top,
            left: b.left,
            bottom: b.bottom,
            right: b.right,
            vertical: b.top + b.bottom,
            horizontal: b.left + b.right
        };
    };

    var dimensions = function ($element) {
        var win = $(window);
        var isRoot = rootrx.test($element[0].nodeName);
        return {
            border: isRoot ? { top: 0, left: 0, bottom: 0, right: 0} : borders($element[0]),
            scroll: {
                top: (isRoot ? win : $element).scrollTop(),
                left: (isRoot ? win : $element).scrollLeft()
            },
            scrollbar: {
                right: isRoot ? 0 : $element.innerWidth() - $element[0].clientWidth,
                bottom: isRoot ? 0 : $element.innerHeight() - $element[0].clientHeight
            },
            rect: (function () {
                var r = $element[0].getBoundingClientRect();
                return {
                    top: isRoot ? 0 : r.top,
                    left: isRoot ? 0 : r.left,
                    bottom: isRoot ? $element[0].clientHeight : r.bottom,
                    right: isRoot ? $element[0].clientWidth : r.right
                };
            })()
        };
    };

    $.fn.extend({
        scrollintoview: function (options) {
            /// <summary>Scrolls the first element in the set into view by scrolling its closest scrollable parent.</summary>
            /// <param name="options" type="Object">Additional options that can configure scrolling:
            ///        duration (default: "fast") - jQuery animation speed (can be a duration string or number of milliseconds)
            ///        direction (default: "both") - select possible scrollings ("vertical" or "y", "horizontal" or "x", "both")
            ///        complete (default: none) - a function to call when scrolling completes (called in context of the DOM element being scrolled)
            /// </param>
            /// <return type="jQuery">Returns the same jQuery set that this function was run on.</return>

            options = $.extend({}, settings, options);
            options.direction = converter[typeof (options.direction) === "string" && options.direction.toLowerCase()] || converter.both;

            var dirStr = "";
            if (options.direction.x === true) dirStr = "horizontal";
            if (options.direction.y === true) dirStr = dirStr ? "both" : "vertical";

            var el = this.eq(0);
            var scroller = el.closest(":scrollable(" + dirStr + ")");

            // check if there's anything to scroll in the first place
            if (scroller.length > 0) {
                scroller = scroller.eq(0);

                var dim = {
                    e: dimensions(el),
                    s: dimensions(scroller)
                };

                var rel = {
                    top: dim.e.rect.top - (dim.s.rect.top + dim.s.border.top),
                    bottom: dim.s.rect.bottom - dim.s.border.bottom - dim.s.scrollbar.bottom - dim.e.rect.bottom,
                    left: dim.e.rect.left - (dim.s.rect.left + dim.s.border.left),
                    right: dim.s.rect.right - dim.s.border.right - dim.s.scrollbar.right - dim.e.rect.right
                };

                var animOptions = {};

                // vertical scroll
                if (options.direction.y === true) {
                    if (rel.top < 0) {
                        animOptions.scrollTop = dim.s.scroll.top + rel.top;
                    } else if (rel.top > 0 && rel.bottom < 0) {
                        animOptions.scrollTop = dim.s.scroll.top + Math.min(rel.top, -rel.bottom) + 100;
                    }
                }

                console.log(animOptions)

                // horizontal scroll
                // if (options.direction.x === true) {
                //     if (rel.left < 0) {
                //         animOptions.scrollLeft = dim.s.scroll.left + rel.left;
                //     } else if (rel.left > 0 && rel.right < 0) {
                //         animOptions.scrollLeft = dim.s.scroll.left + Math.min(rel.left, -rel.right);
                //     }
                // }

                // scroll if needed
                if (!$.isEmptyObject(animOptions)) {
                    if (rootrx.test(scroller[0].nodeName)) {
                        scroller = $("html");
                    }
                    scroller.animate(animOptions, 500)
                    // .eq(0) // we want function to be called just once (ref. "html")
                    // .queue(function (next) {
                    //     $.isFunction(options.complete) && options.complete.call(scroller[0]);
                    //     next();
                    // });
                } else {
                    // when there's nothing to scroll, just call the "complete" function
                    $.isFunction(options.complete) && options.complete.call(scroller[0]);
                }
            }

            // return set back
            return this;
        }
    });

    var scrollValue = {
        auto: true,
        scroll: true,
        visible: false,
        hidden: false
    };

    $.extend($.expr[":"], {
        scrollable: function (element, index, meta, stack) {
            var direction = converter[typeof (meta[3]) === "string" && meta[3].toLowerCase()] || converter.both;
            var styles = (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(element, null) : element.currentStyle);
            var overflow = {
                x: scrollValue[styles.overflowX.toLowerCase()] || false,
                y: scrollValue[styles.overflowY.toLowerCase()] || false,
                isRoot: rootrx.test(element.nodeName)
            };

            // check if completely unscrollable (exclude HTML element because it's special)
            if (!overflow.x && !overflow.y && !overflow.isRoot) {
                return false;
            }

            var size = {
                height: {
                    scroll: element.scrollHeight,
                    client: element.clientHeight
                },
                width: {
                    scroll: element.scrollWidth,
                    client: element.clientWidth
                },
                // check overflow.x/y because iPad (and possibly other tablets) don't dislay scrollbars
                scrollableX: function () {
                    return (overflow.x || overflow.isRoot) && this.width.scroll > this.width.client;
                },
                scrollableY: function () {
                    return (overflow.y || overflow.isRoot) && this.height.scroll > this.height.client;
                }
            };
            return direction.y && size.scrollableY() || direction.x && size.scrollableX();
        }
    });
})(jQuery);

// Calculate whether an item is in the viewport or not
$.fn.isInViewport = function() {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

/**
 * Focus State Manager: An overly-simple Focus State Manager
 */
var FocusStateManager = (function (window, document, undefined) {
    /**
     * Helper to export methods (and other things?) as globals
     */
    var _exports = {};

    window.fsmConfig = null;
    var col = 0, row = 0;

    function _export (namespace, fn) {
        if (!_exports[namespace]) _exports[namespace] = fn;
    }

    function removeFocusStateManager () {
        $("[class^='fs-'], [class*=' fs-']").each(function () {
            this.classList.forEach(function (className) {
                if (className.indexOf('fs-') === 0) $('.'+className).removeClass(className);
            });
        });

        $('.focused').removeClass('focused');
        window.fsmConfig = null;
    }

    function findNextRow () {
        var nextRow = 0, found = 0;

        while (!found) {
            if (!$('.fs-'+nextRow+'-0').length) {
                found = 1;
                return nextRow;
            }
            nextRow++;
        }
    }

    // Generate classes for a grid of child elements
    function generateClassesInGrid (selector, cols) {
        var col = 0;
        var row = findNextRow();

        $(selector).each(function () {
            $(this).addClass('fs-'+row+'-'+col);

            col++;
            if (col > cols) {
                row++;
                col = 0;
            }
        });
    }

    // Generate classes for a single row of child elements
    function generateClassesForRow (selector) {
        var col = 0;
        var row = findNextRow();

        $(selector).each(function () {
            $(this).addClass('fs-'+row+'-'+col);
            col++;
        });
    }

    function checkIsInViewport ($el) {
        var isInViewport = $el.isInViewport();
        // console.log('isInViewport?', isInViewport);

        if (!isInViewport) $el[0].scrollIntoView();

        // if (!isInViewport) $el.scrollintoview({
        //     duration: 500,
        //     direction: "vertical"
        // });
        // $el.scrollintoview({ direction: "y" });

        setTimeout(function () {
            if ($('html').scrollTop() < 300) $('html').scrollTop(0);
            if (($('html').scrollTop() + $(window).height()) - $('.focused').offset().top < 200) $('html').scrollTop($('html').scrollTop() + 300);
            if ($('.focused').offset().top - $('html').scrollTop()  < 10) $('html').scrollTop($('.focused').offset().top - 20);
        }, 1);

        // setTimeout(function () {
        //     if ($('html').scrollTop() < 300) $('html').animate({ scrollTop: 0 }, 200);
        //     // if (($('html').scrollTop() + $(window).height()) - $('.focused').offset().top < 200) $('html').scrollTop($('html').scrollTop() + 300);
        //     // if ($('.focused').offset().top - $('html').scrollTop()  < 10) $('html').scrollTop($('.focused').offset().top - 20);
        // }, 500);
    }

    function tryApplying (fn) {
        var oldCol = col.toString(), oldRow = row.toString();

        if (fn && typeof fn === 'function') fn();

        var $this = $(`.fs-${row}-${col}`);

        if ($this.length) {
            checkIsInViewport($this);
            $('.focused').removeClass('focused');
            $('.fs-'+row+'-'+col).first().addClass('focused');

            if (fsmConfig && fsmConfig.afterTransition && typeof fsmConfig.afterTransition === 'function') fsmConfig.afterTransition(row, col);

        } else {
            // console.log(oldCol, oldRow);
            // Rollback and revert
            col = + oldCol;
            row = + oldRow;
        }
    }

    function goto (roww, coll) {
        tryApplying(function () {
            col = coll;
            row = roww;
        });
    }

    function current () {
        return {
            row: row,
            col: col
        }
    }



    function beforeTransition (roww, coll, key, cb) {
        if (fsmConfig && fsmConfig.beforeTransition && fsmConfig.beforeTransition(roww, coll, key)) fsmConfig.beforeTransition(roww, coll, key)();
        else transition(key);
    }


    function transition (key) {
        switch (key) {
            case 27:
                if (fsmConfig.onPressBack) fsmConfig.onPressBack();
                break;
            case 32:
                if ($('.focused').length) $('.focused')[0].click();
                break;
            case 37:
                goto(row, col - 1);
                break;
            case 38:
                goto(row - 1, col);
                break;
            case 39:
                goto(row, col + 1);
                break;
            case 40:
                goto(row + 1, col);
                break;
        }
    }

    function bindFocusStateManager (config) {

        window.fsmConfig = config;

        var className = $('.focused').first().attr('class');
        if (className && className.indexOf('fs-') !== -1) {
            className = className.split(' ')[1];
            className = className.split('fs-')[1];
            if (className) row = className.split('-')[0];
            if (className) col = className.split('-')[1];
        }

        $('body').off('keydown').on('keydown', function (e) {
            var key = e.which;
            if (key >= 27 && key <= 40) e.preventDefault();
            beforeTransition(row, col, key);
        });

        $(`.fs-${ row }-${ col }`).addClass('focused');
    }

    _export('goto', goto);
    _export('current', current);
    _export('add', generateClassesForRow);
    _export('bind', bindFocusStateManager);
    _export('addGrid', generateClassesInGrid);
    _export('remove', removeFocusStateManager);

    return function () {
        return _exports;
    };

})(window, document);
