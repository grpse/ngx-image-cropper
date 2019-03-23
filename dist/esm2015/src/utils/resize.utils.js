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
    /** @type {?} */
    const width_source = canvas.width;
    /** @type {?} */
    const height_source = canvas.height;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLnV0aWxzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LWltYWdlLWNyb3BwZXIvIiwic291cmNlcyI6WyJzcmMvdXRpbHMvcmVzaXplLnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUtBLE1BQU0sdUJBQXVCLE1BQXlCLEVBQUUsS0FBYSxFQUFFLE1BQWMsRUFBRSxZQUFZLEdBQUcsSUFBSTs7SUFDdEcsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQzs7SUFDbEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNwQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQixNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzs7SUFFNUIsTUFBTSxPQUFPLEdBQUcsWUFBWSxHQUFHLEtBQUssQ0FBQzs7SUFDckMsTUFBTSxPQUFPLEdBQUcsYUFBYSxHQUFHLE1BQU0sQ0FBQzs7SUFDdkMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0lBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDOztJQUU1QyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O1FBQ04sTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQzs7UUFDaEUsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7O1FBQ2hELE1BQU0sSUFBSSxHQUFHLEdBQUcs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Q0FBQyxDQUFDLENBQUM7S0FDaEM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBIZXJtaXRlIHJlc2l6ZSAtIGZhc3QgaW1hZ2UgcmVzaXplL3Jlc2FtcGxlIHVzaW5nIEhlcm1pdGUgZmlsdGVyLlxuICogaHR0cHM6Ly9naXRodWIuY29tL3ZpbGl1c2xlL0hlcm1pdGUtcmVzaXplXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZUNhbnZhcyhjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgcmVzaXplQ2FudmFzID0gdHJ1ZSkge1xuICAgIGNvbnN0IHdpZHRoX3NvdXJjZSA9IGNhbnZhcy53aWR0aDtcbiAgICBjb25zdCBoZWlnaHRfc291cmNlID0gY2FudmFzLmhlaWdodDtcbiAgICB3aWR0aCA9IE1hdGgucm91bmQod2lkdGgpO1xuICAgIGhlaWdodCA9IE1hdGgucm91bmQoaGVpZ2h0KTtcblxuICAgIGNvbnN0IHJhdGlvX3cgPSB3aWR0aF9zb3VyY2UgLyB3aWR0aDtcbiAgICBjb25zdCByYXRpb19oID0gaGVpZ2h0X3NvdXJjZSAvIGhlaWdodDtcbiAgICBjb25zdCByYXRpb193X2hhbGYgPSBNYXRoLmNlaWwocmF0aW9fdyAvIDIpO1xuICAgIGNvbnN0IHJhdGlvX2hfaGFsZiA9IE1hdGguY2VpbChyYXRpb19oIC8gMik7XG5cbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBpZiAoY3R4KSB7XG4gICAgICAgIGNvbnN0IGltZyA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGhfc291cmNlLCBoZWlnaHRfc291cmNlKTtcbiAgICAgICAgY29uc3QgaW1nMiA9IGN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBpbWcuZGF0YTtcbiAgICAgICAgY29uc3QgZGF0YTIgPSBpbWcyLmRhdGE7XG5cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBoZWlnaHQ7IGorKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeDIgPSAoaSArIGogKiB3aWR0aCkgKiA0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlcl95ID0gaiAqIHJhdGlvX2g7XG4gICAgICAgICAgICAgICAgbGV0IHdlaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgbGV0IHdlaWdodHMgPSAwO1xuICAgICAgICAgICAgICAgIGxldCB3ZWlnaHRzX2FscGhhID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgZ3hfciA9IDA7XG4gICAgICAgICAgICAgICAgbGV0IGd4X2cgPSAwO1xuICAgICAgICAgICAgICAgIGxldCBneF9iID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgZ3hfYSA9IDA7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB4eF9zdGFydCA9IE1hdGguZmxvb3IoaSAqIHJhdGlvX3cpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHl5X3N0YXJ0ID0gTWF0aC5mbG9vcihqICogcmF0aW9faCk7XG4gICAgICAgICAgICAgICAgbGV0IHh4X3N0b3AgPSBNYXRoLmNlaWwoKGkgKyAxKSAqIHJhdGlvX3cpO1xuICAgICAgICAgICAgICAgIGxldCB5eV9zdG9wID0gTWF0aC5jZWlsKChqICsgMSkgKiByYXRpb19oKTtcbiAgICAgICAgICAgICAgICB4eF9zdG9wID0gTWF0aC5taW4oeHhfc3RvcCwgd2lkdGhfc291cmNlKTtcbiAgICAgICAgICAgICAgICB5eV9zdG9wID0gTWF0aC5taW4oeXlfc3RvcCwgaGVpZ2h0X3NvdXJjZSk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCB5eSA9IHl5X3N0YXJ0OyB5eSA8IHl5X3N0b3A7IHl5KyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZHkgPSBNYXRoLmFicyhjZW50ZXJfeSAtIHl5KSAvIHJhdGlvX2hfaGFsZjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2VudGVyX3ggPSBpICogcmF0aW9fdztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdzAgPSBkeSAqIGR5OyAvL3ByZS1jYWxjIHBhcnQgb2Ygd1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB4eCA9IHh4X3N0YXJ0OyB4eCA8IHh4X3N0b3A7IHh4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGR4ID0gTWF0aC5hYnMoY2VudGVyX3ggLSB4eCkgLyByYXRpb193X2hhbGY7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3ID0gTWF0aC5zcXJ0KHcwICsgZHggKiBkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodyA+PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9waXhlbCB0b28gZmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2hlcm1pdGUgZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHQgPSAyICogdyAqIHcgKiB3IC0gMyAqIHcgKiB3ICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc194ID0gNCAqICh4eCArIHl5ICogd2lkdGhfc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWxwaGFcbiAgICAgICAgICAgICAgICAgICAgICAgIGd4X2EgKz0gd2VpZ2h0ICogZGF0YVtwb3NfeCArIDNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0c19hbHBoYSArPSB3ZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbG9yc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFbcG9zX3ggKyAzXSA8IDI1NSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHQgPSB3ZWlnaHQgKiBkYXRhW3Bvc194ICsgM10gLyAyNTA7XG4gICAgICAgICAgICAgICAgICAgICAgICBneF9yICs9IHdlaWdodCAqIGRhdGFbcG9zX3hdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3hfZyArPSB3ZWlnaHQgKiBkYXRhW3Bvc194ICsgMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBneF9iICs9IHdlaWdodCAqIGRhdGFbcG9zX3ggKyAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdlaWdodHMgKz0gd2VpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGEyW3gyXSA9IGd4X3IgLyB3ZWlnaHRzO1xuICAgICAgICAgICAgICAgIGRhdGEyW3gyICsgMV0gPSBneF9nIC8gd2VpZ2h0cztcbiAgICAgICAgICAgICAgICBkYXRhMlt4MiArIDJdID0gZ3hfYiAvIHdlaWdodHM7XG4gICAgICAgICAgICAgICAgZGF0YTJbeDIgKyAzXSA9IGd4X2EgLyB3ZWlnaHRzX2FscGhhO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY2xlYXIgYW5kIHJlc2l6ZSBjYW52YXNcbiAgICAgICAgaWYgKHJlc2l6ZUNhbnZhcykge1xuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aF9zb3VyY2UsIGhlaWdodF9zb3VyY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9kcmF3XG4gICAgICAgIGN0eC5wdXRJbWFnZURhdGEoaW1nMiwgMCwgMCk7XG4gICAgfVxufSJdfQ==