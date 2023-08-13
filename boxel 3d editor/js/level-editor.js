class LevelEditor {
    constructor() {

    }

    mouseDown(e, a) {
        // Allow right click toggle to erase
        if (e.button == 2) {
            a.mouse.mode = 'erase';
            a.ui.updateLevelOptions()
        }

        // Check if drawing or erasing
        a.mouse.setPosition('down', a.mouse.getPosition(e, a));
        if (a.mouse.mode == 'draw') {
            var target = a.mouse.clickObject(e, a);
            a.camera.moved = false;
            a.mouse.setOffset(a.mouse.down);
            // Select a new object on start click
            if (target != null) {
                a.mouse.setOffset(target.position);
                a.level.deselectLevel(a);
                a.ui.showObjectOptions(true);
                a.selectedObject = target;
                a.selectedObject.select(true);
                a.ui.updateObjectOptions();
                a.ui.selectObjectType(a.selectedObject.getClass(), false);
                a.camera.allowMovement = false;
            }
            else {
                // Enable camera dragging
                a.camera.allowMovement = true;
            }
        }
        else if (a.mouse.mode == 'erase') {
            a.levelEditor.eraseTarget(e, a);
            a.level.deselectLevel(a); // Deselect everything
            a.ui.showObjectOptions(false);
        }
    }

    mouseMove(e, a) {
        a.mouse.setPosition('move', a.mouse.getPosition(e, a));
        // Update selected object if drag is true
        if (a.mouse.drag == true) {
            if (a.mouse.mode == 'draw') {
                // Update object or camera position if tolerance is true
                if (a.mouse.getTolerance() == true) {
                    // Update camera position
                    var down = a.mouse.down;
                    var diff = a.mouse.getDragDifference();
                    
                    // If 's' is not selected, begin moving camera or object
                    if (a.levelEditor.isScaling != true && a.levelEditor.isRotating != true) {
                        if (a.camera.allowMovement == true) {
                            // Resolve camera ray miscalculations
                            var camTolerance = a.camera.position.z / 2;
                            if (Math.abs(diff.x) > camTolerance || Math.abs(diff.y) > camTolerance || Math.abs(diff.z) > camTolerance) {
                                diff = { x: 0, y: 0, z: 0 };
                            }
                            // Update camera position
                            a.camera.position.x += diff.x;
                            a.camera.position.y += diff.y;
                            a.camera.moved = true;
                        }
                        else { // Update object position
                            if (a.selectedObject != null) {
                                a.camera.allowMovement = false;
                                a.selectedObject.setPosition({
                                    x: a.mouse.snapToValue(down.x - diff.x, a.mouse.snap),
                                    y: a.mouse.snapToValue(down.y - diff.y, a.mouse.snap)
                                });
                            }
                        }
                    }
                    else {
                        if (a.levelEditor.isScaling == true) {
                            // Start scaling object
                            var s = a.selectedObject.getScaleOrigin();
                            var x = a.mouse.snapToValue(s.x - diff.x, a.mouse.snap);
                            var y = a.mouse.snapToValue(s.y - diff.y, a.mouse.snap);
                            if (x < 16) x = 16;
                            if (y < 16) y = 16;
                            a.selectedObject.setScale({ x: x, y: y }, false);
                        }
                        if (a.levelEditor.isRotating == true) {
                            // Start rotating object
                            var d = a.mouse.down;
                            var m = a.mouse.move;
                            var o = a.selectedObject.position;
                            var angle_down = Math.atan2(d.y - o.y, d.x - o.x);
                            var angle_move = Math.atan2(m.y - o.y, m.x - o.x);
                            var angle_diff = angle_move - angle_down;
                            var angle_orig = a.selectedObject.getRotationOrigin();
                            a.selectedObject.setRotation((angle_orig + angle_diff) % (Math.PI * 2), false);
                        }
                    }
                }
            }
            else if (a.mouse.mode == 'erase') {
                a.levelEditor.eraseTarget(e, a);
            }
        }
    }

    mouseUp(e, a) {
        var target = a.mouse.clickObject(e, a);
        a.mouse.setPosition('up', a.mouse.getPosition(e, a));
        
        // Store selected object origin
        if (a.selectedObject != null) {
            a.selectedObject.setScale(a.selectedObject.getScale());
            a.selectedObject.setRotation(a.selectedObject.getRotation());
        }

        // Check if drawing or erasing
        if (a.mouse.mode == 'draw') {
            // Add cube if nothing is selected
            if (target == null) {
                // Check if mouse moved more than tolerance
                if (a.mouse.getTolerance() == false) {
                    // Check if the camera was not moved when given permission to add cube
                    if (a.camera.moved != true) {
                        var objectType = a.ui.getSelectedObjectType();
                        var objectData = {
                            class: objectType,
                            isStatic: true,
                            position: { 
                                x: a.mouse.snapToValue(a.mouse.down.x, a.mouse.snap), 
                                y: a.mouse.snapToValue(a.mouse.down.y, a.mouse.snap), 
                                z: 0 
                            },
                            rotation: { x: 0, y: 0, z: 0 },
                            scale: { x: a.BOX_SIZE, y: a.BOX_SIZE, z: a.BOX_SIZE }
                        };
                        a.level.deselectLevel(a); // Deselect everything
                        a.selectedObject = a.level.createObject(objectType);
                        a.level.setObjectProperties(a.selectedObject, objectData);
                        a.level.addObject(a.selectedObject, a);
                        a.levelHistory.save('Added ' + objectType, a);
                        a.selectedObject.select(true);
                        a.ui.showObjectOptions(true);
                        a.ui.updateObjectOptions();
                    }
                }
            }
            else {
                // Save history if object was moved
                if (a.mouse.getTolerance() != false) {
                    a.levelHistory.save('Moved object', a);
                }
            }
        }
        else if (a.mouse.mode == 'erase') {
            if (a.mouse.erased == true) {
                a.levelHistory.save('Erased object', a);
                a.mouse.erased = false; // Reset state
            }
        }
        
        // Reset right click toggle to erase
        if (e.button == 2) {
            a.mouse.mode = a.mouse.prevMode;
            a.ui.updateLevelOptions()
        }
        //if (a.selectedObject == null) a.levelEditor.setScalingState(a, false);
        a.levelEditor.setScalingState(a, false);
        a.levelEditor.setRotatingState(a, false);
    }

    eraseTarget(e, a) {
        var target = a.mouse.clickObject(e, a);
        if (target != null) {
            if (target.getClass() != 'player') {
                target.select(true);
                a.level.removeObject(target, a, true);
                a.mouse.erased = true; // Used for saving history
            }
        }
    }

    setScalingState(a, isScaling) {
        a.levelEditor.isScaling = isScaling;
    }

    setRotatingState(a, isRotating) {
        a.levelEditor.isRotating = isRotating;
    }

    duplicateSelected(a) {
        if (a.selectedObject != null) {
            $('[action="duplicate"]').click();
        }
    }

    deleteSelected(a) {
        if (a.selectedObject != null) {
            $('[action="trash"]').click();
        }
    }

    undoEdit() {
        $('[action="undo"]').click();
    }

    redoEdit() {
        $('[action="redo"]').click();
    }

    saveLevel() {
        $('[action="save"]').click();
    }
}