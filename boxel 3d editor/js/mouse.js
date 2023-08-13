class Mouse {
    constructor() {
        this.down = new THREE.Vector3();
        this.move = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.up = new THREE.Vector3();
        this.drag = false;
        this.mode = 'draw';
        this.snap = 1; // Drag snapping
        this.prevMode = this.mode;
    }
    
    mouseDown(e, a) {
        this.setTolerance();
        if (a.play == false) { a.levelEditor.mouseDown(e, a); }
        else {
            a.player.jump(a.mouse.getPosition(e, a));
            a.player.addRope(a.mouse.getPosition(e, a));
        }
    }

    mouseMove(e, a) {
        if (a.play == false) { a.levelEditor.mouseMove(e, a); }
    }

    mouseUp(e, a) {
        if (a.play == false) { a.levelEditor.mouseUp(e, a); }
        a.player.removeRope(); // Always remove rope
    }

    getPosition(e, a) {
        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse
        var distance = 0;
        var x = (e.clientX / a.window.innerWidth) * 2 - 1;
        var y = -(e.clientY / a.window.innerHeight) * 2 + 1;
        vec.set(x, y, 0.5);
        vec.unproject(a.camera);
        vec.sub(a.camera.position).normalize();
        distance = -a.camera.position.z / vec.z;
        pos.copy(a.camera.position).add(vec.multiplyScalar(distance));
        return(pos);
    }

    clickObject(e, a) {
        var raycaster = new THREE.Raycaster();
        var vec = new THREE.Vector3();
        var object;
        var x = (e.clientX / a.window.innerWidth) * 2 - 1;
        var y = -(e.clientY / a.window.innerHeight) * 2 + 1;
        vec.set(x, y, 0);
        raycaster.setFromCamera(vec, a.camera);
        var intersects = raycaster.intersectObjects(a.scene.children, true);
        if (intersects.length > 0) {
            // Parent #1 = Shapes, Parent #2 = Cube
            object = intersects[0].object.parent.parent;
        }
        return(object);
    }

    wheel(e, a) {
        e.preventDefault();
        if (app.ui.state == 'level-editor') {
            var zoom = a.camera.position.z + e.deltaY;
            if (zoom < 100) zoom = 100;
            else if (zoom > 1000) zoom = 1000;
            a.camera.position.z = zoom;
            a.mouse.setTolerance();
        }
    }

    setTolerance(value = 0.05) {
        this.tolerance = app.camera.position.z * value;
    }

    setPosition(state, position) {
        if (state == 'down') {
            this.down = position;
            this.move = position; // Reset move
            this.drag = true;
        }
        else if (state == 'move') {
            if (this.drag == true) this.move = position;
        }
        else if (state == 'up') {
            this.up = position;
            this.drag = false;
        }
    }

    setOffset(position) {
        this.offset.x = position.x - this.down.x;
        this.offset.y = position.y - this.down.y;
        this.offset.z = position.z - this.down.z;
    }

    getDragDifference() {
        return { 
            x: Math.round(this.down.x - this.move.x - this.offset.x), 
            y: Math.round(this.down.y - this.move.y - this.offset.y), 
            z: Math.round(this.down.z - this.move.z - this.offset.z)
        }
    }

    getTolerance() {
        var diff = this.getDragDifference();
        return (Math.abs(diff.x + this.offset.x) + Math.abs(diff.y + this.offset.y) > this.tolerance);
    }

    snapToValue(value, step) {
        return Math.round(value / step) * step;
    }
    
    setSnap(snap) {
        this.snap = snap;
    }

    setMode(mode) {
        this.mode = this.prevMode =  mode;
    }

    getMode() {
        return this.mode;
    }
}