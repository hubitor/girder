slicer.views.ControlWidget = girder.View.extend({
    events: {
        'change input,select': '_input',
        'changeColor': '_input',
        'click .h-select-file-button': '_selectFile'
    },

    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
        this.listenTo(this.model, 'invalid', this.invalid);
    },

    render: function (_, options) {
        this.$('.form-group').removeClass('has-error');
        this.model.isValid();
        if (options && options.norender) {
            return this;
        }
        this.$el.html(this.template()(this.model.attributes));
        this.$('.h-control-item[data-type="range"] input').slider();
        this.$('.h-control-item[data-type="color"] .input-group').colorpicker({});
        return this;
    },

    remove: function () {
        this.$('.h-control-item[data-type="color"] .input-group').colorpicker('destroy');
        this.$('.h-control-item[data-type="range"] input').slider('destroy');
        this.$el.empty();
    },

    /**
     * Set classes on the input element to indicate to the user that the current value
     * is invalid.  This is automatically triggered by the model's "invalid" event.
     */
    invalid: function () {
        this.$('.form-group').addClass('has-error');
    },

    /**
     * For image types, this sets the current value to the loaded image.  To be
     * called both on initialization and whenever the viewed image changes.
     *
     * TODO: restore this in the main application code
     *
    _useLoadedImage: function () {
        var current = this.model.get('value');

        if (current) {
            this.stopListening(current);
        }

        // get the large image file id, and trigger a change when fetched
        current = slicer.dialogs.image.model.get('value');

        if (!current) {
            return;
        }

        current.once('g:fetched', function () {
            var largeImage = current.get('largeImage');
            var fileId = largeImage && (largeImage.originalId || largeImage.fileId);
            var file;

            if (fileId) {
                file = new girder.models.FileModel({_id: fileId});
                this.model.set('value', file, {trigger: false});

                file.once('g:fetched', function () {
                    this.model.trigger('change', this.model);
                }, this).fetch();
            }
        }, this).fetch();
    },
     */

    /**
     * Type definitions mapping used internally.  Each widget type
     * specifies it's jade template and possibly more custimizations
     * as needed.
     */
    _typedef: {
        range: {
            template: 'rangeWidget'
        },
        color: {
            template: 'colorWidget'
        },
        string: {
            template: 'widget'
        },
        number: {
            template: 'widget'
        },
        boolean: {
            template: 'booleanWidget'
        },
        'string-vector': {
            template: 'widget'
        },
        'number-vector': {
            template: 'widget'
        },
        'string-enumeration': {
            template: 'enumerationWidget'
        },
        'number-enumeration': {
            template: 'enumerationWidget'
        },
        file: {
            template: 'fileWidget'
        },
        image: {
            template: 'fileWidget'
        },
        directory: {
            template: 'fileWidget'
        },
        'new-file': {
            template: 'fileWidget'
        }
    },

    /**
     * Get the appropriate template for the model type.
     */
    template: function () {
        var type = this.model.get('type');
        var def = this._typedef[type];

        if (def === undefined) {
            console.warn('Invalid widget type "' + type + '"'); // eslint-disable-line no-console
            def = {};
        }
        return slicer.templates[def.template] || _.template('');
    },

    /**
     * Get the current value from an input (or select) element.
     */
    _input: function (evt) {
        var $el, val;

        $el = $(evt.target);
        val = $el.val();

        if ($el.attr('type') === 'checkbox') {
            val = $el.get(0).checked;
        }

        // we don't want to rerender, because this event is generated by the input element
        this.model.set('value', val, {norender: true});
    },

    /**
     * Get the value from a file selection modal and set the text in the widget's
     * input element.
     */
    _selectFile: function () {
        var modal = new slicer.views.ItemSelectorWidget({
            el: $('#g-dialog-container'),
            parentView: this,
            model: this.model
        });
        modal.once('g:saved', _.bind(function () {
            modal.$el.modal('hide');
        }, this)).render();
    }
});
