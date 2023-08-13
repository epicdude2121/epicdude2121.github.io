class Shapes extends THREE.Group {
    constructor() {
        super();
    }

    addCube(options = {}) {
        options.x = (options.x == null) ? 0 : options.x;
        options.y = (options.y == null) ? 0 : options.y;
        options.z = (options.z == null) ? 0 : options.z;
        options.scaleX = (options.scaleX == null) ? 1 : options.scaleX;
        options.scaleY = (options.scaleY == null) ? 1 : options.scaleY;
        options.scaleZ = (options.scaleZ == null) ? 1 : options.scaleZ;
        options.color = (options.color == null) ? '#620460' : options.color;
        options.opacity = (options.opacity == null) ? 1 : options.opacity;

        var geometry = new THREE.BoxGeometry(options.scaleX, options.scaleY, options.scaleZ);
        var material = new THREE.MeshPhongMaterial({ color: options.color, transparent: true });
        var cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.position.set(options.x, options.y, options.z);
        cube.material.colorOrigin = options.color;
        cube.material.opacity = options.opacity;
        this.add(cube);
    }
    
    addCone(options = {}) {
        options.x = (options.x == null) ? 0 : options.x;
        options.y = (options.y == null) ? 0 : options.y;
        options.z = (options.z == null) ? 0 : options.z;
        options.scaleX = (options.scaleX == null) ? 1 : options.scaleX;
        options.scaleY = (options.scaleY == null) ? 1 : options.scaleY;
        options.scaleZ = (options.scaleZ == null) ? 1 : options.scaleZ;
        options.rotationX = (options.rotationX == null) ? 0 : options.rotationX;
        options.rotationY = (options.rotationY == null) ? 0 : options.rotationY;
        options.rotationZ = (options.rotationZ == null) ? 0 : options.rotationZ;
        options.segments = (options.segments == null) ? 4 : options.segments;
        options.color = (options.color == null) ? '#620460' : options.color;
        options.opacity = (options.opacity == null) ? 1 : options.opacity;

        var geometry = new THREE.ConeGeometry((options.scaleX / 2) * 1.5, options.scaleY, options.segments);
        var material = new THREE.MeshPhongMaterial({ color: options.color });
        var cone = new THREE.Mesh(geometry, material);
        cone.castShadow = true;
        cone.receiveShadow = true;
        cone.position.set(options.x, options.y, options.z);
        cone.material.colorOrigin = options.color;
        cone.material.opacity = options.opacity;
        cone.rotation.x = options.rotationX;
        cone.rotation.y = options.rotationY + (45 * Math.PI / 180);
        cone.rotation.z = options.rotationZ;
        this.add(cone);
    }

    addExtrusion(options = {}) {
        // Initialize defaults
        options.position = (options.position == null) ? { x: 0, y: 0, z: 0 } : options.position;
        options.scale = (options.scale == null) ? { x: 1, y: 1, z: 1 } : options.scale;
        options.rotation = (options.rotation == null) ? { x: 0, y: 0, z: 0 } : options.rotation;
        options.points = (options.points == null) ? [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }] : options.points;
        options.depth = (options.depth == null) ? 1 : options.depth;
        options.color = (options.color == null) ? '#620460' : options.color;

        // Construct 2d face from points
        var shape = new THREE.Shape();
        for (var i = 0; i < options.points.length; i++){
            var p = options.points[i];
            if (i == 0) shape.moveTo(p.x, p.y);
            else shape.lineTo(p.x, p.y);
        }

        // Add mesh to shape
        var extrudeSettings = { 
            steps: 1,
            depth: options.depth,
            bevelEnabled: false
        }
        var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        var material = new THREE.MeshPhongMaterial({ color: options.color });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(options.position.x, options.position.y, options.position.z);
        mesh.scale.set(options.scale.x, options.scale.y, options.scale.z);
        mesh.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.add(mesh);
    }

    setColors(color, updateOrigin = true) {
        var length = this.children.length;
        for (var i = 0; i < length; i++) {
            var child = this.children[i];
            child.material.color.set(color);
            if (updateOrigin == true) child.material.colorOrigin = color;
        }
    }

    setOpacities(opacity) {
        var length = this.children.length;
        for (var i = 0; i < length; i++) {
            var child = this.children[i];
            child.material.opacity = opacity;
        }
    }

    resetColors() {
        var length = this.children.length;
        for (var i = 0; i < length; i++) {
            var child = this.children[i];
            var colorOrigin = child.material.colorOrigin;
            child.material.color.set(colorOrigin);
        }
    }

    removeAllShapes() {
        var length = this.children.length;
        for (var i = 0; i < length; i++) {
            var child = this.children[0];
            this.remove(child);
        }
    }
}