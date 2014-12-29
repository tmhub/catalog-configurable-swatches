// ==============================================
// Pointer abstraction
// ==============================================

/**
 * This class provides an easy and abstracted mechanism to determine the
 * best pointer behavior to use -- that is, is the user currently interacting
 * with their device in a touch manner, or using a mouse.
 *
 * Since devices may use either touch or mouse or both, there is no way to
 * know the user's preferred pointer type until they interact with the site.
 *
 * To accommodate this, this class provides a method and two events
 * to determine the user's preferred pointer type.
 *
 * - getPointer() returns the last used pointer type, or, if the user has
 *   not yet interacted with the site, falls back to a Modernizr test.
 *
 * - The mouse-detected event is triggered on the window object when the user
 *   is using a mouse pointer input, or has switched from touch to mouse input.
 *   It can be observed in this manner: $j(window).on('mouse-detected', function(event) { // custom code });
 *
 * - The touch-detected event is triggered on the window object when the user
 *   is using touch pointer input, or has switched from mouse to touch input.
 *   It can be observed in this manner: $j(window).on('touch-detected', function(event) { // custom code });
 */
var PointerManager = {
    MOUSE_POINTER_TYPE: 'mouse',
    TOUCH_POINTER_TYPE: 'touch',
    POINTER_EVENT_TIMEOUT_MS: 500,
    standardTouch: false,
    touchDetectionEvent: null,
    lastTouchType: null,
    pointerTimeout: null,
    pointerEventLock: false,

    getPointerEventsSupported: function() {
        return this.standardTouch;
    },

    getPointerEventsInputTypes: function() {
        if (window.navigator.pointerEnabled) { //IE 11+
            //return string values from http://msdn.microsoft.com/en-us/library/windows/apps/hh466130.aspx
            return {
                MOUSE: 'mouse',
                TOUCH: 'touch',
                PEN: 'pen'
            };
        } else if (window.navigator.msPointerEnabled) { //IE 10
            //return numeric values from http://msdn.microsoft.com/en-us/library/windows/apps/hh466130.aspx
            return {
                MOUSE:  0x00000004,
                TOUCH:  0x00000002,
                PEN:    0x00000003
            };
        } else { //other browsers don't support pointer events
            return {}; //return empty object
        }
    },

    /**
     * If called before init(), get best guess of input pointer type
     * using Modernizr test.
     * If called after init(), get current pointer in use.
     */
    getPointer: function() {
        // On iOS devices, always default to touch, as this.lastTouchType will intermittently return 'mouse' if
        // multiple touches are triggered in rapid succession in Safari on iOS
        if(Modernizr.ios) {
            return this.TOUCH_POINTER_TYPE;
        }

        if(this.lastTouchType) {
            return this.lastTouchType;
        }

        return Modernizr.touch ? this.TOUCH_POINTER_TYPE : this.MOUSE_POINTER_TYPE;
    },

    setPointerEventLock: function() {
        this.pointerEventLock = true;
    },
    clearPointerEventLock: function() {
        this.pointerEventLock = false;
    },
    setPointerEventLockTimeout: function() {
        var that = this;

        if(this.pointerTimeout) {
            clearTimeout(this.pointerTimeout);
        }

        this.setPointerEventLock();
        this.pointerTimeout = setTimeout(function() { that.clearPointerEventLock(); }, this.POINTER_EVENT_TIMEOUT_MS);
    },

    triggerMouseEvent: function(originalEvent) {
        if(this.lastTouchType == this.MOUSE_POINTER_TYPE) {
            return; //prevent duplicate events
        }

        this.lastTouchType = this.MOUSE_POINTER_TYPE;
        $j(window).trigger('mouse-detected', originalEvent);
    },
    triggerTouchEvent: function(originalEvent) {
        if(this.lastTouchType == this.TOUCH_POINTER_TYPE) {
            return; //prevent duplicate events
        }

        this.lastTouchType = this.TOUCH_POINTER_TYPE;
        $j(window).trigger('touch-detected', originalEvent);
    },

    initEnv: function() {
        if (window.navigator.pointerEnabled) {
            this.standardTouch = true;
            this.touchDetectionEvent = 'pointermove';
        } else if (window.navigator.msPointerEnabled) {
            this.standardTouch = true;
            this.touchDetectionEvent = 'MSPointerMove';
        } else {
            this.touchDetectionEvent = 'touchstart';
        }
    },

    wirePointerDetection: function() {
        var that = this;

        if(this.standardTouch) { //standard-based touch events. Wire only one event.
            //detect pointer event
            $j(window).on(this.touchDetectionEvent, function(e) {
                switch(e.originalEvent.pointerType) {
                    case that.getPointerEventsInputTypes().MOUSE:
                        that.triggerMouseEvent(e);
                        break;
                    case that.getPointerEventsInputTypes().TOUCH:
                    case that.getPointerEventsInputTypes().PEN:
                        // intentionally group pen and touch together
                        that.triggerTouchEvent(e);
                        break;
                }
            });
        } else { //non-standard touch events. Wire touch and mouse competing events.
            //detect first touch
            $j(window).on(this.touchDetectionEvent, function(e) {
                if(that.pointerEventLock) {
                    return;
                }

                that.setPointerEventLockTimeout();
                that.triggerTouchEvent(e);
            });

            //detect mouse usage
            $j(document).on('mouseover', function(e) {
                if(that.pointerEventLock) {
                    return;
                }

                that.setPointerEventLockTimeout();
                that.triggerMouseEvent(e);
            });
        }
    },

    init: function() {
        this.initEnv();
        this.wirePointerDetection();
    }
};

/**
 * Default ProductMediaManager for default magento Zoom
 * @type {Object}
 */
var ProductMediaManager = {
    IMAGE_ZOOM_THRESHOLD: 20,
    imageWrapper: null,

    destroyZoom: function() {},
    initZoom: function() {},
    wireThumbnails: function() {},

    createZoom: function(image) {
        var img = $j('.product-img-box .product-image img');

        var srcset = img.attr('srcset'),
            newSrc = image.attr('src');
        img.attr('src', newSrc);

        if (srcset) {
            if (image.attr('srcset')) {
                img.attr('srcset', image.attr('srcset'));
            } else {
                var newSrcset = '';
                srcset.split(',').each(function(rule) {
                    rule = rule.split(' ');
                    newSrcset = newSrc + ' ' + rule[1];
                });
                img.attr('srcset', newSrcset);
            }
        }
    },

    swapImage: function(targetImage) {
        targetImage = $j(targetImage);
        targetImage.addClass('gallery-image');

        var imageGallery = $j('.product-img-box .product-image');

        if (targetImage[0].complete) {
            ProductMediaManager.createZoom(targetImage);
        } else {
            imageGallery.addClass('loading');
            imagesLoaded(targetImage, function() {
                imageGallery.removeClass('loading');
                ProductMediaManager.createZoom(targetImage);
            });
        }
    },

    init: function() {
        ProductMediaManager.imageWrapper = $j('.product-img-box');
        $j(document).trigger('product-media-loaded', ProductMediaManager);
    }
};

$j(document).ready(function() {
    ProductMediaManager.init();
});

// configurable swatches integration
document.observe("dom:loaded", function () {
    if ('undefined' !== typeof Product && 'undefined' !== typeof Product.ConfigurableSwatches) {
        Product.ConfigurableSwatches.prototype.initialize =
            Product.ConfigurableSwatches.prototype.initialize.wrap(function(original, spConfig) {
                // fix for multiple calls to Product.ConfigurableSwatches
                this._E.activeConfigurableOptions = [];
                this._E.allConfigurableOptions    = [];

                original(spConfig);
            });
    }

    if ('undefined' !== typeof ConfigurableMediaImages) {
        ConfigurableMediaImages.init = ConfigurableMediaImages.init.wrap(function(original, imageType) {
            // fit to make the swatches work in listing after the ajax popup with another swatches was closed
            if (ConfigurableMediaImages.imageType) {
                imageType = ConfigurableMediaImages.imageType;
            }
            original(imageType);
        });

        /**
         * Improved method to prevent overriding of previously loaded data.
         * This happens when AjaxPro popup is called on category listing or More products is clicked -
         * object with base_image info override the object with small_image info.
         *
         * @param {Int} productId
         * @param {Object} imageFallback
         */
        ConfigurableMediaImages.setImageFallback = function(productId, imageFallback) {
            for (var i in imageFallback) {
                var oldData = ConfigurableMediaImages.productImages[productId] ?
                        ConfigurableMediaImages.productImages[productId][i] : undefined;

                if (oldData) {
                    if (undefined === oldData.length || oldData.length) {
                        continue; // data is already loaded
                    }
                }

                if (!ConfigurableMediaImages.productImages[productId]) {
                    ConfigurableMediaImages.productImages[productId] = imageFallback;
                } else {
                    ConfigurableMediaImages.productImages[productId][i] = imageFallback[i];
                }
            }
        };

        // Magento ConfigurableMediaImages.arrayIntersect is written to
        // receive sorted product ids but it's not always true.
        // The next override will fix this issue
        ConfigurableMediaImages.arrayIntersect =
            ConfigurableMediaImages.arrayIntersect.wrap(function(o, a, b) {
                a.sort();
                b.sort();
                return o(a, b);
            });
    }
});
