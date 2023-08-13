class Dialog {
    constructor() {
        this.element = this.get();
    }

    add(options, delay = 0) {
        // Prevent multiple dialogs
        if (this.isOpen()) {
            delay = 100;
            this.remove();
        }

        // Construct dialog window
        setTimeout(function() {
            var dialog = $('<div class="dialog">');
            var background = $('<div class="background">');
            var wrapper = $('<div class="wrapper">');
            var inputs = $('<div class="inputs">');

            // Add attributes to dialog
            if (options.attributes != null) {
                dialog.attr(options.attributes);
                dialog.addClass('dialog')
            }

            // Include copy
            if (options.text != null) wrapper.append('<p>' + options.text + '</p>');
            
            // Bind functions
            if (options.inputs != null) {
                for (var i = 0; i < options.inputs.length; i++) {
                    var data = options.inputs[i];
                    var input = $('<input>', data.attributes);

                    // Add default functionality
                    input[0]._function = function(){};
                    input[0]._parameter = input;
                    input[0]._attributes = data.attributes;
                    if (data.function != null) input[0]._function = data.function;
                    if (data.parameter != null) input[0]._parameter = data.parameter;
                    input.on('click', function() {
                        var self = $(this)[0];
                        self._function(self._parameter);
                        if (self._attributes.type == 'button') app.ui.dialog.remove(); // Always close dialog
                    });
                    if (data.label != null) inputs.append('<label>' + data.label + '</label>');
                    inputs.append(input);
                }
                wrapper.append(inputs);
            }
            
            // Select last option if the background is clicked
            background.on('click', function() { dialog.find('input:last-of-type').click(); });

            // Append dialog
            dialog.append(background);
            dialog.append(wrapper);
            dialog.hide().fadeIn(100);
            $('body').append(dialog);
            $('body').addClass('has-dialog');
            dialog.find('input:last-of-type').focus();
        }, delay);
    }

    remove(duration = 100) {
        var dialog = this.get();
        dialog.find('a').off();
        dialog.fadeOut(duration, function(){ dialog.remove(); });
        $('body').removeClass('has-dialog');
    }

    isOpen() {
        return this.get().length > 0;
    }

    get() {
        return $('.dialog');
    }

    getId() {
        return this.get().attr('id');
    }
}