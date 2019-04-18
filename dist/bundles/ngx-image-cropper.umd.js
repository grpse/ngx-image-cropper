(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/platform-browser'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('ngx-image-cropper', ['exports', '@angular/core', '@angular/platform-browser', '@angular/common'], factory) :
    (factory((global['ngx-image-cropper'] = {}),global.ng.core,global.ng.platformBrowser,global.ng.common));
}(this, (function (exports,core,platformBrowser,common) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    /**
     * @param {?} srcBase64
     * @return {?}
     */
    function resetExifOrientation(srcBase64) {
        try {
            /** @type {?} */
            var exifRotation = getExifRotation(srcBase64);
            if (exifRotation > 1) {
                return transformBase64BasedOnExifRotation(srcBase64, exifRotation);
            }
            else {
                return Promise.resolve(srcBase64);
            }
        }
        catch (ex) {
            return Promise.reject(ex);
        }
    }
    /**
     * @param {?} srcBase64
     * @param {?} exifRotation
     * @return {?}
     */
    function transformBase64BasedOnExifRotation(srcBase64, exifRotation) {
        return new Promise(function (resolve, reject) {
            /** @type {?} */
            var img = new Image();
            img.onload = function () {
                /** @type {?} */
                var width = img.width;
                /** @type {?} */
                var height = img.height;
                /** @type {?} */
                var canvas = document.createElement('canvas');
                /** @type {?} */
                var ctx = canvas.getContext('2d');
                if (ctx) {
                    if (4 < exifRotation && exifRotation < 9) {
                        canvas.width = height;
                        canvas.height = width;
                    }
                    else {
                        canvas.width = width;
                        canvas.height = height;
                    }
                    transformCanvas(ctx, exifRotation, width, height);
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL());
                }
                else {
                    reject(new Error('No context'));
                }
            };
            img.src = srcBase64;
        });
    }
    /**
     * @param {?} imageBase64
     * @return {?}
     */
    function getExifRotation(imageBase64) {
        /** @type {?} */
        var view = new DataView(base64ToArrayBuffer(imageBase64));
        if (view.getUint16(0, false) != 0xFFD8) {
            return -2;
        }
        /** @type {?} */
        var length = view.byteLength;
        /** @type {?} */
        var offset = 2;
        while (offset < length) {
            if (view.getUint16(offset + 2, false) <= 8)
                return -1;
            /** @type {?} */
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) {
                    return -1;
                }
                /** @type {?} */
                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                /** @type {?} */
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++) {
                    if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                        return view.getUint16(offset + (i * 12) + 8, little);
                    }
                }
            }
            else if ((marker & 0xFF00) != 0xFF00) {
                break;
            }
            else {
                offset += view.getUint16(offset, false);
            }
        }
        return -1;
    }
    /**
     * @param {?} imageBase64
     * @return {?}
     */
    function base64ToArrayBuffer(imageBase64) {
        imageBase64 = imageBase64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        /** @type {?} */
        var binaryString = atob(imageBase64);
        /** @type {?} */
        var len = binaryString.length;
        /** @type {?} */
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
    /**
     * @param {?} ctx
     * @param {?} orientation
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    function transformCanvas(ctx, orientation, width, height) {
        switch (orientation) {
            case 2:
                ctx.transform(-1, 0, 0, 1, width, 0);
                break;
            case 3:
                ctx.transform(-1, 0, 0, -1, width, height);
                break;
            case 4:
                ctx.transform(1, 0, 0, -1, 0, height);
                break;
            case 5:
                ctx.transform(0, 1, 1, 0, 0, 0);
                break;
            case 6:
                ctx.transform(0, 1, -1, 0, height, 0);
                break;
            case 7:
                ctx.transform(0, -1, -1, 0, height, width);
                break;
            case 8:
                ctx.transform(0, -1, 1, 0, 0, width);
                break;
        }
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    /*
     * Hermite resize - fast image resize/resample using Hermite filter.
     * https://github.com/viliusle/Hermite-resize
     */
    /**
     * @param {?} canvas
     * @param {?} width
     * @param {?} height
     * @param {?=} resizeCanvas
     * @return {?}
     */
    function resizeCanvas(canvas, width, height, resizeCanvas) {
        if (resizeCanvas === void 0) {
            resizeCanvas = true;
        }
        try {
            /** @type {?} */
            var width_source = canvas.width || width;
            /** @type {?} */
            var height_source = canvas.height || height;
            width = Math.round(width);
            height = Math.round(height);
            /** @type {?} */
            var ratio_w = width_source / width;
            /** @type {?} */
            var ratio_h = height_source / height;
            /** @type {?} */
            var ratio_w_half = Math.ceil(ratio_w / 2);
            /** @type {?} */
            var ratio_h_half = Math.ceil(ratio_h / 2);
            /** @type {?} */
            var ctx = canvas.getContext('2d');
            if (ctx) {
                /** @type {?} */
                var img = ctx.getImageData(0, 0, width_source, height_source);
                /** @type {?} */
                var img2 = ctx.createImageData(width, height);
                /** @type {?} */
                var data = img.data;
                /** @type {?} */
                var data2 = img2.data;
                for (var j = 0; j < height; j++) {
                    for (var i = 0; i < width; i++) {
                        /** @type {?} */
                        var x2 = (i + j * width) * 4;
                        /** @type {?} */
                        var center_y = j * ratio_h;
                        /** @type {?} */
                        var weight = 0;
                        /** @type {?} */
                        var weights = 0;
                        /** @type {?} */
                        var weights_alpha = 0;
                        /** @type {?} */
                        var gx_r = 0;
                        /** @type {?} */
                        var gx_g = 0;
                        /** @type {?} */
                        var gx_b = 0;
                        /** @type {?} */
                        var gx_a = 0;
                        /** @type {?} */
                        var xx_start = Math.floor(i * ratio_w);
                        /** @type {?} */
                        var yy_start = Math.floor(j * ratio_h);
                        /** @type {?} */
                        var xx_stop = Math.ceil((i + 1) * ratio_w);
                        /** @type {?} */
                        var yy_stop = Math.ceil((j + 1) * ratio_h);
                        xx_stop = Math.min(xx_stop, width_source);
                        yy_stop = Math.min(yy_stop, height_source);
                        for (var yy = yy_start; yy < yy_stop; yy++) {
                            /** @type {?} */
                            var dy = Math.abs(center_y - yy) / ratio_h_half;
                            /** @type {?} */
                            var center_x = i * ratio_w;
                            /** @type {?} */
                            var w0 = dy * dy; //pre-calc part of w
                            for (var xx = xx_start; xx < xx_stop; xx++) {
                                /** @type {?} */
                                var dx = Math.abs(center_x - xx) / ratio_w_half;
                                /** @type {?} */
                                var w = Math.sqrt(w0 + dx * dx);
                                if (w >= 1) {
                                    //pixel too far
                                    continue;
                                }
                                //hermite filter
                                weight = 2 * w * w * w - 3 * w * w + 1;
                                /** @type {?} */
                                var pos_x = 4 * (xx + yy * width_source);
                                //alpha
                                gx_a += weight * data[pos_x + 3];
                                weights_alpha += weight;
                                //colors
                                if (data[pos_x + 3] < 255)
                                    weight = weight * data[pos_x + 3] / 250;
                                gx_r += weight * data[pos_x];
                                gx_g += weight * data[pos_x + 1];
                                gx_b += weight * data[pos_x + 2];
                                weights += weight;
                            }
                        }
                        data2[x2] = gx_r / weights;
                        data2[x2 + 1] = gx_g / weights;
                        data2[x2 + 2] = gx_b / weights;
                        data2[x2 + 3] = gx_a / weights_alpha;
                    }
                }
                //clear and resize canvas
                if (resizeCanvas) {
                    canvas.width = width;
                    canvas.height = height;
                }
                else {
                    ctx.clearRect(0, 0, width_source, height_source);
                }
                //draw
                ctx.putImageData(img2, 0, 0);
            }
        }
        catch (e) {
        }
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var ImageCropperComponent = (function () {
        function ImageCropperComponent(sanitizer, cd, zone) {
            this.sanitizer = sanitizer;
            this.cd = cd;
            this.zone = zone;
            this.setImageMaxSizeRetries = 0;
            this.cropperScaledMinWidth = 20;
            this.cropperScaledMinHeight = 20;
            this.marginLeft = '0px';
            this.imageVisible = false;
            this.format = 'png';
            this.outputType = 'both';
            this.maintainAspectRatio = true;
            this.aspectRatio = 1;
            this.resizeToWidth = 0;
            this.cropperMinWidth = 0;
            this.roundCropper = false;
            this.onlyScaleDown = false;
            this.imageQuality = 92;
            this.autoCrop = true;
            this.cropper = {
                x1: -100,
                y1: -100,
                x2: 10000,
                y2: 10000
            };
            this.alignImage = 'center';
            this.startCropImage = new core.EventEmitter();
            this.imageCropped = new core.EventEmitter();
            this.imageCroppedBase64 = new core.EventEmitter();
            this.imageCroppedFile = new core.EventEmitter();
            this.imageLoaded = new core.EventEmitter();
            this.cropperReady = new core.EventEmitter();
            this.loadImageFailed = new core.EventEmitter();
            this._canUseCustomData = false;
            this.initCropper();
        }
        Object.defineProperty(ImageCropperComponent.prototype, "imageFileChanged", {
            set: /**
             * @param {?} file
             * @return {?}
             */ function (file) {
                this.initCropper();
                if (file) {
                    this.loadImageFile(file);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageCropperComponent.prototype, "imageChangedEvent", {
            set: /**
             * @param {?} event
             * @return {?}
             */ function (event) {
                this.initCropper();
                if (event && event.target && event.target.files && event.target.files.length > 0) {
                    this.loadImageFile(event.target.files[0]);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageCropperComponent.prototype, "imageBase64", {
            set: /**
             * @param {?} imageBase64
             * @return {?}
             */ function (imageBase64) {
                this.initCropper();
                this.loadBase64Image(imageBase64);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageCropperComponent.prototype, "cropSetOriginalSize", {
            set: /**
             * @param {?} size
             * @return {?}
             */ function (size) {
                this.originalSize.width = size.width;
                this.originalSize.height = size.height;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param {?} changes
         * @return {?}
         */
        ImageCropperComponent.prototype.ngOnChanges = /**
         * @param {?} changes
         * @return {?}
         */
            function (changes) {
                if (changes["cropper"]) {
                    this.setMaxSize();
                    this.setCropperScaledMinSize();
                    this.checkCropperPosition(false);
                    this.doAutoCrop();
                    this.cd.markForCheck();
                }
                if (changes["aspectRatio"] && this.imageVisible) {
                    this.resetCropperPosition();
                }
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.initCropper = /**
         * @return {?}
         */
            function () {
                this.imageVisible = false;
                this.originalImage = null;
                this.safeImgDataUrl = 'data:image/png;base64,iVBORw0KGg'
                    + 'oAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAU'
                    + 'AAarVyFEAAAAASUVORK5CYII=';
                this.moveStart = {
                    active: false,
                    type: null,
                    position: null,
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0,
                    clientX: 0,
                    clientY: 0
                };
                this.maxSize = {
                    width: 0,
                    height: 0
                };
                this.originalSize = {
                    width: 0,
                    height: 0
                };
                this.cropper.x1 = -100;
                this.cropper.y1 = -100;
                this.cropper.x2 = 10000;
                this.cropper.y2 = 10000;
            };
        /**
         * @param {?} file
         * @return {?}
         */
        ImageCropperComponent.prototype.loadImageFile = /**
         * @param {?} file
         * @return {?}
         */
            function (file) {
                var _this = this;
                /** @type {?} */
                var fileReader = new FileReader();
                fileReader.onload = function (event) {
                    /** @type {?} */
                    var imageType = file.type;
                    if (_this.isValidImageType(imageType)) {
                        resetExifOrientation(event.target.result)
                            .then(function (resultBase64) { return _this.loadBase64Image(resultBase64); })
                            .catch(function () { return _this.loadImageFailed.emit(); });
                    }
                    else {
                        _this.loadImageFailed.emit();
                    }
                };
                fileReader.readAsDataURL(file);
            };
        /**
         * @param {?} type
         * @return {?}
         */
        ImageCropperComponent.prototype.isValidImageType = /**
         * @param {?} type
         * @return {?}
         */
            function (type) {
                return /image\/(png|jpg|jpeg|bmp|gif|tiff)/.test(type);
            };
        /**
         * @param {?} imageBase64
         * @return {?}
         */
        ImageCropperComponent.prototype.loadBase64Image = /**
         * @param {?} imageBase64
         * @return {?}
         */
            function (imageBase64) {
                var _this = this;
                this.originalBase64 = imageBase64;
                this.safeImgDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(imageBase64);
                this.originalImage = new Image();
                this.originalImage.onload = function () {
                    _this.originalSize.width = _this.originalImage.width;
                    _this.originalSize.height = _this.originalImage.height;
                    _this.cd.markForCheck();
                };
                this.originalImage.src = imageBase64;
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.imageLoadedInView = /**
         * @return {?}
         */
            function () {
                var _this = this;
                if (this.originalImage != null) {
                    this.imageLoaded.emit();
                    this.setImageMaxSizeRetries = 0;
                    setTimeout(function () { return _this.checkImageMaxSizeRecursively(); });
                }
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.checkImageMaxSizeRecursively = /**
         * @return {?}
         */
            function () {
                var _this = this;
                if (this.setImageMaxSizeRetries > 40) {
                    this.loadImageFailed.emit();
                }
                else if (this.sourceImage && this.sourceImage.nativeElement && this.sourceImage.nativeElement.offsetWidth > 0) {
                    this.setMaxSize();
                    this.setCropperScaledMinSize();
                    this.resetCropperPosition();
                    this.cropperReady.emit();
                    this.cd.markForCheck();
                }
                else {
                    this.setImageMaxSizeRetries++;
                    setTimeout(function () {
                        _this.checkImageMaxSizeRecursively();
                    }, 50);
                }
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.onResize = /**
         * @return {?}
         */
            function () {
                this.resizeCropperPosition();
                this.setMaxSize();
                this.setCropperScaledMinSize();
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.rotateLeft = /**
         * @return {?}
         */
            function () {
                this.transformBase64(8);
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.rotateRight = /**
         * @return {?}
         */
            function () {
                this.transformBase64(6);
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.flipHorizontal = /**
         * @return {?}
         */
            function () {
                this.transformBase64(2);
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.flipVertical = /**
         * @return {?}
         */
            function () {
                this.transformBase64(4);
            };
        /**
         * @param {?} exifOrientation
         * @return {?}
         */
        ImageCropperComponent.prototype.transformBase64 = /**
         * @param {?} exifOrientation
         * @return {?}
         */
            function (exifOrientation) {
                var _this = this;
                if (this.originalBase64) {
                    transformBase64BasedOnExifRotation(this.originalBase64, exifOrientation)
                        .then(function (rotatedBase64) { return _this.loadBase64Image(rotatedBase64); });
                }
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.resizeCropperPosition = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var sourceImageElement = this.sourceImage.nativeElement;
                if (this.maxSize.width !== sourceImageElement.offsetWidth || this.maxSize.height !== sourceImageElement.offsetHeight) {
                    this.cropper.x1 = this.cropper.x1 * sourceImageElement.offsetWidth / this.maxSize.width;
                    this.cropper.x2 = this.cropper.x2 * sourceImageElement.offsetWidth / this.maxSize.width;
                    this.cropper.y1 = this.cropper.y1 * sourceImageElement.offsetHeight / this.maxSize.height;
                    this.cropper.y2 = this.cropper.y2 * sourceImageElement.offsetHeight / this.maxSize.height;
                }
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.resetCropperPosition = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var sourceImageElement = this.sourceImage.nativeElement;
                if (!this.maintainAspectRatio) {
                    this.cropper.x1 = 0;
                    this.cropper.x2 = sourceImageElement.offsetWidth;
                    this.cropper.y1 = 0;
                    this.cropper.y2 = sourceImageElement.offsetHeight;
                }
                else if (sourceImageElement.offsetWidth / this.aspectRatio < sourceImageElement.offsetHeight) {
                    this.cropper.x1 = 0;
                    this.cropper.x2 = sourceImageElement.offsetWidth;
                    /** @type {?} */
                    var cropperHeight = sourceImageElement.offsetWidth / this.aspectRatio;
                    this.cropper.y1 = (sourceImageElement.offsetHeight - cropperHeight) / 2;
                    this.cropper.y2 = this.cropper.y1 + cropperHeight;
                }
                else {
                    this.cropper.y1 = 0;
                    this.cropper.y2 = sourceImageElement.offsetHeight;
                    /** @type {?} */
                    var cropperWidth = sourceImageElement.offsetHeight * this.aspectRatio;
                    this.cropper.x1 = (sourceImageElement.offsetWidth - cropperWidth) / 2;
                    this.cropper.x2 = this.cropper.x1 + cropperWidth;
                }
                this.doAutoCrop();
                this.imageVisible = true;
            };
        /**
         * @param {?} event
         * @param {?} moveType
         * @param {?=} position
         * @return {?}
         */
        ImageCropperComponent.prototype.startMove = /**
         * @param {?} event
         * @param {?} moveType
         * @param {?=} position
         * @return {?}
         */
            function (event, moveType, position) {
                if (position === void 0) {
                    position = null;
                }
                event.preventDefault();
                this.moveStart = __assign({ active: true, type: moveType, position: position, clientX: this.getClientX(event), clientY: this.getClientY(event) }, this.cropper);
            };
        /**
         * @param {?} event
         * @return {?}
         */
        ImageCropperComponent.prototype.moveImg = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                if (this.moveStart.active) {
                    event.stopPropagation();
                    event.preventDefault();
                    if (this.moveStart.type === 'move') {
                        this.move(event);
                        this.checkCropperPosition(true);
                    }
                    else if (this.moveStart.type === 'resize') {
                        this.resize(event);
                        this.checkCropperPosition(false);
                    }
                    this.cd.detectChanges();
                }
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.setMaxSize = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var sourceImageElement = this.sourceImage.nativeElement;
                this.maxSize.width = sourceImageElement.offsetWidth;
                this.maxSize.height = sourceImageElement.offsetHeight;
                this.marginLeft = this.sanitizer.bypassSecurityTrustStyle('calc(50% - ' + this.maxSize.width / 2 + 'px)');
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.setCropperScaledMinSize = /**
         * @return {?}
         */
            function () {
                if (this.originalImage && this.cropperMinWidth > 0) {
                    this.cropperScaledMinWidth = Math.max(20, this.cropperMinWidth / this.originalImage.width * this.maxSize.width);
                    this.cropperScaledMinHeight = this.maintainAspectRatio
                        ? Math.max(20, this.cropperScaledMinWidth / this.aspectRatio)
                        : 20;
                }
                else {
                    this.cropperScaledMinWidth = 20;
                    this.cropperScaledMinHeight = 20;
                }
            };
        /**
         * @param {?=} maintainSize
         * @return {?}
         */
        ImageCropperComponent.prototype.checkCropperPosition = /**
         * @param {?=} maintainSize
         * @return {?}
         */
            function (maintainSize) {
                if (maintainSize === void 0) {
                    maintainSize = false;
                }
                if (this.cropper.x1 < 0) {
                    this.cropper.x2 -= maintainSize ? this.cropper.x1 : 0;
                    this.cropper.x1 = 0;
                }
                if (this.cropper.y1 < 0) {
                    this.cropper.y2 -= maintainSize ? this.cropper.y1 : 0;
                    this.cropper.y1 = 0;
                }
                if (this.cropper.x2 > this.maxSize.width) {
                    this.cropper.x1 -= maintainSize ? (this.cropper.x2 - this.maxSize.width) : 0;
                    this.cropper.x2 = this.maxSize.width;
                }
                if (this.cropper.y2 > this.maxSize.height) {
                    this.cropper.y1 -= maintainSize ? (this.cropper.y2 - this.maxSize.height) : 0;
                    this.cropper.y2 = this.maxSize.height;
                }
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.moveStop = /**
         * @return {?}
         */
            function () {
                if (this.moveStart.active) {
                    this.moveStart.active = false;
                    this.doAutoCrop();
                }
            };
        /**
         * @param {?} event
         * @return {?}
         */
        ImageCropperComponent.prototype.move = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                /** @type {?} */
                var diffX = this.getClientX(event) - this.moveStart.clientX;
                /** @type {?} */
                var diffY = this.getClientY(event) - this.moveStart.clientY;
                this.cropper.x1 = this.moveStart.x1 + diffX;
                this.cropper.y1 = this.moveStart.y1 + diffY;
                this.cropper.x2 = this.moveStart.x2 + diffX;
                this.cropper.y2 = this.moveStart.y2 + diffY;
            };
        /**
         * @param {?} event
         * @return {?}
         */
        ImageCropperComponent.prototype.resize = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                /** @type {?} */
                var diffX = this.getClientX(event) - this.moveStart.clientX;
                /** @type {?} */
                var diffY = this.getClientY(event) - this.moveStart.clientY;
                switch (this.moveStart.position) {
                    case 'left':
                        this.cropper.x1 = Math.min(this.moveStart.x1 + diffX, this.cropper.x2 - this.cropperScaledMinWidth);
                        break;
                    case 'topleft':
                        this.cropper.x1 = Math.min(this.moveStart.x1 + diffX, this.cropper.x2 - this.cropperScaledMinWidth);
                        this.cropper.y1 = Math.min(this.moveStart.y1 + diffY, this.cropper.y2 - this.cropperScaledMinHeight);
                        break;
                    case 'top':
                        this.cropper.y1 = Math.min(this.moveStart.y1 + diffY, this.cropper.y2 - this.cropperScaledMinHeight);
                        break;
                    case 'topright':
                        this.cropper.x2 = Math.max(this.moveStart.x2 + diffX, this.cropper.x1 + this.cropperScaledMinWidth);
                        this.cropper.y1 = Math.min(this.moveStart.y1 + diffY, this.cropper.y2 - this.cropperScaledMinHeight);
                        break;
                    case 'right':
                        this.cropper.x2 = Math.max(this.moveStart.x2 + diffX, this.cropper.x1 + this.cropperScaledMinWidth);
                        break;
                    case 'bottomright':
                        this.cropper.x2 = Math.max(this.moveStart.x2 + diffX, this.cropper.x1 + this.cropperScaledMinWidth);
                        this.cropper.y2 = Math.max(this.moveStart.y2 + diffY, this.cropper.y1 + this.cropperScaledMinHeight);
                        break;
                    case 'bottom':
                        this.cropper.y2 = Math.max(this.moveStart.y2 + diffY, this.cropper.y1 + this.cropperScaledMinHeight);
                        break;
                    case 'bottomleft':
                        this.cropper.x1 = Math.min(this.moveStart.x1 + diffX, this.cropper.x2 - this.cropperScaledMinWidth);
                        this.cropper.y2 = Math.max(this.moveStart.y2 + diffY, this.cropper.y1 + this.cropperScaledMinHeight);
                        break;
                }
                if (this.maintainAspectRatio) {
                    this.checkAspectRatio();
                }
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.checkAspectRatio = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var overflowX = 0;
                /** @type {?} */
                var overflowY = 0;
                switch (this.moveStart.position) {
                    case 'top':
                        this.cropper.x2 = this.cropper.x1 + (this.cropper.y2 - this.cropper.y1) * this.aspectRatio;
                        overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                        overflowY = Math.max(0 - this.cropper.y1, 0);
                        if (overflowX > 0 || overflowY > 0) {
                            this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                            this.cropper.y1 += (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                        }
                        break;
                    case 'bottom':
                        this.cropper.x2 = this.cropper.x1 + (this.cropper.y2 - this.cropper.y1) * this.aspectRatio;
                        overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                        overflowY = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                        if (overflowX > 0 || overflowY > 0) {
                            this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                            this.cropper.y2 -= (overflowY * this.aspectRatio) > overflowX ? overflowY : (overflowX / this.aspectRatio);
                        }
                        break;
                    case 'topleft':
                        this.cropper.y1 = this.cropper.y2 - (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                        overflowX = Math.max(0 - this.cropper.x1, 0);
                        overflowY = Math.max(0 - this.cropper.y1, 0);
                        if (overflowX > 0 || overflowY > 0) {
                            this.cropper.x1 += (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                            this.cropper.y1 += (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                        }
                        break;
                    case 'topright':
                        this.cropper.y1 = this.cropper.y2 - (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                        overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                        overflowY = Math.max(0 - this.cropper.y1, 0);
                        if (overflowX > 0 || overflowY > 0) {
                            this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                            this.cropper.y1 += (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                        }
                        break;
                    case 'right':
                    case 'bottomright':
                        this.cropper.y2 = this.cropper.y1 + (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                        overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                        overflowY = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                        if (overflowX > 0 || overflowY > 0) {
                            this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                            this.cropper.y2 -= (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                        }
                        break;
                    case 'left':
                    case 'bottomleft':
                        this.cropper.y2 = this.cropper.y1 + (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                        overflowX = Math.max(0 - this.cropper.x1, 0);
                        overflowY = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                        if (overflowX > 0 || overflowY > 0) {
                            this.cropper.x1 += (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                            this.cropper.y2 -= (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                        }
                        break;
                }
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.doAutoCrop = /**
         * @return {?}
         */
            function () {
                if (this.autoCrop) {
                    this.crop();
                }
            };
        Object.defineProperty(ImageCropperComponent.prototype, "canUseCustomData", {
            set: /**
             * @param {?} canUseCustom
             * @return {?}
             */ function (canUseCustom) {
                this._canUseCustomData = canUseCustom;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageCropperComponent.prototype, "customCropper", {
            set: /**
             * @param {?} cropper
             * @return {?}
             */ function (cropper) {
                if (this._canUseCustomData) {
                    this.imageVisible = true;
                    this.cropper = cropper;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ImageCropperComponent.prototype, "customImagePosition", {
            set: /**
             * @param {?} imagePosition
             * @return {?}
             */ function (imagePosition) {
                if (!this._canUseCustomData)
                    return;
                this.imageVisible = true;
                if (this.sourceImage.nativeElement && this.originalImage != null) {
                    this.startCropImage.emit();
                    /** @type {?} */
                    var width = imagePosition.x2 - imagePosition.x1;
                    /** @type {?} */
                    var height = imagePosition.y2 - imagePosition.y1;
                    /** @type {?} */
                    var cropCanvas = (document.createElement('canvas'));
                    cropCanvas.width = width;
                    cropCanvas.height = height;
                    /** @type {?} */
                    var ctx = cropCanvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(this.originalImage, imagePosition.x1, imagePosition.y1, width, height, 0, 0, width, height);
                        /** @type {?} */
                        var output = { width: width, height: height, imagePosition: imagePosition, cropperPosition: __assign({}, this.cropper) };
                        /** @type {?} */
                        var resizeRatio = this.getResizeRatio(width);
                        if (resizeRatio !== 1) {
                            output.width = Math.floor(width * resizeRatio);
                            output.height = Math.floor(height * resizeRatio);
                            resizeCanvas(cropCanvas, output.width || width, output.height || height);
                        }
                        this.cropToOutputType(this.outputType, cropCanvas, output);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param {?=} outputType
         * @return {?}
         */
        ImageCropperComponent.prototype.crop = /**
         * @param {?=} outputType
         * @return {?}
         */
            function (outputType) {
                if (outputType === void 0) {
                    outputType = this.outputType;
                }
                if (this.sourceImage.nativeElement && this.originalImage != null) {
                    this.startCropImage.emit();
                    /** @type {?} */
                    var imagePosition = this.getImagePosition();
                    /** @type {?} */
                    var width = imagePosition.x2 - imagePosition.x1;
                    /** @type {?} */
                    var height = imagePosition.y2 - imagePosition.y1;
                    /** @type {?} */
                    var cropCanvas = (document.createElement('canvas'));
                    cropCanvas.width = width;
                    cropCanvas.height = height;
                    /** @type {?} */
                    var ctx = cropCanvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(this.originalImage, imagePosition.x1, imagePosition.y1, width, height, 0, 0, width, height);
                        /** @type {?} */
                        var output = { width: width, height: height, imagePosition: imagePosition, cropperPosition: __assign({}, this.cropper) };
                        /** @type {?} */
                        var resizeRatio = this.getResizeRatio(width);
                        if (resizeRatio !== 1) {
                            output.width = Math.floor(width * resizeRatio);
                            output.height = Math.floor(height * resizeRatio);
                            resizeCanvas(cropCanvas, output.width, output.height);
                        }
                        return this.cropToOutputType(outputType, cropCanvas, output);
                    }
                }
                return null;
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.getImagePosition = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var sourceImageElement = this.sourceImage.nativeElement;
                /** @type {?} */
                var ratio = this.originalSize.width / sourceImageElement.offsetWidth;
                return {
                    x1: Math.round(this.cropper.x1 * ratio),
                    y1: Math.round(this.cropper.y1 * ratio),
                    x2: Math.min(Math.round(this.cropper.x2 * ratio), this.originalSize.width),
                    y2: Math.min(Math.round(this.cropper.y2 * ratio), this.originalSize.height)
                };
            };
        /**
         * @param {?} outputType
         * @param {?} cropCanvas
         * @param {?} output
         * @return {?}
         */
        ImageCropperComponent.prototype.cropToOutputType = /**
         * @param {?} outputType
         * @param {?} cropCanvas
         * @param {?} output
         * @return {?}
         */
            function (outputType, cropCanvas, output) {
                var _this = this;
                switch (outputType) {
                    case 'file':
                        return this.cropToFile(cropCanvas)
                            .then(function (result) {
                            output.file = result;
                            _this.imageCropped.emit(output);
                            return output;
                        });
                    case 'both':
                        output.base64 = this.cropToBase64(cropCanvas);
                        return this.cropToFile(cropCanvas)
                            .then(function (result) {
                            output.file = result;
                            _this.imageCropped.emit(output);
                            return output;
                        });
                    default:
                        output.base64 = this.cropToBase64(cropCanvas);
                        this.imageCropped.emit(output);
                        return output;
                }
            };
        /**
         * @param {?} cropCanvas
         * @return {?}
         */
        ImageCropperComponent.prototype.cropToBase64 = /**
         * @param {?} cropCanvas
         * @return {?}
         */
            function (cropCanvas) {
                /** @type {?} */
                var imageBase64 = cropCanvas.toDataURL('image/' + this.format, this.getQuality());
                this.imageCroppedBase64.emit(imageBase64);
                return imageBase64;
            };
        /**
         * @param {?} cropCanvas
         * @return {?}
         */
        ImageCropperComponent.prototype.cropToFile = /**
         * @param {?} cropCanvas
         * @return {?}
         */
            function (cropCanvas) {
                var _this = this;
                return this.getCanvasBlob(cropCanvas)
                    .then(function (result) {
                    if (result) {
                        _this.imageCroppedFile.emit(result);
                    }
                    return result;
                });
            };
        /**
         * @param {?} cropCanvas
         * @return {?}
         */
        ImageCropperComponent.prototype.getCanvasBlob = /**
         * @param {?} cropCanvas
         * @return {?}
         */
            function (cropCanvas) {
                var _this = this;
                return new Promise(function (resolve) {
                    cropCanvas.toBlob(function (result) { return _this.zone.run(function () { return resolve(result); }); }, 'image/' + _this.format, _this.getQuality());
                });
            };
        /**
         * @return {?}
         */
        ImageCropperComponent.prototype.getQuality = /**
         * @return {?}
         */
            function () {
                return Math.min(1, Math.max(0, this.imageQuality / 100));
            };
        /**
         * @param {?} width
         * @return {?}
         */
        ImageCropperComponent.prototype.getResizeRatio = /**
         * @param {?} width
         * @return {?}
         */
            function (width) {
                return this.resizeToWidth > 0 && (!this.onlyScaleDown || width > this.resizeToWidth)
                    ? this.resizeToWidth / width
                    : 1;
            };
        /**
         * @param {?} event
         * @return {?}
         */
        ImageCropperComponent.prototype.getClientX = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                return event.clientX || event.touches && event.touches[0] && event.touches[0].clientX;
            };
        /**
         * @param {?} event
         * @return {?}
         */
        ImageCropperComponent.prototype.getClientY = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                return event.clientY || event.touches && event.touches[0] && event.touches[0].clientY;
            };
        ImageCropperComponent.decorators = [
            { type: core.Component, args: [{
                        selector: 'image-cropper',
                        template: "<div>\n    <img\n        #sourceImage\n        class=\"source-image\"\n        [src]=\"safeImgDataUrl\"\n        [style.visibility]=\"'hidden'\"\n        [style.width]=\"'100%'\"\n        [style.height]=\"'100%'\"\n        (load)=\"imageLoadedInView()\"/>\n\n    <div class=\"cropper\"\n         *ngIf=\"imageVisible\"\n         [class.rounded]=\"roundCropper\"\n         [style.top.px]=\"cropper.y1\"\n         [style.left.px]=\"cropper.x1\"\n         [style.width.px]=\"cropper.x2 - cropper.x1\"\n         [style.height.px]=\"cropper.y2 - cropper.y1\"\n         [style.margin-left]=\"alignImage === 'center' ? marginLeft : null\"\n         [style.visibility]=\"'visible'\"\n    >\n        <div\n                (mousedown)=\"startMove($event, 'move')\"\n                (touchstart)=\"startMove($event, 'move')\"\n                class=\"move\"\n        >&nbsp;</div>\n        <span\n                class=\"resize topleft\"\n                (mousedown)=\"startMove($event, 'resize', 'topleft')\"\n                (touchstart)=\"startMove($event, 'resize', 'topleft')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize top\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize topright\"\n                (mousedown)=\"startMove($event, 'resize', 'topright')\"\n                (touchstart)=\"startMove($event, 'resize', 'topright')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize right\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize bottomright\"\n                (mousedown)=\"startMove($event, 'resize', 'bottomright')\"\n                (touchstart)=\"startMove($event, 'resize', 'bottomright')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize bottom\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize bottomleft\"\n                (mousedown)=\"startMove($event, 'resize', 'bottomleft')\"\n                (touchstart)=\"startMove($event, 'resize', 'bottomleft')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize left\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize-bar top\"\n                (mousedown)=\"startMove($event, 'resize', 'top')\"\n                (touchstart)=\"startMove($event, 'resize', 'top')\"\n        ></span>\n        <span\n                class=\"resize-bar right\"\n                (mousedown)=\"startMove($event, 'resize', 'right')\"\n                (touchstart)=\"startMove($event, 'resize', 'right')\"\n        ></span>\n        <span\n                class=\"resize-bar bottom\"\n                (mousedown)=\"startMove($event, 'resize', 'bottom')\"\n                (touchstart)=\"startMove($event, 'resize', 'bottom')\"\n        ></span>\n        <span\n                class=\"resize-bar left\"\n                (mousedown)=\"startMove($event, 'resize', 'left')\"\n                (touchstart)=\"startMove($event, 'resize', 'left')\"\n        ></span>\n    </div>\n</div>\n",
                        changeDetection: core.ChangeDetectionStrategy.OnPush,
                        styles: [":host{display:flex;position:relative;width:100%;max-width:100%;max-height:100%;overflow:hidden;padding:5px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host>div{position:relative;width:100%}:host>div img.source-image{max-width:100%;max-height:100%}:host .cropper{position:absolute;display:flex;color:#53535c;background:0 0;touch-action:none;outline:rgba(255,255,255,.3) solid 100vw}:host .cropper:after{position:absolute;content:'';top:0;bottom:0;left:0;right:0;pointer-events:none;border:1px dashed;opacity:.75;color:inherit;z-index:1}:host .cropper .move{width:100%;cursor:move;border:1px solid rgba(255,255,255,.5)}:host .cropper .resize{position:absolute;display:inline-block;line-height:6px;padding:8px;opacity:.85;z-index:1}:host .cropper .resize .square{display:inline-block;background:#53535c;width:6px;height:6px;border:1px solid rgba(255,255,255,.5);box-sizing:content-box}:host .cropper .resize.topleft{top:-12px;left:-12px;cursor:nwse-resize}:host .cropper .resize.top{top:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.topright{top:-12px;right:-12px;cursor:nesw-resize}:host .cropper .resize.right{top:calc(50% - 12px);right:-12px;cursor:ew-resize}:host .cropper .resize.bottomright{bottom:-12px;right:-12px;cursor:nwse-resize}:host .cropper .resize.bottom{bottom:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.bottomleft{bottom:-12px;left:-12px;cursor:nesw-resize}:host .cropper .resize.left{top:calc(50% - 12px);left:-12px;cursor:ew-resize}:host .cropper .resize-bar{position:absolute;z-index:1}:host .cropper .resize-bar.top{top:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.right{top:11px;right:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper .resize-bar.bottom{bottom:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.left{top:11px;left:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper.rounded{outline-color:transparent}:host .cropper.rounded:after{border-radius:100%;box-shadow:0 0 0 100vw rgba(255,255,255,.3)}@media (orientation:portrait){:host .cropper{outline-width:100vh}:host .cropper.rounded:after{box-shadow:0 0 0 100vh rgba(255,255,255,.3)}}:host .cropper.rounded .move{border-radius:100%}"]
                    }] }
        ];
        /** @nocollapse */
        ImageCropperComponent.ctorParameters = function () {
            return [
                { type: platformBrowser.DomSanitizer },
                { type: core.ChangeDetectorRef },
                { type: core.NgZone }
            ];
        };
        ImageCropperComponent.propDecorators = {
            sourceImage: [{ type: core.ViewChild, args: ['sourceImage',] }],
            imageFileChanged: [{ type: core.Input }],
            imageChangedEvent: [{ type: core.Input }],
            imageBase64: [{ type: core.Input }],
            cropSetOriginalSize: [{ type: core.Input }],
            format: [{ type: core.Input }],
            outputType: [{ type: core.Input }],
            maintainAspectRatio: [{ type: core.Input }],
            aspectRatio: [{ type: core.Input }],
            resizeToWidth: [{ type: core.Input }],
            cropperMinWidth: [{ type: core.Input }],
            roundCropper: [{ type: core.Input }],
            onlyScaleDown: [{ type: core.Input }],
            imageQuality: [{ type: core.Input }],
            autoCrop: [{ type: core.Input }],
            cropper: [{ type: core.Input }],
            alignImage: [{ type: core.HostBinding, args: ['style.text-align',] }, { type: core.Input }],
            startCropImage: [{ type: core.Output }],
            imageCropped: [{ type: core.Output }],
            imageCroppedBase64: [{ type: core.Output }],
            imageCroppedFile: [{ type: core.Output }],
            imageLoaded: [{ type: core.Output }],
            cropperReady: [{ type: core.Output }],
            loadImageFailed: [{ type: core.Output }],
            onResize: [{ type: core.HostListener, args: ['window:resize',] }],
            moveImg: [{ type: core.HostListener, args: ['document:mousemove', ['$event'],] }, { type: core.HostListener, args: ['document:touchmove', ['$event'],] }],
            moveStop: [{ type: core.HostListener, args: ['document:mouseup',] }, { type: core.HostListener, args: ['document:touchend',] }],
            canUseCustomData: [{ type: core.Input }],
            customCropper: [{ type: core.Input }],
            customImagePosition: [{ type: core.Input }]
        };
        return ImageCropperComponent;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var ImageCropperModule = (function () {
        function ImageCropperModule() {
        }
        ImageCropperModule.decorators = [
            { type: core.NgModule, args: [{
                        imports: [
                            common.CommonModule
                        ],
                        declarations: [
                            ImageCropperComponent
                        ],
                        exports: [
                            ImageCropperComponent
                        ]
                    },] }
        ];
        return ImageCropperModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */

    exports.ImageCropperModule = ImageCropperModule;
    exports.ImageCropperComponent = ImageCropperComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWltYWdlLWNyb3BwZXIudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIm5nOi8vbmd4LWltYWdlLWNyb3BwZXIvc3JjL3V0aWxzL2V4aWYudXRpbHMudHMiLCJuZzovL25neC1pbWFnZS1jcm9wcGVyL3NyYy91dGlscy9yZXNpemUudXRpbHMudHMiLCJuZzovL25neC1pbWFnZS1jcm9wcGVyL3NyYy9jb21wb25lbnQvaW1hZ2UtY3JvcHBlci5jb21wb25lbnQudHMiLCJuZzovL25neC1pbWFnZS1jcm9wcGVyL3NyYy9pbWFnZS1jcm9wcGVyLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZVxyXG50aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZVxyXG5MaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG5cclxuVEhJUyBDT0RFIElTIFBST1ZJREVEIE9OIEFOICpBUyBJUyogQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWVxyXG5LSU5ELCBFSVRIRVIgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgV0lUSE9VVCBMSU1JVEFUSU9OIEFOWSBJTVBMSUVEXHJcbldBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBUSVRMRSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UsXHJcbk1FUkNIQU5UQUJMSVRZIE9SIE5PTi1JTkZSSU5HRU1FTlQuXHJcblxyXG5TZWUgdGhlIEFwYWNoZSBWZXJzaW9uIDIuMCBMaWNlbnNlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnNcclxuYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDApXHJcbiAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUocmVzdWx0LnZhbHVlKTsgfSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSByZXN1bHRba10gPSBtb2Rba107XHJcbiAgICByZXN1bHQuZGVmYXVsdCA9IG1vZDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcbiIsImV4cG9ydCBmdW5jdGlvbiByZXNldEV4aWZPcmllbnRhdGlvbihzcmNCYXNlNjQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXhpZlJvdGF0aW9uID0gZ2V0RXhpZlJvdGF0aW9uKHNyY0Jhc2U2NCk7XG4gICAgICAgIGlmIChleGlmUm90YXRpb24gPiAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtQmFzZTY0QmFzZWRPbkV4aWZSb3RhdGlvbihzcmNCYXNlNjQsIGV4aWZSb3RhdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNyY0Jhc2U2NCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybUJhc2U2NEJhc2VkT25FeGlmUm90YXRpb24oc3JjQmFzZTY0OiBzdHJpbmcsIGV4aWZSb3RhdGlvbjogbnVtYmVyKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgICAgICBpZiAoNCA8IGV4aWZSb3RhdGlvbiAmJiBleGlmUm90YXRpb24gPCA5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IHdpZHRoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1DYW52YXMoY3R4LCBleGlmUm90YXRpb24sIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNhbnZhcy50b0RhdGFVUkwoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ05vIGNvbnRleHQnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGltZy5zcmMgPSBzcmNCYXNlNjQ7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEV4aWZSb3RhdGlvbihpbWFnZUJhc2U2NDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KGJhc2U2NFRvQXJyYXlCdWZmZXIoaW1hZ2VCYXNlNjQpKTtcbiAgICBpZiAodmlldy5nZXRVaW50MTYoMCwgZmFsc2UpICE9IDB4RkZEOCkge1xuICAgICAgICByZXR1cm4gLTI7XG4gICAgfVxuICAgIGNvbnN0IGxlbmd0aCA9IHZpZXcuYnl0ZUxlbmd0aDtcbiAgICBsZXQgb2Zmc2V0ID0gMjtcbiAgICB3aGlsZSAob2Zmc2V0IDwgbGVuZ3RoKSB7XG4gICAgICAgIGlmICh2aWV3LmdldFVpbnQxNihvZmZzZXQgKyAyLCBmYWxzZSkgPD0gOCkgcmV0dXJuIC0xO1xuICAgICAgICBjb25zdCBtYXJrZXIgPSB2aWV3LmdldFVpbnQxNihvZmZzZXQsIGZhbHNlKTtcbiAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgIGlmIChtYXJrZXIgPT0gMHhGRkUxKSB7XG4gICAgICAgICAgICBpZiAodmlldy5nZXRVaW50MzIob2Zmc2V0ICs9IDIsIGZhbHNlKSAhPSAweDQ1Nzg2OTY2KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBsaXR0bGUgPSB2aWV3LmdldFVpbnQxNihvZmZzZXQgKz0gNiwgZmFsc2UpID09IDB4NDk0OTtcbiAgICAgICAgICAgIG9mZnNldCArPSB2aWV3LmdldFVpbnQzMihvZmZzZXQgKyA0LCBsaXR0bGUpO1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IHZpZXcuZ2V0VWludDE2KG9mZnNldCwgbGl0dGxlKTtcbiAgICAgICAgICAgIG9mZnNldCArPSAyO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YWdzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodmlldy5nZXRVaW50MTYob2Zmc2V0ICsgKGkgKiAxMiksIGxpdHRsZSkgPT0gMHgwMTEyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2aWV3LmdldFVpbnQxNihvZmZzZXQgKyAoaSAqIDEyKSArIDgsIGxpdHRsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKChtYXJrZXIgJiAweEZGMDApICE9IDB4RkYwMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBvZmZzZXQgKz0gdmlldy5nZXRVaW50MTYob2Zmc2V0LCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0FycmF5QnVmZmVyKGltYWdlQmFzZTY0OiBzdHJpbmcpIHtcbiAgICBpbWFnZUJhc2U2NCA9IGltYWdlQmFzZTY0LnJlcGxhY2UoL15kYXRhXFw6KFteXFw7XSspXFw7YmFzZTY0LC9nbWksICcnKTtcbiAgICBjb25zdCBiaW5hcnlTdHJpbmcgPSBhdG9iKGltYWdlQmFzZTY0KTtcbiAgICBjb25zdCBsZW4gPSBiaW5hcnlTdHJpbmcubGVuZ3RoO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkobGVuKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5U3RyaW5nLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBieXRlcy5idWZmZXI7XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhbnZhcyhjdHg6IGFueSwgb3JpZW50YXRpb246IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGN0eC50cmFuc2Zvcm0oLTEsIDAsIDAsIDEsIHdpZHRoLCAwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjdHgudHJhbnNmb3JtKC0xLCAwLCAwLCAtMSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgY3R4LnRyYW5zZm9ybSgxLCAwLCAwLCAtMSwgMCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICBjdHgudHJhbnNmb3JtKDAsIDEsIDEsIDAsIDAsIDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGN0eC50cmFuc2Zvcm0oMCwgMSwgLTEsIDAsIGhlaWdodCwgMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgY3R4LnRyYW5zZm9ybSgwLCAtMSwgLTEsIDAsIGhlaWdodCwgd2lkdGgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgIGN0eC50cmFuc2Zvcm0oMCwgLTEsIDEsIDAsIDAsIHdpZHRoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cbiIsIi8qXG4gKiBIZXJtaXRlIHJlc2l6ZSAtIGZhc3QgaW1hZ2UgcmVzaXplL3Jlc2FtcGxlIHVzaW5nIEhlcm1pdGUgZmlsdGVyLlxuICogaHR0cHM6Ly9naXRodWIuY29tL3ZpbGl1c2xlL0hlcm1pdGUtcmVzaXplXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZUNhbnZhcyhjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgcmVzaXplQ2FudmFzID0gdHJ1ZSkge1xuXG4gICAgdHJ5IHtcblxuICAgICAgICBjb25zdCB3aWR0aF9zb3VyY2UgPSBjYW52YXMud2lkdGggfHwgd2lkdGg7XG4gICAgICAgIGNvbnN0IGhlaWdodF9zb3VyY2UgPSBjYW52YXMuaGVpZ2h0IHx8IGhlaWdodDtcbiAgICAgICAgd2lkdGggPSBNYXRoLnJvdW5kKHdpZHRoKTtcbiAgICAgICAgaGVpZ2h0ID0gTWF0aC5yb3VuZChoZWlnaHQpO1xuICAgIFxuICAgICAgICBjb25zdCByYXRpb193ID0gd2lkdGhfc291cmNlIC8gd2lkdGg7XG4gICAgICAgIGNvbnN0IHJhdGlvX2ggPSBoZWlnaHRfc291cmNlIC8gaGVpZ2h0O1xuICAgICAgICBjb25zdCByYXRpb193X2hhbGYgPSBNYXRoLmNlaWwocmF0aW9fdyAvIDIpO1xuICAgICAgICBjb25zdCByYXRpb19oX2hhbGYgPSBNYXRoLmNlaWwocmF0aW9faCAvIDIpO1xuICAgIFxuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgY29uc3QgaW1nID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aF9zb3VyY2UsIGhlaWdodF9zb3VyY2UpO1xuICAgICAgICAgICAgY29uc3QgaW1nMiA9IGN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gaW1nLmRhdGE7XG4gICAgICAgICAgICBjb25zdCBkYXRhMiA9IGltZzIuZGF0YTtcbiAgICBcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgaGVpZ2h0OyBqKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeDIgPSAoaSArIGogKiB3aWR0aCkgKiA0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXJfeSA9IGogKiByYXRpb19oO1xuICAgICAgICAgICAgICAgICAgICBsZXQgd2VpZ2h0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdlaWdodHMgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgd2VpZ2h0c19hbHBoYSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBneF9yID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGd4X2cgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ3hfYiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBneF9hID0gMDtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeHhfc3RhcnQgPSBNYXRoLmZsb29yKGkgKiByYXRpb193KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeXlfc3RhcnQgPSBNYXRoLmZsb29yKGogKiByYXRpb19oKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHh4X3N0b3AgPSBNYXRoLmNlaWwoKGkgKyAxKSAqIHJhdGlvX3cpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgeXlfc3RvcCA9IE1hdGguY2VpbCgoaiArIDEpICogcmF0aW9faCk7XG4gICAgICAgICAgICAgICAgICAgIHh4X3N0b3AgPSBNYXRoLm1pbih4eF9zdG9wLCB3aWR0aF9zb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICB5eV9zdG9wID0gTWF0aC5taW4oeXlfc3RvcCwgaGVpZ2h0X3NvdXJjZSk7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHl5ID0geXlfc3RhcnQ7IHl5IDwgeXlfc3RvcDsgeXkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZHkgPSBNYXRoLmFicyhjZW50ZXJfeSAtIHl5KSAvIHJhdGlvX2hfaGFsZjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlcl94ID0gaSAqIHJhdGlvX3c7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3MCA9IGR5ICogZHk7IC8vcHJlLWNhbGMgcGFydCBvZiB3XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB4eCA9IHh4X3N0YXJ0OyB4eCA8IHh4X3N0b3A7IHh4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkeCA9IE1hdGguYWJzKGNlbnRlcl94IC0geHgpIC8gcmF0aW9fd19oYWxmO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHcgPSBNYXRoLnNxcnQodzAgKyBkeCAqIGR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodyA+PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcGl4ZWwgdG9vIGZhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9oZXJtaXRlIGZpbHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlaWdodCA9IDIgKiB3ICogdyAqIHcgLSAzICogdyAqIHcgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc194ID0gNCAqICh4eCArIHl5ICogd2lkdGhfc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FscGhhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3hfYSArPSB3ZWlnaHQgKiBkYXRhW3Bvc194ICsgM107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0c19hbHBoYSArPSB3ZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jb2xvcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVtwb3NfeCArIDNdIDwgMjU1KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHQgPSB3ZWlnaHQgKiBkYXRhW3Bvc194ICsgM10gLyAyNTA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3hfciArPSB3ZWlnaHQgKiBkYXRhW3Bvc194XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBneF9nICs9IHdlaWdodCAqIGRhdGFbcG9zX3ggKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBneF9iICs9IHdlaWdodCAqIGRhdGFbcG9zX3ggKyAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHRzICs9IHdlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkYXRhMlt4Ml0gPSBneF9yIC8gd2VpZ2h0cztcbiAgICAgICAgICAgICAgICAgICAgZGF0YTJbeDIgKyAxXSA9IGd4X2cgLyB3ZWlnaHRzO1xuICAgICAgICAgICAgICAgICAgICBkYXRhMlt4MiArIDJdID0gZ3hfYiAvIHdlaWdodHM7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEyW3gyICsgM10gPSBneF9hIC8gd2VpZ2h0c19hbHBoYTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2NsZWFyIGFuZCByZXNpemUgY2FudmFzXG4gICAgICAgICAgICBpZiAocmVzaXplQ2FudmFzKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGhfc291cmNlLCBoZWlnaHRfc291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIC8vZHJhd1xuICAgICAgICAgICAgY3R4LnB1dEltYWdlRGF0YShpbWcyLCAwLCAwKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuXG4gICAgfVxufSIsImltcG9ydCB7XG4gICAgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEhvc3RCaW5kaW5nLCBIb3N0TGlzdGVuZXIsIElucHV0LCBPbkNoYW5nZXMsIE91dHB1dCxcbiAgICBTaW1wbGVDaGFuZ2VzLCBDaGFuZ2VEZXRlY3RvclJlZiwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIE5nWm9uZSwgVmlld0NoaWxkXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyLCBTYWZlVXJsLCBTYWZlU3R5bGUgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IE1vdmVTdGFydCwgRGltZW5zaW9ucywgQ3JvcHBlclBvc2l0aW9uLCBJbWFnZUNyb3BwZWRFdmVudCB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgcmVzZXRFeGlmT3JpZW50YXRpb24sIHRyYW5zZm9ybUJhc2U2NEJhc2VkT25FeGlmUm90YXRpb24gfSBmcm9tICcuLi91dGlscy9leGlmLnV0aWxzJztcbmltcG9ydCB7IHJlc2l6ZUNhbnZhcyB9IGZyb20gJy4uL3V0aWxzL3Jlc2l6ZS51dGlscyc7XG5cbmV4cG9ydCB0eXBlIE91dHB1dFR5cGUgPSAnYmFzZTY0JyB8w4LCoCdmaWxlJyB8ICdib3RoJztcblxuZXhwb3J0IHR5cGUgUmVjdCA9IHt4MSA6IG51bWJlciwgeTEgOiBudW1iZXIsIHgyIDogbnVtYmVyLCB5MjogbnVtYmVyfVxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2ltYWdlLWNyb3BwZXInLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9pbWFnZS1jcm9wcGVyLmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnLi9pbWFnZS1jcm9wcGVyLmNvbXBvbmVudC5zY3NzJ10sXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VDcm9wcGVyQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgICBwcml2YXRlIG9yaWdpbmFsSW1hZ2U6IGFueTtcbiAgICBwcml2YXRlIG9yaWdpbmFsQmFzZTY0OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBtb3ZlU3RhcnQ6IE1vdmVTdGFydDtcbiAgICBwcml2YXRlIG1heFNpemU6IERpbWVuc2lvbnM7XG4gICAgcHJpdmF0ZSBvcmlnaW5hbFNpemU6IERpbWVuc2lvbnM7XG4gICAgcHJpdmF0ZSBzZXRJbWFnZU1heFNpemVSZXRyaWVzID0gMDtcbiAgICBwcml2YXRlIGNyb3BwZXJTY2FsZWRNaW5XaWR0aCA9IDIwO1xuICAgIHByaXZhdGUgY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IDIwO1xuXG4gICAgc2FmZUltZ0RhdGFVcmw6IFNhZmVVcmwgfCBzdHJpbmc7XG4gICAgbWFyZ2luTGVmdDogU2FmZVN0eWxlIHwgc3RyaW5nID0gJzBweCc7XG4gICAgaW1hZ2VWaXNpYmxlID0gZmFsc2U7XG5cbiAgICBAVmlld0NoaWxkKCdzb3VyY2VJbWFnZScpIHNvdXJjZUltYWdlOiBFbGVtZW50UmVmO1xuXG4gICAgQElucHV0KClcbiAgICBzZXQgaW1hZ2VGaWxlQ2hhbmdlZChmaWxlOiBGaWxlKSB7XG4gICAgICAgIHRoaXMuaW5pdENyb3BwZXIoKTtcbiAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRmlsZShmaWxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGltYWdlQ2hhbmdlZEV2ZW50KGV2ZW50OiBhbnkpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgICAgICBpZiAoZXZlbnQgJiYgZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnRhcmdldC5maWxlcyAmJiBldmVudC50YXJnZXQuZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKGV2ZW50LnRhcmdldC5maWxlc1swXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBpbWFnZUJhc2U2NChpbWFnZUJhc2U2NDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuaW5pdENyb3BwZXIoKTtcbiAgICAgICAgdGhpcy5sb2FkQmFzZTY0SW1hZ2UoaW1hZ2VCYXNlNjQpO1xuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGNyb3BTZXRPcmlnaW5hbFNpemUoc2l6ZSA6IHt3aWR0aDpudW1iZXIsIGhlaWdodDogbnVtYmVyfSkge1xuICAgICAgICB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCA9IHNpemUud2lkdGg7XG4gICAgICAgIHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCA9IHNpemUuaGVpZ2h0O1xuICAgIH1cblxuICAgIEBJbnB1dCgpIGZvcm1hdDogJ3BuZycgfCAnanBlZycgfCAnYm1wJyB8ICd3ZWJwJyB8ICdpY28nID0gJ3BuZyc7XG4gICAgQElucHV0KCkgb3V0cHV0VHlwZTogT3V0cHV0VHlwZSA9ICdib3RoJztcbiAgICBASW5wdXQoKSBtYWludGFpbkFzcGVjdFJhdGlvID0gdHJ1ZTtcbiAgICBASW5wdXQoKSBhc3BlY3RSYXRpbyA9IDE7XG4gICAgQElucHV0KCkgcmVzaXplVG9XaWR0aCA9IDA7XG4gICAgQElucHV0KCkgY3JvcHBlck1pbldpZHRoID0gMDtcbiAgICBASW5wdXQoKSByb3VuZENyb3BwZXIgPSBmYWxzZTtcbiAgICBASW5wdXQoKSBvbmx5U2NhbGVEb3duID0gZmFsc2U7XG4gICAgQElucHV0KCkgaW1hZ2VRdWFsaXR5ID0gOTI7XG4gICAgQElucHV0KCkgYXV0b0Nyb3AgPSB0cnVlO1xuICAgIEBJbnB1dCgpIGNyb3BwZXI6IENyb3BwZXJQb3NpdGlvbiA9IHtcbiAgICAgICAgeDE6IC0xMDAsXG4gICAgICAgIHkxOiAtMTAwLFxuICAgICAgICB4MjogMTAwMDAsXG4gICAgICAgIHkyOiAxMDAwMFxuICAgIH07XG4gICAgQEhvc3RCaW5kaW5nKCdzdHlsZS50ZXh0LWFsaWduJylcbiAgICBASW5wdXQoKSBhbGlnbkltYWdlOiAnbGVmdCcgfCAnY2VudGVyJyA9ICdjZW50ZXInO1xuXG5cbiAgICBAT3V0cHV0KCkgc3RhcnRDcm9wSW1hZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gICAgQE91dHB1dCgpIGltYWdlQ3JvcHBlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SW1hZ2VDcm9wcGVkRXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIGltYWdlQ3JvcHBlZEJhc2U2NCA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xuICAgIEBPdXRwdXQoKSBpbWFnZUNyb3BwZWRGaWxlID0gbmV3IEV2ZW50RW1pdHRlcjxCbG9iPigpO1xuICAgIEBPdXRwdXQoKSBpbWFnZUxvYWRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgICBAT3V0cHV0KCkgY3JvcHBlclJlYWR5ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBsb2FkSW1hZ2VGYWlsZWQgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNhbml0aXplcjogRG9tU2FuaXRpemVyLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgY2Q6IENoYW5nZURldGVjdG9yUmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgem9uZTogTmdab25lKSB7XG4gICAgICAgIHRoaXMuaW5pdENyb3BwZXIoKTtcbiAgICB9XG5cbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgICAgIGlmIChjaGFuZ2VzLmNyb3BwZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4U2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy5zZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy5jaGVja0Nyb3BwZXJQb3NpdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmRvQXV0b0Nyb3AoKTtcbiAgICAgICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMuYXNwZWN0UmF0aW8gJiYgdGhpcy5pbWFnZVZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRDcm9wcGVyUG9zaXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdENyb3BwZXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaW1hZ2VWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZSA9IG51bGw7XG4gICAgICAgIHRoaXMuc2FmZUltZ0RhdGFVcmwgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2cnXG4gICAgICAgICAgICArICdvQUFBQU5TVWhFVWdBQUFBRUFBQUFCQ0FZQUFBQWZGY1NKQUFBQUMwbEVRVlFZVjJOZ0FBSUFBQVUnXG4gICAgICAgICAgICArICdBQWFyVnlGRUFBQUFBU1VWT1JLNUNZSUk9JztcbiAgICAgICAgdGhpcy5tb3ZlU3RhcnQgPSB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgdHlwZTogbnVsbCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICAgICAgeDE6IDAsXG4gICAgICAgICAgICB5MTogMCxcbiAgICAgICAgICAgIHgyOiAwLFxuICAgICAgICAgICAgeTI6IDAsXG4gICAgICAgICAgICBjbGllbnRYOiAwLFxuICAgICAgICAgICAgY2xpZW50WTogMFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm1heFNpemUgPSB7XG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9yaWdpbmFsU2l6ZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY3JvcHBlci54MSA9IC0xMDA7XG4gICAgICAgIHRoaXMuY3JvcHBlci55MSA9IC0xMDA7XG4gICAgICAgIHRoaXMuY3JvcHBlci54MiA9IDEwMDAwO1xuICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSAxMDAwMDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRJbWFnZUZpbGUoZmlsZTogRmlsZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VUeXBlID0gZmlsZS50eXBlO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNWYWxpZEltYWdlVHlwZShpbWFnZVR5cGUpKSB7XG4gICAgICAgICAgICAgICAgcmVzZXRFeGlmT3JpZW50YXRpb24oZXZlbnQudGFyZ2V0LnJlc3VsdClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdEJhc2U2NDogc3RyaW5nKSA9PiB0aGlzLmxvYWRCYXNlNjRJbWFnZShyZXN1bHRCYXNlNjQpKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4gdGhpcy5sb2FkSW1hZ2VGYWlsZWQuZW1pdCgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGYWlsZWQuZW1pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ZhbGlkSW1hZ2VUeXBlKHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gL2ltYWdlXFwvKHBuZ3xqcGd8anBlZ3xibXB8Z2lmfHRpZmYpLy50ZXN0KHR5cGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZEJhc2U2NEltYWdlKGltYWdlQmFzZTY0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEJhc2U2NCA9IGltYWdlQmFzZTY0O1xuICAgICAgICB0aGlzLnNhZmVJbWdEYXRhVXJsID0gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFJlc291cmNlVXJsKGltYWdlQmFzZTY0KTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCA9IHRoaXMub3JpZ2luYWxJbWFnZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxTaXplLmhlaWdodCA9IHRoaXMub3JpZ2luYWxJbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2Uuc3JjID0gaW1hZ2VCYXNlNjQ7XG4gICAgfVxuXG4gICAgaW1hZ2VMb2FkZWRJblZpZXcoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9yaWdpbmFsSW1hZ2UgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZUxvYWRlZC5lbWl0KCk7XG4gICAgICAgICAgICB0aGlzLnNldEltYWdlTWF4U2l6ZVJldHJpZXMgPSAwO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmNoZWNrSW1hZ2VNYXhTaXplUmVjdXJzaXZlbHkoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrSW1hZ2VNYXhTaXplUmVjdXJzaXZlbHkoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNldEltYWdlTWF4U2l6ZVJldHJpZXMgPiA0MCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGYWlsZWQuZW1pdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc291cmNlSW1hZ2UgJiYgdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50ICYmIHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudC5vZmZzZXRXaWR0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4U2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy5zZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy5yZXNldENyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyUmVhZHkuZW1pdCgpO1xuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0SW1hZ2VNYXhTaXplUmV0cmllcysrO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0ltYWdlTWF4U2l6ZVJlY3Vyc2l2ZWx5KCk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJylcbiAgICBvblJlc2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5yZXNpemVDcm9wcGVyUG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgIHRoaXMuc2V0Q3JvcHBlclNjYWxlZE1pblNpemUoKTtcbiAgICB9XG5cbiAgICByb3RhdGVMZWZ0KCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUJhc2U2NCg4KTtcbiAgICB9XG5cbiAgICByb3RhdGVSaWdodCgpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1CYXNlNjQoNik7XG4gICAgfVxuXG4gICAgZmxpcEhvcml6b250YWwoKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtQmFzZTY0KDIpO1xuICAgIH1cblxuICAgIGZsaXBWZXJ0aWNhbCgpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1CYXNlNjQoNCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0cmFuc2Zvcm1CYXNlNjQoZXhpZk9yaWVudGF0aW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxCYXNlNjQpIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybUJhc2U2NEJhc2VkT25FeGlmUm90YXRpb24odGhpcy5vcmlnaW5hbEJhc2U2NCwgZXhpZk9yaWVudGF0aW9uKVxuICAgICAgICAgICAgICAgIC50aGVuKChyb3RhdGVkQmFzZTY0OiBzdHJpbmcpID0+IHRoaXMubG9hZEJhc2U2NEltYWdlKHJvdGF0ZWRCYXNlNjQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVzaXplQ3JvcHBlclBvc2l0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzb3VyY2VJbWFnZUVsZW1lbnQgPSB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmICh0aGlzLm1heFNpemUud2lkdGggIT09IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCB8fCB0aGlzLm1heFNpemUuaGVpZ2h0ICE9PSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSB0aGlzLmNyb3BwZXIueDEgKiBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLyB0aGlzLm1heFNpemUud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDIgKiBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLyB0aGlzLm1heFNpemUud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLmNyb3BwZXIueTEgKiBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gdGhpcy5tYXhTaXplLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMuY3JvcHBlci55MiAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQgLyB0aGlzLm1heFNpemUuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNldENyb3BwZXJQb3NpdGlvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICBpZiAoIXRoaXMubWFpbnRhaW5Bc3BlY3RSYXRpbykge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCAvIHRoaXMuYXNwZWN0UmF0aW8gPCBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgY29uc3QgY3JvcHBlckhlaWdodCA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSAoc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAtIGNyb3BwZXJIZWlnaHQpIC8gMjtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMuY3JvcHBlci55MSArIGNyb3BwZXJIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIGNvbnN0IGNyb3BwZXJXaWR0aCA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQgKiB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gKHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCAtIGNyb3BwZXJXaWR0aCkgLyAyO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5jcm9wcGVyLngxICsgY3JvcHBlcldpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZG9BdXRvQ3JvcCgpO1xuICAgICAgICB0aGlzLmltYWdlVmlzaWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgc3RhcnRNb3ZlKGV2ZW50OiBhbnksIG1vdmVUeXBlOiBzdHJpbmcsIHBvc2l0aW9uOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IHZvaWQge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLm1vdmVTdGFydCA9IHtcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHR5cGU6IG1vdmVUeXBlLFxuICAgICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgICAgICAgY2xpZW50WDogdGhpcy5nZXRDbGllbnRYKGV2ZW50KSxcbiAgICAgICAgICAgIGNsaWVudFk6IHRoaXMuZ2V0Q2xpZW50WShldmVudCksXG4gICAgICAgICAgICAuLi50aGlzLmNyb3BwZXJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZW1vdmUnLCBbJyRldmVudCddKVxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OnRvdWNobW92ZScsIFsnJGV2ZW50J10pXG4gICAgbW92ZUltZyhldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm1vdmVTdGFydC5hY3RpdmUpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmVTdGFydC50eXBlID09PSAnbW92ZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tDcm9wcGVyUG9zaXRpb24odHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW92ZVN0YXJ0LnR5cGUgPT09ICdyZXNpemUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tDcm9wcGVyUG9zaXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldE1heFNpemUoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5tYXhTaXplLndpZHRoID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICB0aGlzLm1heFNpemUuaGVpZ2h0ID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICAgICAgdGhpcy5tYXJnaW5MZWZ0ID0gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFN0eWxlKCdjYWxjKDUwJSAtICcgKyB0aGlzLm1heFNpemUud2lkdGggLyAyICsgJ3B4KScpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0Q3JvcHBlclNjYWxlZE1pblNpemUoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9yaWdpbmFsSW1hZ2UgJiYgdGhpcy5jcm9wcGVyTWluV2lkdGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCA9IE1hdGgubWF4KDIwLCB0aGlzLmNyb3BwZXJNaW5XaWR0aCAvIHRoaXMub3JpZ2luYWxJbWFnZS53aWR0aCAqIHRoaXMubWF4U2l6ZS53aWR0aCk7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQgPSB0aGlzLm1haW50YWluQXNwZWN0UmF0aW9cbiAgICAgICAgICAgICAgICA/IE1hdGgubWF4KDIwLCB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCAvIHRoaXMuYXNwZWN0UmF0aW8pXG4gICAgICAgICAgICAgICAgOiAyMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoID0gMjA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQgPSAyMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tDcm9wcGVyUG9zaXRpb24obWFpbnRhaW5TaXplID0gZmFsc2UpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuY3JvcHBlci54MSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSBtYWludGFpblNpemUgPyB0aGlzLmNyb3BwZXIueDEgOiAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLnkxIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IG1haW50YWluU2l6ZSA/IHRoaXMuY3JvcHBlci55MSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNyb3BwZXIueDIgPiB0aGlzLm1heFNpemUud2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSAtPSBtYWludGFpblNpemUgPyAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoKSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLm1heFNpemUud2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY3JvcHBlci55MiA+IHRoaXMubWF4U2l6ZS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSAtPSBtYWludGFpblNpemUgPyAodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCkgOiAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5tYXhTaXplLmhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50Om1vdXNldXAnKVxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OnRvdWNoZW5kJylcbiAgICBtb3ZlU3RvcCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlU3RhcnQuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRvQXV0b0Nyb3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbW92ZShldmVudDogYW55KSB7XG4gICAgICAgIGNvbnN0IGRpZmZYID0gdGhpcy5nZXRDbGllbnRYKGV2ZW50KSAtIHRoaXMubW92ZVN0YXJ0LmNsaWVudFg7XG4gICAgICAgIGNvbnN0IGRpZmZZID0gdGhpcy5nZXRDbGllbnRZKGV2ZW50KSAtIHRoaXMubW92ZVN0YXJ0LmNsaWVudFk7XG5cbiAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gdGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gdGhpcy5tb3ZlU3RhcnQueTEgKyBkaWZmWTtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5tb3ZlU3RhcnQueTIgKyBkaWZmWTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZShldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGRpZmZYID0gdGhpcy5nZXRDbGllbnRYKGV2ZW50KSAtIHRoaXMubW92ZVN0YXJ0LmNsaWVudFg7XG4gICAgICAgIGNvbnN0IGRpZmZZID0gdGhpcy5nZXRDbGllbnRZKGV2ZW50KSAtIHRoaXMubW92ZVN0YXJ0LmNsaWVudFk7XG4gICAgICAgIHN3aXRjaCAodGhpcy5tb3ZlU3RhcnQucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LngxICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcGxlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LngxICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC55MSArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC55MSArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wcmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LngyICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC55MSArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LngyICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbXJpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC54MiArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueTIgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueTIgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbWxlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LngxICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWFpbnRhaW5Bc3BlY3RSYXRpbykge1xuICAgICAgICAgICAgdGhpcy5jaGVja0FzcGVjdFJhdGlvKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrQXNwZWN0UmF0aW8oKTogdm9pZCB7XG4gICAgICAgIGxldCBvdmVyZmxvd1ggPSAwO1xuICAgICAgICBsZXQgb3ZlcmZsb3dZID0gMDtcblxuICAgICAgICBzd2l0Y2ggKHRoaXMubW92ZVN0YXJ0LnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MSArICh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXIueTEpICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueTEsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDEgKyAodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyLnkxKSAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiAob3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gdGhpcy5jcm9wcGVyLnkyIC0gKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueDEsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueTEsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wcmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IHRoaXMuY3JvcHBlci55MiAtICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXIueDEpIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueTEsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgY2FzZSAnYm90dG9tcmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMuY3JvcHBlci55MSArICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXIueDEpIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci55MiAtIHRoaXMubWF4U2l6ZS5oZWlnaHQsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICBjYXNlICdib3R0b21sZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLmNyb3BwZXIueTEgKyAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci54MSwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRvQXV0b0Nyb3AoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmF1dG9Dcm9wKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2NhblVzZUN1c3RvbURhdGEgOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBjYW5Vc2VDdXN0b21EYXRhKGNhblVzZUN1c3RvbSA6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fY2FuVXNlQ3VzdG9tRGF0YSA9IGNhblVzZUN1c3RvbTtcbiAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBjdXN0b21Dcm9wcGVyKGNyb3BwZXIgOiBSZWN0KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NhblVzZUN1c3RvbURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlciA9IGNyb3BwZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgQElucHV0KCkgXG4gICAgc2V0IGN1c3RvbUltYWdlUG9zaXRpb24oaW1hZ2VQb3NpdGlvbiA6IFJlY3QpIHtcblxuICAgICAgICBpZiAoIXRoaXMuX2NhblVzZUN1c3RvbURhdGEpIHJldHVybjtcblxuICAgICAgICB0aGlzLmltYWdlVmlzaWJsZSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5vcmlnaW5hbEltYWdlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRDcm9wSW1hZ2UuZW1pdCgpO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbWFnZVBvc2l0aW9uLngyIC0gaW1hZ2VQb3NpdGlvbi54MTtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGltYWdlUG9zaXRpb24ueTIgLSBpbWFnZVBvc2l0aW9uLnkxO1xuXG4gICAgICAgICAgICBjb25zdCBjcm9wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAgICAgY29uc3QgY3R4ID0gY3JvcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VQb3NpdGlvbi54MSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VQb3NpdGlvbi55MSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0ge3dpZHRoLCBoZWlnaHQsIGltYWdlUG9zaXRpb24sIGNyb3BwZXJQb3NpdGlvbjogey4uLnRoaXMuY3JvcHBlcn19O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc2l6ZVJhdGlvID0gdGhpcy5nZXRSZXNpemVSYXRpbyh3aWR0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZVJhdGlvICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC53aWR0aCA9IE1hdGguZmxvb3Iod2lkdGggKiByZXNpemVSYXRpbyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5oZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAqIHJlc2l6ZVJhdGlvKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplQ2FudmFzKGNyb3BDYW52YXMsIG91dHB1dC53aWR0aCB8fCB3aWR0aCwgb3V0cHV0LmhlaWdodCB8fCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcFRvT3V0cHV0VHlwZSh0aGlzLm91dHB1dFR5cGUsIGNyb3BDYW52YXMsIG91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcm9wKG91dHB1dFR5cGU6IE91dHB1dFR5cGUgPSB0aGlzLm91dHB1dFR5cGUpOiBJbWFnZUNyb3BwZWRFdmVudCB8IFByb21pc2U8SW1hZ2VDcm9wcGVkRXZlbnQ+IHwgbnVsbCB7XG4gICAgICAgIGlmICh0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5vcmlnaW5hbEltYWdlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRDcm9wSW1hZ2UuZW1pdCgpO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VQb3NpdGlvbiA9IHRoaXMuZ2V0SW1hZ2VQb3NpdGlvbigpO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbWFnZVBvc2l0aW9uLngyIC0gaW1hZ2VQb3NpdGlvbi54MTtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGltYWdlUG9zaXRpb24ueTIgLSBpbWFnZVBvc2l0aW9uLnkxO1xuXG4gICAgICAgICAgICBjb25zdCBjcm9wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAgICAgY29uc3QgY3R4ID0gY3JvcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VQb3NpdGlvbi54MSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VQb3NpdGlvbi55MSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0ge3dpZHRoLCBoZWlnaHQsIGltYWdlUG9zaXRpb24sIGNyb3BwZXJQb3NpdGlvbjogey4uLnRoaXMuY3JvcHBlcn19O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc2l6ZVJhdGlvID0gdGhpcy5nZXRSZXNpemVSYXRpbyh3aWR0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZVJhdGlvICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC53aWR0aCA9IE1hdGguZmxvb3Iod2lkdGggKiByZXNpemVSYXRpbyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5oZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAqIHJlc2l6ZVJhdGlvKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplQ2FudmFzKGNyb3BDYW52YXMsIG91dHB1dC53aWR0aCwgb3V0cHV0LmhlaWdodCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNyb3BUb091dHB1dFR5cGUob3V0cHV0VHlwZSwgY3JvcENhbnZhcywgb3V0cHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEltYWdlUG9zaXRpb24oKTogQ3JvcHBlclBvc2l0aW9uIHtcbiAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICBjb25zdCByYXRpbyA9IHRoaXMub3JpZ2luYWxTaXplLndpZHRoIC8gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDE6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLngxICogcmF0aW8pLFxuICAgICAgICAgICAgeTE6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLnkxICogcmF0aW8pLFxuICAgICAgICAgICAgeDI6IE1hdGgubWluKE1hdGgucm91bmQodGhpcy5jcm9wcGVyLngyICogcmF0aW8pLCB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCksXG4gICAgICAgICAgICB5MjogTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmNyb3BwZXIueTIgICogcmF0aW8pLCB0aGlzLm9yaWdpbmFsU2l6ZS5oZWlnaHQpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyb3BUb091dHB1dFR5cGUob3V0cHV0VHlwZTogT3V0cHV0VHlwZSwgY3JvcENhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIG91dHB1dDogSW1hZ2VDcm9wcGVkRXZlbnQpOiBJbWFnZUNyb3BwZWRFdmVudCB8IFByb21pc2U8SW1hZ2VDcm9wcGVkRXZlbnQ+IHtcbiAgICAgICAgc3dpdGNoIChvdXRwdXRUeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmaWxlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jcm9wVG9GaWxlKGNyb3BDYW52YXMpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQ6IEJsb2IgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQuZmlsZSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VDcm9wcGVkLmVtaXQob3V0cHV0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FzZSAnYm90aCc6XG4gICAgICAgICAgICAgICAgb3V0cHV0LmJhc2U2NCA9IHRoaXMuY3JvcFRvQmFzZTY0KGNyb3BDYW52YXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNyb3BUb0ZpbGUoY3JvcENhbnZhcylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdDogQmxvYiB8IG51bGwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5maWxlID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUNyb3BwZWQuZW1pdChvdXRwdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIG91dHB1dC5iYXNlNjQgPSB0aGlzLmNyb3BUb0Jhc2U2NChjcm9wQ2FudmFzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlQ3JvcHBlZC5lbWl0KG91dHB1dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JvcFRvQmFzZTY0KGNyb3BDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaW1hZ2VCYXNlNjQgPSBjcm9wQ2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvJyArIHRoaXMuZm9ybWF0LCB0aGlzLmdldFF1YWxpdHkoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VDcm9wcGVkQmFzZTY0LmVtaXQoaW1hZ2VCYXNlNjQpO1xuICAgICAgICByZXR1cm4gaW1hZ2VCYXNlNjQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcm9wVG9GaWxlKGNyb3BDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogUHJvbWlzZTxCbG9iIHwgbnVsbD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDYW52YXNCbG9iKGNyb3BDYW52YXMpXG4gICAgICAgICAgICAudGhlbigocmVzdWx0OiBCbG9iIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUNyb3BwZWRGaWxlLmVtaXQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2FudmFzQmxvYihjcm9wQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFByb21pc2U8QmxvYiB8IG51bGw+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLnRvQmxvYihcbiAgICAgICAgICAgICAgICAocmVzdWx0OiBCbG9iIHwgbnVsbCkgPT4gdGhpcy56b25lLnJ1bigoKSA9PiByZXNvbHZlKHJlc3VsdCkpLFxuICAgICAgICAgICAgICAgICdpbWFnZS8nICsgdGhpcy5mb3JtYXQsXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRRdWFsaXR5KClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UXVhbGl0eSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgdGhpcy5pbWFnZVF1YWxpdHkgLyAxMDApKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlc2l6ZVJhdGlvKHdpZHRoOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVUb1dpZHRoID4gMCAmJiAoIXRoaXMub25seVNjYWxlRG93biB8fCB3aWR0aCA+IHRoaXMucmVzaXplVG9XaWR0aClcbiAgICAgICAgICAgID8gdGhpcy5yZXNpemVUb1dpZHRoIC8gd2lkdGhcbiAgICAgICAgICAgIDogMTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsaWVudFgoZXZlbnQ6IGFueSk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBldmVudC5jbGllbnRYIHx8IGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXSAmJiBldmVudC50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDbGllbnRZKGV2ZW50OiBhbnkpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gZXZlbnQuY2xpZW50WSB8fCBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0gJiYgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgSW1hZ2VDcm9wcGVyQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnQvaW1hZ2UtY3JvcHBlci5jb21wb25lbnQnO1xuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICAgQ29tbW9uTW9kdWxlXG4gICAgXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtcbiAgICAgICAgSW1hZ2VDcm9wcGVyQ29tcG9uZW50XG4gICAgXSxcbiAgICBleHBvcnRzOiBbXG4gICAgICAgIEltYWdlQ3JvcHBlckNvbXBvbmVudFxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VDcm9wcGVyTW9kdWxlIHt9XG4iXSwibmFtZXMiOlsiRXZlbnRFbWl0dGVyIiwiQ29tcG9uZW50IiwiQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kiLCJEb21TYW5pdGl6ZXIiLCJDaGFuZ2VEZXRlY3RvclJlZiIsIk5nWm9uZSIsIlZpZXdDaGlsZCIsIklucHV0IiwiSG9zdEJpbmRpbmciLCJPdXRwdXQiLCJIb3N0TGlzdGVuZXIiLCJOZ01vZHVsZSIsIkNvbW1vbk1vZHVsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQUE7Ozs7Ozs7Ozs7Ozs7O0FBY0EsSUFlTyxJQUFJLFFBQVEsR0FBRztRQUNsQixRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxrQkFBa0IsQ0FBQztZQUMzQyxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakQsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsRUFB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SUFBSSxDQUFDLFdBQVcsQ0FBQzt3QkFDM0YsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQzlELFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUMvRCxJQUFJLFNBQVMsR0FBRyxDQUFDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTs0QkFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxTQUFTLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDOzRCQUMzRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLFNBQVMsR0FBRyxTQUFTLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzt5QkFDOUc7d0JBQ0QsTUFBTTtvQkFDVixLQUFLLFNBQVM7d0JBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO3dCQUMzRixTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQzdDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxD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