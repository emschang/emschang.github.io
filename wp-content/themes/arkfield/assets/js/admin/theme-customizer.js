if (typeof arkfieldCustomizerData === 'undefined') {
    arkfieldCustomizerData = {
        optionsConfig: {
            style: [],
            text: [],
            cssFilters: []
        }
    };
}

(function ($) {
    "use strict";

    var buildSettingId = function ($id) {
        return 'arkfield_setting_' + $id;
    };

    var buildCustomizeControlId = function ($id) {
        return 'customize-control-' + buildSettingId($id);
    };

    var optionCssFilter = {
        size_unit_em: function (value) {
            return value + 'em';
        },
        size_unit_px: function (value) {
            return value + 'px';
        },
        reverse_percentage: function (value) {
            return (100 / parseInt(value)).toString() + '%';
        },
        font_family: function (value) {
            return "'" + value.split(':')[0].replace(/\+/g, ' ') + "'";
        }
    };

    var filterCssOption = function (optionId, value) {
        var cssFilters = arkfieldCustomizerData.optionsConfig.cssFilters;

        if (cssFilters.hasOwnProperty(optionId)) {
            var filterName = cssFilters[optionId];

            if (optionCssFilter.hasOwnProperty(filterName)) {
                return optionCssFilter[filterName](value);
            }
        }

        return value;
    };


    var optionsStyleConfig = arkfieldCustomizerData.optionsConfig.style;

    Object.keys(optionsStyleConfig).forEach(function (optionId) {
        var optionConfig = optionsStyleConfig[optionId];

        wp.customize(optionId, function (value) {
            value.bind(function (to) {
                to = filterCssOption(optionId, to);

                Object.keys(optionConfig).forEach(function (elementProperty) {
                    var elements = optionConfig[elementProperty].join(', ');
                    $(elements).css(elementProperty, to);
                });
            });
        });
    });

    var optionsTextConfig = arkfieldCustomizerData.optionsConfig.text;

    Object.keys(optionsTextConfig).forEach(function (optionId) {
        var elements = optionsTextConfig[optionId];

        wp.customize(optionId, function (value) {
            value.bind(function (to) {
                $(elements.join(', ')).text(to);
            });
        });
    });

    var getControlElement = function (controlId, element) {
        return $('#' + buildCustomizeControlId(controlId) + ' ' + element, parent.document);
    };

    var adjustLogoDimension = function (scalingVal) {
        var logoDimension = getControlElement('logo_dimension', 'input'),
            logo = $('#logo-image'),
            minWidth = parseInt(logoDimension.data('min-width')),
            maxWidth = parseInt(logoDimension.data('max-width')),
            minHeight = parseInt(logoDimension.data('min-height')),
            maxHeight = parseInt(logoDimension.data('max-height'));

        var computeRealLogoDimension = function (minDimVal, maxDimVal) {
            return (maxDimVal - minDimVal) * parseInt(scalingVal) / parseInt(logoDimension.attr('max')) + minDimVal;
        };

        if (logo.prop('naturalWidth') / logo.prop('naturalHeight') > maxWidth / maxHeight) {
            logo.width(computeRealLogoDimension(minWidth, maxWidth));
            logo.height('auto');
        } else {
            logo.height(computeRealLogoDimension(minHeight, maxHeight));
            logo.width('auto');
        }
    };

    wp.customize(buildSettingId('logo_image'), function (value) {
        value.bind(function (to) {
            var logoImage = $('#logo-image'),
                logoText = $('#logo-text');

            logoImage.load(function () {
                adjustLogoDimension(getControlElement('logo_dimension', 'input').val());
            });

            if ('' === to) {
                logoText.show();
                logoImage.hide();
            } else {
                logoText.hide();
                logoImage.show();
            }

            logoImage.attr('src', to);
        });
    });

    wp.customize(buildSettingId('logo_dimension'), function (value) {
        value.bind(function (to) {
            adjustLogoDimension(to);
        });
    });

    var logoImage = $('#logo-image');

    if (!$('#logo-text').length) {
        var logoTextVal = getControlElement('logo_text', 'input').val();
        var logoTextStyle = logoImage.length ? 'style="display: none"' : '';
        $(".navigation--logo a").append('<span id="logo-text" ' + logoTextStyle + '>' + logoTextVal + '</span>');
    }

    if (!logoImage.length) {
        $(".navigation--logo a").append('<img id="logo-image" style="display: none"/>');
    }

    var sortSelectOptions = function (selectElement) {
        var selectList = selectElement.find('option');

        selectList.sort(function (option1, option2) {
            if (option1.value === option2.value) {
                return 0;
            }

            return option1.value < option2.value ? -1 : 1;
        });

        selectElement.html(selectList);
    };


    getControlElement('add_google_font', 'label').append('<span id="google-font-message"></span>');

    getControlElement('add_google_font', 'input').click(function () {
        var googleFontEl = getControlElement('google_font', ' input'),
            googleFont = googleFontEl.val().trim(),
            urlEncodedGoogleFont = encodeURIComponent(googleFont),
            googleFontMessage = $('#google-font-message', parent.document);

        googleFontMessage.text('');

        $.ajax({
            method: "POST",
            url: wp.ajax.settings.url,
            data: {
                action: 'add_google_font',
                googleFont: urlEncodedGoogleFont
            },
            success: function (response) {
                if (response.success) {
                    googleFontMessage.text(response.data.message);
                    $('head style').last().append(response.data.fontContent);

                    var fontName = googleFont.split(':')[0].replace(/\+/g, ' ');
                    var fontOption = $("<option></option>").attr("value", googleFont).text(fontName);

                    sortSelectOptions(getControlElement('heading_font_family', 'select').append(fontOption));
                    sortSelectOptions(getControlElement('text_font_family', 'select').append(fontOption.clone()));

                    googleFontEl.val('');
                } else {
                    googleFontMessage.text(response.data);
                }
            },
            error: function (message) {
                googleFontMessage.text(message);
            }
        });
    });
})(jQuery);
