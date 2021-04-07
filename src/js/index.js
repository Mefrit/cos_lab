"use strict";
class CanvasImage {
    constructor(canvas, canvas_init, src, size_matrix) {
        // загрузка изображения на холст
        var context = canvas.getContext('2d'), context_init = canvas_init.getContext('2d');
        var i = new Image();
        var that = this;
        i.onload = function () {
            canvas.width = i.width;
            canvas.height = i.height;
            canvas_init.width = i.width;
            canvas_init.height = i.height;
            context_init.drawImage(i, 0, 0, i.width, i.height);
            context.drawImage(i, 0, 0, i.width, i.height);
            // запомним оригинальные пикселы
            console.log(that);
            that.original = that.getData();
        };
        i.src = src;
        this.size_matrix = size_matrix;
        // кешируем
        this.context = context;
        this.image = i;
    }
    getData = () => {
        return this.context.getImageData(0, 0, this.image.width, this.image.height);
    }


    setData = (data) => {
        return this.context.putImageData(data, 0, 0);
    };
    reset = () => {
        this.setData(this.original);
    }
    transform = function (fn, factor) {
        console.log("this.original", this.original);
        var olddata = this.original;
        var oldpx = olddata.data;
        var newdata = this.context.createImageData(olddata);
        var newpx = newdata.data

        // this.median(newdata, 3, 3);
        // for (var i = 0; i < len; i += 4) {
        //     res = fn.call(this, oldpx[i], oldpx[i + 1], oldpx[i + 2], oldpx[i + 3], factor, i);
        //     newpx[i] = res[0]; // r
        //     newpx[i + 1] = res[1]; // g
        //     newpx[i + 2] = res[2]; // b
        //     newpx[i + 3] = res[3]; // a
        // }
        // console.log(this.median(olddata, 9, 3));
        console.log("this.size_matrix", this.size_matrix);
        this.setData(this.median(olddata, this.size_matrix, 3));
    };
    median(pixels, size, colors) {
        var d = pixels.data;
        var buff = new pixels.data.constructor(new ArrayBuffer(pixels.data.length));
        var w = pixels.width;
        var h = pixels.height;
        const bpr = w * 4; // Байты на строку

        if (size < 3) return;

        const ms = Math.floor(size / 2);
        const mc = Math.floor((size * size) / 2);

        // Найти среднее значение путем обхода гистограммы
        function getMiddle(h, n) {
            for (var count = h[0], i = 1; i < 256; i++, count += h[i]) {
                if (count >= n) { return i; }
            }
            return 255;
        }
        colors = colors || 3;
        for (var i, j, c = 0; c < colors; c++) {
            var srcIt, dstIt, l;
            for (i = ms; i < h - ms; i++) {
                var hist = new Uint16Array(256);
                const offset = (i - ms) * bpr + c;
                for (var ii = (i - ms) * bpr; ii <= (i + ms) * bpr; ii += bpr) {
                    for (var jj = c; jj < (ms * 2) * 4 + c; jj += 4) {
                        hist[d[ii + jj]]++;
                    }
                }
                for (j = ms, dstIt = i * bpr + j * 4 + c; j < w - ms; j++, dstIt += 4) {
                    // Добавление крайних левых значений гистограммы
                    for (srcIt = offset + (j + ms) * 4,
                        l = srcIt + bpr * size; srcIt < l; srcIt += bpr) {
                        hist[d[srcIt]]++;
                    }

                    buff[dstIt] = getMiddle(hist, mc);
                    //Удаление крайних левых значений гистограммы
                    for (srcIt = offset + (j - ms) * 4,
                        l = srcIt + bpr * size; srcIt < l; srcIt += bpr) { hist[d[srcIt]]--; }
                }
            }
        } if (colors > 1) {
            for (var i = 3; i < l; i += 4) {
                buff[i] = 255;
            }
        } else {
            for (var i = 3; i < l; i += 4) {
                buff[i] = 255;
                buff[i - 2] = buff[i - 1] = buff[i - 3];
            }
        }

        pixels.data.set(buff);

        return pixels;
    }
}
class ImageFilter {
    constructor(canvas, canvas_init, image_data, size_matrix) {
        this.canvas = canvas;
        this.image_data = image_data;
        this.canvas_init = canvas_init;
        this.size_matrix = size_matrix;
    }
    updateSizeMatrix(size_matrix) {
        this.size_matrix = size_matrix;
    }
    start() {
        console.log("start", typeof this.image_data);
        let ctx = this.canvas.getContext("2d"), canvas = this.canvas;
        var transformador = new CanvasImage(
            this.canvas,
            this.canvas_init,
            this.image_data,
            this.size_matrix
        );
        setTimeout(() => {
            transformador.transform(function (r, g, b, a, factor, i) {
                return [255 - r, 255 - g, 255 - b, 255];
            });
        }, 200);

    }
    startMedian(canvas) {
        console.log("toDataURL", canvas.toDataURL());
    }


}