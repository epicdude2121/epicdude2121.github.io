class Rope extends THREE.Group {
    constructor() {
        super();
        this.radius = 4; // controls width and joint body size
        this.setTexture(this);
    }

    addJoints(bodyA, bodyB, pointB) {
        var p1 = bodyA.position;
        var p2 = pointB;
        var length = Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        var joints = 4;
        var spacing = Math.ceil(length / (this.radius * 2) / joints);
        var minLength = 16 / joints;
        var speed = 1 / joints;

        for (var i = 1; i <= joints; i++) {
            var isLastJoint = (i == joints);
            var percent = i / joints;
            var jointPosition = { 
                x: p1.x + ((p2.x - p1.x) * percent),
                y: p1.y + ((p2.y - p1.y) * percent)
            };
            
            // Update bodyA to previous joint
            if (i > 1) { bodyA = this.children[this.children.length - 1].body; }

            // Update joint options
            var options = {
                bodyA: bodyA,
                bodyB: bodyB,
                isLastJoint: isLastJoint,
                minLength: minLength,
                position: jointPosition,
                radius: this.radius,
                spacing: spacing,
                speed: speed,
                texture: this.texture
            };

            // Add new joint
            var joint = new Joint(options);
            this.add(joint);
        }
    }
    
    removeJoints() {
        var length = this.children.length;
        var index = length - 1;

        // Loop through each child
        while (index >= 0) {
            var child = this.children[index];
            child.removeConstraint();
            child.removeBody();
            this.remove(child);
            index--;
        }
    }

    resetToOrigin() {
        this.removeJoints();
    }
    
    updateJoints() {
        for (var i = 0; i < this.children.length; i++) {
            var points = [];
            var child = this.children[i];
            var pointA = child.constraint.bodyA.position;
            var pointB = child.constraint.bodyB.position;
            
            // Shrink every joint
            child.shrink();

            // Update line mesh
            if (child.line != null) {
                points.push(new THREE.Vector3(pointA.x, -pointA.y, 0));
                points.push(new THREE.Vector3(pointB.x + child.offset.x, -(pointB.y + child.offset.y), 0));
                child.line.setPoints(points);
            }

            // Update circle mesh
            if (child.circleMesh != null) {
                child.circleMesh.position.set(pointB.x, -pointB.y, 0);
            }
        }
    }

    setTexture(self) {
        this.loader = new THREE.TextureLoader();
        this.loader.load('../img/png/textures/texture-chain.png', function(texture) { 
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            self.texture = texture;
        });
    }
}

class Joint extends THREE.Group {
    constructor(options) {
        super();
        this.addLineMesh(options);
        //this.addCircleMesh(options);
        this.addBody(options);
        this.addConstraint(options);
    }

    addLineMesh(options) {
        // Line mesh
        this.speed = options.speed; // Shrink speed
        this.minLength = options.minLength;
        this.line = new MeshLine();
        this.lineMaterial = new MeshLineMaterial({ 
            color: '#ffffff',
            lineWidth: options.radius * 2,
            map: options.texture,
            opacity: 1.0,
            useMap: true,
            repeat: new THREE.Vector2(options.spacing, 1),
            transparent: true
        });
        this.lineMesh = new THREE.Mesh(this.line, this.lineMaterial);
        this.add(this.lineMesh);
    }

    addCircleMesh(options) {
        // Circle mesh
        this.circle = new THREE.CircleGeometry(options.radius, 12); // radius, segments
        this.circleMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', opacity: 1.0, transparent: true });
        this.circleMesh = new THREE.Mesh(this.circle, this.circleMaterial);
        this.add(this.circleMesh);
    }

    removeCircleMesh() {
        this.remove(this.circleMesh);
    }

    addBody(options) {
        // Physical body
        this.part = Matter.Bodies.circle(options.position.x, options.position.y, options.radius, { isSensor: true });
        this.body = Matter.Body.create({ parts: [this.part], friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 0 });
        Matter.World.add(app.engine.world, this.body);
    }

    removeBody() {
        Matter.World.remove(app.engine.world, this.body);
    }

    addConstraint(options) {
        // Constraint
        var bodyB = this.body;
        var pointB = { x: 0, y: 0 };

        // Update last joint properties
        if (options.isLastJoint == true) {
            this.removeBody();
            this.removeCircleMesh();
            bodyB = options.bodyB;
            pointB = {
                x: -(bodyB.position.x - options.position.x),
                y: -(bodyB.position.y - options.position.y)
            };
        }

        // Configure constraint options
        this.offset = pointB; // Used for last joint
        this.constraint = Matter.Constraint.create({ bodyA: options.bodyA, bodyB: bodyB, mass: 0, pointB: pointB, stiffness: 1.5, shrink: true });
        Matter.World.add(app.engine.world, this.constraint);
    }

    removeConstraint() {
        Matter.World.remove(app.engine.world, this.constraint);
    }

    shrink() {
        if (this.constraint.shrink == true) {
            if (this.constraint.length > this.minLength) {
                this.constraint.length -= this.speed;
            }
            else {
                this.constraint.length = this.minLength;
                this.constraint.shrink = false;
            }
        }
    }
}