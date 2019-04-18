/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { resetExifOrientation, transformBase64BasedOnExifRotation } from '../utils/exif.utils';
import { resizeCanvas } from '../utils/resize.utils';
/** @typedef {?} */
var OutputType;
export { OutputType };
/** @typedef {?} */
var Rect;
export { Rect };
var ImageCropperComponent = /** @class */ (function () {
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
        this.startCropImage = new EventEmitter();
        this.imageCropped = new EventEmitter();
        this.imageCroppedBase64 = new EventEmitter();
        this.imageCroppedFile = new EventEmitter();
        this.imageLoaded = new EventEmitter();
        this.cropperReady = new EventEmitter();
        this.loadImageFailed = new EventEmitter();
        this._canUseCustomData = false;
        this.initCropper();
    }
    Object.defineProperty(ImageCropperComponent.prototype, "imageFileChanged", {
        set: /**
         * @param {?} file
         * @return {?}
         */
        function (file) {
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
         */
        function (event) {
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
         */
        function (imageBase64) {
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
         */
        function (size) {
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
        if (position === void 0) { position = null; }
        event.preventDefault();
        this.moveStart = tslib_1.__assign({ active: true, type: moveType, position: position, clientX: this.getClientX(event), clientY: this.getClientY(event) }, this.cropper);
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
        if (maintainSize === void 0) { maintainSize = false; }
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
         */
        function (canUseCustom) {
            this._canUseCustomData = canUseCustom;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageCropperComponent.prototype, "customCropper", {
        set: /**
         * @param {?} cropper
         * @return {?}
         */
        function (cropper) {
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
         */
        function (imagePosition) {
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
                var cropCanvas = /** @type {?} */ (document.createElement('canvas'));
                cropCanvas.width = width;
                cropCanvas.height = height;
                /** @type {?} */
                var ctx = cropCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(this.originalImage, imagePosition.x1, imagePosition.y1, width, height, 0, 0, width, height);
                    /** @type {?} */
                    var output = { width: width, height: height, imagePosition: imagePosition, cropperPosition: tslib_1.__assign({}, this.cropper) };
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
        if (outputType === void 0) { outputType = this.outputType; }
        if (this.sourceImage.nativeElement && this.originalImage != null) {
            this.startCropImage.emit();
            /** @type {?} */
            var imagePosition = this.getImagePosition();
            /** @type {?} */
            var width = imagePosition.x2 - imagePosition.x1;
            /** @type {?} */
            var height = imagePosition.y2 - imagePosition.y1;
            /** @type {?} */
            var cropCanvas = /** @type {?} */ (document.createElement('canvas'));
            cropCanvas.width = width;
            cropCanvas.height = height;
            /** @type {?} */
            var ctx = cropCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(this.originalImage, imagePosition.x1, imagePosition.y1, width, height, 0, 0, width, height);
                /** @type {?} */
                var output = { width: width, height: height, imagePosition: imagePosition, cropperPosition: tslib_1.__assign({}, this.cropper) };
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
        { type: Component, args: [{
                    selector: 'image-cropper',
                    template: "<div>\n    <img\n        #sourceImage\n        class=\"source-image\"\n        [src]=\"safeImgDataUrl\"\n        [style.visibility]=\"'hidden'\"\n        [style.width]=\"'100%'\"\n        [style.height]=\"'100%'\"\n        (load)=\"imageLoadedInView()\"/>\n\n    <div class=\"cropper\"\n         *ngIf=\"imageVisible\"\n         [class.rounded]=\"roundCropper\"\n         [style.top.px]=\"cropper.y1\"\n         [style.left.px]=\"cropper.x1\"\n         [style.width.px]=\"cropper.x2 - cropper.x1\"\n         [style.height.px]=\"cropper.y2 - cropper.y1\"\n         [style.margin-left]=\"alignImage === 'center' ? marginLeft : null\"\n         [style.visibility]=\"'visible'\"\n    >\n        <div\n                (mousedown)=\"startMove($event, 'move')\"\n                (touchstart)=\"startMove($event, 'move')\"\n                class=\"move\"\n        >&nbsp;</div>\n        <span\n                class=\"resize topleft\"\n                (mousedown)=\"startMove($event, 'resize', 'topleft')\"\n                (touchstart)=\"startMove($event, 'resize', 'topleft')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize top\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize topright\"\n                (mousedown)=\"startMove($event, 'resize', 'topright')\"\n                (touchstart)=\"startMove($event, 'resize', 'topright')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize right\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize bottomright\"\n                (mousedown)=\"startMove($event, 'resize', 'bottomright')\"\n                (touchstart)=\"startMove($event, 'resize', 'bottomright')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize bottom\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize bottomleft\"\n                (mousedown)=\"startMove($event, 'resize', 'bottomleft')\"\n                (touchstart)=\"startMove($event, 'resize', 'bottomleft')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize left\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize-bar top\"\n                (mousedown)=\"startMove($event, 'resize', 'top')\"\n                (touchstart)=\"startMove($event, 'resize', 'top')\"\n        ></span>\n        <span\n                class=\"resize-bar right\"\n                (mousedown)=\"startMove($event, 'resize', 'right')\"\n                (touchstart)=\"startMove($event, 'resize', 'right')\"\n        ></span>\n        <span\n                class=\"resize-bar bottom\"\n                (mousedown)=\"startMove($event, 'resize', 'bottom')\"\n                (touchstart)=\"startMove($event, 'resize', 'bottom')\"\n        ></span>\n        <span\n                class=\"resize-bar left\"\n                (mousedown)=\"startMove($event, 'resize', 'left')\"\n                (touchstart)=\"startMove($event, 'resize', 'left')\"\n        ></span>\n    </div>\n</div>\n",
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    styles: [":host{display:flex;position:relative;width:100%;max-width:100%;max-height:100%;overflow:hidden;padding:5px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host>div{position:relative;width:100%}:host>div img.source-image{max-width:100%;max-height:100%}:host .cropper{position:absolute;display:flex;color:#53535c;background:0 0;touch-action:none;outline:rgba(255,255,255,.3) solid 100vw}:host .cropper:after{position:absolute;content:'';top:0;bottom:0;left:0;right:0;pointer-events:none;border:1px dashed;opacity:.75;color:inherit;z-index:1}:host .cropper .move{width:100%;cursor:move;border:1px solid rgba(255,255,255,.5)}:host .cropper .resize{position:absolute;display:inline-block;line-height:6px;padding:8px;opacity:.85;z-index:1}:host .cropper .resize .square{display:inline-block;background:#53535c;width:6px;height:6px;border:1px solid rgba(255,255,255,.5);box-sizing:content-box}:host .cropper .resize.topleft{top:-12px;left:-12px;cursor:nwse-resize}:host .cropper .resize.top{top:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.topright{top:-12px;right:-12px;cursor:nesw-resize}:host .cropper .resize.right{top:calc(50% - 12px);right:-12px;cursor:ew-resize}:host .cropper .resize.bottomright{bottom:-12px;right:-12px;cursor:nwse-resize}:host .cropper .resize.bottom{bottom:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.bottomleft{bottom:-12px;left:-12px;cursor:nesw-resize}:host .cropper .resize.left{top:calc(50% - 12px);left:-12px;cursor:ew-resize}:host .cropper .resize-bar{position:absolute;z-index:1}:host .cropper .resize-bar.top{top:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.right{top:11px;right:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper .resize-bar.bottom{bottom:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.left{top:11px;left:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper.rounded{outline-color:transparent}:host .cropper.rounded:after{border-radius:100%;box-shadow:0 0 0 100vw rgba(255,255,255,.3)}@media (orientation:portrait){:host .cropper{outline-width:100vh}:host .cropper.rounded:after{box-shadow:0 0 0 100vh rgba(255,255,255,.3)}}:host .cropper.rounded .move{border-radius:100%}"]
                }] }
    ];
    /** @nocollapse */
    ImageCropperComponent.ctorParameters = function () { return [
        { type: DomSanitizer },
        { type: ChangeDetectorRef },
        { type: NgZone }
    ]; };
    ImageCropperComponent.propDecorators = {
        sourceImage: [{ type: ViewChild, args: ['sourceImage',] }],
        imageFileChanged: [{ type: Input }],
        imageChangedEvent: [{ type: Input }],
        imageBase64: [{ type: Input }],
        cropSetOriginalSize: [{ type: Input }],
        format: [{ type: Input }],
        outputType: [{ type: Input }],
        maintainAspectRatio: [{ type: Input }],
        aspectRatio: [{ type: Input }],
        resizeToWidth: [{ type: Input }],
        cropperMinWidth: [{ type: Input }],
        roundCropper: [{ type: Input }],
        onlyScaleDown: [{ type: Input }],
        imageQuality: [{ type: Input }],
        autoCrop: [{ type: Input }],
        cropper: [{ type: Input }],
        alignImage: [{ type: HostBinding, args: ['style.text-align',] }, { type: Input }],
        startCropImage: [{ type: Output }],
        imageCropped: [{ type: Output }],
        imageCroppedBase64: [{ type: Output }],
        imageCroppedFile: [{ type: Output }],
        imageLoaded: [{ type: Output }],
        cropperReady: [{ type: Output }],
        loadImageFailed: [{ type: Output }],
        onResize: [{ type: HostListener, args: ['window:resize',] }],
        moveImg: [{ type: HostListener, args: ['document:mousemove', ['$event'],] }, { type: HostListener, args: ['document:touchmove', ['$event'],] }],
        moveStop: [{ type: HostListener, args: ['document:mouseup',] }, { type: HostListener, args: ['document:touchend',] }],
        canUseCustomData: [{ type: Input }],
        customCropper: [{ type: Input }],
        customImagePosition: [{ type: Input }]
    };
    return ImageCropperComponent;
}());
export { ImageCropperComponent };
if (false) {
    /** @type {?} */
    ImageCropperComponent.prototype.originalImage;
    /** @type {?} */
    ImageCropperComponent.prototype.originalBase64;
    /** @type {?} */
    ImageCropperComponent.prototype.moveStart;
    /** @type {?} */
    ImageCropperComponent.prototype.maxSize;
    /** @type {?} */
    ImageCropperComponent.prototype.originalSize;
    /** @type {?} */
    ImageCropperComponent.prototype.setImageMaxSizeRetries;
    /** @type {?} */
    ImageCropperComponent.prototype.cropperScaledMinWidth;
    /** @type {?} */
    ImageCropperComponent.prototype.cropperScaledMinHeight;
    /** @type {?} */
    ImageCropperComponent.prototype.safeImgDataUrl;
    /** @type {?} */
    ImageCropperComponent.prototype.marginLeft;
    /** @type {?} */
    ImageCropperComponent.prototype.imageVisible;
    /** @type {?} */
    ImageCropperComponent.prototype.sourceImage;
    /** @type {?} */
    ImageCropperComponent.prototype.format;
    /** @type {?} */
    ImageCropperComponent.prototype.outputType;
    /** @type {?} */
    ImageCropperComponent.prototype.maintainAspectRatio;
    /** @type {?} */
    ImageCropperComponent.prototype.aspectRatio;
    /** @type {?} */
    ImageCropperComponent.prototype.resizeToWidth;
    /** @type {?} */
    ImageCropperComponent.prototype.cropperMinWidth;
    /** @type {?} */
    ImageCropperComponent.prototype.roundCropper;
    /** @type {?} */
    ImageCropperComponent.prototype.onlyScaleDown;
    /** @type {?} */
    ImageCropperComponent.prototype.imageQuality;
    /** @type {?} */
    ImageCropperComponent.prototype.autoCrop;
    /** @type {?} */
    ImageCropperComponent.prototype.cropper;
    /** @type {?} */
    ImageCropperComponent.prototype.alignImage;
    /** @type {?} */
    ImageCropperComponent.prototype.startCropImage;
    /** @type {?} */
    ImageCropperComponent.prototype.imageCropped;
    /** @type {?} */
    ImageCropperComponent.prototype.imageCroppedBase64;
    /** @type {?} */
    ImageCropperComponent.prototype.imageCroppedFile;
    /** @type {?} */
    ImageCropperComponent.prototype.imageLoaded;
    /** @type {?} */
    ImageCropperComponent.prototype.cropperReady;
    /** @type {?} */
    ImageCropperComponent.prototype.loadImageFailed;
    /** @type {?} */
    ImageCropperComponent.prototype._canUseCustomData;
    /** @type {?} */
    ImageCropperComponent.prototype.sanitizer;
    /** @type {?} */
    ImageCropperComponent.prototype.cd;
    /** @type {?} */
    ImageCropperComponent.prototype.zone;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UtY3JvcHBlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci8iLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnQvaW1hZ2UtY3JvcHBlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQWEsTUFBTSxFQUN6RSxpQkFBaUIsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUMvRSxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsWUFBWSxFQUFzQixNQUFNLDJCQUEyQixDQUFDO0FBRTdFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxrQ0FBa0MsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9GLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQzs7Ozs7Ozs7SUFvRmpELCtCQUFvQixTQUF1QixFQUN2QixJQUNBO1FBRkEsY0FBUyxHQUFULFNBQVMsQ0FBYztRQUN2QixPQUFFLEdBQUYsRUFBRTtRQUNGLFNBQUksR0FBSixJQUFJO3NDQXBFUyxDQUFDO3FDQUNGLEVBQUU7c0NBQ0QsRUFBRTswQkFHRixLQUFLOzRCQUN2QixLQUFLO3NCQWdDdUMsS0FBSzswQkFDOUIsTUFBTTttQ0FDVCxJQUFJOzJCQUNaLENBQUM7NkJBQ0MsQ0FBQzsrQkFDQyxDQUFDOzRCQUNKLEtBQUs7NkJBQ0osS0FBSzs0QkFDTixFQUFFO3dCQUNOLElBQUk7dUJBQ1k7WUFDaEMsRUFBRSxFQUFFLENBQUMsR0FBRztZQUNSLEVBQUUsRUFBRSxDQUFDLEdBQUc7WUFDUixFQUFFLEVBQUUsS0FBSztZQUNULEVBQUUsRUFBRSxLQUFLO1NBQ1o7MEJBRXdDLFFBQVE7OEJBR3RCLElBQUksWUFBWSxFQUFROzRCQUMxQixJQUFJLFlBQVksRUFBcUI7a0NBQy9C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LGtCQUFrQixjQUM5QixLQUFLO2lDQUdMLE1BQU07K0JBQ04sTUFBTTtxQ0FDTixNQUFNO21DQUNOLE1BQU07OEJBQ04sTUFBTTsrQkFDTixNQUFNO2tDQUNOLE1BQU07MkJBNEdOLFlBQVksU0FBQyxlQUFlOzBCQTRFNUIsWUFBWSxTQUFDLG9CQUFvQixFQUFFLENBQUMsUUFBUSxDQUFDLGNBQzdDLFlBQVksU0FBQyxvQkFBb0IsRUFBRSxDQUFDLFFBQVEsQ0FBQzsyQkFzRDdDLFlBQVksU0FBQyxrQkFBa0IsY0FDL0IsWUFBWSxTQUFDLG1CQUFtQjttQ0FpSWhDLEtBQUs7Z0NBS0wsS0FBSztzQ0FTTCxLQUFLOztnQ0F4ZFY7O1NBbUJhLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEhvc3RCaW5kaW5nLCBIb3N0TGlzdGVuZXIsIElucHV0LCBPbkNoYW5nZXMsIE91dHB1dCxcbiAgICBTaW1wbGVDaGFuZ2VzLCBDaGFuZ2VEZXRlY3RvclJlZiwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIE5nWm9uZSwgVmlld0NoaWxkXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyLCBTYWZlVXJsLCBTYWZlU3R5bGUgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IE1vdmVTdGFydCwgRGltZW5zaW9ucywgQ3JvcHBlclBvc2l0aW9uLCBJbWFnZUNyb3BwZWRFdmVudCB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgcmVzZXRFeGlmT3JpZW50YXRpb24sIHRyYW5zZm9ybUJhc2U2NEJhc2VkT25FeGlmUm90YXRpb24gfSBmcm9tICcuLi91dGlscy9leGlmLnV0aWxzJztcbmltcG9ydCB7IHJlc2l6ZUNhbnZhcyB9IGZyb20gJy4uL3V0aWxzL3Jlc2l6ZS51dGlscyc7XG5cbmV4cG9ydCB0eXBlIE91dHB1dFR5cGUgPSAnYmFzZTY0JyB8wqAnZmlsZScgfCAnYm90aCc7XG5cbmV4cG9ydCB0eXBlIFJlY3QgPSB7eDEgOiBudW1iZXIsIHkxIDogbnVtYmVyLCB4MiA6IG51bWJlciwgeTI6IG51bWJlcn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdpbWFnZS1jcm9wcGVyJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW1hZ2UtY3JvcHBlci5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2UtY3JvcHBlci5jb21wb25lbnQuc2NzcyddLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIEltYWdlQ3JvcHBlckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gICAgcHJpdmF0ZSBvcmlnaW5hbEltYWdlOiBhbnk7XG4gICAgcHJpdmF0ZSBvcmlnaW5hbEJhc2U2NDogc3RyaW5nO1xuICAgIHByaXZhdGUgbW92ZVN0YXJ0OiBNb3ZlU3RhcnQ7XG4gICAgcHJpdmF0ZSBtYXhTaXplOiBEaW1lbnNpb25zO1xuICAgIHByaXZhdGUgb3JpZ2luYWxTaXplOiBEaW1lbnNpb25zO1xuICAgIHByaXZhdGUgc2V0SW1hZ2VNYXhTaXplUmV0cmllcyA9IDA7XG4gICAgcHJpdmF0ZSBjcm9wcGVyU2NhbGVkTWluV2lkdGggPSAyMDtcbiAgICBwcml2YXRlIGNyb3BwZXJTY2FsZWRNaW5IZWlnaHQgPSAyMDtcblxuICAgIHNhZmVJbWdEYXRhVXJsOiBTYWZlVXJsIHwgc3RyaW5nO1xuICAgIG1hcmdpbkxlZnQ6IFNhZmVTdHlsZSB8IHN0cmluZyA9ICcwcHgnO1xuICAgIGltYWdlVmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgQFZpZXdDaGlsZCgnc291cmNlSW1hZ2UnKSBzb3VyY2VJbWFnZTogRWxlbWVudFJlZjtcblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGltYWdlRmlsZUNoYW5nZWQoZmlsZTogRmlsZSkge1xuICAgICAgICB0aGlzLmluaXRDcm9wcGVyKCk7XG4gICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZpbGUoZmlsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBpbWFnZUNoYW5nZWRFdmVudChldmVudDogYW55KSB7XG4gICAgICAgIHRoaXMuaW5pdENyb3BwZXIoKTtcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQuZmlsZXMgJiYgZXZlbnQudGFyZ2V0LmZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRmlsZShldmVudC50YXJnZXQuZmlsZXNbMF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgaW1hZ2VCYXNlNjQoaW1hZ2VCYXNlNjQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmluaXRDcm9wcGVyKCk7XG4gICAgICAgIHRoaXMubG9hZEJhc2U2NEltYWdlKGltYWdlQmFzZTY0KTtcbiAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBjcm9wU2V0T3JpZ2luYWxTaXplKHNpemUgOiB7d2lkdGg6bnVtYmVyLCBoZWlnaHQ6IG51bWJlcn0pIHtcbiAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUud2lkdGggPSBzaXplLndpZHRoO1xuICAgICAgICB0aGlzLm9yaWdpbmFsU2l6ZS5oZWlnaHQgPSBzaXplLmhlaWdodDtcbiAgICB9XG5cbiAgICBASW5wdXQoKSBmb3JtYXQ6ICdwbmcnIHwgJ2pwZWcnIHwgJ2JtcCcgfCAnd2VicCcgfCAnaWNvJyA9ICdwbmcnO1xuICAgIEBJbnB1dCgpIG91dHB1dFR5cGU6IE91dHB1dFR5cGUgPSAnYm90aCc7XG4gICAgQElucHV0KCkgbWFpbnRhaW5Bc3BlY3RSYXRpbyA9IHRydWU7XG4gICAgQElucHV0KCkgYXNwZWN0UmF0aW8gPSAxO1xuICAgIEBJbnB1dCgpIHJlc2l6ZVRvV2lkdGggPSAwO1xuICAgIEBJbnB1dCgpIGNyb3BwZXJNaW5XaWR0aCA9IDA7XG4gICAgQElucHV0KCkgcm91bmRDcm9wcGVyID0gZmFsc2U7XG4gICAgQElucHV0KCkgb25seVNjYWxlRG93biA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIGltYWdlUXVhbGl0eSA9IDkyO1xuICAgIEBJbnB1dCgpIGF1dG9Dcm9wID0gdHJ1ZTtcbiAgICBASW5wdXQoKSBjcm9wcGVyOiBDcm9wcGVyUG9zaXRpb24gPSB7XG4gICAgICAgIHgxOiAtMTAwLFxuICAgICAgICB5MTogLTEwMCxcbiAgICAgICAgeDI6IDEwMDAwLFxuICAgICAgICB5MjogMTAwMDBcbiAgICB9O1xuICAgIEBIb3N0QmluZGluZygnc3R5bGUudGV4dC1hbGlnbicpXG4gICAgQElucHV0KCkgYWxpZ25JbWFnZTogJ2xlZnQnIHwgJ2NlbnRlcicgPSAnY2VudGVyJztcblxuXG4gICAgQE91dHB1dCgpIHN0YXJ0Q3JvcEltYWdlID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBpbWFnZUNyb3BwZWQgPSBuZXcgRXZlbnRFbWl0dGVyPEltYWdlQ3JvcHBlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBpbWFnZUNyb3BwZWRCYXNlNjQgPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcbiAgICBAT3V0cHV0KCkgaW1hZ2VDcm9wcGVkRmlsZSA9IG5ldyBFdmVudEVtaXR0ZXI8QmxvYj4oKTtcbiAgICBAT3V0cHV0KCkgaW1hZ2VMb2FkZWQgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gICAgQE91dHB1dCgpIGNyb3BwZXJSZWFkeSA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgICBAT3V0cHV0KCkgbG9hZEltYWdlRmFpbGVkID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBzYW5pdGl6ZXI6IERvbVNhbml0aXplcixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSkge1xuICAgICAgICB0aGlzLmluaXRDcm9wcGVyKCk7XG4gICAgfVxuXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgICAgICBpZiAoY2hhbmdlcy5jcm9wcGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNldE1heFNpemUoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Q3JvcHBlclNjYWxlZE1pblNpemUoKTtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tDcm9wcGVyUG9zaXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5kb0F1dG9Dcm9wKCk7XG4gICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLmFzcGVjdFJhdGlvICYmIHRoaXMuaW1hZ2VWaXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0Q3JvcHBlclBvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXRDcm9wcGVyKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmltYWdlVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2UgPSBudWxsO1xuICAgICAgICB0aGlzLnNhZmVJbWdEYXRhVXJsID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnJ1xuICAgICAgICAgICAgKyAnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBWUFBQUFmRmNTSkFBQUFDMGxFUVZRWVYyTmdBQUlBQUFVJ1xuICAgICAgICAgICAgKyAnQUFhclZ5RkVBQUFBQVNVVk9SSzVDWUlJPSc7XG4gICAgICAgIHRoaXMubW92ZVN0YXJ0ID0ge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHR5cGU6IG51bGwsXG4gICAgICAgICAgICBwb3NpdGlvbjogbnVsbCxcbiAgICAgICAgICAgIHgxOiAwLFxuICAgICAgICAgICAgeTE6IDAsXG4gICAgICAgICAgICB4MjogMCxcbiAgICAgICAgICAgIHkyOiAwLFxuICAgICAgICAgICAgY2xpZW50WDogMCxcbiAgICAgICAgICAgIGNsaWVudFk6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5tYXhTaXplID0ge1xuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUgPSB7XG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAtMTAwO1xuICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSAtMTAwO1xuICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSAxMDAwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gMTAwMDA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2FkSW1hZ2VGaWxlKGZpbGU6IEZpbGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlVHlwZSA9IGZpbGUudHlwZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzVmFsaWRJbWFnZVR5cGUoaW1hZ2VUeXBlKSkge1xuICAgICAgICAgICAgICAgIHJlc2V0RXhpZk9yaWVudGF0aW9uKGV2ZW50LnRhcmdldC5yZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHRCYXNlNjQ6IHN0cmluZykgPT4gdGhpcy5sb2FkQmFzZTY0SW1hZ2UocmVzdWx0QmFzZTY0KSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHRoaXMubG9hZEltYWdlRmFpbGVkLmVtaXQoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRmFpbGVkLmVtaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNWYWxpZEltYWdlVHlwZSh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIC9pbWFnZVxcLyhwbmd8anBnfGpwZWd8Ym1wfGdpZnx0aWZmKS8udGVzdCh0eXBlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRCYXNlNjRJbWFnZShpbWFnZUJhc2U2NDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxCYXNlNjQgPSBpbWFnZUJhc2U2NDtcbiAgICAgICAgdGhpcy5zYWZlSW1nRGF0YVVybCA9IHRoaXMuc2FuaXRpemVyLmJ5cGFzc1NlY3VyaXR5VHJ1c3RSZXNvdXJjZVVybChpbWFnZUJhc2U2NCk7XG4gICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUud2lkdGggPSB0aGlzLm9yaWdpbmFsSW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsU2l6ZS5oZWlnaHQgPSB0aGlzLm9yaWdpbmFsSW1hZ2UuaGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLnNyYyA9IGltYWdlQmFzZTY0O1xuICAgIH1cblxuICAgIGltYWdlTG9hZGVkSW5WaWV3KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbEltYWdlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VMb2FkZWQuZW1pdCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRJbWFnZU1heFNpemVSZXRyaWVzID0gMDtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5jaGVja0ltYWdlTWF4U2l6ZVJlY3Vyc2l2ZWx5KCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0ltYWdlTWF4U2l6ZVJlY3Vyc2l2ZWx5KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5zZXRJbWFnZU1heFNpemVSZXRyaWVzID4gNDApIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEltYWdlRmFpbGVkLmVtaXQoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNvdXJjZUltYWdlICYmIHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudCAmJiB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldE1heFNpemUoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Q3JvcHBlclNjYWxlZE1pblNpemUoKTtcbiAgICAgICAgICAgIHRoaXMucmVzZXRDcm9wcGVyUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclJlYWR5LmVtaXQoKTtcbiAgICAgICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldEltYWdlTWF4U2l6ZVJldHJpZXMrKztcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tJbWFnZU1heFNpemVSZWN1cnNpdmVseSgpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignd2luZG93OnJlc2l6ZScpXG4gICAgb25SZXNpemUoKTogdm9pZCB7XG4gICAgICAgIHRoaXMucmVzaXplQ3JvcHBlclBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMuc2V0TWF4U2l6ZSgpO1xuICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk7XG4gICAgfVxuXG4gICAgcm90YXRlTGVmdCgpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1CYXNlNjQoOCk7XG4gICAgfVxuXG4gICAgcm90YXRlUmlnaHQoKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtQmFzZTY0KDYpO1xuICAgIH1cblxuICAgIGZsaXBIb3Jpem9udGFsKCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUJhc2U2NCgyKTtcbiAgICB9XG5cbiAgICBmbGlwVmVydGljYWwoKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtQmFzZTY0KDQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdHJhbnNmb3JtQmFzZTY0KGV4aWZPcmllbnRhdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm9yaWdpbmFsQmFzZTY0KSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1CYXNlNjRCYXNlZE9uRXhpZlJvdGF0aW9uKHRoaXMub3JpZ2luYWxCYXNlNjQsIGV4aWZPcmllbnRhdGlvbilcbiAgICAgICAgICAgICAgICAudGhlbigocm90YXRlZEJhc2U2NDogc3RyaW5nKSA9PiB0aGlzLmxvYWRCYXNlNjRJbWFnZShyb3RhdGVkQmFzZTY0KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2l6ZUNyb3BwZXJQb3NpdGlvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICBpZiAodGhpcy5tYXhTaXplLndpZHRoICE9PSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggfHwgdGhpcy5tYXhTaXplLmhlaWdodCAhPT0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gdGhpcy5jcm9wcGVyLngxICogc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5tYXhTaXplLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5jcm9wcGVyLngyICogc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5tYXhTaXplLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gdGhpcy5jcm9wcGVyLnkxICogc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAvIHRoaXMubWF4U2l6ZS5oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLmNyb3BwZXIueTIgKiBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gdGhpcy5tYXhTaXplLmhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVzZXRDcm9wcGVyUG9zaXRpb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgaWYgKCF0aGlzLm1haW50YWluQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICAgICAgfSBlbHNlIGlmIChzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvIDwgc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIGNvbnN0IGNyb3BwZXJIZWlnaHQgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gKHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQgLSBjcm9wcGVySGVpZ2h0KSAvIDI7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLmNyb3BwZXIueTEgKyBjcm9wcGVySGVpZ2h0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICBjb25zdCBjcm9wcGVyV2lkdGggPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0ICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IChzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGggLSBjcm9wcGVyV2lkdGgpIC8gMjtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MSArIGNyb3BwZXJXaWR0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRvQXV0b0Nyb3AoKTtcbiAgICAgICAgdGhpcy5pbWFnZVZpc2libGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHN0YXJ0TW92ZShldmVudDogYW55LCBtb3ZlVHlwZTogc3RyaW5nLCBwb3NpdGlvbjogc3RyaW5nIHwgbnVsbCA9IG51bGwpOiB2b2lkIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5tb3ZlU3RhcnQgPSB7XG4gICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB0eXBlOiBtb3ZlVHlwZSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICAgICAgICAgIGNsaWVudFg6IHRoaXMuZ2V0Q2xpZW50WChldmVudCksXG4gICAgICAgICAgICBjbGllbnRZOiB0aGlzLmdldENsaWVudFkoZXZlbnQpLFxuICAgICAgICAgICAgLi4udGhpcy5jcm9wcGVyXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6bW91c2Vtb3ZlJywgWyckZXZlbnQnXSlcbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDp0b3VjaG1vdmUnLCBbJyRldmVudCddKVxuICAgIG1vdmVJbWcoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5tb3ZlU3RhcnQuYWN0aXZlKSB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5tb3ZlU3RhcnQudHlwZSA9PT0gJ21vdmUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQ3JvcHBlclBvc2l0aW9uKHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1vdmVTdGFydC50eXBlID09PSAncmVzaXplJykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzaXplKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrQ3JvcHBlclBvc2l0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRNYXhTaXplKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzb3VyY2VJbWFnZUVsZW1lbnQgPSB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMubWF4U2l6ZS53aWR0aCA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgdGhpcy5tYXhTaXplLmhlaWdodCA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHRoaXMubWFyZ2luTGVmdCA9IHRoaXMuc2FuaXRpemVyLmJ5cGFzc1NlY3VyaXR5VHJ1c3RTdHlsZSgnY2FsYyg1MCUgLSAnICsgdGhpcy5tYXhTaXplLndpZHRoIC8gMiArICdweCknKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbEltYWdlICYmIHRoaXMuY3JvcHBlck1pbldpZHRoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGggPSBNYXRoLm1heCgyMCwgdGhpcy5jcm9wcGVyTWluV2lkdGggLyB0aGlzLm9yaWdpbmFsSW1hZ2Uud2lkdGggKiB0aGlzLm1heFNpemUud2lkdGgpO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0ID0gdGhpcy5tYWludGFpbkFzcGVjdFJhdGlvXG4gICAgICAgICAgICAgICAgPyBNYXRoLm1heCgyMCwgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGggLyB0aGlzLmFzcGVjdFJhdGlvKVxuICAgICAgICAgICAgICAgIDogMjA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCA9IDIwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0ID0gMjA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrQ3JvcHBlclBvc2l0aW9uKG1haW50YWluU2l6ZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmNyb3BwZXIueDEgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gbWFpbnRhaW5TaXplID8gdGhpcy5jcm9wcGVyLngxIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY3JvcHBlci55MSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiAtPSBtYWludGFpblNpemUgPyB0aGlzLmNyb3BwZXIueTEgOiAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLngyID4gdGhpcy5tYXhTaXplLndpZHRoKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgLT0gbWFpbnRhaW5TaXplID8gKHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCkgOiAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5tYXhTaXplLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNyb3BwZXIueTIgPiB0aGlzLm1heFNpemUuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgLT0gbWFpbnRhaW5TaXplID8gKHRoaXMuY3JvcHBlci55MiAtIHRoaXMubWF4U2l6ZS5oZWlnaHQpIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMubWF4U2l6ZS5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZXVwJylcbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDp0b3VjaGVuZCcpXG4gICAgbW92ZVN0b3AoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLm1vdmVTdGFydC5hY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5kb0F1dG9Dcm9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG1vdmUoZXZlbnQ6IGFueSkge1xuICAgICAgICBjb25zdCBkaWZmWCA9IHRoaXMuZ2V0Q2xpZW50WChldmVudCkgLSB0aGlzLm1vdmVTdGFydC5jbGllbnRYO1xuICAgICAgICBjb25zdCBkaWZmWSA9IHRoaXMuZ2V0Q2xpZW50WShldmVudCkgLSB0aGlzLm1vdmVTdGFydC5jbGllbnRZO1xuXG4gICAgICAgIHRoaXMuY3JvcHBlci54MSA9IHRoaXMubW92ZVN0YXJ0LngxICsgZGlmZlg7XG4gICAgICAgIHRoaXMuY3JvcHBlci55MSA9IHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlk7XG4gICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMubW92ZVN0YXJ0LngyICsgZGlmZlg7XG4gICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMubW92ZVN0YXJ0LnkyICsgZGlmZlk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemUoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zdCBkaWZmWCA9IHRoaXMuZ2V0Q2xpZW50WChldmVudCkgLSB0aGlzLm1vdmVTdGFydC5jbGllbnRYO1xuICAgICAgICBjb25zdCBkaWZmWSA9IHRoaXMuZ2V0Q2xpZW50WShldmVudCkgLSB0aGlzLm1vdmVTdGFydC5jbGllbnRZO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubW92ZVN0YXJ0LnBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC54MSArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3BsZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC54MSArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueTEgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueTEgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcHJpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC54MiArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueTEgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC54MiArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b21yaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LnkyICsgZGlmZlksIHRoaXMuY3JvcHBlci55MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LnkyICsgZGlmZlksIHRoaXMuY3JvcHBlci55MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b21sZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSBNYXRoLm1pbih0aGlzLm1vdmVTdGFydC54MSArIGRpZmZYLCB0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXJTY2FsZWRNaW5XaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueTIgKyBkaWZmWSwgdGhpcy5jcm9wcGVyLnkxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1haW50YWluQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tBc3BlY3RSYXRpbygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0FzcGVjdFJhdGlvKCk6IHZvaWQge1xuICAgICAgICBsZXQgb3ZlcmZsb3dYID0gMDtcbiAgICAgICAgbGV0IG92ZXJmbG93WSA9IDA7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLm1vdmVTdGFydC5wb3NpdGlvbikge1xuICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDEgKyAodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5jcm9wcGVyLnkxKSAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLnkxLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5jcm9wcGVyLngxICsgKHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlci55MSkgKiB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogKG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcGxlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IHRoaXMuY3JvcHBlci55MiAtICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXIueDEpIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLngxLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLnkxLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RvcHJpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLmNyb3BwZXIueTIgLSAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLnkxLCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbXJpZ2h0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLmNyb3BwZXIueTEgKyAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5tYXhTaXplLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgY2FzZSAnYm90dG9tbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KDAgLSB0aGlzLmNyb3BwZXIueDEsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci55MiAtIHRoaXMubWF4U2l6ZS5oZWlnaHQsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxICs9IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IG92ZXJmbG93WCAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkb0F1dG9Dcm9wKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5hdXRvQ3JvcCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9jYW5Vc2VDdXN0b21EYXRhIDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgQElucHV0KClcbiAgICBzZXQgY2FuVXNlQ3VzdG9tRGF0YShjYW5Vc2VDdXN0b20gOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX2NhblVzZUN1c3RvbURhdGEgPSBjYW5Vc2VDdXN0b207XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgY3VzdG9tQ3JvcHBlcihjcm9wcGVyIDogUmVjdCkge1xuXG4gICAgICAgIGlmICh0aGlzLl9jYW5Vc2VDdXN0b21EYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIgPSBjcm9wcGVyO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIEBJbnB1dCgpIFxuICAgIHNldCBjdXN0b21JbWFnZVBvc2l0aW9uKGltYWdlUG9zaXRpb24gOiBSZWN0KSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9jYW5Vc2VDdXN0b21EYXRhKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5pbWFnZVZpc2libGUgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50ICYmIHRoaXMub3JpZ2luYWxJbWFnZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0Q3JvcEltYWdlLmVtaXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gaW1hZ2VQb3NpdGlvbi54MiAtIGltYWdlUG9zaXRpb24ueDE7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSBpbWFnZVBvc2l0aW9uLnkyIC0gaW1hZ2VQb3NpdGlvbi55MTtcblxuICAgICAgICAgICAgY29uc3QgY3JvcENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgICAgICAgICAgY3JvcENhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgY3JvcENhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IGNyb3BDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlUG9zaXRpb24ueDEsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlUG9zaXRpb24ueTEsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IHt3aWR0aCwgaGVpZ2h0LCBpbWFnZVBvc2l0aW9uLCBjcm9wcGVyUG9zaXRpb246IHsuLi50aGlzLmNyb3BwZXJ9fTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNpemVSYXRpbyA9IHRoaXMuZ2V0UmVzaXplUmF0aW8od2lkdGgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXNpemVSYXRpbyAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQud2lkdGggPSBNYXRoLmZsb29yKHdpZHRoICogcmVzaXplUmF0aW8pO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuaGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgKiByZXNpemVSYXRpbyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZUNhbnZhcyhjcm9wQ2FudmFzLCBvdXRwdXQud2lkdGggfHwgd2lkdGgsIG91dHB1dC5oZWlnaHQgfHwgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BUb091dHB1dFR5cGUodGhpcy5vdXRwdXRUeXBlLCBjcm9wQ2FudmFzLCBvdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JvcChvdXRwdXRUeXBlOiBPdXRwdXRUeXBlID0gdGhpcy5vdXRwdXRUeXBlKTogSW1hZ2VDcm9wcGVkRXZlbnQgfCBQcm9taXNlPEltYWdlQ3JvcHBlZEV2ZW50PiB8IG51bGwge1xuICAgICAgICBpZiAodGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50ICYmIHRoaXMub3JpZ2luYWxJbWFnZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0Q3JvcEltYWdlLmVtaXQoKTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlUG9zaXRpb24gPSB0aGlzLmdldEltYWdlUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gaW1hZ2VQb3NpdGlvbi54MiAtIGltYWdlUG9zaXRpb24ueDE7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSBpbWFnZVBvc2l0aW9uLnkyIC0gaW1hZ2VQb3NpdGlvbi55MTtcblxuICAgICAgICAgICAgY29uc3QgY3JvcENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgICAgICAgICAgY3JvcENhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgY3JvcENhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IGNyb3BDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlUG9zaXRpb24ueDEsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlUG9zaXRpb24ueTEsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IHt3aWR0aCwgaGVpZ2h0LCBpbWFnZVBvc2l0aW9uLCBjcm9wcGVyUG9zaXRpb246IHsuLi50aGlzLmNyb3BwZXJ9fTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNpemVSYXRpbyA9IHRoaXMuZ2V0UmVzaXplUmF0aW8od2lkdGgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXNpemVSYXRpbyAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQud2lkdGggPSBNYXRoLmZsb29yKHdpZHRoICogcmVzaXplUmF0aW8pO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuaGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgKiByZXNpemVSYXRpbyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZUNhbnZhcyhjcm9wQ2FudmFzLCBvdXRwdXQud2lkdGgsIG91dHB1dC5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jcm9wVG9PdXRwdXRUeXBlKG91dHB1dFR5cGUsIGNyb3BDYW52YXMsIG91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbWFnZVBvc2l0aW9uKCk6IENyb3BwZXJQb3NpdGlvbiB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29uc3QgcmF0aW8gPSB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCAvIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHgxOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci54MSAqIHJhdGlvKSxcbiAgICAgICAgICAgIHkxOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci55MSAqIHJhdGlvKSxcbiAgICAgICAgICAgIHgyOiBNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci54MiAqIHJhdGlvKSwgdGhpcy5vcmlnaW5hbFNpemUud2lkdGgpLFxuICAgICAgICAgICAgeTI6IE1hdGgubWluKE1hdGgucm91bmQodGhpcy5jcm9wcGVyLnkyICAqIHJhdGlvKSwgdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcm9wVG9PdXRwdXRUeXBlKG91dHB1dFR5cGU6IE91dHB1dFR5cGUsIGNyb3BDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBvdXRwdXQ6IEltYWdlQ3JvcHBlZEV2ZW50KTogSW1hZ2VDcm9wcGVkRXZlbnQgfCBQcm9taXNlPEltYWdlQ3JvcHBlZEV2ZW50PiB7XG4gICAgICAgIHN3aXRjaCAob3V0cHV0VHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZmlsZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JvcFRvRmlsZShjcm9wQ2FudmFzKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0OiBCbG9iIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmZpbGUgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlQ3JvcHBlZC5lbWl0KG91dHB1dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhc2UgJ2JvdGgnOlxuICAgICAgICAgICAgICAgIG91dHB1dC5iYXNlNjQgPSB0aGlzLmNyb3BUb0Jhc2U2NChjcm9wQ2FudmFzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jcm9wVG9GaWxlKGNyb3BDYW52YXMpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQ6IEJsb2IgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQuZmlsZSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VDcm9wcGVkLmVtaXQob3V0cHV0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvdXRwdXQuYmFzZTY0ID0gdGhpcy5jcm9wVG9CYXNlNjQoY3JvcENhbnZhcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUNyb3BwZWQuZW1pdChvdXRwdXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyb3BUb0Jhc2U2NChjcm9wQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGltYWdlQmFzZTY0ID0gY3JvcENhbnZhcy50b0RhdGFVUkwoJ2ltYWdlLycgKyB0aGlzLmZvcm1hdCwgdGhpcy5nZXRRdWFsaXR5KCkpO1xuICAgICAgICB0aGlzLmltYWdlQ3JvcHBlZEJhc2U2NC5lbWl0KGltYWdlQmFzZTY0KTtcbiAgICAgICAgcmV0dXJuIGltYWdlQmFzZTY0O1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JvcFRvRmlsZShjcm9wQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFByb21pc2U8QmxvYiB8IG51bGw+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2FudmFzQmxvYihjcm9wQ2FudmFzKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3VsdDogQmxvYiB8IG51bGwpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VDcm9wcGVkRmlsZS5lbWl0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENhbnZhc0Jsb2IoY3JvcENhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBQcm9taXNlPEJsb2IgfCBudWxsPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY3JvcENhbnZhcy50b0Jsb2IoXG4gICAgICAgICAgICAgICAgKHJlc3VsdDogQmxvYiB8IG51bGwpID0+IHRoaXMuem9uZS5ydW4oKCkgPT4gcmVzb2x2ZShyZXN1bHQpKSxcbiAgICAgICAgICAgICAgICAnaW1hZ2UvJyArIHRoaXMuZm9ybWF0LFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UXVhbGl0eSgpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFF1YWxpdHkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKDEsIE1hdGgubWF4KDAsIHRoaXMuaW1hZ2VRdWFsaXR5IC8gMTAwKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZXNpemVSYXRpbyh3aWR0aDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzaXplVG9XaWR0aCA+IDAgJiYgKCF0aGlzLm9ubHlTY2FsZURvd24gfHwgd2lkdGggPiB0aGlzLnJlc2l6ZVRvV2lkdGgpXG4gICAgICAgICAgICA/IHRoaXMucmVzaXplVG9XaWR0aCAvIHdpZHRoXG4gICAgICAgICAgICA6IDE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDbGllbnRYKGV2ZW50OiBhbnkpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gZXZlbnQuY2xpZW50WCB8fCBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0gJiYgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2xpZW50WShldmVudDogYW55KTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50LmNsaWVudFkgfHwgZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdICYmIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICB9XG59XG4iXX0=