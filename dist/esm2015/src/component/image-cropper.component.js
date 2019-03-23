/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { resetExifOrientation, transformBase64BasedOnExifRotation } from '../utils/exif.utils';
import { resizeCanvas } from '../utils/resize.utils';
/** @typedef {?} */
var OutputType;
export { OutputType };
export class ImageCropperComponent {
    /**
     * @param {?} sanitizer
     * @param {?} cd
     * @param {?} zone
     */
    constructor(sanitizer, cd, zone) {
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
        this.initCropper();
    }
    /**
     * @param {?} file
     * @return {?}
     */
    set imageFileChanged(file) {
        this.initCropper();
        if (file) {
            this.loadImageFile(file);
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    set imageChangedEvent(event) {
        this.initCropper();
        if (event && event.target && event.target.files && event.target.files.length > 0) {
            this.loadImageFile(event.target.files[0]);
        }
    }
    /**
     * @param {?} imageBase64
     * @return {?}
     */
    set imageBase64(imageBase64) {
        this.initCropper();
        this.loadBase64Image(imageBase64);
    }
    /**
     * @param {?} size
     * @return {?}
     */
    set cropSetOriginalSize(size) {
        setInterval(_ => {
            this.originalSize.width = size.width;
            this.originalSize.height = size.height;
        }, 500);
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
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
    }
    /**
     * @return {?}
     */
    initCropper() {
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
    }
    /**
     * @param {?} file
     * @return {?}
     */
    loadImageFile(file) {
        /** @type {?} */
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            /** @type {?} */
            const imageType = file.type;
            if (this.isValidImageType(imageType)) {
                resetExifOrientation(event.target.result)
                    .then((resultBase64) => this.loadBase64Image(resultBase64))
                    .catch(() => this.loadImageFailed.emit());
            }
            else {
                this.loadImageFailed.emit();
            }
        };
        fileReader.readAsDataURL(file);
    }
    /**
     * @param {?} type
     * @return {?}
     */
    isValidImageType(type) {
        return /image\/(png|jpg|jpeg|bmp|gif|tiff)/.test(type);
    }
    /**
     * @param {?} imageBase64
     * @return {?}
     */
    loadBase64Image(imageBase64) {
        this.originalBase64 = imageBase64;
        this.safeImgDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(imageBase64);
        this.originalImage = new Image();
        this.originalImage.onload = () => {
            this.originalSize.width = this.originalImage.width;
            this.originalSize.height = this.originalImage.height;
            this.cd.markForCheck();
        };
        this.originalImage.src = imageBase64;
    }
    /**
     * @return {?}
     */
    imageLoadedInView() {
        if (this.originalImage != null) {
            this.imageLoaded.emit();
            this.setImageMaxSizeRetries = 0;
            setTimeout(() => this.checkImageMaxSizeRecursively());
        }
    }
    /**
     * @return {?}
     */
    checkImageMaxSizeRecursively() {
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
            setTimeout(() => {
                this.checkImageMaxSizeRecursively();
            }, 50);
        }
    }
    /**
     * @return {?}
     */
    onResize() {
        this.resizeCropperPosition();
        this.setMaxSize();
        this.setCropperScaledMinSize();
    }
    /**
     * @return {?}
     */
    rotateLeft() {
        this.transformBase64(8);
    }
    /**
     * @return {?}
     */
    rotateRight() {
        this.transformBase64(6);
    }
    /**
     * @return {?}
     */
    flipHorizontal() {
        this.transformBase64(2);
    }
    /**
     * @return {?}
     */
    flipVertical() {
        this.transformBase64(4);
    }
    /**
     * @param {?} exifOrientation
     * @return {?}
     */
    transformBase64(exifOrientation) {
        if (this.originalBase64) {
            transformBase64BasedOnExifRotation(this.originalBase64, exifOrientation)
                .then((rotatedBase64) => this.loadBase64Image(rotatedBase64));
        }
    }
    /**
     * @return {?}
     */
    resizeCropperPosition() {
        /** @type {?} */
        const sourceImageElement = this.sourceImage.nativeElement;
        if (this.maxSize.width !== sourceImageElement.offsetWidth || this.maxSize.height !== sourceImageElement.offsetHeight) {
            this.cropper.x1 = this.cropper.x1 * sourceImageElement.offsetWidth / this.maxSize.width;
            this.cropper.x2 = this.cropper.x2 * sourceImageElement.offsetWidth / this.maxSize.width;
            this.cropper.y1 = this.cropper.y1 * sourceImageElement.offsetHeight / this.maxSize.height;
            this.cropper.y2 = this.cropper.y2 * sourceImageElement.offsetHeight / this.maxSize.height;
        }
    }
    /**
     * @return {?}
     */
    resetCropperPosition() {
        /** @type {?} */
        const sourceImageElement = this.sourceImage.nativeElement;
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
            const cropperHeight = sourceImageElement.offsetWidth / this.aspectRatio;
            this.cropper.y1 = (sourceImageElement.offsetHeight - cropperHeight) / 2;
            this.cropper.y2 = this.cropper.y1 + cropperHeight;
        }
        else {
            this.cropper.y1 = 0;
            this.cropper.y2 = sourceImageElement.offsetHeight;
            /** @type {?} */
            const cropperWidth = sourceImageElement.offsetHeight * this.aspectRatio;
            this.cropper.x1 = (sourceImageElement.offsetWidth - cropperWidth) / 2;
            this.cropper.x2 = this.cropper.x1 + cropperWidth;
        }
        this.doAutoCrop();
        this.imageVisible = true;
    }
    /**
     * @param {?} event
     * @param {?} moveType
     * @param {?=} position
     * @return {?}
     */
    startMove(event, moveType, position = null) {
        event.preventDefault();
        this.moveStart = Object.assign({ active: true, type: moveType, position: position, clientX: this.getClientX(event), clientY: this.getClientY(event) }, this.cropper);
    }
    /**
     * @param {?} event
     * @return {?}
     */
    moveImg(event) {
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
    }
    /**
     * @return {?}
     */
    setMaxSize() {
        /** @type {?} */
        const sourceImageElement = this.sourceImage.nativeElement;
        this.maxSize.width = sourceImageElement.offsetWidth;
        this.maxSize.height = sourceImageElement.offsetHeight;
        this.marginLeft = this.sanitizer.bypassSecurityTrustStyle('calc(50% - ' + this.maxSize.width / 2 + 'px)');
    }
    /**
     * @return {?}
     */
    setCropperScaledMinSize() {
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
    }
    /**
     * @param {?=} maintainSize
     * @return {?}
     */
    checkCropperPosition(maintainSize = false) {
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
    }
    /**
     * @return {?}
     */
    moveStop() {
        if (this.moveStart.active) {
            this.moveStart.active = false;
            this.doAutoCrop();
        }
    }
    /**
     * @param {?} event
     * @return {?}
     */
    move(event) {
        /** @type {?} */
        const diffX = this.getClientX(event) - this.moveStart.clientX;
        /** @type {?} */
        const diffY = this.getClientY(event) - this.moveStart.clientY;
        this.cropper.x1 = this.moveStart.x1 + diffX;
        this.cropper.y1 = this.moveStart.y1 + diffY;
        this.cropper.x2 = this.moveStart.x2 + diffX;
        this.cropper.y2 = this.moveStart.y2 + diffY;
    }
    /**
     * @param {?} event
     * @return {?}
     */
    resize(event) {
        /** @type {?} */
        const diffX = this.getClientX(event) - this.moveStart.clientX;
        /** @type {?} */
        const diffY = this.getClientY(event) - this.moveStart.clientY;
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
    }
    /**
     * @return {?}
     */
    checkAspectRatio() {
        /** @type {?} */
        let overflowX = 0;
        /** @type {?} */
        let overflowY = 0;
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
    }
    /**
     * @return {?}
     */
    doAutoCrop() {
        if (this.autoCrop) {
            this.crop();
        }
    }
    /**
     * @param {?=} outputType
     * @return {?}
     */
    crop(outputType = this.outputType) {
        if (this.sourceImage.nativeElement && this.originalImage != null) {
            this.startCropImage.emit();
            /** @type {?} */
            const imagePosition = this.getImagePosition();
            /** @type {?} */
            const width = imagePosition.x2 - imagePosition.x1;
            /** @type {?} */
            const height = imagePosition.y2 - imagePosition.y1;
            /** @type {?} */
            const cropCanvas = /** @type {?} */ (document.createElement('canvas'));
            cropCanvas.width = width;
            cropCanvas.height = height;
            /** @type {?} */
            const ctx = cropCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(this.originalImage, imagePosition.x1, imagePosition.y1, width, height, 0, 0, width, height);
                /** @type {?} */
                const output = { width, height, imagePosition, cropperPosition: Object.assign({}, this.cropper) };
                /** @type {?} */
                const resizeRatio = this.getResizeRatio(width);
                if (resizeRatio !== 1) {
                    output.width = Math.floor(width * resizeRatio);
                    output.height = Math.floor(height * resizeRatio);
                    resizeCanvas(cropCanvas, output.width, output.height);
                }
                return this.cropToOutputType(outputType, cropCanvas, output);
            }
        }
        return null;
    }
    /**
     * @return {?}
     */
    getImagePosition() {
        /** @type {?} */
        const sourceImageElement = this.sourceImage.nativeElement;
        /** @type {?} */
        const ratio = this.originalSize.width / sourceImageElement.offsetWidth;
        return {
            x1: Math.round(this.cropper.x1 * ratio),
            y1: Math.round(this.cropper.y1 * ratio),
            x2: Math.min(Math.round(this.cropper.x2 * ratio), this.originalSize.width),
            y2: Math.min(Math.round(this.cropper.y2 * ratio), this.originalSize.height)
        };
    }
    /**
     * @param {?} outputType
     * @param {?} cropCanvas
     * @param {?} output
     * @return {?}
     */
    cropToOutputType(outputType, cropCanvas, output) {
        switch (outputType) {
            case 'file':
                return this.cropToFile(cropCanvas)
                    .then((result) => {
                    output.file = result;
                    this.imageCropped.emit(output);
                    return output;
                });
            case 'both':
                output.base64 = this.cropToBase64(cropCanvas);
                return this.cropToFile(cropCanvas)
                    .then((result) => {
                    output.file = result;
                    this.imageCropped.emit(output);
                    return output;
                });
            default:
                output.base64 = this.cropToBase64(cropCanvas);
                this.imageCropped.emit(output);
                return output;
        }
    }
    /**
     * @param {?} cropCanvas
     * @return {?}
     */
    cropToBase64(cropCanvas) {
        /** @type {?} */
        const imageBase64 = cropCanvas.toDataURL('image/' + this.format, this.getQuality());
        this.imageCroppedBase64.emit(imageBase64);
        return imageBase64;
    }
    /**
     * @param {?} cropCanvas
     * @return {?}
     */
    cropToFile(cropCanvas) {
        return this.getCanvasBlob(cropCanvas)
            .then((result) => {
            if (result) {
                this.imageCroppedFile.emit(result);
            }
            return result;
        });
    }
    /**
     * @param {?} cropCanvas
     * @return {?}
     */
    getCanvasBlob(cropCanvas) {
        return new Promise((resolve) => {
            cropCanvas.toBlob((result) => this.zone.run(() => resolve(result)), 'image/' + this.format, this.getQuality());
        });
    }
    /**
     * @return {?}
     */
    getQuality() {
        return Math.min(1, Math.max(0, this.imageQuality / 100));
    }
    /**
     * @param {?} width
     * @return {?}
     */
    getResizeRatio(width) {
        return this.resizeToWidth > 0 && (!this.onlyScaleDown || width > this.resizeToWidth)
            ? this.resizeToWidth / width
            : 1;
    }
    /**
     * @param {?} event
     * @return {?}
     */
    getClientX(event) {
        return event.clientX || event.touches && event.touches[0] && event.touches[0].clientX;
    }
    /**
     * @param {?} event
     * @return {?}
     */
    getClientY(event) {
        return event.clientY || event.touches && event.touches[0] && event.touches[0].clientY;
    }
}
ImageCropperComponent.decorators = [
    { type: Component, args: [{
                selector: 'image-cropper',
                template: "<div>\n    <img\n        #sourceImage\n        class=\"source-image\"\n        [src]=\"safeImgDataUrl\"\n        [style.visibility]=\"'hidden'\"\n        [style.width]=\"'100%'\"\n        [style.height]=\"'100%'\"\n        (load)=\"imageLoadedInView()\"/>\n\n    <div class=\"cropper\"\n         *ngIf=\"imageVisible\"\n         [class.rounded]=\"roundCropper\"\n         [style.top.px]=\"cropper.y1\"\n         [style.left.px]=\"cropper.x1\"\n         [style.width.px]=\"cropper.x2 - cropper.x1\"\n         [style.height.px]=\"cropper.y2 - cropper.y1\"\n         [style.margin-left]=\"alignImage === 'center' ? marginLeft : null\"\n         [style.visibility]=\"'visible'\"\n    >\n        <div\n                (mousedown)=\"startMove($event, 'move')\"\n                (touchstart)=\"startMove($event, 'move')\"\n                class=\"move\"\n        >&nbsp;</div>\n        <span\n                class=\"resize topleft\"\n                (mousedown)=\"startMove($event, 'resize', 'topleft')\"\n                (touchstart)=\"startMove($event, 'resize', 'topleft')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize top\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize topright\"\n                (mousedown)=\"startMove($event, 'resize', 'topright')\"\n                (touchstart)=\"startMove($event, 'resize', 'topright')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize right\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize bottomright\"\n                (mousedown)=\"startMove($event, 'resize', 'bottomright')\"\n                (touchstart)=\"startMove($event, 'resize', 'bottomright')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize bottom\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize bottomleft\"\n                (mousedown)=\"startMove($event, 'resize', 'bottomleft')\"\n                (touchstart)=\"startMove($event, 'resize', 'bottomleft')\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize left\"\n        ><span class=\"square\"></span></span>\n        <span\n                class=\"resize-bar top\"\n                (mousedown)=\"startMove($event, 'resize', 'top')\"\n                (touchstart)=\"startMove($event, 'resize', 'top')\"\n        ></span>\n        <span\n                class=\"resize-bar right\"\n                (mousedown)=\"startMove($event, 'resize', 'right')\"\n                (touchstart)=\"startMove($event, 'resize', 'right')\"\n        ></span>\n        <span\n                class=\"resize-bar bottom\"\n                (mousedown)=\"startMove($event, 'resize', 'bottom')\"\n                (touchstart)=\"startMove($event, 'resize', 'bottom')\"\n        ></span>\n        <span\n                class=\"resize-bar left\"\n                (mousedown)=\"startMove($event, 'resize', 'left')\"\n                (touchstart)=\"startMove($event, 'resize', 'left')\"\n        ></span>\n    </div>\n</div>\n",
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: [":host{display:flex;position:relative;width:100%;max-width:100%;max-height:100%;overflow:hidden;padding:5px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host>div{position:relative;width:100%}:host>div img.source-image{max-width:100%;max-height:100%}:host .cropper{position:absolute;display:flex;color:#53535c;background:0 0;touch-action:none;outline:rgba(255,255,255,.3) solid 100vw}:host .cropper:after{position:absolute;content:'';top:0;bottom:0;left:0;right:0;pointer-events:none;border:1px dashed;opacity:.75;color:inherit;z-index:1}:host .cropper .move{width:100%;cursor:move;border:1px solid rgba(255,255,255,.5)}:host .cropper .resize{position:absolute;display:inline-block;line-height:6px;padding:8px;opacity:.85;z-index:1}:host .cropper .resize .square{display:inline-block;background:#53535c;width:6px;height:6px;border:1px solid rgba(255,255,255,.5);box-sizing:content-box}:host .cropper .resize.topleft{top:-12px;left:-12px;cursor:nwse-resize}:host .cropper .resize.top{top:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.topright{top:-12px;right:-12px;cursor:nesw-resize}:host .cropper .resize.right{top:calc(50% - 12px);right:-12px;cursor:ew-resize}:host .cropper .resize.bottomright{bottom:-12px;right:-12px;cursor:nwse-resize}:host .cropper .resize.bottom{bottom:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.bottomleft{bottom:-12px;left:-12px;cursor:nesw-resize}:host .cropper .resize.left{top:calc(50% - 12px);left:-12px;cursor:ew-resize}:host .cropper .resize-bar{position:absolute;z-index:1}:host .cropper .resize-bar.top{top:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.right{top:11px;right:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper .resize-bar.bottom{bottom:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.left{top:11px;left:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper.rounded{outline-color:transparent}:host .cropper.rounded:after{border-radius:100%;box-shadow:0 0 0 100vw rgba(255,255,255,.3)}@media (orientation:portrait){:host .cropper{outline-width:100vh}:host .cropper.rounded:after{box-shadow:0 0 0 100vh rgba(255,255,255,.3)}}:host .cropper.rounded .move{border-radius:100%}"]
            }] }
];
/** @nocollapse */
ImageCropperComponent.ctorParameters = () => [
    { type: DomSanitizer },
    { type: ChangeDetectorRef },
    { type: NgZone }
];
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
    moveStop: [{ type: HostListener, args: ['document:mouseup',] }, { type: HostListener, args: ['document:touchend',] }]
};
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
    ImageCropperComponent.prototype.sanitizer;
    /** @type {?} */
    ImageCropperComponent.prototype.cd;
    /** @type {?} */
    ImageCropperComponent.prototype.zone;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UtY3JvcHBlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZ3gtaW1hZ2UtY3JvcHBlci8iLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnQvaW1hZ2UtY3JvcHBlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBYSxNQUFNLEVBQ3pFLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQy9FLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxZQUFZLEVBQXNCLE1BQU0sMkJBQTJCLENBQUM7QUFFN0UsT0FBTyxFQUFFLG9CQUFvQixFQUFFLGtDQUFrQyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDL0YsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7O0FBVXJELE1BQU07Ozs7OztJQTBFRixZQUFvQixTQUF1QixFQUN2QixJQUNBO1FBRkEsY0FBUyxHQUFULFNBQVMsQ0FBYztRQUN2QixPQUFFLEdBQUYsRUFBRTtRQUNGLFNBQUksR0FBSixJQUFJO3NDQXRFUyxDQUFDO3FDQUNGLEVBQUU7c0NBQ0QsRUFBRTswQkFHRixLQUFLOzRCQUN2QixLQUFLO3NCQWtDdUMsS0FBSzswQkFDOUIsTUFBTTttQ0FDVCxJQUFJOzJCQUNaLENBQUM7NkJBQ0MsQ0FBQzsrQkFDQyxDQUFDOzRCQUNKLEtBQUs7NkJBQ0osS0FBSzs0QkFDTixFQUFFO3dCQUNOLElBQUk7dUJBQ1k7WUFDaEMsRUFBRSxFQUFFLENBQUMsR0FBRztZQUNSLEVBQUUsRUFBRSxDQUFDLEdBQUc7WUFDUixFQUFFLEVBQUUsS0FBSztZQUNULEVBQUUsRUFBRSxLQUFLO1NBQ1o7MEJBRXdDLFFBQVE7OEJBR3RCLElBQUksWUFBWSxFQUFROzRCQUMxQixJQUFJLFlBQVksRUFB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LENBQUMsRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDdkI7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDdkI7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztTQUN4QztRQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMs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QUFNOzhCQUNOLE1BQU07dUJBNEdOLFlBQVksU0FBQyxlQUFlO3NCQTRFNUIsWUFBWSxTQUFDLG9CQUFvQixFQUFFLENBQUMsUUFBUSxDQUFDLGNBQzdDLFlBQVksU0FBQyxvQkFBb0IsRUFBRSxDQUFDLFFBQVEsQ0FBQzt1QkFzRDdDLFlBQVksU0FBQyxrQkFBa0IsY0FDL0IsWUFBWSxTQUFDLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEhvc3RCaW5kaW5nLCBIb3N0TGlzdGVuZXIsIElucHV0LCBPbkNoYW5nZXMsIE91dHB1dCxcbiAgICBTaW1wbGVDaGFuZ2VzLCBDaGFuZ2VEZXRlY3RvclJlZiwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIE5nWm9uZSwgVmlld0NoaWxkXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyLCBTYWZlVXJsLCBTYWZlU3R5bGUgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcbmltcG9ydCB7IE1vdmVTdGFydCwgRGltZW5zaW9ucywgQ3JvcHBlclBvc2l0aW9uLCBJbWFnZUNyb3BwZWRFdmVudCB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgcmVzZXRFeGlmT3JpZW50YXRpb24sIHRyYW5zZm9ybUJhc2U2NEJhc2VkT25FeGlmUm90YXRpb24gfSBmcm9tICcuLi91dGlscy9leGlmLnV0aWxzJztcbmltcG9ydCB7IHJlc2l6ZUNhbnZhcyB9IGZyb20gJy4uL3V0aWxzL3Jlc2l6ZS51dGlscyc7XG5cbmV4cG9ydCB0eXBlIE91dHB1dFR5cGUgPSAnYmFzZTY0JyB8wqAnZmlsZScgfCAnYm90aCc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnaW1hZ2UtY3JvcHBlcicsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlLWNyb3BwZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogWycuL2ltYWdlLWNyb3BwZXIuY29tcG9uZW50LnNjc3MnXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxufSlcbmV4cG9ydCBjbGFzcyBJbWFnZUNyb3BwZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAgIHByaXZhdGUgb3JpZ2luYWxJbWFnZTogYW55O1xuICAgIHByaXZhdGUgb3JpZ2luYWxCYXNlNjQ6IHN0cmluZztcbiAgICBwcml2YXRlIG1vdmVTdGFydDogTW92ZVN0YXJ0O1xuICAgIHByaXZhdGUgbWF4U2l6ZTogRGltZW5zaW9ucztcbiAgICBwcml2YXRlIG9yaWdpbmFsU2l6ZTogRGltZW5zaW9ucztcbiAgICBwcml2YXRlIHNldEltYWdlTWF4U2l6ZVJldHJpZXMgPSAwO1xuICAgIHByaXZhdGUgY3JvcHBlclNjYWxlZE1pbldpZHRoID0gMjA7XG4gICAgcHJpdmF0ZSBjcm9wcGVyU2NhbGVkTWluSGVpZ2h0ID0gMjA7XG5cbiAgICBzYWZlSW1nRGF0YVVybDogU2FmZVVybCB8IHN0cmluZztcbiAgICBtYXJnaW5MZWZ0OiBTYWZlU3R5bGUgfCBzdHJpbmcgPSAnMHB4JztcbiAgICBpbWFnZVZpc2libGUgPSBmYWxzZTtcblxuICAgIEBWaWV3Q2hpbGQoJ3NvdXJjZUltYWdlJykgc291cmNlSW1hZ2U6IEVsZW1lbnRSZWY7XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBpbWFnZUZpbGVDaGFuZ2VkKGZpbGU6IEZpbGUpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2VGaWxlKGZpbGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgaW1hZ2VDaGFuZ2VkRXZlbnQoZXZlbnQ6IGFueSkge1xuICAgICAgICB0aGlzLmluaXRDcm9wcGVyKCk7XG4gICAgICAgIGlmIChldmVudCAmJiBldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0LmZpbGVzICYmIGV2ZW50LnRhcmdldC5maWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZpbGUoZXZlbnQudGFyZ2V0LmZpbGVzWzBdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpXG4gICAgc2V0IGltYWdlQmFzZTY0KGltYWdlQmFzZTY0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgICAgICB0aGlzLmxvYWRCYXNlNjRJbWFnZShpbWFnZUJhc2U2NCk7XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzZXQgY3JvcFNldE9yaWdpbmFsU2l6ZShzaXplIDoge3dpZHRoOm51bWJlciwgaGVpZ2h0OiBudW1iZXJ9KSB7XG4gICAgICAgIHNldEludGVydmFsKF8gPT4ge1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUud2lkdGggPSBzaXplLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQ7XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfVxuXG4gICAgQElucHV0KCkgZm9ybWF0OiAncG5nJyB8ICdqcGVnJyB8ICdibXAnIHwgJ3dlYnAnIHwgJ2ljbycgPSAncG5nJztcbiAgICBASW5wdXQoKSBvdXRwdXRUeXBlOiBPdXRwdXRUeXBlID0gJ2JvdGgnO1xuICAgIEBJbnB1dCgpIG1haW50YWluQXNwZWN0UmF0aW8gPSB0cnVlO1xuICAgIEBJbnB1dCgpIGFzcGVjdFJhdGlvID0gMTtcbiAgICBASW5wdXQoKSByZXNpemVUb1dpZHRoID0gMDtcbiAgICBASW5wdXQoKSBjcm9wcGVyTWluV2lkdGggPSAwO1xuICAgIEBJbnB1dCgpIHJvdW5kQ3JvcHBlciA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIG9ubHlTY2FsZURvd24gPSBmYWxzZTtcbiAgICBASW5wdXQoKSBpbWFnZVF1YWxpdHkgPSA5MjtcbiAgICBASW5wdXQoKSBhdXRvQ3JvcCA9IHRydWU7XG4gICAgQElucHV0KCkgY3JvcHBlcjogQ3JvcHBlclBvc2l0aW9uID0ge1xuICAgICAgICB4MTogLTEwMCxcbiAgICAgICAgeTE6IC0xMDAsXG4gICAgICAgIHgyOiAxMDAwMCxcbiAgICAgICAgeTI6IDEwMDAwXG4gICAgfTtcbiAgICBASG9zdEJpbmRpbmcoJ3N0eWxlLnRleHQtYWxpZ24nKVxuICAgIEBJbnB1dCgpIGFsaWduSW1hZ2U6ICdsZWZ0JyB8ICdjZW50ZXInID0gJ2NlbnRlcic7XG5cblxuICAgIEBPdXRwdXQoKSBzdGFydENyb3BJbWFnZSA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgICBAT3V0cHV0KCkgaW1hZ2VDcm9wcGVkID0gbmV3IEV2ZW50RW1pdHRlcjxJbWFnZUNyb3BwZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgaW1hZ2VDcm9wcGVkQmFzZTY0ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG4gICAgQE91dHB1dCgpIGltYWdlQ3JvcHBlZEZpbGUgPSBuZXcgRXZlbnRFbWl0dGVyPEJsb2I+KCk7XG4gICAgQE91dHB1dCgpIGltYWdlTG9hZGVkID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBjcm9wcGVyUmVhZHkgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gICAgQE91dHB1dCgpIGxvYWRJbWFnZUZhaWxlZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgc2FuaXRpemVyOiBEb21TYW5pdGl6ZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUpIHtcbiAgICAgICAgdGhpcy5pbml0Q3JvcHBlcigpO1xuICAgIH1cblxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuY3JvcHBlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrQ3JvcHBlclBvc2l0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZG9BdXRvQ3JvcCgpO1xuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlcy5hc3BlY3RSYXRpbyAmJiB0aGlzLmltYWdlVmlzaWJsZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldENyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0Q3JvcHBlcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbWFnZVZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5zYWZlSW1nRGF0YVVybCA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZydcbiAgICAgICAgICAgICsgJ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBQzBsRVFWUVlWMk5nQUFJQUFBVSdcbiAgICAgICAgICAgICsgJ0FBYXJWeUZFQUFBQUFTVVZPUks1Q1lJST0nO1xuICAgICAgICB0aGlzLm1vdmVTdGFydCA9IHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiBudWxsLFxuICAgICAgICAgICAgcG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICB4MTogMCxcbiAgICAgICAgICAgIHkxOiAwLFxuICAgICAgICAgICAgeDI6IDAsXG4gICAgICAgICAgICB5MjogMCxcbiAgICAgICAgICAgIGNsaWVudFg6IDAsXG4gICAgICAgICAgICBjbGllbnRZOiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubWF4U2l6ZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3JpZ2luYWxTaXplID0ge1xuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gLTEwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gLTEwMDtcbiAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gMTAwMDA7XG4gICAgICAgIHRoaXMuY3JvcHBlci55MiA9IDEwMDAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZEltYWdlRmlsZShmaWxlOiBGaWxlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVR5cGUgPSBmaWxlLnR5cGU7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1ZhbGlkSW1hZ2VUeXBlKGltYWdlVHlwZSkpIHtcbiAgICAgICAgICAgICAgICByZXNldEV4aWZPcmllbnRhdGlvbihldmVudC50YXJnZXQucmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0QmFzZTY0OiBzdHJpbmcpID0+IHRoaXMubG9hZEJhc2U2NEltYWdlKHJlc3VsdEJhc2U2NCkpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZpbGVSZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmFsaWRJbWFnZVR5cGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAvaW1hZ2VcXC8ocG5nfGpwZ3xqcGVnfGJtcHxnaWZ8dGlmZikvLnRlc3QodHlwZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2FkQmFzZTY0SW1hZ2UoaW1hZ2VCYXNlNjQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLm9yaWdpbmFsQmFzZTY0ID0gaW1hZ2VCYXNlNjQ7XG4gICAgICAgIHRoaXMuc2FmZUltZ0RhdGFVcmwgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwoaW1hZ2VCYXNlNjQpO1xuICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEltYWdlLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxTaXplLndpZHRoID0gdGhpcy5vcmlnaW5hbEltYWdlLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0ID0gdGhpcy5vcmlnaW5hbEltYWdlLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3JpZ2luYWxJbWFnZS5zcmMgPSBpbWFnZUJhc2U2NDtcbiAgICB9XG5cbiAgICBpbWFnZUxvYWRlZEluVmlldygpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxJbWFnZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlTG9hZGVkLmVtaXQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0SW1hZ2VNYXhTaXplUmV0cmllcyA9IDA7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuY2hlY2tJbWFnZU1heFNpemVSZWN1cnNpdmVseSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tJbWFnZU1heFNpemVSZWN1cnNpdmVseSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0SW1hZ2VNYXhTaXplUmV0cmllcyA+IDQwKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZUZhaWxlZC5lbWl0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zb3VyY2VJbWFnZSAmJiB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhTaXplKCk7XG4gICAgICAgICAgICB0aGlzLnNldENyb3BwZXJTY2FsZWRNaW5TaXplKCk7XG4gICAgICAgICAgICB0aGlzLnJlc2V0Q3JvcHBlclBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXJSZWFkeS5lbWl0KCk7XG4gICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRJbWFnZU1heFNpemVSZXRyaWVzKys7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrSW1hZ2VNYXhTaXplUmVjdXJzaXZlbHkoKTtcbiAgICAgICAgICAgIH0sIDUwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzpyZXNpemUnKVxuICAgIG9uUmVzaXplKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnJlc2l6ZUNyb3BwZXJQb3NpdGlvbigpO1xuICAgICAgICB0aGlzLnNldE1heFNpemUoKTtcbiAgICAgICAgdGhpcy5zZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpO1xuICAgIH1cblxuICAgIHJvdGF0ZUxlZnQoKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtQmFzZTY0KDgpO1xuICAgIH1cblxuICAgIHJvdGF0ZVJpZ2h0KCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUJhc2U2NCg2KTtcbiAgICB9XG5cbiAgICBmbGlwSG9yaXpvbnRhbCgpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1CYXNlNjQoMik7XG4gICAgfVxuXG4gICAgZmxpcFZlcnRpY2FsKCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUJhc2U2NCg0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyYW5zZm9ybUJhc2U2NChleGlmT3JpZW50YXRpb246IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbEJhc2U2NCkge1xuICAgICAgICAgICAgdHJhbnNmb3JtQmFzZTY0QmFzZWRPbkV4aWZSb3RhdGlvbih0aGlzLm9yaWdpbmFsQmFzZTY0LCBleGlmT3JpZW50YXRpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJvdGF0ZWRCYXNlNjQ6IHN0cmluZykgPT4gdGhpcy5sb2FkQmFzZTY0SW1hZ2Uocm90YXRlZEJhc2U2NCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNpemVDcm9wcGVyUG9zaXRpb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMubWF4U2l6ZS53aWR0aCAhPT0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIHx8IHRoaXMubWF4U2l6ZS5oZWlnaHQgIT09IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IHRoaXMuY3JvcHBlci54MSAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCAvIHRoaXMubWF4U2l6ZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MiAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aCAvIHRoaXMubWF4U2l6ZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IHRoaXMuY3JvcHBlci55MSAqIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQgLyB0aGlzLm1heFNpemUuaGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkyICogc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAvIHRoaXMubWF4U2l6ZS5oZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0Q3JvcHBlclBvc2l0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzb3VyY2VJbWFnZUVsZW1lbnQgPSB0aGlzLnNvdXJjZUltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGlmICghdGhpcy5tYWludGFpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAwO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbyA8IHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBjb25zdCBjcm9wcGVySGVpZ2h0ID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IChzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gY3JvcHBlckhlaWdodCkgLyAyO1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgY3JvcHBlckhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgY29uc3QgY3JvcHBlcldpZHRoID0gc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldEhlaWdodCAqIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAoc291cmNlSW1hZ2VFbGVtZW50Lm9mZnNldFdpZHRoIC0gY3JvcHBlcldpZHRoKSAvIDI7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLmNyb3BwZXIueDEgKyBjcm9wcGVyV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kb0F1dG9Dcm9wKCk7XG4gICAgICAgIHRoaXMuaW1hZ2VWaXNpYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzdGFydE1vdmUoZXZlbnQ6IGFueSwgbW92ZVR5cGU6IHN0cmluZywgcG9zaXRpb246IHN0cmluZyB8IG51bGwgPSBudWxsKTogdm9pZCB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubW92ZVN0YXJ0ID0ge1xuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgdHlwZTogbW92ZVR5cGUsXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgICAgICAgICBjbGllbnRYOiB0aGlzLmdldENsaWVudFgoZXZlbnQpLFxuICAgICAgICAgICAgY2xpZW50WTogdGhpcy5nZXRDbGllbnRZKGV2ZW50KSxcbiAgICAgICAgICAgIC4uLnRoaXMuY3JvcHBlclxuICAgICAgICB9O1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50Om1vdXNlbW92ZScsIFsnJGV2ZW50J10pXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2htb3ZlJywgWyckZXZlbnQnXSlcbiAgICBtb3ZlSW1nKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LmFjdGl2ZSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMubW92ZVN0YXJ0LnR5cGUgPT09ICdtb3ZlJykge1xuICAgICAgICAgICAgICAgIHRoaXMubW92ZShldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0Nyb3BwZXJQb3NpdGlvbih0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5tb3ZlU3RhcnQudHlwZSA9PT0gJ3Jlc2l6ZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZShldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja0Nyb3BwZXJQb3NpdGlvbihmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0TWF4U2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc291cmNlSW1hZ2VFbGVtZW50ID0gdGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLm1heFNpemUud2lkdGggPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgIHRoaXMubWF4U2l6ZS5oZWlnaHQgPSBzb3VyY2VJbWFnZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB0aGlzLm1hcmdpbkxlZnQgPSB0aGlzLnNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0U3R5bGUoJ2NhbGMoNTAlIC0gJyArIHRoaXMubWF4U2l6ZS53aWR0aCAvIDIgKyAncHgpJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDcm9wcGVyU2NhbGVkTWluU2l6ZSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxJbWFnZSAmJiB0aGlzLmNyb3BwZXJNaW5XaWR0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoID0gTWF0aC5tYXgoMjAsIHRoaXMuY3JvcHBlck1pbldpZHRoIC8gdGhpcy5vcmlnaW5hbEltYWdlLndpZHRoICogdGhpcy5tYXhTaXplLndpZHRoKTtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IHRoaXMubWFpbnRhaW5Bc3BlY3RSYXRpb1xuICAgICAgICAgICAgICAgID8gTWF0aC5tYXgoMjAsIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbylcbiAgICAgICAgICAgICAgICA6IDIwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGggPSAyMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCA9IDIwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja0Nyb3BwZXJQb3NpdGlvbihtYWludGFpblNpemUgPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLngxIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IG1haW50YWluU2l6ZSA/IHRoaXMuY3JvcHBlci54MSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNyb3BwZXIueTEgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gbWFpbnRhaW5TaXplID8gdGhpcy5jcm9wcGVyLnkxIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY3JvcHBlci54MiA+IHRoaXMubWF4U2l6ZS53aWR0aCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxIC09IG1haW50YWluU2l6ZSA/ICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgpIDogMDtcbiAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMubWF4U2l6ZS53aWR0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jcm9wcGVyLnkyID4gdGhpcy5tYXhTaXplLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxIC09IG1haW50YWluU2l6ZSA/ICh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0KSA6IDA7XG4gICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLm1heFNpemUuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6bW91c2V1cCcpXG4gICAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2hlbmQnKVxuICAgIG1vdmVTdG9wKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5tb3ZlU3RhcnQuYWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVTdGFydC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZG9BdXRvQ3JvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtb3ZlKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgY29uc3QgZGlmZlggPSB0aGlzLmdldENsaWVudFgoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WDtcbiAgICAgICAgY29uc3QgZGlmZlkgPSB0aGlzLmdldENsaWVudFkoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WTtcblxuICAgICAgICB0aGlzLmNyb3BwZXIueDEgPSB0aGlzLm1vdmVTdGFydC54MSArIGRpZmZYO1xuICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLm1vdmVTdGFydC55MSArIGRpZmZZO1xuICAgICAgICB0aGlzLmNyb3BwZXIueDIgPSB0aGlzLm1vdmVTdGFydC54MiArIGRpZmZYO1xuICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSB0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzaXplKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZGlmZlggPSB0aGlzLmdldENsaWVudFgoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WDtcbiAgICAgICAgY29uc3QgZGlmZlkgPSB0aGlzLmdldENsaWVudFkoZXZlbnQpIC0gdGhpcy5tb3ZlU3RhcnQuY2xpZW50WTtcbiAgICAgICAgc3dpdGNoICh0aGlzLm1vdmVTdGFydC5wb3NpdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndG9wbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlksIHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3AnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlksIHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3ByaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MSA9IE1hdGgubWluKHRoaXMubW92ZVN0YXJ0LnkxICsgZGlmZlksIHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gTWF0aC5tYXgodGhpcy5tb3ZlU3RhcnQueDIgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngxICsgdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tcmlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LngyICsgZGlmZlgsIHRoaXMuY3JvcHBlci54MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbldpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgPSBNYXRoLm1heCh0aGlzLm1vdmVTdGFydC55MiArIGRpZmZZLCB0aGlzLmNyb3BwZXIueTEgKyB0aGlzLmNyb3BwZXJTY2FsZWRNaW5IZWlnaHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm90dG9tbGVmdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngxID0gTWF0aC5taW4odGhpcy5tb3ZlU3RhcnQueDEgKyBkaWZmWCwgdGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyU2NhbGVkTWluV2lkdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IE1hdGgubWF4KHRoaXMubW92ZVN0YXJ0LnkyICsgZGlmZlksIHRoaXMuY3JvcHBlci55MSArIHRoaXMuY3JvcHBlclNjYWxlZE1pbkhlaWdodCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5tYWludGFpbkFzcGVjdFJhdGlvKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrQXNwZWN0UmF0aW8oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tBc3BlY3RSYXRpbygpOiB2b2lkIHtcbiAgICAgICAgbGV0IG92ZXJmbG93WCA9IDA7XG4gICAgICAgIGxldCBvdmVyZmxvd1kgPSAwO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5tb3ZlU3RhcnQucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyID0gdGhpcy5jcm9wcGVyLngxICsgKHRoaXMuY3JvcHBlci55MiAtIHRoaXMuY3JvcHBlci55MSkgKiB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MiA9IHRoaXMuY3JvcHBlci54MSArICh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLmNyb3BwZXIueTEpICogdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLm1heFNpemUud2lkdGgsIDApO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WSA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci55MiAtIHRoaXMubWF4U2l6ZS5oZWlnaHQsIDApO1xuICAgICAgICAgICAgICAgIGlmIChvdmVyZmxvd1ggPiAwIHx8IG92ZXJmbG93WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLngyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA6IG92ZXJmbG93WDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyIC09IChvdmVyZmxvd1kgKiB0aGlzLmFzcGVjdFJhdGlvKSA+IG92ZXJmbG93WCA/IG92ZXJmbG93WSA6IChvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3BsZWZ0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgPSB0aGlzLmNyb3BwZXIueTIgLSAodGhpcy5jcm9wcGVyLngyIC0gdGhpcy5jcm9wcGVyLngxKSAvIHRoaXMuYXNwZWN0UmF0aW87XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dYID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci54MSwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0b3ByaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkxID0gdGhpcy5jcm9wcGVyLnkyIC0gKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgoMCAtIHRoaXMuY3JvcHBlci55MSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTEgKz0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgICBjYXNlICdib3R0b21yaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jcm9wcGVyLnkyID0gdGhpcy5jcm9wcGVyLnkxICsgKHRoaXMuY3JvcHBlci54MiAtIHRoaXMuY3JvcHBlci54MSkgLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIG92ZXJmbG93WCA9IE1hdGgubWF4KHRoaXMuY3JvcHBlci54MiAtIHRoaXMubWF4U2l6ZS53aWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZID0gTWF0aC5tYXgodGhpcy5jcm9wcGVyLnkyIC0gdGhpcy5tYXhTaXplLmhlaWdodCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJmbG93WCA+IDAgfHwgb3ZlcmZsb3dZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueDIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pIDogb3ZlcmZsb3dYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyb3BwZXIueTIgLT0gKG92ZXJmbG93WSAqIHRoaXMuYXNwZWN0UmF0aW8pID4gb3ZlcmZsb3dYID8gb3ZlcmZsb3dZIDogb3ZlcmZsb3dYIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbWxlZnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiA9IHRoaXMuY3JvcHBlci55MSArICh0aGlzLmNyb3BwZXIueDIgLSB0aGlzLmNyb3BwZXIueDEpIC8gdGhpcy5hc3BlY3RSYXRpbztcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1ggPSBNYXRoLm1heCgwIC0gdGhpcy5jcm9wcGVyLngxLCAwKTtcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1kgPSBNYXRoLm1heCh0aGlzLmNyb3BwZXIueTIgLSB0aGlzLm1heFNpemUuaGVpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmZsb3dYID4gMCB8fCBvdmVyZmxvd1kgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci54MSArPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgOiBvdmVyZmxvd1g7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JvcHBlci55MiAtPSAob3ZlcmZsb3dZICogdGhpcy5hc3BlY3RSYXRpbykgPiBvdmVyZmxvd1ggPyBvdmVyZmxvd1kgOiBvdmVyZmxvd1ggLyB0aGlzLmFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZG9BdXRvQ3JvcCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuYXV0b0Nyb3ApIHtcbiAgICAgICAgICAgIHRoaXMuY3JvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JvcChvdXRwdXRUeXBlOiBPdXRwdXRUeXBlID0gdGhpcy5vdXRwdXRUeXBlKTogSW1hZ2VDcm9wcGVkRXZlbnQgfCBQcm9taXNlPEltYWdlQ3JvcHBlZEV2ZW50PiB8IG51bGwge1xuICAgICAgICBpZiAodGhpcy5zb3VyY2VJbWFnZS5uYXRpdmVFbGVtZW50ICYmIHRoaXMub3JpZ2luYWxJbWFnZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0Q3JvcEltYWdlLmVtaXQoKTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlUG9zaXRpb24gPSB0aGlzLmdldEltYWdlUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gaW1hZ2VQb3NpdGlvbi54MiAtIGltYWdlUG9zaXRpb24ueDE7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSBpbWFnZVBvc2l0aW9uLnkyIC0gaW1hZ2VQb3NpdGlvbi55MTtcblxuICAgICAgICAgICAgY29uc3QgY3JvcENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgICAgICAgICAgY3JvcENhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgY3JvcENhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IGNyb3BDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsSW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlUG9zaXRpb24ueDEsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlUG9zaXRpb24ueTEsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IHt3aWR0aCwgaGVpZ2h0LCBpbWFnZVBvc2l0aW9uLCBjcm9wcGVyUG9zaXRpb246IHsuLi50aGlzLmNyb3BwZXJ9fTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNpemVSYXRpbyA9IHRoaXMuZ2V0UmVzaXplUmF0aW8od2lkdGgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXNpemVSYXRpbyAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQud2lkdGggPSBNYXRoLmZsb29yKHdpZHRoICogcmVzaXplUmF0aW8pO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQuaGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgKiByZXNpemVSYXRpbyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZUNhbnZhcyhjcm9wQ2FudmFzLCBvdXRwdXQud2lkdGgsIG91dHB1dC5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jcm9wVG9PdXRwdXRUeXBlKG91dHB1dFR5cGUsIGNyb3BDYW52YXMsIG91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbWFnZVBvc2l0aW9uKCk6IENyb3BwZXJQb3NpdGlvbiB7XG4gICAgICAgIGNvbnN0IHNvdXJjZUltYWdlRWxlbWVudCA9IHRoaXMuc291cmNlSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgY29uc3QgcmF0aW8gPSB0aGlzLm9yaWdpbmFsU2l6ZS53aWR0aCAvIHNvdXJjZUltYWdlRWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHgxOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci54MSAqIHJhdGlvKSxcbiAgICAgICAgICAgIHkxOiBNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci55MSAqIHJhdGlvKSxcbiAgICAgICAgICAgIHgyOiBNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuY3JvcHBlci54MiAqIHJhdGlvKSwgdGhpcy5vcmlnaW5hbFNpemUud2lkdGgpLFxuICAgICAgICAgICAgeTI6IE1hdGgubWluKE1hdGgucm91bmQodGhpcy5jcm9wcGVyLnkyICAqIHJhdGlvKSwgdGhpcy5vcmlnaW5hbFNpemUuaGVpZ2h0KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcm9wVG9PdXRwdXRUeXBlKG91dHB1dFR5cGU6IE91dHB1dFR5cGUsIGNyb3BDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBvdXRwdXQ6IEltYWdlQ3JvcHBlZEV2ZW50KTogSW1hZ2VDcm9wcGVkRXZlbnQgfCBQcm9taXNlPEltYWdlQ3JvcHBlZEV2ZW50PiB7XG4gICAgICAgIHN3aXRjaCAob3V0cHV0VHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZmlsZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JvcFRvRmlsZShjcm9wQ2FudmFzKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0OiBCbG9iIHwgbnVsbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LmZpbGUgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlQ3JvcHBlZC5lbWl0KG91dHB1dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhc2UgJ2JvdGgnOlxuICAgICAgICAgICAgICAgIG91dHB1dC5iYXNlNjQgPSB0aGlzLmNyb3BUb0Jhc2U2NChjcm9wQ2FudmFzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jcm9wVG9GaWxlKGNyb3BDYW52YXMpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQ6IEJsb2IgfCBudWxsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQuZmlsZSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VDcm9wcGVkLmVtaXQob3V0cHV0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvdXRwdXQuYmFzZTY0ID0gdGhpcy5jcm9wVG9CYXNlNjQoY3JvcENhbnZhcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUNyb3BwZWQuZW1pdChvdXRwdXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyb3BUb0Jhc2U2NChjcm9wQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGltYWdlQmFzZTY0ID0gY3JvcENhbnZhcy50b0RhdGFVUkwoJ2ltYWdlLycgKyB0aGlzLmZvcm1hdCwgdGhpcy5nZXRRdWFsaXR5KCkpO1xuICAgICAgICB0aGlzLmltYWdlQ3JvcHBlZEJhc2U2NC5lbWl0KGltYWdlQmFzZTY0KTtcbiAgICAgICAgcmV0dXJuIGltYWdlQmFzZTY0O1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JvcFRvRmlsZShjcm9wQ2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFByb21pc2U8QmxvYiB8IG51bGw+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2FudmFzQmxvYihjcm9wQ2FudmFzKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3VsdDogQmxvYiB8IG51bGwpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VDcm9wcGVkRmlsZS5lbWl0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENhbnZhc0Jsb2IoY3JvcENhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBQcm9taXNlPEJsb2IgfCBudWxsPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY3JvcENhbnZhcy50b0Jsb2IoXG4gICAgICAgICAgICAgICAgKHJlc3VsdDogQmxvYiB8IG51bGwpID0+IHRoaXMuem9uZS5ydW4oKCkgPT4gcmVzb2x2ZShyZXN1bHQpKSxcbiAgICAgICAgICAgICAgICAnaW1hZ2UvJyArIHRoaXMuZm9ybWF0LFxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UXVhbGl0eSgpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFF1YWxpdHkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKDEsIE1hdGgubWF4KDAsIHRoaXMuaW1hZ2VRdWFsaXR5IC8gMTAwKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZXNpemVSYXRpbyh3aWR0aDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVzaXplVG9XaWR0aCA+IDAgJiYgKCF0aGlzLm9ubHlTY2FsZURvd24gfHwgd2lkdGggPiB0aGlzLnJlc2l6ZVRvV2lkdGgpXG4gICAgICAgICAgICA/IHRoaXMucmVzaXplVG9XaWR0aCAvIHdpZHRoXG4gICAgICAgICAgICA6IDE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDbGllbnRYKGV2ZW50OiBhbnkpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gZXZlbnQuY2xpZW50WCB8fCBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0gJiYgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2xpZW50WShldmVudDogYW55KTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50LmNsaWVudFkgfHwgZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdICYmIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICB9XG59XG4iXX0=