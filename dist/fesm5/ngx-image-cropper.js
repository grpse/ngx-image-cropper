import { __assign } from 'tslib';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ViewChild, NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

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
    if (resizeCanvas === void 0) { resizeCanvas = true; }
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var ImageCropperModule = /** @class */ (function () {
    function ImageCropperModule() {
    }
    ImageCropperModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        CommonModule
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

export { ImageCropperModule, ImageCropperComponent };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWltYWdlLWNyb3BwZXIuanMubWFwIiwic291cmNlcyI6WyJuZzovL25neC1pbWFnZS1jcm9wcGVyL3NyYy91dGlscy9leGlmLnV0aWxzLnRzIiwibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci9zcmMvdXRpbHMvcmVzaXplLnV0aWxzLnRzIiwibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci9zcmMvY29tcG9uZW50L2ltYWdlLWNyb3BwZXIuY29tcG9uZW50LnRzIiwibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci9zcmMvaW1hZ2UtY3JvcHBlci5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RXhpZk9yaWVudGF0aW9uKHNyY0Jhc2U2NDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBleGlmUm90YXRpb24gPSBnZXRFeGlmUm90YXRpb24oc3JjQmFzZTY0KTtcbiAgICAgICAgaWYgKGV4aWZSb3RhdGlvbiA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1CYXNlNjRCYXNlZE9uRXhpZlJvdGF0aW9uKHNyY0Jhc2U2NCwgZXhpZlJvdGF0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc3JjQmFzZTY0KTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChleCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtQmFzZTY0QmFzZWRPbkV4aWZSb3RhdGlvbihzcmNCYXNlNjQ6IHN0cmluZywgZXhpZlJvdGF0aW9uOiBudW1iZXIpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgIGlmICg0IDwgZXhpZlJvdGF0aW9uICYmIGV4aWZSb3RhdGlvbiA8IDkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybUNhbnZhcyhjdHgsIGV4aWZSb3RhdGlvbiwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoY2FudmFzLnRvRGF0YVVSTCgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignTm8gY29udGV4dCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaW1nLnNyYyA9IHNyY0Jhc2U2NDtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0RXhpZlJvdGF0aW9uKGltYWdlQmFzZTY0OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcoYmFzZTY0VG9BcnJheUJ1ZmZlcihpbWFnZUJhc2U2NCkpO1xuICAgIGlmICh2aWV3LmdldFVpbnQxNigwLCBmYWxzZSkgIT0gMHhGRkQ4KSB7XG4gICAgICAgIHJldHVybiAtMjtcbiAgICB9XG4gICAgY29uc3QgbGVuZ3RoID0gdmlldy5ieXRlTGVuZ3RoO1xuICAgIGxldCBvZmZzZXQgPSAyO1xuICAgIHdoaWxlIChvZmZzZXQgPCBsZW5ndGgpIHtcbiAgICAgICAgaWYgKHZpZXcuZ2V0VWludDE2KG9mZnNldCArIDIsIGZhbHNlKSA8PSA4KSByZXR1cm4gLTE7XG4gICAgICAgIGNvbnN0IG1hcmtlciA9IHZpZXcuZ2V0VWludDE2KG9mZnNldCwgZmFsc2UpO1xuICAgICAgICBvZmZzZXQgKz0gMjtcbiAgICAgICAgaWYgKG1hcmtlciA9PSAweEZGRTEpIHtcbiAgICAgICAgICAgIGlmICh2aWV3LmdldFVpbnQzMihvZmZzZXQgKz0gMiwgZmFsc2UpICE9IDB4NDU3ODY5NjYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGxpdHRsZSA9IHZpZXcuZ2V0VWludDE2KG9mZnNldCArPSA2LCBmYWxzZSkgPT0gMHg0OTQ5O1xuICAgICAgICAgICAgb2Zmc2V0ICs9IHZpZXcuZ2V0VWludDMyKG9mZnNldCArIDQsIGxpdHRsZSk7XG4gICAgICAgICAgICBjb25zdCB0YWdzID0gdmlldy5nZXRVaW50MTYob2Zmc2V0LCBsaXR0bGUpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhZ3M7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh2aWV3LmdldFVpbnQxNihvZmZzZXQgKyAoaSAqIDEyKSwgbGl0dGxlKSA9PSAweDAxMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcuZ2V0VWludDE2KG9mZnNldCArIChpICogMTIpICsgOCwgbGl0dGxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoKG1hcmtlciAmIDB4RkYwMCkgIT0gMHhGRjAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9mZnNldCArPSB2aWV3LmdldFVpbnQxNihvZmZzZXQsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoaW1hZ2VCYXNlNjQ6IHN0cmluZykge1xuICAgIGltYWdlQmFzZTY0ID0gaW1hZ2VCYXNlNjQucmVwbGFjZSgvXmRhdGFcXDooW15cXDtdKylcXDtiYXNlNjQsL2dtaSwgJycpO1xuICAgIGNvbnN0IGJpbmFyeVN0cmluZyA9IGF0b2IoaW1hZ2VCYXNlNjQpO1xuICAgIGNvbnN0IGxlbiA9IGJpbmFyeVN0cmluZy5sZW5ndGg7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShsZW4pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtQ2FudmFzKGN0eDogYW55LCBvcmllbnRhdGlvbjogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIHN3aXRjaCAob3JpZW50YXRpb24pIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgY3R4LnRyYW5zZm9ybSgtMSwgMCwgMCwgMSwgd2lkdGgsIDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGN0eC50cmFuc2Zvcm0oLTEsIDAsIDAsIC0xLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBoZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGN0eC50cmFuc2Zvcm0oMCwgMSwgMSwgMCwgMCwgMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgY3R4LnRyYW5zZm9ybSgwLCAxLCAtMSwgMCwgaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICBjdHgudHJhbnNmb3JtKDAsIC0xLCAtMSwgMCwgaGVpZ2h0LCB3aWR0aCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgY3R4LnRyYW5zZm9ybSgwLCAtMSwgMSwgMCwgMCwgd2lkdGgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuIiwiLypcbiAqIEhlcm1pdGUgcmVzaXplIC0gZmFzdCBpbWFnZSByZXNpemUvcmVzYW1wbGUgdXNpbmcgSGVybWl0ZSBmaWx0ZXIuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vdmlsaXVzbGUvSGVybWl0ZS1yZXNpemVcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzaXplQ2FudmFzKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCByZXNpemVDYW52YXMgPSB0cnVlKSB7XG5cbiAgICB0cnkge1xuXG4gICAgICAgIGNvbnN0IHdpZHRoX3NvdXJjZSA9IGNhbnZhcy53aWR0aCB8fCB3aWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0X3NvdXJjZSA9IGNhbnZhcy5oZWlnaHQgfHwgaGVpZ2h0O1xuICAgICAgICB3aWR0aCA9IE1hdGgucm91bmQod2lkdGgpO1xuICAgICAgICBoZWlnaHQgPSBNYXRoLnJvdW5kKGhlaWdodCk7XG4gICAgXG4gICAgICAgIGNvbnN0IHJhdGlvX3cgPSB3aWR0aF9zb3VyY2UgLyB3aWR0aDtcbiAgICAgICAgY29uc3QgcmF0aW9faCA9IGhlaWdodF9zb3VyY2UgLyBoZWlnaHQ7XG4gICAgICAgIGNvbnN0IHJhdGlvX3dfaGFsZiA9IE1hdGguY2VpbChyYXRpb193IC8gMik7XG4gICAgICAgIGNvbnN0IHJhdGlvX2hfaGFsZiA9IE1hdGguY2VpbChyYXRpb19oIC8gMik7XG4gICAgXG4gICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBjb25zdCBpbWcgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoX3NvdXJjZSwgaGVpZ2h0X3NvdXJjZSk7XG4gICAgICAgICAgICBjb25zdCBpbWcyID0gY3R4LmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBpbWcuZGF0YTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEyID0gaW1nMi5kYXRhO1xuICAgIFxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBoZWlnaHQ7IGorKykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB4MiA9IChpICsgaiAqIHdpZHRoKSAqIDQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlcl95ID0gaiAqIHJhdGlvX2g7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3ZWlnaHQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgd2VpZ2h0cyA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3ZWlnaHRzX2FscGhhID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGd4X3IgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ3hfZyA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBneF9iID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGd4X2EgPSAwO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4eF9zdGFydCA9IE1hdGguZmxvb3IoaSAqIHJhdGlvX3cpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB5eV9zdGFydCA9IE1hdGguZmxvb3IoaiAqIHJhdGlvX2gpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgeHhfc3RvcCA9IE1hdGguY2VpbCgoaSArIDEpICogcmF0aW9fdyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB5eV9zdG9wID0gTWF0aC5jZWlsKChqICsgMSkgKiByYXRpb19oKTtcbiAgICAgICAgICAgICAgICAgICAgeHhfc3RvcCA9IE1hdGgubWluKHh4X3N0b3AsIHdpZHRoX3NvdXJjZSk7XG4gICAgICAgICAgICAgICAgICAgIHl5X3N0b3AgPSBNYXRoLm1pbih5eV9zdG9wLCBoZWlnaHRfc291cmNlKTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgeXkgPSB5eV9zdGFydDsgeXkgPCB5eV9zdG9wOyB5eSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkeSA9IE1hdGguYWJzKGNlbnRlcl95IC0geXkpIC8gcmF0aW9faF9oYWxmO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2VudGVyX3ggPSBpICogcmF0aW9fdztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHcwID0gZHkgKiBkeTsgLy9wcmUtY2FsYyBwYXJ0IG9mIHdcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHh4ID0geHhfc3RhcnQ7IHh4IDwgeHhfc3RvcDsgeHgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGR4ID0gTWF0aC5hYnMoY2VudGVyX3ggLSB4eCkgLyByYXRpb193X2hhbGY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdyA9IE1hdGguc3FydCh3MCArIGR4ICogZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3ID49IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9waXhlbCB0b28gZmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2hlcm1pdGUgZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gMiAqIHcgKiB3ICogdyAtIDMgKiB3ICogdyArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zX3ggPSA0ICogKHh4ICsgeXkgKiB3aWR0aF9zb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYWxwaGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBneF9hICs9IHdlaWdodCAqIGRhdGFbcG9zX3ggKyAzXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHRzX2FscGhhICs9IHdlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbG9yc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhW3Bvc194ICsgM10gPCAyNTUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlaWdodCA9IHdlaWdodCAqIGRhdGFbcG9zX3ggKyAzXSAvIDI1MDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBneF9yICs9IHdlaWdodCAqIGRhdGFbcG9zX3hdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd4X2cgKz0gd2VpZ2h0ICogZGF0YVtwb3NfeCArIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd4X2IgKz0gd2VpZ2h0ICogZGF0YVtwb3NfeCArIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlaWdodHMgKz0gd2VpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRhdGEyW3gyXSA9IGd4X3IgLyB3ZWlnaHRzO1xuICAgICAgICAgICAgICAgICAgICBkYXRhMlt4MiArIDFdID0gZ3hfZyAvIHdlaWdodHM7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEyW3gyICsgMl0gPSBneF9iIC8gd2VpZ2h0cztcbiAgICAgICAgICAgICAgICAgICAgZGF0YTJbeDIgKyAzXSA9IGd4X2EgLyB3ZWlnaHRzX2FscGhhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY2xlYXIgYW5kIHJlc2l6ZSBjYW52YXNcbiAgICAgICAgICAgIGlmIChyZXNpemVDYW52YXMpIHtcbiAgICAgICAgICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aF9zb3VyY2UsIGhlaWdodF9zb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgLy9kcmF3XG4gICAgICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGltZzIsIDAsIDApO1xuICAgICAgICB9XG4gICAgfSBjYXRjaChlKSB7XG5cbiAgICB9XG59IiwiaW1wb3J0IHtcbiAgICBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSG9zdEJpbmRpbmcsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIE9uQ2hhbmdlcywgT3V0cHV0LFxuICAgIFNpbXBsZUNoYW5nZXMsIENoYW5nZURldGVjdG9yUmVmLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgTmdab25lLCBWaWV3Q2hpbGRcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVVcmwsIFNhZmVTdHlsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgTW92ZVN0YXJ0LCBEaW1lbnNpb25zLCBDcm9wcGVyUG9zaXRpb24sIEltYWdlQ3JvcHBlZEV2ZW50IH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyByZXNldEV4aWZPcmllbnRhdGlvbiwgdHJhbnNmb3JtQmFzZTY0QmFzZWRPbkV4aWZSb3RhdGlvbiB9IGZyb20gJy4uL3V0aWxzL2V4aWYudXRpbHMnO1xuaW1wb3J0IHsgcmVzaXplQ2FudmFzIH0gZnJvbSAnLi4vdXRpbHMvcmVzaXplLnV0aWxzJztcblxuZXhwb3J0IHR5cGUgT3V0cHV0VHlwZSA9ICdiYXNlNjQnIHzDgsKgJ2ZpbGUnIHwgJ2JvdGgnO1xuXG5leHBvcnQgdHlwZSBSZWN0ID0ge3gxIDogbnVtYmVyLCB5MSA6IG51bWJlciwgeDIgOiBudW1iZXIsIHkyOiBudW1iZXJ9XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnaW1hZ2UtY3JvcHBlcicsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlLWNyb3BwZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogWycuL2ltYWdlLWNyb3BwZXIuY29tcG9uZW50LnNjc3MnXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBJbWFnZUNyb3BwZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAgIHByaXZhdGUgb3JpZ2luYWxJbWFnZTogYW55O1xuICAgIHByaXZhdGUgb3JpZ2luYWxCYXNlNjQ6IHN0cmluZztcbiAgICBwcml2YXRlIG1vdmVTdGFydDogTW92ZVN0YXJ0O1xuICAgIHByaXZhdGUgbWF4U2l6ZTogRGltZW5zaW9ucztcbiAgICBwcml2YXRlIG9yaWdpbmFsU2l6ZTogRGltZW5zaW9ucztcbiAgICBwcml2YXRlIHNldEltYWdlTWF4U2l6ZVJldHJpZXMgPSAwO1xuICAgIHByaXZhdGUgY3JvcHBlclNjYWxlZE1pbldpZHRoID0gMjA7XG4gICAgcHJpdmF0ZSBjcm9wcGVyU2NhbGVkTWluSGVpZ2h0ID0gMjA7XG5cbiAgICBzYWZlSW1nRGF0YVVybDogU2FmZVVybCB8IHN0cmluZztcbiAgICBtYXJnaW5MZWZ0OiBTYWZlU3R5bGUgfCBzdHJpbmcgPSAnMHB4JztcbiAgICBpbWFnZVZpc2libGUgPSBmYWxzZTtcblxuICAgIEBWaWV3Q2hpbGQoJ3NvdXJjZUltYWdlJykgc291cmNlSW1hZ2U6IEVsZW1lbnRSZWY7XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBpbWFnZUZpbGVDaGFuZ2VkKGZpbGU6IEZpbGUpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKGZpbGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgaW1hZ2VDaGFuZ2VkRXZlbnQoZXZlbnQ6IGFueSkge1xuICAgICAgICB0aGlzLmluaXRDcm9wcGVyKCk7XG4gICAgICAgIGlmIChldmVudCAmJiBldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0LmZpbGVzICYmIGV2ZW50LnRhcmdldC5maWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZpbGUoZXZlbnQudGFyZ2V0LmZpbGVzWzBdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGltYWdlQmFzZTY0KGltYWdlQmFzZTY0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgICAgICB0aGlzLmxvYWRCYXNlNjRJbWFnZShpbWFnZUJhc2U2NCk7XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgY3JvcFNldE9yaWdpbmFsU2l6ZShzaXplIDoge3dpZHRoOm51bWJlciwgaGVpZ2h0OiBudW1iZXJ9KSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxTaXplLndpZHRoID0gc2l6ZS53aWR0aDtcbiAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQ7XG4gICAgfVxuXG4gICAgQElucHV0KCkgZm9ybWF0OiAncG5nJyB8ICdqcGVnJyB8ICdibXAnIHwgJ3dlYnAnIHwgJ2ljbycgPSAncG5nJztcbiAgICBASW5wdXQoKSBvdXRwdXRUeXBlOiBPdXRwdXRUeXBlID0gJ2JvdGgnO1xuICAgIEBJbnB1dCgpIG1haW50YWluQXNwZWN0UmF0aW8gPSB0cnVlO1xuICAgIEBJbnB1dCgpIGFzcGVjdFJhdGlvID0gMTtcbiAgICBASW5wdXQoKSByZXNpemVUb1dpZHRoID0gMDtcbiAgICBASW5wdXQoKSBjcm9wcGVyTWluV2lkdGggPSAwO1xuICAgIEBJbnB1dCgpIHJvdW5kQ3JvcHBlciA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIG9ubHlTY2FsZURvd24gPSBmYWxzZTtcbiAgICBASW5wdXQoKSBpbWFnZVF1YWxpdHkgPSA5MjtcbiAgICBASW5wdXQoKSBhdXRvQ3JvcCA9IHRydWU7XG4gICAgQElucHV0KCkgY3JvcHBlcjogQ3JvcHBlclBvc2l0aW9uID0ge1xuICAgICAgICB4MTogLTEwMCxcbiAgICAgICAgeTE6IC0xMDAsXG4gICAgICAgIHgyOiAxMDAwMCxcbiAgICAgICAgeTI6IDEwMDAwXG4gICAgfTtcbiAgICBASG9zdEJpbmRpbmcoJ3N0eWxlLnRleHQtYWxpZ24nKVxuICAgIEBJbnB1dCgpIGFsaWduSW1hZ2U6ICdsZWZ0JyB8ICdjZW50ZXInID0gJ2NlbnRlcic7XG5cblxuICAgIEBPdXRwdXQoKSBzdGFydENyb3BJbWFnZSA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgICBAT3V0cHV0KCkgaW1hZ2VDcm9wcGVkID0gbmV3IEV2ZW50RW1pdHRlcjxJbWFnZUNyb3BwZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgaW1hZ2VDcm9wcGVkQmFzZTY0ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG4gICAgQE91dHB1dCgpIGltYWdlQ3JvcHBlZEZpbGUgPSBuZXcgRXZlbnRFbWl0dGVyPEJsb2I+KCk7XG4gICAgQE91dHB1dCgpIGltYWdlTG9hZGVkID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBjcm9wcGVyUmVhZHkgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gICAgQE91dHB1dCgpIGxvYWRJbWFnZUZhaWxlZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgc2FuaXRpemVyOiBEb21TYW5pdGl6ZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgIH1cblxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuY3JvcHBlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrQ3JvcHBlclBvc2l0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZG9BdXRvQ3JvcCgpO1xuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlcy5hc3BlY3RSYXRpbyAmJiB0aGlzLmltYWdlVmlzaWJsZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldENyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0Q3JvcHBlcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbWFnZVZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5zYWZlSW1nRGF0YVVybCA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZydcbiAgICAgICAgICAgICsgJ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBQzBsRVFWUVlWMk5nQUFJQUFBVSdcbiAgICAgICAgICAgICsgJ0FBYXJWeUZFQUFBQUFTVVZPUks1Q1lJST0nO1xuICAgICAgICB0aGlzLm1vdmVTdGFydCA9IHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiBudWxsLFxuICAgICAgICAgICAgcG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICB4MTogMCxcbiAgICAgICAgICAgIHkxOiAwLFxuICAgICAgICAgICAgeDI6IDAsXG4gICAgICAgICAgICB5MjogMCxcbiAgICAgICAgICAgIGNsaWVudFg6IDAsXG4gICAgICAgICAgICBjbGllbnRZOiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubWF4U2l6ZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3JpZ2luYWxTaXplID0ge1xuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gLTEwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gLTEwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gMTAwMDA7XG4gICAgICAgIHRoaXMuY3JvcHBlci55MiA9IDEwMDAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZEltYWdlRmlsZShmaWxlOiBGaWxlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVR5cGUgPSBmaWxlLnR5cGU7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1ZhbGlkSW1hZ2VUeXBlKGltYWdlVHlwZSkpIHtcbiAgICAgICAgICAgICAgICByZXNldEV4aWZPcmllbnRhdGlvbihldmVudC50YXJnZXQucmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0QmFzZTY0OiBzdHJpbmcpID0+IHRoaXMubG9hZEJhc2U2NEltYWdlKHJlc3VsdEJhc2U2NCkpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZpbGVSZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmFsaWRJbWFnZVR5cGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAvaW1hZ2VcXC8ocG5nfGpwZ3xqcGVnfGJtcHxnaWZ8dGlmZikvLnRlc3QodHlwZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2FkQmFzZTY0SW1hZ2UoaW1hZ2VCYXNlNjQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLm9yaWdpbmFsQmFzZTY0ID0gaW1hZ2VCYXNlNjQ7XG4gICAgICAgIHRoaXMuc2FmZUltZ0RhdGFVcmwgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwoaW1hZ2VCYXNlNjQpO1xuICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxTaXplLndpZHRoID0gdGhpcy5vcmlnaW5hbEltYWdlLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0ID0gdGhpcy5vcmlnaW5hbEltYWdlLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZS5zcmMgPSBpbWFnZUJhc2U2NDtcbiAgICB9XG5cbiAgICBpbWFnZUxvYWRlZEluVmlldygpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxJbWFnZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlTG9hZGVkLmVtaXQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0SW1hZ2VNYXhTaXplUmV0cmllcyA9IDA7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuY2hlY2tJbWFnZU1heFNpemVSZWN1cnNpdmVseSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tJbWFnZU1heFNpemVSZWN1cnNpdmVseSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0SW1hZ2VNYXhTaXplUmV0cmllcyA+IDQwKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zb3VyY2VJbWFnZSAmJiB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk7XG4gICAgICAgICAgICB0aGlzLnJlc2V0Q3JvcHBlclBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJSZWFkeS5lbWl0KCk7XG4gICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRJbWFnZU1heFNpemVSZXRyaWVzKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSW1hZ2VNYXhTaXplUmVjdXJzaXZlbHkoKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzpyZXNpemUnKVxuICAgIG9uUmVzaXplKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJlc2l6ZUNyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICB0aGlzLnNldE1heFNpemUoKTtcbiAgICAgICAgdGhpcy5zZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpO1xuICAgIH1cblxuICAgIHJvdGF0ZUxlZnQoKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtQmFzZTY0KDgpO1xuICAgIH1cblxuICAgIHJvdGF0ZVJpZ2h0KCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUJhc2U2NCg2KTtcbiAgICB9XG5cbiAgICBmbGlwSG9yaXpvbnRhbCgpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1CYXNlNjQoMik7XG4gICAgfVxuXG4gICAgZmxpcFZlcnRpY2FsKCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUJhc2U2NCg0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyYW5zZm9ybUJhc2U2NChleGlmT3JpZW50YXRpb246IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbEJhc2U2NCkge1xuICAgICAgICAgICAgdHJhbnNmb3JtQmFzZTY0QmFzZWRPbkV4aWZSb3RhdGlvbih0aGlzLm9yaWdpbmFsQmFzZTY0LCBleGlmT3JpZW50YXRpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJvdGF0ZWRCYXNlNjQ6IHN0cmluZykgPT4gdGhpcy5sb2FkQmFzZTY0SW1hZ2Uocm90YXRlZEJhc2U2NCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVDcm9wcGVyUG9zaXRpb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMubWF4U2l6ZS53aWR0aCAhPT0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIHx8IHRoaXMubWF4U2l6ZS5oZWlnaHQgIT09IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IHRoaXMuY3JvcHBlci54MSAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCAvIHRoaXMubWF4U2l6ZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MiAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCAvIHRoaXMubWF4U2l6ZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IHRoaXMuY3JvcHBlci55MSAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQgLyB0aGlzLm1heFNpemUuaGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkyICogc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAvIHRoaXMubWF4U2l6ZS5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0Q3JvcHBlclBvc2l0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzb3VyY2VJbWFnZUVsZW1lbnQgPSB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmICghdGhpcy5tYWludGFpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbyA8IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBjb25zdCBjcm9wcGVySGVpZ2h0ID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IChzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gY3JvcHBlckhlaWdodCkgLyAyO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgY3JvcHBlckhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgY29uc3QgY3JvcHBlcldpZHRoID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAoc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC0gY3JvcHBlcldpZHRoKSAvIDI7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDEgKyBjcm9wcGVyV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kb0F1dG9Dcm9wKCk7XG4gICAgICAgIHRoaXMuaW1hZ2VWaXNpYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzdGFydE1vdmUoZXZlbnQ6IGFueSwgbW92ZVR5cGU6IHN0cmluZywgcG9zaXRpb246IHN0cmluZyB8IG51bGwgPSBudWxsKTogdm9pZCB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubW92ZVN0YXJ0ID0ge1xuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgdHlwZTogbW92ZVR5cGUsXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgICAgICAgICBjbGllbnRYOiB0aGlzLmdldENsaWVudFgoZXZlbnQpLFxuICAgICAgICAgICAgY2xpZW50WTogdGhpcy5nZXRDbGllbnRZKGV2ZW50KSxcbiAgICAgICAgICAgIC4uLnRoaXMuY3JvcHBlclxuICAgICAgICB9O1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50Om1vdXNlbW92ZScsIFsnJGV2ZW50J10pXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2htb3ZlJywgWyckZXZlbnQnXSlcbiAgICBtb3ZlSW1nKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LnR5cGUgPT09ICdtb3ZlJykge1xuICAgICAgICAgICAgICAgIHRoaXMubW92ZShldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0Nyb3BwZXJQb3NpdGlvbih0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3ZlU3RhcnQudHlwZSA9PT0gJ3Jlc2l6ZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZShldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0Nyb3BwZXJQb3NpdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0TWF4U2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLm1heFNpemUud2lkdGggPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgIHRoaXMubWF4U2l6ZS5oZWlnaHQgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB0aGlzLm1hcmdpbkxlZnQgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0U3R5bGUoJ2NhbGMoNTAlIC0gJyArIHRoaXMubWF4U2l6ZS53aWR0aCAvIDIgKyAncHgpJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxJbWFnZSAmJiB0aGlzLmNyb3BwZXJNaW5XaWR0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoID0gTWF0aC5tYXgoMjAsIHRoaXMuY3JvcHBlck1pbldpZHRoIC8gdGhpcy5vcmlnaW5hbEltYWdlLndpZHRoICogdGhpcy5tYXhTaXplLndpZHRoKTtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IHRoaXMubWFpbnRhaW5Bc3BlY3RSYXRpb1xuICAgICAgICAgICAgICAgID8gTWF0aC5tYXgoMjAsIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbylcbiAgICAgICAgICAgICAgICA6IDIwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGggPSAyMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IDIwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0Nyb3BwZXJQb3NpdGlvbihtYWludGFpblNpemUgPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLngxIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IG1haW50YWluU2l6ZSA/IHRoaXMuY3JvcHBlci54MSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNyb3BwZXIueTEgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gbWFpbnRhaW5TaXplID8gdGhpcy5jcm9wcGVyLnkxIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY3JvcHBlci54MiA+IHRoaXMubWF4U2l6ZS53aWR0aCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxIC09IG1haW50YWluU2l6ZSA/ICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgpIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMubWF4U2l6ZS53aWR0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLnkyID4gdGhpcy5tYXhTaXplLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxIC09IG1haW50YWluU2l6ZSA/ICh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0KSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLm1heFNpemUuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6bW91c2V1cCcpXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2hlbmQnKVxuICAgIG1vdmVTdG9wKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5tb3ZlU3RhcnQuYWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVTdGFydC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZG9BdXRvQ3JvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtb3ZlKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgZGlmZlggPSB0aGlzLmdldENsaWVudFgoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WDtcbiAgICAgICAgY29uc3QgZGlmZlkgPSB0aGlzLmdldENsaWVudFkoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WTtcblxuICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSB0aGlzLm1vdmVTdGFydC54MSArIGRpZmZYO1xuICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLm1vdmVTdGFydC55MSArIGRpZmZZO1xuICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLm1vdmVTdGFydC54MiArIGRpZmZYO1xuICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzaXplKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZGlmZlggPSB0aGlzLmdldENsaWVudFgoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WDtcbiAgICAgICAgY29uc3QgZGlmZlkgPSB0aGlzLmdldENsaWVudFkoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WTtcbiAgICAgICAgc3dpdGNoICh0aGlzLm1vdmVTdGFydC5wb3NpdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlksIHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlksIHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3ByaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlksIHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tcmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LngyICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LnkyICsgZGlmZlksIHRoaXMuY3JvcHBlci55MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5tYWludGFpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrQXNwZWN0UmF0aW8oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tBc3BlY3RSYXRpbygpOiB2b2lkIHtcbiAgICAgICAgbGV0IG92ZXJmbG93WCA9IDA7XG4gICAgICAgIGxldCBvdmVyZmxvd1kgPSAwO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5tb3ZlU3RhcnQucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5jcm9wcGVyLngxICsgKHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlci55MSkgKiB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MSArICh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXIueTEpICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci55MiAtIHRoaXMubWF4U2l6ZS5oZWlnaHQsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IChvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3BsZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLmNyb3BwZXIueTIgLSAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci54MSwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3ByaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gdGhpcy5jcm9wcGVyLnkyIC0gKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICBjYXNlICdib3R0b21yaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbWxlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMuY3JvcHBlci55MSArICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXIueDEpIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLngxLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZG9BdXRvQ3JvcCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuYXV0b0Nyb3ApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2FuVXNlQ3VzdG9tRGF0YSA6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGNhblVzZUN1c3RvbURhdGEoY2FuVXNlQ3VzdG9tIDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9jYW5Vc2VDdXN0b21EYXRhID0gY2FuVXNlQ3VzdG9tO1xuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGN1c3RvbUNyb3BwZXIoY3JvcHBlciA6IFJlY3QpIHtcblxuICAgICAgICBpZiAodGhpcy5fY2FuVXNlQ3VzdG9tRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyID0gY3JvcHBlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBASW5wdXQoKSBcbiAgICBzZXQgY3VzdG9tSW1hZ2VQb3NpdGlvbihpbWFnZVBvc2l0aW9uIDogUmVjdCkge1xuXG4gICAgICAgIGlmICghdGhpcy5fY2FuVXNlQ3VzdG9tRGF0YSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICh0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5vcmlnaW5hbEltYWdlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRDcm9wSW1hZ2UuZW1pdCgpO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbWFnZVBvc2l0aW9uLngyIC0gaW1hZ2VQb3NpdGlvbi54MTtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGltYWdlUG9zaXRpb24ueTIgLSBpbWFnZVBvc2l0aW9uLnkxO1xuXG4gICAgICAgICAgICBjb25zdCBjcm9wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAgICAgY29uc3QgY3R4ID0gY3JvcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VQb3NpdGlvbi54MSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VQb3NpdGlvbi55MSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0ge3dpZHRoLCBoZWlnaHQsIGltYWdlUG9zaXRpb24sIGNyb3BwZXJQb3NpdGlvbjogey4uLnRoaXMuY3JvcHBlcn19O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc2l6ZVJhdGlvID0gdGhpcy5nZXRSZXNpemVSYXRpbyh3aWR0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZVJhdGlvICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC53aWR0aCA9IE1hdGguZmxvb3Iod2lkdGggKiByZXNpemVSYXRpbyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5oZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAqIHJlc2l6ZVJhdGlvKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplQ2FudmFzKGNyb3BDYW52YXMsIG91dHB1dC53aWR0aCB8fCB3aWR0aCwgb3V0cHV0LmhlaWdodCB8fCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcFRvT3V0cHV0VHlwZSh0aGlzLm91dHB1dFR5cGUsIGNyb3BDYW52YXMsIG91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcm9wKG91dHB1dFR5cGU6IE91dHB1dFR5cGUgPSB0aGlzLm91dHB1dFR5cGUpOiBJbWFnZUNyb3BwZWRFdmVudCB8IFByb21pc2U8SW1hZ2VDcm9wcGVkRXZlbnQ+IHwgbnVsbCB7XG4gICAgICAgIGlmICh0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5vcmlnaW5hbEltYWdlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRDcm9wSW1hZ2UuZW1pdCgpO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VQb3NpdGlvbiA9IHRoaXMuZ2V0SW1hZ2VQb3NpdGlvbigpO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbWFnZVBvc2l0aW9uLngyIC0gaW1hZ2VQb3NpdGlvbi54MTtcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGltYWdlUG9zaXRpb24ueTIgLSBpbWFnZVBvc2l0aW9uLnkxO1xuXG4gICAgICAgICAgICBjb25zdCBjcm9wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAgICAgY29uc3QgY3R4ID0gY3JvcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VQb3NpdGlvbi54MSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VQb3NpdGlvbi55MSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0ge3dpZHRoLCBoZWlnaHQsIGltYWdlUG9zaXRpb24sIGNyb3BwZXJQb3NpdGlvbjogey4uLnRoaXMuY3JvcHBlcn19O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc2l6ZVJhdGlvID0gdGhpcy5nZXRSZXNpemVSYXRpbyh3aWR0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZVJhdGlvICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC53aWR0aCA9IE1hdGguZmxvb3Iod2lkdGggKiByZXNpemVSYXRpbyk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5oZWlnaHQgPSBNYXRoLmZsb29yKGhlaWdodCAqIHJlc2l6ZVJhdGlvKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzaXplQ2FudmFzKGNyb3BDYW52YXMsIG91dHB1dC53aWR0aCwgb3V0cHV0LmhlaWdodCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNyb3BUb091dHB1dFR5cGUob3V0cHV0VHlwZSwgY3JvcENhbnZhcywgb3V0cHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEltYWdlUG9zaXRpb24oKTogQ3JvcHBlclBvc2l0aW9uIHtcbiAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICBjb25zdCByYXRpbyA9IHRoaXMub3JpZ2luYWxTaXplLndpZHRoIC8gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDE6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLngxICogcmF0aW8pLFxuICAgICAgICAgICAgeTE6IE1hdGgucm91bmQodGhpcy5jcm9wcGVyLnkxICogcmF0aW8pLFxuICAgICAgICAgICAgeDI6IE1hdGgubWluKE1hdGgucm91bmQodGhpcy5jcm9wcGVyLngyICogcmF0aW8pLCB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCksXG4gICAgICAgICAgICB5MjogTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmNyb3BwZXIueTIgICogcmF0aW8pLCB0aGlzLm9yaWdpbmFsU2l6ZS5oZWlnaHQpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyb3BUb091dHB1dFR5cGUob3V0cHV0VHlwZTogT3V0cHV0VHlwZSwgY3JvcENhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIG91dHB1dDogSW1hZ2VDcm9wcGVkRXZlbnQpOiBJbWFnZUNyb3BwZWRFdmVudCB8IFByb21pc2U8SW1hZ2VDcm9wcGVkRXZlbnQ+IHtcbiAgICAgICAgc3dpdGNoIChvdXRwdXRUeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmaWxlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jcm9wVG9GaWxlKGNyb3BDYW52YXMpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQ6IEJsb2IgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQuZmlsZSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VDcm9wcGVkLmVtaXQob3V0cHV0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FzZSAnYm90aCc6XG4gICAgICAgICAgICAgICAgb3V0cHV0LmJhc2U2NCA9IHRoaXMuY3JvcFRvQmFzZTY0KGNyb3BDYW52YXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNyb3BUb0ZpbGUoY3JvcENhbnZhcylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdDogQmxvYiB8IG51bGwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5maWxlID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUNyb3BwZWQuZW1pdChvdXRwdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIG91dHB1dC5iYXNlNjQgPSB0aGlzLmNyb3BUb0Jhc2U2NChjcm9wQ2FudmFzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlQ3JvcHBlZC5lbWl0KG91dHB1dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JvcFRvQmFzZTY0KGNyb3BDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaW1hZ2VCYXNlNjQgPSBjcm9wQ2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvJyArIHRoaXMuZm9ybWF0LCB0aGlzLmdldFF1YWxpdHkoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VDcm9wcGVkQmFzZTY0LmVtaXQoaW1hZ2VCYXNlNjQpO1xuICAgICAgICByZXR1cm4gaW1hZ2VCYXNlNjQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcm9wVG9GaWxlKGNyb3BDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogUHJvbWlzZTxCbG9iIHwgbnVsbD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDYW52YXNCbG9iKGNyb3BDYW52YXMpXG4gICAgICAgICAgICAudGhlbigocmVzdWx0OiBCbG9iIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUNyb3BwZWRGaWxlLmVtaXQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2FudmFzQmxvYihjcm9wQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFByb21pc2U8QmxvYiB8IG51bGw+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjcm9wQ2FudmFzLnRvQmxvYihcbiAgICAgICAgICAgICAgICAocmVzdWx0OiBCbG9iIHwgbnVsbCkgPT4gdGhpcy56b25lLnJ1bigoKSA9PiByZXNvbHZlKHJlc3VsdCkpLFxuICAgICAgICAgICAgICAgICdpbWFnZS8nICsgdGhpcy5mb3JtYXQsXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRRdWFsaXR5KClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UXVhbGl0eSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgdGhpcy5pbWFnZVF1YWxpdHkgLyAxMDApKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlc2l6ZVJhdGlvKHdpZHRoOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVUb1dpZHRoID4gMCAmJiAoIXRoaXMub25seVNjYWxlRG93biB8fCB3aWR0aCA+IHRoaXMucmVzaXplVG9XaWR0aClcbiAgICAgICAgICAgID8gdGhpcy5yZXNpemVUb1dpZHRoIC8gd2lkdGhcbiAgICAgICAgICAgIDogMTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsaWVudFgoZXZlbnQ6IGFueSk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBldmVudC5jbGllbnRYIHx8IGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXSAmJiBldmVudC50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDbGllbnRZKGV2ZW50OiBhbnkpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gZXZlbnQuY2xpZW50WSB8fCBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0gJiYgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgSW1hZ2VDcm9wcGVyQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnQvaW1hZ2UtY3JvcHBlci5jb21wb25lbnQnO1xuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICAgQ29tbW9uTW9kdWxlXG4gICAgXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtcbiAgICAgICAgSW1hZ2VDcm9wcGVyQ29tcG9uZW50XG4gICAgXSxcbiAgICBleHBvcnRzOiBbXG4gICAgICAgIEltYWdlQ3JvcHBlckNvbXBvbmVudFxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VDcm9wcGVyTW9kdWxlIHt9XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLDhCQUFxQyxTQUFpQjtJQUNsRCxJQUFJOztRQUNBLElBQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRCxJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7WUFDbEIsT0FBTyxrQ0FBa0MsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDdEU7YUFBTTtZQUNILE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNyQztLQUNKO0lBQUMsT0FBTyxFQUFFLEVBQUU7UUFDVCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDN0I7Q0FDSjs7Ozs7O0FBRUQsNENBQW1ELFNBQWlCLEVBQUUsWUFBb0I7SUFDdEYsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNOztRQUMvQixJQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3hCLEdBQUcsQ0FBQyxNQUFNLEdBQUc7O1lBQ1QsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQzs7WUFDeEIsSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQzs7WUFDMUIsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7WUFDaEQsSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVwQyxJQUFJLEdBQUcsRUFBRTtnQkFDTCxJQUFJLENBQUMsR0FBRyxZQUFZLElBQUksWUFBWSxHQUFHLENBQUMsRUFBRTtvQkFDdEMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7b0JBQ3RCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2lCQUN6QjtxQkFBTTtvQkFDSCxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztvQkFDckIsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7aUJBQzFCO2dCQUNELGVBQWUsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDbEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDL0I7aUJBQU07Z0JBQ0gsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7YUFDbkM7U0FDSixDQUFDO1FBQ0YsR0FBRyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7S0FDdkIsQ0FBQyxDQUFDO0NBQ047Ozs7O0FBRUQseUJBQXlCLFdBQW1COztJQUN4QyxJQUFNLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzVELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxFQUFFO1FBQ3BDLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDYjs7SUFDRCxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDOztJQUMvQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDZixPQUFPLE1BQU0sR0FBRyxNQUFNLEVBQUU7UUFDcEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7O1FBQ3RELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLE1BQU0sSUFBSSxNQUFNLEVBQUU7WUFDbEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksVUFBVSxFQUFFO2dCQUNsRCxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ2I7O1lBRUQsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQztZQUM1RCxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztZQUM3QyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM1QyxNQUFNLElBQUksQ0FBQyxDQUFDO1lBQ1osS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFO29CQUNyRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQ3hEO2FBQ0o7U0FDSjthQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxLQUFLLE1BQU0sRUFBRTtZQUNsQyxNQUFNO1NBQ1Q7YUFDSTtZQUNELE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUMzQztLQUNKO0lBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUNiOzs7OztBQUVELDZCQUE2QixXQUFtQjtJQUM1QyxXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxFQUFFLENBQUMsQ0FBQzs7SUFDckUsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztJQUN2QyxJQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDOztJQUNoQyxJQUFNLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3pDO0lBQ0QsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDO0NBQ3ZCOzs7Ozs7OztBQUVELHlCQUF5QixHQUFRLEVBQUUsV0FBbUIsRUFBRSxLQUFhLEVBQUUsTUFBYztJQUNqRixRQUFRLFdBQVc7UUFDZixLQUFLLENBQUM7WUFDRixHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNO1FBQ1YsS0FBSyxDQUFDO1lBQ0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzQyxNQUFNO1FBQ1YsS0FBSyxDQUFDO1lBQ0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEMsTUFBTTtRQUNWLEtBQUssQ0FBQztZQUNGLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoQyxNQUFNO1FBQ1YsS0FBSyxDQUFDO1lBQ0YsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTTtRQUNWLEtBQUssQ0FBQztZQUNGLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDM0MsTUFBTTtRQUNWLEtBQUssQ0FBQztZQUNGLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFD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