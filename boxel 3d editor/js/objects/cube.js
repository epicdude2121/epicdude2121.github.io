class Cube extends THREE.Mesh {
    constructor(options = {}) {
        super();

        // Update null values
        options.x = (options.x == null) ? 0 : options.x;
        options.y = (options.y == null) ? 0 : options.y;
        options.z = (options.z == null) ? 0 : options.z;
        options.scaleX = (options.scaleX == null) ? 1 : options.scaleX;
        options.scaleY = (options.scaleY == null) ? 1 : options.scaleY;
        options.scaleZ = (options.scaleZ == null) ? 1 : options.scaleZ;
        options.angle = (options.angle == null) ? 0 : options.angle;
        options.color = (options.color == null) ? '#620460' : options.color;

        // Set default properties
        this.shapes = new Shapes();
        this.shapes.addCube();
        this.setColors(options.color);
        this.add(this.shapes);
        this.hitbox = Matter.Bodies.rectangle(0, 0, options.scaleX, options.scaleY, { class: 'hitbox' });
        this.body = Matter.Body.create({
            parts: [this.hitbox],
            friction: 0.0, // Default 0.1
            frictionAir: 0.0, // Default 0.1
            frictionStatic: 0.0, // Default: 0.5, stationary stickiness
            restitution: 0.0, // Default: 0.0, bounciness
            slop: 0.0, // Default: 0.05
            timeScale: 1.0, // Default: 1
            name: this.uuid, // Useful for finding scene object
            class: 'cube'
        });
        this.name = this.uuid;
        this.maxSpeed = 4;
        this.setPosition({ x: options.x, y: options.y, z: options.z });
        this.setRotation(options.angle);
        this.setScale({ x: options.scaleX, y: options.scaleY, z: options.scaleZ });
        this.setMode();
        this.setForceDirection();
    }

    update() {
        // Apply force to body until it reaches it's max speed (generic)
        if (this.body.speed < this.maxSpeed) {
            Matter.Body.applyForce(this.body, this.body.position, { x: this.force.x, y: this.force.y });
        }
    }

    setColors(color) {
        this.color = color; // Update last color
        this.shapes.setColors(color);
    }

    setPosition(position = {}, updateOrigin = true) {
        // Set null values
        position.x = (position.x == null) ? this.position.x : position.x;
        position.y = (position.y == null) ? this.position.y : position.y;
        position.z = (position.z == null) ? this.position.z : position.z;

        // Update position
        this.position.set(position.x, position.y, position.z);
        Matter.Body.setPosition(this.body, { x: position.x, y: -position.y });
        if (updateOrigin == true) this.setPositionOrigin(position);
    }

    setPositionOrigin(position) {
        if (this.positionOrigin == null) this.positionOrigin = {};
        this.positionOrigin.x = position.x;
        this.positionOrigin.y = position.y;
        this.positionOrigin.z = position.z;
    }

    setRotation(angle, updateOrigin = true) {
        this.rotation.z = angle;
        Matter.Body.setAngle(this.body, -angle);
        if (updateOrigin == true) { this.setRotationOrigin(angle); }
    }

    setRotationOrigin(angle) {
        this.rotationOrigin = angle;
    }

    getRotation(format = 'radians') {
        var value = this.rotation.z; // Default radians
        if (format == 'degrees') value = Math.round(this.rotation.z * (180 / Math.PI));
        return value;
    }

    getRotationOrigin() {
        return this.rotationOrigin;
    }

    setScale(scale = {}, updateOrigin = true) {
        // Resolve null values
        scale.x = (scale.x == null) ? this.scale.x : scale.x;
        scale.y = (scale.y == null) ? this.scale.y : scale.y;
        scale.z = (scale.z == null) ? this.scale.z : scale.z;
        
        // Temporarily set rectangle angle to zero to prevent skewing
        var tempAngle = this.rotation.z;
        this.setRotation(0, false);

        // Scale rectangle by previous scale, then update mesh scale ratio
        Matter.Body.scale(this.body, scale.x / this.scale.x, scale.y / this.scale.y);
        this.scale.x = scale.x;
        this.scale.y = scale.y;
        this.scale.z = scale.z;
        this.setRotation(tempAngle, false); // Revert angle
        if (updateOrigin == true) this.setScaleOrigin({ x: scale.x, y: scale.y, z: scale.z });
    }

    getScale() {
        return this.scale;
    }

    getScaleOrigin() {
        return this.scaleOrigin;
    }

    setScaleOrigin(scale) {
        if (this.scaleOrigin == null) this.scaleOrigin = {};
        this.scaleOrigin.x = scale.x;
        this.scaleOrigin.y = scale.y;
        this.scaleOrigin.z = scale.z;
    }

    setForceDirection(force = { x: 0, y: 0 }, updateOrigin = true) {
        // Resolve null values
        this.force = force;
        if (updateOrigin == true) { this.setForceDirectionOrigin(force); }
    }

    setForceDirectionOrigin(force) {
        this.forceOrigin = force;
    }

    getForce() {
        return this.force;
    }

    calculateForceDirection(bodyA, bodyB) {
        var force = { x: 0.00025 * bodyB.mass, y: 0 }; // Left-to-right
        force = Matter.Vector.rotate(force, bodyA.angle);

        //return force;
        return force;
    }

    resetToOrigin() {
        this.hide(false); // reveal
        this.setPosition(this.positionOrigin, false);
        this.setRotation(this.rotationOrigin, false);
        this.setScale({ x: this.scaleOrigin.x, y: this.scaleOrigin.y, z: this.scaleOrigin.z }, false);
        this.setForceDirection(this.forceOrigin, false);
        this.setStatic(this.isStaticOrigin, false);
        this.setFriction(this.frictionOrigin, false);
        this.setMode(this.modeOrigin, false);
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(this.body, 0);
    }

    setStatic(isStatic = true, updateOrigin = true) {
        Matter.Body.setStatic(this.body, isStatic);
        if (updateOrigin == true) this.setStaticOrigin(isStatic);
    }

    setStaticOrigin(isStatic) {
        this.isStaticOrigin = isStatic;
    }

    toggleStatic() {
        var isStatic = !this.body.isStatic;
        this.setStatic(isStatic);
        return isStatic;
    }

    isStatic() {
        return this.body.isStatic;
    }

    setFriction(friction = 0.1, updateOrigin = true) {
        this.body.friction = parseFloat(friction);
        if (updateOrigin == true) this.setFrictionOrigin(friction);
    }

    setFrictionOrigin(friction) {
        this.frictionOrigin = parseFloat(friction);
    }

    getFriction() {
        return this.body.friction;
    }

    setMode(mode, updateOrigin = true) {
        mode = (mode == null) ? 'default' : mode;
        this.mode = mode;
        if (updateOrigin == true) this.setModeOrigin(mode);
    }

    setModeOrigin(mode) {
        this.modeOrigin = mode;
    }

    getClass() {
        return this.body.class;
    }

    setText(text) {
        if (text != null) this.text = text;
    }

    getText() { return this.text; }

    select(state = true) {
        this.selected = state;
        if (state == true) {
            this.shapes.setColors('#ffffff', false);
            this.shapes.setOpacities(0.9);
            Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(this.body, 0);
        }
        else {
            this.shapes.resetColors();
            this.shapes.setOpacities(1);
        }
    }

    isSelected() {
        return this.selected;
    }

    setForce(force, object, relativeAngle = false) {
        // Vector of this cube
        var x1 = this.body.positionPrev.x;
        var x2 = this.body.position.x;
        var y1 = this.body.positionPrev.y;
        var y2 = this.body.position.y;
        var angleA = object.body.angle; // Ex: object angle
        var angleB = Math.atan2(y2 - y1, x2 - x1); // Ex: this angle

        // Use relative angle, not object angle
        if (relativeAngle == true) {
            angleA = this.body.angle;
            angleB = this.body.angle + (Math.PI / 2);
            force *= -1; // Newtons 3rd law of pizza
        }

        // Normalize velocity
        var vx = Math.cos(angleB);
        var vy = Math.sin(angleB);

        // Set surface direction
        var nx = -Math.sin(angleA);
        var ny = Math.cos(angleA);

        // Get dot value to calculate reflection
        var dot = (vx * nx) + (vy * ny);

        // Update velocity direction after reflection transforms
        var vnewx = vx - (2 * dot * nx);
        var vnewy = vy - (2 * dot * ny);

        // Reverse force if dot product is negative
        if (dot < 0 && (Math.abs(vnewx) == 1 || Math.abs(vnewy) == 1)) { force *= -1; }

        Matter.Body.setVelocity(this.body, { 
            x: vnewx * force,
            y: vnewy * force
        });
        return force;
    }

    getVelocity(object = this) {
        return { 
            x: object.body.position.x - object.body.positionPrev.x,
            y: object.body.position.y - object.body.positionPrev.y
        }
    }

    freeze(state = true) {
        this.body.collisionFilter.category = (state == true) ? 0 : 1;
        Matter.Sleeping.set(this.body, state);
    }

    hide(state = true) {
        // Freeze and update visibility
        this.visible = !state;
        this.freeze(state);
    }

    isFrozen() {
        return this.body.collisionFilter.category == 0;
    }

    addLight(color, intensity, distance, castShadow = false) {
        if (this.light == null) {
            this.light = new THREE.PointLight(color, intensity, distance);
            this.light.position.set(0, 0, 0);
            this.light.castShadow = castShadow;
            this.add(this.light);
        }
    }
}