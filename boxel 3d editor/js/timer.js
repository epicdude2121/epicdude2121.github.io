class Timer {
    constructor() {
        this.reset();
    }

    start() {
        if (this.pauseTime <= this.startTime) { this.reset(); }
        this.resume();
    }

    pause() {
        this.pauseTime = Date.now();
    }

    reset() {
        var now = Date.now();
        this.startTime = now;
        this.pauseTime = now;
        this.playTime = 0;
    }

    resume() { 
        this.playTime += Date.now() - this.pauseTime;
    }

    getPlayTime() {
        var time = Date.now() - this.startTime - (this.playTime);
        return time;
    }

    toString() {
        var a = this.getPlayTime();
        var milliseconds = ((a / 1000) % 1).toFixed(3).slice(-3);
        var seconds = (Math.floor((a / 1000)));
        //if (("0"+seconds).length <= 2) seconds = ("0" + seconds).slice(-2);
        return seconds+"."+milliseconds;
    }

    toHTML(time) {
        return '<span>' + time.split('').join('</span><span>') + '</span>';
    }

    render(a) {
        var time = a.timer.toString();
        a.document.getElementById('timer').innerHTML = a.timer.toHTML(time);
    }
}