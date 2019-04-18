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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWltYWdlLWNyb3BwZXIuanMubWFwIiwic291cmNlcyI6WyJuZzovL25neC1pbWFnZS1jcm9wcGVyL3NyYy91dGlscy9leGlmLnV0aWxzLnRzIiwibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci9zcmMvdXRpbHMvcmVzaXplLnV0aWxzLnRzIiwibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci9zcmMvY29tcG9uZW50L2ltYWdlLWNyb3BwZXIuY29tcG9uZW50LnRzIiwibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci9zcmMvaW1hZ2UtY3JvcHBlci5tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RXhpZk9yaWVudGF0aW9uKHNyY0Jhc2U2NDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBleGlmUm90YXRpb24gPSBnZXRFeGlmUm90YXRpb24oc3JjQmFzZTY0KTtcbiAgICAgICAgaWYgKGV4aWZSb3RhdGlvbiA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1CYXNlNjRCYXNlZE9uRXhpZlJvdGF0aW9uKHNyY0Jhc2U2NCwgZXhpZlJvdGF0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc3JjQmFzZTY0KTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChleCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtQmFzZTY0QmFzZWRPbkV4aWZSb3RhdGlvbihzcmNCYXNlNjQ6IHN0cmluZywgZXhpZlJvdGF0aW9uOiBudW1iZXIpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgIGlmICg0IDwgZXhpZlJvdGF0aW9uICYmIGV4aWZSb3RhdGlvbiA8IDkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybUNhbnZhcyhjdHgsIGV4aWZSb3RhdGlvbiwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoY2FudmFzLnRvRGF0YVVSTCgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignTm8gY29udGV4dCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaW1nLnNyYyA9IHNyY0Jhc2U2NDtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0RXhpZlJvdGF0aW9uKGltYWdlQmFzZTY0OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcoYmFzZTY0VG9BcnJheUJ1ZmZlcihpbWFnZUJhc2U2NCkpO1xuICAgIGlmICh2aWV3LmdldFVpbnQxNigwLCBmYWxzZSkgIT0gMHhGRkQ4KSB7XG4gICAgICAgIHJldHVybiAtMjtcbiAgICB9XG4gICAgY29uc3QgbGVuZ3RoID0gdmlldy5ieXRlTGVuZ3RoO1xuICAgIGxldCBvZmZzZXQgPSAyO1xuICAgIHdoaWxlIChvZmZzZXQgPCBsZW5ndGgpIHtcbiAgICAgICAgaWYgKHZpZXcuZ2V0VWludDE2KG9mZnNldCArIDIsIGZhbHNlKSA8PSA4KSByZXR1cm4gLTE7XG4gICAgICAgIGNvbnN0IG1hcmtlciA9IHZpZXcuZ2V0VWludDE2KG9mZnNldCwgZmFsc2UpO1xuICAgICAgICBvZmZzZXQgKz0gMjtcbiAgICAgICAgaWYgKG1hcmtlciA9PSAweEZGRTEpIHtcbiAgICAgICAgICAgIGlmICh2aWV3LmdldFVpbnQzMihvZmZzZXQgKz0gMiwgZmFsc2UpICE9IDB4NDU3ODY5NjYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGxpdHRsZSA9IHZpZXcuZ2V0VWludDE2KG9mZnNldCArPSA2LCBmYWxzZSkgPT0gMHg0OTQ5O1xuICAgICAgICAgICAgb2Zmc2V0ICs9IHZpZXcuZ2V0VWludDMyKG9mZnNldCArIDQsIGxpdHRsZSk7XG4gICAgICAgICAgICBjb25zdCB0YWdzID0gdmlldy5nZXRVaW50MTYob2Zmc2V0LCBsaXR0bGUpO1xuICAgICAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhZ3M7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh2aWV3LmdldFVpbnQxNihvZmZzZXQgKyAoaSAqIDEyKSwgbGl0dGxlKSA9PSAweDAxMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZpZXcuZ2V0VWludDE2KG9mZnNldCArIChpICogMTIpICsgOCwgbGl0dGxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoKG1hcmtlciAmIDB4RkYwMCkgIT0gMHhGRjAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9mZnNldCArPSB2aWV3LmdldFVpbnQxNihvZmZzZXQsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoaW1hZ2VCYXNlNjQ6IHN0cmluZykge1xuICAgIGltYWdlQmFzZTY0ID0gaW1hZ2VCYXNlNjQucmVwbGFjZSgvXmRhdGFcXDooW15cXDtdKylcXDtiYXNlNjQsL2dtaSwgJycpO1xuICAgIGNvbnN0IGJpbmFyeVN0cmluZyA9IGF0b2IoaW1hZ2VCYXNlNjQpO1xuICAgIGNvbnN0IGxlbiA9IGJpbmFyeVN0cmluZy5sZW5ndGg7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShsZW4pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtQ2FudmFzKGN0eDogYW55LCBvcmllbnRhdGlvbjogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIHN3aXRjaCAob3JpZW50YXRpb24pIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgY3R4LnRyYW5zZm9ybSgtMSwgMCwgMCwgMSwgd2lkdGgsIDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGN0eC50cmFuc2Zvcm0oLTEsIDAsIDAsIC0xLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBoZWlnaHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGN0eC50cmFuc2Zvcm0oMCwgMSwgMSwgMCwgMCwgMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgY3R4LnRyYW5zZm9ybSgwLCAxLCAtMSwgMCwgaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICBjdHgudHJhbnNmb3JtKDAsIC0xLCAtMSwgMCwgaGVpZ2h0LCB3aWR0aCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgY3R4LnRyYW5zZm9ybSgwLCAtMSwgMSwgMCwgMCwgd2lkdGgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuIiwiLypcbiAqIEhlcm1pdGUgcmVzaXplIC0gZmFzdCBpbWFnZSByZXNpemUvcmVzYW1wbGUgdXNpbmcgSGVybWl0ZSBmaWx0ZXIuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vdmlsaXVzbGUvSGVybWl0ZS1yZXNpemVcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzaXplQ2FudmFzKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCByZXNpemVDYW52YXMgPSB0cnVlKSB7XG5cbiAgICB0cnkge1xuXG4gICAgICAgIGNvbnN0IHdpZHRoX3NvdXJjZSA9IGNhbnZhcy53aWR0aCB8fCB3aWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0X3NvdXJjZSA9IGNhbnZhcy5oZWlnaHQgfHwgaGVpZ2h0O1xuICAgICAgICB3aWR0aCA9IE1hdGgucm91bmQod2lkdGgpO1xuICAgICAgICBoZWlnaHQgPSBNYXRoLnJvdW5kKGhlaWdodCk7XG4gICAgXG4gICAgICAgIGNvbnN0IHJhdGlvX3cgPSB3aWR0aF9zb3VyY2UgLyB3aWR0aDtcbiAgICAgICAgY29uc3QgcmF0aW9faCA9IGhlaWdodF9zb3VyY2UgLyBoZWlnaHQ7XG4gICAgICAgIGNvbnN0IHJhdGlvX3dfaGFsZiA9IE1hdGguY2VpbChyYXRpb193IC8gMik7XG4gICAgICAgIGNvbnN0IHJhdGlvX2hfaGFsZiA9IE1hdGguY2VpbChyYXRpb19oIC8gMik7XG4gICAgXG4gICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBjb25zdCBpbWcgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoX3NvdXJjZSwgaGVpZ2h0X3NvdXJjZSk7XG4gICAgICAgICAgICBjb25zdCBpbWcyID0gY3R4LmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBpbWcuZGF0YTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEyID0gaW1nMi5kYXRhO1xuICAgIFxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBoZWlnaHQ7IGorKykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB4MiA9IChpICsgaiAqIHdpZHRoKSAqIDQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlcl95ID0gaiAqIHJhdGlvX2g7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3ZWlnaHQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgd2VpZ2h0cyA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3ZWlnaHRzX2FscGhhID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGd4X3IgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ3hfZyA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBneF9iID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGd4X2EgPSAwO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4eF9zdGFydCA9IE1hdGguZmxvb3IoaSAqIHJhdGlvX3cpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB5eV9zdGFydCA9IE1hdGguZmxvb3IoaiAqIHJhdGlvX2gpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgeHhfc3RvcCA9IE1hdGguY2VpbCgoaSArIDEpICogcmF0aW9fdyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB5eV9zdG9wID0gTWF0aC5jZWlsKChqICsgMSkgKiByYXRpb19oKTtcbiAgICAgICAgICAgICAgICAgICAgeHhfc3RvcCA9IE1hdGgubWluKHh4X3N0b3AsIHdpZHRoX3NvdXJjZSk7XG4gICAgICAgICAgICAgICAgICAgIHl5X3N0b3AgPSBNYXRoLm1pbih5eV9zdG9wLCBoZWlnaHRfc291cmNlKTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgeXkgPSB5eV9zdGFydDsgeXkgPCB5eV9zdG9wOyB5eSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkeSA9IE1hdGguYWJzKGNlbnRlcl95IC0geXkpIC8gcmF0aW9faF9oYWxmO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2VudGVyX3ggPSBpICogcmF0aW9fdztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHcwID0gZHkgKiBkeTsgLy9wcmUtY2FsYyBwYXJ0IG9mIHdcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHh4ID0geHhfc3RhcnQ7IHh4IDwgeHhfc3RvcDsgeHgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGR4ID0gTWF0aC5hYnMoY2VudGVyX3ggLSB4eCkgLyByYXRpb193X2hhbGY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdyA9IE1hdGguc3FydCh3MCArIGR4ICogZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3ID49IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9waXhlbCB0b28gZmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2hlcm1pdGUgZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gMiAqIHcgKiB3ICogdyAtIDMgKiB3ICogdyArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zX3ggPSA0ICogKHh4ICsgeXkgKiB3aWR0aF9zb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYWxwaGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBneF9hICs9IHdlaWdodCAqIGRhdGFbcG9zX3ggKyAzXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHRzX2FscGhhICs9IHdlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbG9yc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhW3Bvc194ICsgM10gPCAyNTUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlaWdodCA9IHdlaWdodCAqIGRhdGFbcG9zX3ggKyAzXSAvIDI1MDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBneF9yICs9IHdlaWdodCAqIGRhdGFbcG9zX3hdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd4X2cgKz0gd2VpZ2h0ICogZGF0YVtwb3NfeCArIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd4X2IgKz0gd2VpZ2h0ICogZGF0YVtwb3NfeCArIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlaWdodHMgKz0gd2VpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRhdGEyW3gyXSA9IGd4X3IgLyB3ZWlnaHRzO1xuICAgICAgICAgICAgICAgICAgICBkYXRhMlt4MiArIDFdID0gZ3hfZyAvIHdlaWdodHM7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEyW3gyICsgMl0gPSBneF9iIC8gd2VpZ2h0cztcbiAgICAgICAgICAgICAgICAgICAgZGF0YTJbeDIgKyAzXSA9IGd4X2EgLyB3ZWlnaHRzX2FscGhhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY2xlYXIgYW5kIHJlc2l6ZSBjYW52YXNcbiAgICAgICAgICAgIGlmIChyZXNpemVDYW52YXMpIHtcbiAgICAgICAgICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aF9zb3VyY2UsIGhlaWdodF9zb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgLy9kcmF3XG4gICAgICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGltZzIsIDAsIDApO1xuICAgICAgICB9XG4gICAgfSBjYXRjaChlKSB7XG5cbiAgICB9XG59IiwiaW1wb3J0IHtcbiAgICBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSG9zdEJpbmRpbmcsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIE9uQ2hhbmdlcywgT3V0cHV0LFxuICAgIFNpbXBsZUNoYW5nZXMsIENoYW5nZURldGVjdG9yUmVmLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgTmdab25lLCBWaWV3Q2hpbGRcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVVcmwsIFNhZmVTdHlsZSB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHsgTW92ZVN0YXJ0LCBEaW1lbnNpb25zLCBDcm9wcGVyUG9zaXRpb24sIEltYWdlQ3JvcHBlZEV2ZW50IH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyByZXNldEV4aWZPcmllbnRhdGlvbiwgdHJhbnNmb3JtQmFzZTY0QmFzZWRPbkV4aWZSb3RhdGlvbiB9IGZyb20gJy4uL3V0aWxzL2V4aWYudXRpbHMnO1xuaW1wb3J0IHsgcmVzaXplQ2FudmFzIH0gZnJvbSAnLi4vdXRpbHMvcmVzaXplLnV0aWxzJztcblxuZXhwb3J0IHR5cGUgT3V0cHV0VHlwZSA9ICdiYXNlNjQnIHzDgsKgJ2ZpbGUnIHwgJ2JvdGgnO1xuXG5leHBvcnQgdHlwZSBSZWN0ID0ge3gxIDogbnVtYmVyLCB5MSA6IG51bWJlciwgeDIgOiBudW1iZXIsIHkyOiBudW1iZXJ9XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnaW1hZ2UtY3JvcHBlcicsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlLWNyb3BwZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogWycuL2ltYWdlLWNyb3BwZXIuY29tcG9uZW50LnNjc3MnXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBJbWFnZUNyb3BwZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAgIHByaXZhdGUgb3JpZ2luYWxJbWFnZTogYW55O1xuICAgIHByaXZhdGUgb3JpZ2luYWxCYXNlNjQ6IHN0cmluZztcbiAgICBwcml2YXRlIG1vdmVTdGFydDogTW92ZVN0YXJ0O1xuICAgIHByaXZhdGUgbWF4U2l6ZTogRGltZW5zaW9ucztcbiAgICBwcml2YXRlIG9yaWdpbmFsU2l6ZTogRGltZW5zaW9ucztcbiAgICBwcml2YXRlIHNldEltYWdlTWF4U2l6ZVJldHJpZXMgPSAwO1xuICAgIHByaXZhdGUgY3JvcHBlclNjYWxlZE1pbldpZHRoID0gMjA7XG4gICAgcHJpdmF0ZSBjcm9wcGVyU2NhbGVkTWluSGVpZ2h0ID0gMjA7XG5cbiAgICBzYWZlSW1nRGF0YVVybDogU2FmZVVybCB8IHN0cmluZztcbiAgICBtYXJnaW5MZWZ0OiBTYWZlU3R5bGUgfCBzdHJpbmcgPSAnMHB4JztcbiAgICBpbWFnZVZpc2libGUgPSBmYWxzZTtcblxuICAgIEBWaWV3Q2hpbGQoJ3NvdXJjZUltYWdlJykgc291cmNlSW1hZ2U6IEVsZW1lbnRSZWY7XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBpbWFnZUZpbGVDaGFuZ2VkKGZpbGU6IEZpbGUpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKGZpbGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgaW1hZ2VDaGFuZ2VkRXZlbnQoZXZlbnQ6IGFueSkge1xuICAgICAgICB0aGlzLmluaXRDcm9wcGVyKCk7XG4gICAgICAgIGlmIChldmVudCAmJiBldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0LmZpbGVzICYmIGV2ZW50LnRhcmdldC5maWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZpbGUoZXZlbnQudGFyZ2V0LmZpbGVzWzBdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGltYWdlQmFzZTY0KGltYWdlQmFzZTY0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgICAgICB0aGlzLmxvYWRCYXNlNjRJbWFnZShpbWFnZUJhc2U2NCk7XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgY3JvcFNldE9yaWdpbmFsU2l6ZShzaXplIDoge3dpZHRoOm51bWJlciwgaGVpZ2h0OiBudW1iZXJ9KSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxTaXplLndpZHRoID0gc2l6ZS53aWR0aDtcbiAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQ7XG4gICAgfVxuXG4gICAgQElucHV0KCkgZm9ybWF0OiAncG5nJyB8ICdqcGVnJyB8ICdibXAnIHwgJ3dlYnAnIHwgJ2ljbycgPSAncG5nJztcbiAgICBASW5wdXQoKSBvdXRwdXRUeXBlOiBPdXRwdXRUeXBlID0gJ2JvdGgnO1xuICAgIEBJbnB1dCgpIG1haW50YWluQXNwZWN0UmF0aW8gPSB0cnVlO1xuICAgIEBJbnB1dCgpIGFzcGVjdFJhdGlvID0gMTtcbiAgICBASW5wdXQoKSByZXNpemVUb1dpZHRoID0gMDtcbiAgICBASW5wdXQoKSBjcm9wcGVyTWluV2lkdGggPSAwO1xuICAgIEBJbnB1dCgpIHJvdW5kQ3JvcHBlciA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIG9ubHlTY2FsZURvd24gPSBmYWxzZTtcbiAgICBASW5wdXQoKSBpbWFnZVF1YWxpdHkgPSA5MjtcbiAgICBASW5wdXQoKSBhdXRvQ3JvcCA9IHRydWU7XG4gICAgQElucHV0KCkgY3JvcHBlcjogQ3JvcHBlclBvc2l0aW9uID0ge1xuICAgICAgICB4MTogLTEwMCxcbiAgICAgICAgeTE6IC0xMDAsXG4gICAgICAgIHgyOiAxMDAwMCxcbiAgICAgICAgeTI6IDEwMDAwXG4gICAgfTtcbiAgICBASG9zdEJpbmRpbmcoJ3N0eWxlLnRleHQtYWxpZ24nKVxuICAgIEBJbnB1dCgpIGFsaWduSW1hZ2U6ICdsZWZ0JyB8ICdjZW50ZXInID0gJ2NlbnRlcic7XG5cblxuICAgIEBPdXRwdXQoKSBzdGFydENyb3BJbWFnZSA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgICBAT3V0cHV0KCkgaW1hZ2VDcm9wcGVkID0gbmV3IEV2ZW50RW1pdHRlcjxJbWFnZUNyb3BwZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgaW1hZ2VDcm9wcGVkQmFzZTY0ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG4gICAgQE91dHB1dCgpIGltYWdlQ3JvcHBlZEZpbGUgPSBuZXcgRXZlbnRFbWl0dGVyPEJsb2I+KCk7XG4gICAgQE91dHB1dCgpIGltYWdlTG9hZGVkID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBjcm9wcGVyUmVhZHkgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gICAgQE91dHB1dCgpIGxvYWRJbWFnZUZhaWxlZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgc2FuaXRpemVyOiBEb21TYW5pdGl6ZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgIH1cblxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuY3JvcHBlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrQ3JvcHBlclBvc2l0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZG9BdXRvQ3JvcCgpO1xuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlcy5hc3BlY3RSYXRpbyAmJiB0aGlzLmltYWdlVmlzaWJsZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldENyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0Q3JvcHBlcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbWFnZVZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5zYWZlSW1nRGF0YVVybCA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZydcbiAgICAgICAgICAgICsgJ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBQzBsRVFWUVlWMk5nQUFJQUFBVSdcbiAgICAgICAgICAgICsgJ0FBYXJWeUZFQUFBQUFTVVZPUks1Q1lJST0nO1xuICAgICAgICB0aGlzLm1vdmVTdGFydCA9IHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiBudWxsLFxuICAgICAgICAgICAgcG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICB4MTogMCxcbiAgICAgICAgICAgIHkxOiAwLFxuICAgICAgICAgICAgeDI6IDAsXG4gICAgICAgICAgICB5MjogMCxcbiAgICAgICAgICAgIGNsaWVudFg6IDAsXG4gICAgICAgICAgICBjbGllbnRZOiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubWF4U2l6ZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3JpZ2luYWxTaXplID0ge1xuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gLTEwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gLTEwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gMTAwMDA7XG4gICAgICAgIHRoaXMuY3JvcHBlci55MiA9IDEwMDAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZEltYWdlRmlsZShmaWxlOiBGaWxlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVR5cGUgPSBmaWxlLnR5cGU7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1ZhbGlkSW1hZ2VUeXBlKGltYWdlVHlwZSkpIHtcbiAgICAgICAgICAgICAgICByZXNldEV4aWZPcmllbnRhdGlvbihldmVudC50YXJnZXQucmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0QmFzZTY0OiBzdHJpbmcpID0+IHRoaXMubG9hZEJhc2U2NEltYWdlKHJlc3VsdEJhc2U2NCkpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZpbGVSZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmFsaWRJbWFnZVR5cGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAvaW1hZ2VcXC8ocG5nfGpwZ3xqcGVnfGJtcHxnaWZ8dGlmZikvLnRlc3QodHlwZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2FkQmFzZTY0SW1hZ2UoaW1hZ2VCYXNlNjQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLm9yaWdpbmFsQmFzZTY0ID0gaW1hZ2VCYXNlNjQ7XG4gICAgICAgIHRoaXMuc2FmZUltZ0RhdGFVcmwgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwoaW1hZ2VCYXNlNjQpO1xuICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxTaXplLndpZHRoID0gdGhpcy5vcmlnaW5hbEltYWdlLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0ID0gdGhpcy5vcmlnaW5hbEltYWdlLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZS5zcmMgPSBpbWFnZUJhc2U2NDtcbiAgICB9XG5cbiAgICBpbWFnZUxvYWRlZEluVmlldygpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxJbWFnZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlTG9hZGVkLmVtaXQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0SW1hZ2VNYXhTaXplUmV0cmllcyA9IDA7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuY2hlY2tJbWFnZU1heFNpemVSZWN1cnNpdmVseSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tJbWFnZU1heFNpemVSZWN1cnNpdmVseSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0SW1hZ2VNYXhTaXplUmV0cmllcyA+IDQwKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zb3VyY2VJbWFnZSAmJiB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk7XG4gICAgICAgICAgICB0aGlzLnJlc2V0Q3JvcHBlclBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJSZWFkeS5lbWl0KCk7XG4gICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRJbWFnZU1heFNpemVSZXRyaWVzKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSW1hZ2VNYXhTaXplUmVjdXJzaXZlbHkoKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzpyZXNpemUnKVxuICAgIG9uUmVzaXplKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJlc2l6ZUNyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICB0aGlzLnNldE1heFNpemUoKTtcbiAgICAgICAgdGhpcy5zZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpO1xuICAgIH1cblxuICAgIHJvdGF0ZUxlZnQoKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtQmFzZTY0KDgpO1xuICAgIH1cblxuICAgIHJvdGF0ZVJpZ2h0KCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUJhc2U2NCg2KTtcbiAgICB9XG5cbiAgICBmbGlwSG9yaXpvbnRhbCgpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1CYXNlNjQoMik7XG4gICAgfVxuXG4gICAgZmxpcFZlcnRpY2FsKCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUJhc2U2NCg0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyYW5zZm9ybUJhc2U2NChleGlmT3JpZW50YXRpb246IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbEJhc2U2NCkge1xuICAgICAgICAgICAgdHJhbnNmb3JtQmFzZTY0QmFzZWRPbkV4aWZSb3RhdGlvbih0aGlzLm9yaWdpbmFsQmFzZTY0LCBleGlmT3JpZW50YXRpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJvdGF0ZWRCYXNlNjQ6IHN0cmluZykgPT4gdGhpcy5sb2FkQmFzZTY0SW1hZ2Uocm90YXRlZEJhc2U2NCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVDcm9wcGVyUG9zaXRpb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMubWF4U2l6ZS53aWR0aCAhPT0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIHx8IHRoaXMubWF4U2l6ZS5oZWlnaHQgIT09IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IHRoaXMuY3JvcHBlci54MSAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCAvIHRoaXMubWF4U2l6ZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MiAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCAvIHRoaXMubWF4U2l6ZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IHRoaXMuY3JvcHBlci55MSAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQgLyB0aGlzLm1heFNpemUuaGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkyICogc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAvIHRoaXMubWF4U2l6ZS5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0Q3JvcHBlclBvc2l0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzb3VyY2VJbWFnZUVsZW1lbnQgPSB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmICghdGhpcy5tYWludGFpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbyA8IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBjb25zdCBjcm9wcGVySGVpZ2h0ID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IChzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gY3JvcHBlckhlaWdodCkgLyAyO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgY3JvcHBlckhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgY29uc3QgY3JvcHBlcldpZHRoID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAoc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC0gY3JvcHBlcldpZHRoKSAvIDI7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDEgKyBjcm9wcGVyV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kb0F1dG9Dcm9wKCk7XG4gICAgICAgIHRoaXMuaW1hZ2VWaXNpYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzdGFydE1vdmUoZXZlbnQ6IGFueSwgbW92ZVR5cGU6IHN0cmluZywgcG9zaXRpb246IHN0cmluZyB8IG51bGwgPSBudWxsKTogdm9pZCB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubW92ZVN0YXJ0ID0ge1xuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgdHlwZTogbW92ZVR5cGUsXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgICAgICAgICBjbGllbnRYOiB0aGlzLmdldENsaWVudFgoZXZlbnQpLFxuICAgICAgICAgICAgY2xpZW50WTogdGhpcy5nZXRDbGllbnRZKGV2ZW50KSxcbiAgICAgICAgICAgIC4uLnRoaXMuY3JvcHBlclxuICAgICAgICB9O1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50Om1vdXNlbW92ZScsIFsnJGV2ZW50J10pXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2htb3ZlJywgWyckZXZlbnQnXSlcbiAgICBtb3ZlSW1nKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LnR5cGUgPT09ICdtb3ZlJykge1xuICAgICAgICAgICAgICAgIHRoaXMubW92ZShldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0Nyb3BwZXJQb3NpdGlvbih0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3ZlU3RhcnQudHlwZSA9PT0gJ3Jlc2l6ZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZShldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0Nyb3BwZXJQb3NpdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0TWF4U2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLm1heFNpemUud2lkdGggPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgIHRoaXMubWF4U2l6ZS5oZWlnaHQgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB0aGlzLm1hcmdpbkxlZnQgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0U3R5bGUoJ2NhbGMoNTAlIC0gJyArIHRoaXMubWF4U2l6ZS53aWR0aCAvIDIgKyAncHgpJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxJbWFnZSAmJiB0aGlzLmNyb3BwZXJNaW5XaWR0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoID0gTWF0aC5tYXgoMjAsIHRoaXMuY3JvcHBlck1pbldpZHRoIC8gdGhpcy5vcmlnaW5hbEltYWdlLndpZHRoICogdGhpcy5tYXhTaXplLndpZHRoKTtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IHRoaXMubWFpbnRhaW5Bc3BlY3RSYXRpb1xuICAgICAgICAgICAgICAgID8gTWF0aC5tYXgoMjAsIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbylcbiAgICAgICAgICAgICAgICA6IDIwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGggPSAyMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IDIwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0Nyb3BwZXJQb3NpdGlvbihtYWludGFpblNpemUgPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLngxIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IG1haW50YWluU2l6ZSA/IHRoaXMuY3JvcHBlci54MSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNyb3BwZXIueTEgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gbWFpbnRhaW5TaXplID8gdGhpcy5jcm9wcGVyLnkxIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY3JvcHBlci54MiA+IHRoaXMubWF4U2l6ZS53aWR0aCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxIC09IG1haW50YWluU2l6ZSA/ICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgpIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMubWF4U2l6ZS53aWR0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLnkyID4gdGhpcy5tYXhTaXplLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxIC09IG1haW50YWluU2l6ZSA/ICh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0KSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLm1heFNpemUuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6bW91c2V1cCcpXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2hlbmQnKVxuICAgIG1vdmVTdG9wKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5tb3ZlU3RhcnQuYWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVTdGFydC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZG9BdXRvQ3JvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtb3ZlKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgZGlmZlggPSB0aGlzLmdldENsaWVudFgoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WDtcbiAgICAgICAgY29uc3QgZGlmZlkgPSB0aGlzLmdldENsaWVudFkoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WTtcblxuICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSB0aGlzLm1vdmVTdGFydC54MSArIGRpZmZYO1xuICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLm1vdmVTdGFydC55MSArIGRpZmZZO1xuICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLm1vdmVTdGFydC54MiArIGRpZmZYO1xuICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzaXplKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZGlmZlggPSB0aGlzLmdldENsaWVudFgoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WDtcbiAgICAgICAgY29uc3QgZGlmZlkgPSB0aGlzLmdldENsaWVudFkoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WTtcbiAgICAgICAgc3dpdGNoICh0aGlzLm1vdmVTdGFydC5wb3NpdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlksIHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlksIHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3ByaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlksIHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tcmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LngyICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LnkyICsgZGlmZlksIHRoaXMuY3JvcHBlci55MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5tYWludGFpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrQXNwZWN0UmF0aW8oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tBc3BlY3RSYXRpbygpOiB2b2lkIHtcbiAgICAgICAgbGV0IG92ZXJmbG93WCA9IDA7XG4gICAgICAgIGxldCBvdmVyZmxvd1kgPSAwO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5tb3ZlU3RhcnQucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5jcm9wcGVyLngxICsgKHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlci55MSkgKiB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MSArICh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXIueTEpICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci55MiAtIHRoaXMubWF4U2l6ZS5oZWlnaHQsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IChvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3BsZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLmNyb3BwZXIueTIgLSAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci54MSwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3ByaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gdGhpcy5jcm9wcGVyLnkyIC0gKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICBjYXNlICdib3R0b21yaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbWxlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMuY3JvcHBlci55MSArICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXIueDEpIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLngxLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZG9BdXRvQ3JvcCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuYXV0b0Nyb3ApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2FuVXNlQ3VzdG9tRGF0YSA6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGNhblVzZUN1c3RvbURhdGEoY2FuVXNlQ3VzdG9tIDogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9jYW5Vc2VDdXN0b21EYXRhID0gY2FuVXNlQ3VzdG9tO1xuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGN1c3RvbUNyb3BwZXIoY3JvcHBlciA6IFJlY3QpIHtcblxuICAgICAgICBpZiAodGhpcy5fY2FuVXNlQ3VzdG9tRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZVZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyID0gY3JvcHBlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBASW5wdXQoKSBcbiAgICBzZXQgY3VzdG9tSW1hZ2VQb3NpdGlvbihpbWFnZVBvc2l0aW9uIDogUmVjdCkge1xuXG4gICAgICAgIGlmICghdGhpcy5fY2FuVXNlQ3VzdG9tRGF0YSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuaW1hZ2VWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudCAmJiB0aGlzLm9yaWdpbmFsSW1hZ2UgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdGFydENyb3BJbWFnZS5lbWl0KCk7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IGltYWdlUG9zaXRpb24ueDIgLSBpbWFnZVBvc2l0aW9uLngxO1xuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gaW1hZ2VQb3NpdGlvbi55MiAtIGltYWdlUG9zaXRpb24ueTE7XG5cbiAgICAgICAgICAgIGNvbnN0IGNyb3BDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgICAgIGNyb3BDYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIGNyb3BDYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgICAgICBjb25zdCBjdHggPSBjcm9wQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVBvc2l0aW9uLngxLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVBvc2l0aW9uLnkxLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvdXRwdXQgPSB7d2lkdGgsIGhlaWdodCwgaW1hZ2VQb3NpdGlvbiwgY3JvcHBlclBvc2l0aW9uOiB7Li4udGhpcy5jcm9wcGVyfX07XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzaXplUmF0aW8gPSB0aGlzLmdldFJlc2l6ZVJhdGlvKHdpZHRoKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzaXplUmF0aW8gIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LndpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAqIHJlc2l6ZVJhdGlvKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmhlaWdodCA9IE1hdGguZmxvb3IoaGVpZ2h0ICogcmVzaXplUmF0aW8pO1xuICAgICAgICAgICAgICAgICAgICByZXNpemVDYW52YXMoY3JvcENhbnZhcywgb3V0cHV0LndpZHRoIHx8IHdpZHRoLCBvdXRwdXQuaGVpZ2h0IHx8IGhlaWdodCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wVG9PdXRwdXRUeXBlKHRoaXMub3V0cHV0VHlwZSwgY3JvcENhbnZhcywgb3V0cHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyb3Aob3V0cHV0VHlwZTogT3V0cHV0VHlwZSA9IHRoaXMub3V0cHV0VHlwZSk6IEltYWdlQ3JvcHBlZEV2ZW50IHwgUHJvbWlzZTxJbWFnZUNyb3BwZWRFdmVudD4gfCBudWxsIHtcbiAgICAgICAgaWYgKHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudCAmJiB0aGlzLm9yaWdpbmFsSW1hZ2UgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdGFydENyb3BJbWFnZS5lbWl0KCk7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVBvc2l0aW9uID0gdGhpcy5nZXRJbWFnZVBvc2l0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IGltYWdlUG9zaXRpb24ueDIgLSBpbWFnZVBvc2l0aW9uLngxO1xuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gaW1hZ2VQb3NpdGlvbi55MiAtIGltYWdlUG9zaXRpb24ueTE7XG5cbiAgICAgICAgICAgIGNvbnN0IGNyb3BDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgICAgIGNyb3BDYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgIGNyb3BDYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgICAgICBjb25zdCBjdHggPSBjcm9wQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVBvc2l0aW9uLngxLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVBvc2l0aW9uLnkxLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvdXRwdXQgPSB7d2lkdGgsIGhlaWdodCwgaW1hZ2VQb3NpdGlvbiwgY3JvcHBlclBvc2l0aW9uOiB7Li4udGhpcy5jcm9wcGVyfX07XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzaXplUmF0aW8gPSB0aGlzLmdldFJlc2l6ZVJhdGlvKHdpZHRoKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzaXplUmF0aW8gIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LndpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAqIHJlc2l6ZVJhdGlvKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmhlaWdodCA9IE1hdGguZmxvb3IoaGVpZ2h0ICogcmVzaXplUmF0aW8pO1xuICAgICAgICAgICAgICAgICAgICByZXNpemVDYW52YXMoY3JvcENhbnZhcywgb3V0cHV0LndpZHRoLCBvdXRwdXQuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JvcFRvT3V0cHV0VHlwZShvdXRwdXRUeXBlLCBjcm9wQ2FudmFzLCBvdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SW1hZ2VQb3NpdGlvbigpOiBDcm9wcGVyUG9zaXRpb24ge1xuICAgICAgICBjb25zdCBzb3VyY2VJbWFnZUVsZW1lbnQgPSB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHJhdGlvID0gdGhpcy5vcmlnaW5hbFNpemUud2lkdGggLyBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4MTogTWF0aC5yb3VuZCh0aGlzLmNyb3BwZXIueDEgKiByYXRpbyksXG4gICAgICAgICAgICB5MTogTWF0aC5yb3VuZCh0aGlzLmNyb3BwZXIueTEgKiByYXRpbyksXG4gICAgICAgICAgICB4MjogTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmNyb3BwZXIueDIgKiByYXRpbyksIHRoaXMub3JpZ2luYWxTaXplLndpZHRoKSxcbiAgICAgICAgICAgIHkyOiBNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci55MiAgKiByYXRpbyksIHRoaXMub3JpZ2luYWxTaXplLmhlaWdodClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JvcFRvT3V0cHV0VHlwZShvdXRwdXRUeXBlOiBPdXRwdXRUeXBlLCBjcm9wQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgb3V0cHV0OiBJbWFnZUNyb3BwZWRFdmVudCk6IEltYWdlQ3JvcHBlZEV2ZW50IHwgUHJvbWlzZTxJbWFnZUNyb3BwZWRFdmVudD4ge1xuICAgICAgICBzd2l0Y2ggKG91dHB1dFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZpbGUnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNyb3BUb0ZpbGUoY3JvcENhbnZhcylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdDogQmxvYiB8IG51bGwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5maWxlID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUNyb3BwZWQuZW1pdChvdXRwdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXNlICdib3RoJzpcbiAgICAgICAgICAgICAgICBvdXRwdXQuYmFzZTY0ID0gdGhpcy5jcm9wVG9CYXNlNjQoY3JvcENhbnZhcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JvcFRvRmlsZShjcm9wQ2FudmFzKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0OiBCbG9iIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmZpbGUgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlQ3JvcHBlZC5lbWl0KG91dHB1dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb3V0cHV0LmJhc2U2NCA9IHRoaXMuY3JvcFRvQmFzZTY0KGNyb3BDYW52YXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VDcm9wcGVkLmVtaXQob3V0cHV0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcm9wVG9CYXNlNjQoY3JvcENhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBpbWFnZUJhc2U2NCA9IGNyb3BDYW52YXMudG9EYXRhVVJMKCdpbWFnZS8nICsgdGhpcy5mb3JtYXQsIHRoaXMuZ2V0UXVhbGl0eSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZUNyb3BwZWRCYXNlNjQuZW1pdChpbWFnZUJhc2U2NCk7XG4gICAgICAgIHJldHVybiBpbWFnZUJhc2U2NDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyb3BUb0ZpbGUoY3JvcENhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBQcm9taXNlPEJsb2IgfCBudWxsPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENhbnZhc0Jsb2IoY3JvcENhbnZhcylcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHQ6IEJsb2IgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlQ3JvcHBlZEZpbGUuZW1pdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDYW52YXNCbG9iKGNyb3BDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogUHJvbWlzZTxCbG9iIHwgbnVsbD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNyb3BDYW52YXMudG9CbG9iKFxuICAgICAgICAgICAgICAgIChyZXN1bHQ6IEJsb2IgfCBudWxsKSA9PiB0aGlzLnpvbmUucnVuKCgpID0+IHJlc29sdmUocmVzdWx0KSksXG4gICAgICAgICAgICAgICAgJ2ltYWdlLycgKyB0aGlzLmZvcm1hdCxcbiAgICAgICAgICAgICAgICB0aGlzLmdldFF1YWxpdHkoKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRRdWFsaXR5KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCB0aGlzLmltYWdlUXVhbGl0eSAvIDEwMCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UmVzaXplUmF0aW8od2lkdGg6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRvV2lkdGggPiAwICYmICghdGhpcy5vbmx5U2NhbGVEb3duIHx8IHdpZHRoID4gdGhpcy5yZXNpemVUb1dpZHRoKVxuICAgICAgICAgICAgPyB0aGlzLnJlc2l6ZVRvV2lkdGggLyB3aWR0aFxuICAgICAgICAgICAgOiAxO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2xpZW50WChldmVudDogYW55KTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50LmNsaWVudFggfHwgZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdICYmIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENsaWVudFkoZXZlbnQ6IGFueSk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBldmVudC5jbGllbnRZIHx8IGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXSAmJiBldmVudC50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBJbWFnZUNyb3BwZXJDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudC9pbWFnZS1jcm9wcGVyLmNvbXBvbmVudCc7XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW1xuICAgICAgICBDb21tb25Nb2R1bGVcbiAgICBdLFxuICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICBJbWFnZUNyb3BwZXJDb21wb25lbnRcbiAgICBdLFxuICAgIGV4cG9ydHM6IFtcbiAgICAgICAgSW1hZ2VDcm9wcGVyQ29tcG9uZW50XG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBJbWFnZUNyb3BwZXJNb2R1bGUge31cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsOEJBQXFDLFNBQWlCO0lBQ2xELElBQUk7O1FBQ0EsSUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hELElBQUksWUFBWSxHQUFHLENBQUMsRUFBRTtZQUNsQixPQUFPLGtDQUFrQyxDQUFDLFNBQVMs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QUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDckcsTUFBTTtZQUNWLEtBQUssT0FBTztnQkFDUixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDcEcsTUFBTTtZQUNWLEtBQUssYUFBYTtnQkFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDcEcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3JHLE1BQU07WUFDVixLQUFLLFFBQVE7Z0JBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3JHLE1BQU07WUFDVixLQUFLLFlBQVk7Z0JBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLHFC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