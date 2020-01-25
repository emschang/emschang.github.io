"use strict";

(function ($) {
    $(document).ready(function () {
        if (pagenow !== 'post') {
            return;
        }

        var audioPostFormatMetaBox = $('#audio_post_format');

        if ($('#post-format-audio').is(':checked')) {
            audioPostFormatMetaBox.show();
        } else {
            audioPostFormatMetaBox.hide();
        }

        $('input:radio[name="post_format"]').click(function () {
            if ($(this).is(':checked')) {
                if ($(this).val() === 'audio') {
                    audioPostFormatMetaBox.show();
                } else {
                    audioPostFormatMetaBox.hide();
                }
            }
        });

    });
})(jQuery);