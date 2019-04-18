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
export function resizeCanvas(canvas, width, height, resizeCanvas = true) {
    try {
        /** @type {?} */
        const width_source = canvas.width || width;
        /** @type {?} */
        const height_source = canvas.height || height;
        width = Math.round(width);
        height = Math.round(height);
        /** @type {?} */
        const ratio_w = width_source / width;
        /** @type {?} */
        const ratio_h = height_source / height;
        /** @type {?} */
        const ratio_w_half = Math.ceil(ratio_w / 2);
        /** @type {?} */
        const ratio_h_half = Math.ceil(ratio_h / 2);
        /** @type {?} */
        const ctx = canvas.getContext('2d');
        if (ctx) {
            /** @type {?} */
            const img = ctx.getImageData(0, 0, width_source, height_source);
            /** @type {?} */
            const img2 = ctx.createImageData(width, height);
            /** @type {?} */
            const data = img.data;
            /** @type {?} */
            const data2 = img2.data;
            for (let j = 0; j < height; j++) {
                for (let i = 0; i < width; i++) {
                    /** @type {?} */
                    const x2 = (i + j * width) * 4;
                    /** @type {?} */
                    const center_y = j * ratio_h;
                    /** @type {?} */
                    let weight = 0;
                    /** @type {?} */
                    let weights = 0;
                    /** @type {?} */
                    let weights_alpha = 0;
                    /** @type {?} */
                    let gx_r = 0;
                    /** @type {?} */
                    let gx_g = 0;
                    /** @type {?} */
                    let gx_b = 0;
                    /** @type {?} */
                    let gx_a = 0;
                    /** @type {?} */
                    const xx_start = Math.floor(i * ratio_w);
                    /** @type {?} */
                    const yy_start = Math.floor(j * ratio_h);
                    /** @type {?} */
                    let xx_stop = Math.ceil((i + 1) * ratio_w);
                    /** @type {?} */
                    let yy_stop = Math.ceil((j + 1) * ratio_h);
                    xx_stop = Math.min(xx_stop, width_source);
                    yy_stop = Math.min(yy_stop, height_source);
                    for (let yy = yy_start; yy < yy_stop; yy++) {
                        /** @type {?} */
                        const dy = Math.abs(center_y - yy) / ratio_h_half;
                        /** @type {?} */
                        const center_x = i * ratio_w;
                        /** @type {?} */
                        const w0 = dy * dy; //pre-calc part of w
                        for (let xx = xx_start; xx < xx_stop; xx++) {
                            /** @type {?} */
                            const dx = Math.abs(center_x - xx) / ratio_w_half;
                            /** @type {?} */
                            const w = Math.sqrt(w0 + dx * dx);
                            if (w >= 1) {
                                //pixel too far
                                continue;
                            }
                            //hermite filter
                            weight = 2 * w * w * w - 3 * w * w + 1;
                            /** @type {?} */
                            const pos_x = 4 * (xx + yy * width_source);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLnV0aWxzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LWltYWdlLWNyb3BwZXIvIiwic291cmNlcyI6WyJzcmMvdXRpbHMvcmVzaXplLnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUtBLE1BQU0sdUJBQXVCLE1BQXlCLEVBQUUsS0FBYSxFQUFFLE1BQWMsRUFBRSxZQUFZLEdBQUcsSUFBSTtJQUV0RyxJQUFJLENBQUM7O1FBRUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUM7O1FBQzNDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDO1FBQzlDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztRQUU1QixNQUFNLE9BQU8sR0FBRyxZQUFZLEdBQUcsS0FBSyxDQUFDOztRQUNyQyxNQUFNLE9BQU8sR0FBRyxhQUFhLEdBQUcsTUFBTSxDQUFDOztRQUN2QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQzs7UUFDNUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7O1FBRTVDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7WUFDTixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDOztZQUNoRSxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxNQUFNLENB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R0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2hDO0tBQ0o7SUFBQyxLQUFLLENBQUEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztLQUVYO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogSGVybWl0ZSByZXNpemUgLSBmYXN0IGltYWdlIHJlc2l6ZS9yZXNhbXBsZSB1c2luZyBIZXJtaXRlIGZpbHRlci5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS92aWxpdXNsZS9IZXJtaXRlLXJlc2l6ZVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByZXNpemVDYW52YXMoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHJlc2l6ZUNhbnZhcyA9IHRydWUpIHtcblxuICAgIHRyeSB7XG5cbiAgICAgICAgY29uc3Qgd2lkdGhfc291cmNlID0gY2FudmFzLndpZHRoIHx8IHdpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHRfc291cmNlID0gY2FudmFzLmhlaWdodCB8fCBoZWlnaHQ7XG4gICAgICAgIHdpZHRoID0gTWF0aC5yb3VuZCh3aWR0aCk7XG4gICAgICAgIGhlaWdodCA9IE1hdGgucm91bmQoaGVpZ2h0KTtcbiAgICBcbiAgICAgICAgY29uc3QgcmF0aW9fdyA9IHdpZHRoX3NvdXJjZSAvIHdpZHRoO1xuICAgICAgICBjb25zdCByYXRpb19oID0gaGVpZ2h0X3NvdXJjZSAvIGhlaWdodDtcbiAgICAgICAgY29uc3QgcmF0aW9fd19oYWxmID0gTWF0aC5jZWlsKHJhdGlvX3cgLyAyKTtcbiAgICAgICAgY29uc3QgcmF0aW9faF9oYWxmID0gTWF0aC5jZWlsKHJhdGlvX2ggLyAyKTtcbiAgICBcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGNvbnN0IGltZyA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGhfc291cmNlLCBoZWlnaHRfc291cmNlKTtcbiAgICAgICAgICAgIGNvbnN0IGltZzIgPSBjdHguY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGltZy5kYXRhO1xuICAgICAgICAgICAgY29uc3QgZGF0YTIgPSBpbWcyLmRhdGE7XG4gICAgXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGhlaWdodDsgaisrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHgyID0gKGkgKyBqICogd2lkdGgpICogNDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2VudGVyX3kgPSBqICogcmF0aW9faDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdlaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3ZWlnaHRzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdlaWdodHNfYWxwaGEgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ3hfciA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBneF9nID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGd4X2IgPSAwO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ3hfYSA9IDA7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHh4X3N0YXJ0ID0gTWF0aC5mbG9vcihpICogcmF0aW9fdyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHl5X3N0YXJ0ID0gTWF0aC5mbG9vcihqICogcmF0aW9faCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4eF9zdG9wID0gTWF0aC5jZWlsKChpICsgMSkgKiByYXRpb193KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHl5X3N0b3AgPSBNYXRoLmNlaWwoKGogKyAxKSAqIHJhdGlvX2gpO1xuICAgICAgICAgICAgICAgICAgICB4eF9zdG9wID0gTWF0aC5taW4oeHhfc3RvcCwgd2lkdGhfc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgeXlfc3RvcCA9IE1hdGgubWluKHl5X3N0b3AsIGhlaWdodF9zb3VyY2UpO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB5eSA9IHl5X3N0YXJ0OyB5eSA8IHl5X3N0b3A7IHl5KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGR5ID0gTWF0aC5hYnMoY2VudGVyX3kgLSB5eSkgLyByYXRpb19oX2hhbGY7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjZW50ZXJfeCA9IGkgKiByYXRpb193O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdzAgPSBkeSAqIGR5OyAvL3ByZS1jYWxjIHBhcnQgb2Ygd1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgeHggPSB4eF9zdGFydDsgeHggPCB4eF9zdG9wOyB4eCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZHggPSBNYXRoLmFicyhjZW50ZXJfeCAtIHh4KSAvIHJhdGlvX3dfaGFsZjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3ID0gTWF0aC5zcXJ0KHcwICsgZHggKiBkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHcgPj0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3BpeGVsIHRvbyBmYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaGVybWl0ZSBmaWx0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHQgPSAyICogdyAqIHcgKiB3IC0gMyAqIHcgKiB3ICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NfeCA9IDQgKiAoeHggKyB5eSAqIHdpZHRoX3NvdXJjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbHBoYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd4X2EgKz0gd2VpZ2h0ICogZGF0YVtwb3NfeCArIDNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdlaWdodHNfYWxwaGEgKz0gd2VpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29sb3JzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFbcG9zX3ggKyAzXSA8IDI1NSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gd2VpZ2h0ICogZGF0YVtwb3NfeCArIDNdIC8gMjUwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd4X3IgKz0gd2VpZ2h0ICogZGF0YVtwb3NfeF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3hfZyArPSB3ZWlnaHQgKiBkYXRhW3Bvc194ICsgMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3hfYiArPSB3ZWlnaHQgKiBkYXRhW3Bvc194ICsgMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0cyArPSB3ZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGF0YTJbeDJdID0gZ3hfciAvIHdlaWdodHM7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEyW3gyICsgMV0gPSBneF9nIC8gd2VpZ2h0cztcbiAgICAgICAgICAgICAgICAgICAgZGF0YTJbeDIgKyAyXSA9IGd4X2IgLyB3ZWlnaHRzO1xuICAgICAgICAgICAgICAgICAgICBkYXRhMlt4MiArIDNdID0gZ3hfYSAvIHdlaWdodHNfYWxwaGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jbGVhciBhbmQgcmVzaXplIGNhbnZhc1xuICAgICAgICAgICAgaWYgKHJlc2l6ZUNhbnZhcykge1xuICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoX3NvdXJjZSwgaGVpZ2h0X3NvdXJjZSk7XG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICAvL2RyYXdcbiAgICAgICAgICAgIGN0eC5wdXRJbWFnZURhdGEoaW1nMiwgMCwgMCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHtcblxuICAgIH1cbn0iXX0=