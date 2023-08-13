class FPS {
    constructor() {
        // Initialize class
        this.start = 0;
        this.end = 0;
        this.average = [];
        this.averageSize = 5;
    }

    update() {
        this.end = performance.now();
        this.delta = this.end - this.start;
        if (this.delta == 0) this.delta = 1000;
        this.fps = parseInt(1000 / (this.delta));
        this.start = this.end;
        this.updateAverage(this.fps);
    }

    updateAverage(fps) {
        this.average.unshift(fps);
        this.average = this.average.slice(0, this.averageSize);
    }

    getFPS() {
        return this.fps;
    }

    getAverageFPS() {
        var total = 0;
        var size = this.average.length;
        for (var i = 0; i < size; i++) {
            total += this.average[i];
        }
        return parseInt(total / size);
    }
}