class Keyboard {
    constructor() {
        this.shift = false;
        this.ctrl = false;
    }
    
    keyDown(e, a) {
        var state = a.ui.state;

        // Only add shortcuts when not typing
        if (a.ui.dialog.isOpen() == false && $('input:focus').length <= 0) {
            e.preventDefault();
            switch (e.keyCode) {
                case 13: a.keyboard.spaceBarDown(a); break; // Enter (same as space)
                case 16: this.shift = true; break; // Shift
                case 17: this.ctrl = true; break; // Ctrl
                case 27: // Esc
                    // Add 'go back' behavior
                    if (state == 'level-manager') {
                        $('[action="exit-to-home"]').click();
                    }
                    else if (state == 'level-editor') {
                        a.ui.dialog.remove(0);
                        $('[action="exit-to-level-manager"]').click();
                    }
                    else if (state == 'level-picker') {
                        $('[action="exit-to-home"]').click();
                    }
                    else if (state == 'shop') {
                        $('[action="exit-to-home"]').click();
                    }
                    else if (state == 'play') {
                        // Resume or pause game
                        if (a.ui.dialog.isOpen()) {
                            if (a.ui.dialog.getId() != 'finished') {
                                a.ui.dialog.remove(0);
                                a.ui.resumeCampaign();
                            }
                            else {
                                // Continue if level is finished
                                a.ui.dialog.get().find('input[type="button"]:last-of-type').click();
                            }
                        }
                        else {
                            a.ui.pause();
                        }
                    }
                break;
                case 32: a.keyboard.spaceBarDown(a); break; // Space Bar
                case 38: a.keyboard.spaceBarDown(a); break; // Up
                case 68: // 'd'
                    if (state == 'level-editor') {
                        a.levelEditor.duplicateSelected(a);
                    }
                break;
                case 69: // 'e'
                    if (a.play == true && (state == 'play')) {
                        a.ui.exitCampaign();
                    }
                break;
                case 82: // 'r'
                    if (a.play == true && (state == 'play' || state == 'level-editor')) {
                        a.level.retryLevel(a);
                    }
                    else if (a.play == false && state == 'level-editor') {
                        a.levelEditor.setRotatingState(a, true);
                    }
                break;
                case 83: // 's'
                    if (state == 'level-editor') {
                        if (this.ctrl == true) {
                            a.levelEditor.saveLevel();
                        }
                        else {
                            a.levelEditor.setScalingState(a, true);
                        }
                    }
                break;
                case 87: a.keyboard.spaceBarDown(a); break; // 'w'
                case 88: // 'x'
                    if (state == 'level-editor') {
                        a.levelEditor.deleteSelected(a);
                    }
                break;
                case 90: // 'z'
                    if (state == 'level-editor') {
                        if (this.ctrl == true && this.shift == false) { // Undo
                            a.levelEditor.undoEdit();
                        }
                        if (this.ctrl == true && this.shift == true) { // Redo
                            a.levelEditor.redoEdit();
                        }
                    }
                break;
            }
        }
    }

    spaceBarDown(a) {
        if (a.ui.state == 'play' || a.ui.state == 'level-editor') {
            if (a.play == true) {
                a.player.jump();
            }
        }
        else {
            $(':focus').click();
        }
    }

    keyUp(e, a) {
        switch (e.keyCode) {
            case 16: this.shift = false; break; // Shift
            case 17: this.ctrl = false; break; // Ctrl
        }
    }
}