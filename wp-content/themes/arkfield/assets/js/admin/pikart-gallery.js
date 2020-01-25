"use strict";

var initGallery = function ($) {
    var galleryContainer = $('.pikart-gallery-container'),
        galleryImagesSelector = 'ul',
        inputFieldSelector = "input[type='hidden']";

    galleryContainer.find('.pikart-gallery-open').on('click', function (e) {
        e.preventDefault();

        var refreshIcon = $(this).closest('.pikart-gallery-container').find('.icon-refresh');

        var inputField = $(this).siblings(inputFieldSelector),
            galleryImagesContainer = $(this).siblings(galleryImagesSelector),
            inputFieldVal = inputField.val().trim(),
            imageIds = inputFieldVal === '' ? [] : inputFieldVal.split(',');

        wp.media.pikartGallery.run({
            galleryIds: imageIds,
            updateCallback: function (galleryIds, htmlData) {
                inputField.val(galleryIds.join(','));
                galleryImagesContainer.html(htmlData);
            },
            refreshIcon: refreshIcon
        });
    });

    galleryContainer.find('.pikart-gallery-reset').on('click', function (e) {
        e.preventDefault();

        $(this).siblings(inputFieldSelector).val('');
        $(this).siblings(galleryImagesSelector).html('');
    });
};

jQuery(function ($) {
    initGallery($);
    wp.media.pikartGallery = {
        defaultOptions: {
            title: 'Gallery',
            multiple: true,
            editing: true,
            state: 'gallery-edit',
            frame: 'post',
            library: {
                type: 'image'
            },
            galleryIds: [],
            updateCallback: function (galleryIds) {
            }
        },

        run: function (customOptions) {
            var options = $.extend(true, {}, this.defaultOptions, customOptions);
            options['selection'] = this.getSelection(options['galleryIds']);

            var frame = wp.media(options);
            var controller = frame.state('gallery-edit');
            controller.attributes.displaySettings = false;

            frame.on('update', function () {
                var ids = controller.get('library').pluck('id'),
                    refreshIcon = customOptions['refreshIcon'];

                refreshIcon.show();

                $.ajax({
                    method: "POST",
                    url: wp.ajax.settings.url,
                    data: {
                        action: 'pikart_gallery_update_ajax',
                        galleryIds: ids,
                        pikart_gallery_nonce: $('#pikart_gallery_nonce').val()
                    },
                    success: function (response) {
                        if (response.success) {
                            options['updateCallback'](ids, response.data);
                        }

                        refreshIcon.hide();
                    }
                });
            });

            frame.open();
        },

        getSelection: function (galleryIds) {

            if (galleryIds.length < 1) {
                return null;
            }

            var shortcode = wp.shortcode.next('gallery', '[gallery ids="' + galleryIds.join(',') + '"]'),
                defaultPostId = wp.media.gallery.defaults.id,
                attachments, selection;

            if (!shortcode) {
                return;
            }

            // Ignore the rest of the match object.
            shortcode = shortcode.shortcode;

            if (_.isUndefined(shortcode.get('id')) && !_.isUndefined(defaultPostId)) {
                shortcode.set('id', defaultPostId);
            }

            attachments = wp.media.gallery.attachments(shortcode);
            selection = new wp.media.model.Selection(attachments.models, {
                props: attachments.props.toJSON(),
                multiple: true
            });

            selection.gallery = attachments.gallery;

            // Fetch the query's attachments, and then break ties from the
            // query to allow for sorting.
            selection.more().done(function () {
                // Break ties with the query.
                selection.props.set({query: false});
                selection.unmirror();
                selection.props.unset('orderby');
            });

            return selection;
        }
    };
});