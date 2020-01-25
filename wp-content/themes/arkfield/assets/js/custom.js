if (typeof themeCustomOptions === 'undefined') {
    themeCustomOptions = {
        "footerWidgetsNbColumns": 3,
        "projectsLazyLoad": 1,
        "colors": []
    };
}

(function ($) {
    "use strict";

    $(document).ready(function () {

        // VIEWPORT
        var viewportWidth = viewport().width;

        $(window).resize(function () {
            viewportWidth = viewport().width;
        });

        // INIT
        runPreLoader();
        runBackToTop();

        // HEADER
        processLogo();
        runMenuProcessor();

        // FOOTER
        adjustWidgetBorderHeight();
        hideBorderFromLastElementOfRow();

        // ISOTOPE
        runDiaryIsotope();
        runIsotopeAnimations();
        runSingleGalleryIsotope();
        runShopIsotope();

        // ANIMATIONS
        runAnimatedItems();
        animateProgressBars();
        initSinglePopupImage();
        initGalleryPopupImages();

        // GOOGLE MAP
        initCustomGmap();

        // SLIDERS
        runFullScreenSlider();
        mouseCursor();
        runQuotesSlider();
        runPostFormatGallerySlider();
        updateRoyalSliderCount();

        // WINDOW SIZE
        runDeviceSize();
        runWindowResizeEvent();

        // POST FORMATS
        setQuotePostFormat();
        setVideoPostFormat();

        // ADJUSTMENTS
        adjustPikodeColumnMargin();
        adjustTeamMemberItems();
        fixIconColor();
        runFluidVideos();
        runFluidAudio();
        contentFilter();
        moveProjectGalleryToBrowserMargin();
        removeDiaryUselessRows();
        setPageBuilderMargins();
        wooCommerceHooks();
        updateHeaderShoppingCart();


        /* Viewport
         /*******************************************************/
        function viewport() {
            var element = window,
                dimensionPrefix = 'inner';

            if (!('innerWidth' in window)) {
                dimensionPrefix = 'client';
                element = document.documentElement || document.body;
            }

            return {
                width: element[dimensionPrefix + 'Width'],
                height: element[dimensionPrefix + 'Height']
            };
        }


        /* Initialize
         /*******************************************************/
        function runPreLoader() {
            $(window).load(function () {
                $('#preloader').fadeOut(1000, 'easeInBack');
            });
        }

        function runBackToTop() {
            $('.btn--top').on('click', function (event) {
                event.preventDefault();
                $('html, body').animate({
                        scrollTop: 0
                    }, 750, 'easeInOutCirc'
                );
            });
        }


        /* Header
         /*******************************************************/
        function processLogo() {
            var logoProcessor = {
                setLogoDimensions: function () {
                    var logo = $('#logo-image');

                    if (logo.length) {
                        var logoMaxWidth = parseInt(logo.data('max-width')),
                            logoMaxHeight = parseInt(logo.data('max-height'));

                        if (logo.prop('naturalWidth') / logo.prop('naturalHeight') > logoMaxWidth / logoMaxHeight) {
                            logo.width(logo.data('width'));
                            logo.height('auto');
                        } else {
                            logo.height(logo.data('height'));
                            logo.width('auto');
                        }
                    }
                },

                computeLogoMaxHeight: function () {
                    var topBarHeight = $('.main-menu > .menu-item').height(),
                        defaultHeight = topBarHeight,
                        menuItemPosition = 0;
                    $('.main-menu > li').each(function () {
                        if (menuItemPosition != $(this).offset().top) {
                            menuItemPosition = $(this).offset().top;
                            topBarHeight = defaultHeight + menuItemPosition;
                        }
                    });
                    $('.navbar-logo img').css({'max-height': topBarHeight});
                }
            };

            $(window).load(function () {
                logoProcessor.setLogoDimensions();
                logoProcessor.computeLogoMaxHeight();
            });
        }

        function runMenuProcessor() {
            var headerMenus = $('.flexbox__item--menus'),
                mainMenu = $('.menu--main'),
                windowWidth = viewportWidth,
                mainMenuItem = mainMenu.find('>.menu-item').find('>a'),
                socialMenuItem = $('.menu--social').find('.menu-item'),
                siteHeader = $('#site-header');

            if (viewportWidth < 1025) {
                headerMenus.css({'left': -windowWidth}); // hide initially Main Menu
            }

            var menuItemsHeight = function () {
                var row = 1,
                    initOffset = mainMenu.find('>.menu-item:first-child').offset().top,
                    subMenu = $('.sub-menu'),
                    wcCart = siteHeader.find('.wc-cart--link');

                if (viewportWidth > 1024) {

                    if (mainMenu.height() > mainMenuItem.height()) {

                        mainMenuItem.css('height', '4rem');
                        mainMenu.find('>.menu-item').each(function () {
                            if(initOffset != $(this).offset().top) {
                                initOffset = $(this).offset().top;
                                row ++;
                            }
                        });
                        siteHeader.add(socialMenuItem).add(wcCart).css({'height': 4*row + 'rem'});
                        subMenu.css('padding-bottom', '0.5rem');
                        subMenu.find('.sub-menu').css('padding-top', '1.75rem');

                    } else if (mainMenu.height() == mainMenuItem.height()) {

                        mainMenuItem.add(socialMenuItem).add(siteHeader).add(wcCart).css('height', '6rem');
                        subMenu.css('padding-bottom', '1.75rem');
                        subMenu.find('.sub-menu').css('padding-top', '2.625rem');

                    }
                } else {
                    siteHeader.css('height', '6rem');
                    mainMenuItem.add(socialMenuItem).add(wcCart).css('height', '4rem');
                    subMenu.css('padding-bottom', '0');
                    subMenu.find('.sub-menu').css('padding-top', '0');
                }
            }

            // adjusting Header Menu on different window sizes
            $(window).on('resize', menuItemsHeight);
            menuItemsHeight();

            var menuProcessor = {
                run: function () {
                    this.registerOnMenuButtonClickEvent();
                    this.registerOnWindowResizeEvent();
                    this.processMenuItemsWithChildren();
                },

                registerOnMenuButtonClickEvent: function () {
                    $('.navigation--btn').click(function (e) {
                        e.preventDefault();
                        var $this = $(this),
                            $html = $('html'),
                            $body = $('body');

                        if ($this.hasClass('animout')) {

                            headerMenus.animate({left: -windowWidth});
                            $html.css({'height': '', 'overflow-y': 'scroll'});
                            $this.removeClass('animout');

                        } else {

                            headerMenus.animate({left: 0});
                            $html.css({'height': '100%', 'overflow-y': 'hidden'});
                            $this.addClass('animout');

                        }
                    });
                },

                registerOnWindowResizeEvent: function () {
                    $(window).resize(function () {
                        windowWidth = viewportWidth;

                        // resetting header menu
                        headerMenus.css({'left': -windowWidth});
                        $('.navigation--btn').removeClass('animout');
                        $('html').css({'height': '', 'overflow-y': 'scroll'});
                        $('body').css({'height': ''});
                    });
                },

                processMenuItemsWithChildren: function () {
                    var menuItemsWithChildren = mainMenu.find('.menu-item-has-children'),
                        firstLevelMenuItemsWithChildren = mainMenu.find('>.menu-item-has-children');

                    menuItemsWithChildren.find('>a').find('span').addClass('menu-item--children');

                    var hoverMenuItemsDesk = function () {
                        var subMenu = mainMenu.find('.sub-menu');

                        menuItemsWithChildren.bind('mouseenter mouseleave');
                        firstLevelMenuItemsWithChildren.find('>a').css('color', '#000');
                        subMenu.hide();
                        // push submenus to the left
                        var headerSubmenu = subMenu.find('.menu-item-has-children').find('.sub-menu');
                        if (!$('body').hasClass('rtl')) {
                            headerSubmenu.css({'left': $('.menu--main').find('.menu-item').width(), 'top': '0'});
                        } else {
                            headerSubmenu.css({'right': $('.menu--main').find('.menu-item').width(), 'top': '0'});
                        }

                        menuItemsWithChildren.mouseenter(function () {
                            $(this).find('>.sub-menu').fadeIn();
                        }).mouseleave(function () {
                            $(this).find('.sub-menu').fadeOut();
                        });

                        firstLevelMenuItemsWithChildren.find('>a').mouseleave(function () {
                            $(this).css('color', '#fff');
                        });

                        firstLevelMenuItemsWithChildren.mouseenter(function () {
                            $(this).find('>a').css('color', '#fff');
                        }).mouseleave(function () {
                            $(this).find('>a').css('color', '#000');
                        });
                    };

                    var hoverMenuItemsPortable = function () {
                        menuItemsWithChildren.unbind('mouseenter mouseleave');
                        firstLevelMenuItemsWithChildren.find('>a').css('color', '#fff');
                        $('.sub-menu').show();
                        // push submenus to the right
                        $('.sub-menu .menu-item-has-children').find('.sub-menu').css({'left': '0', 'top': '0'});
                    };

                    if (viewportWidth > 1024) {
                        hoverMenuItemsDesk();
                    }

                    $(window).resize(function () {
                        if (viewportWidth > 1024) {
                            hoverMenuItemsDesk();
                        } else {
                            hoverMenuItemsPortable();
                        }
                    });
                }
            };

            menuProcessor.run();
        }


        /* Footer
         /*******************************************************/
        function adjustWidgetBorderHeight() {
            $(window).load(function () {

                if (viewportWidth > 1024) {
                    var footerWidgetsNbColumns = themeCustomOptions.footerWidgetsNbColumns,
                        elementsClass = '.widget-item',
                        maxRowHeight = 0,
                        maxRowsHeight = [];

                    // if only one column, skip height adjustment
                    if (footerWidgetsNbColumns < 2) {
                        return;
                    }

                    // build an array with the max height for each row
                    $(elementsClass).each(function (index) {
                        if (index % footerWidgetsNbColumns === 0) {
                            if (maxRowHeight !== 0) {
                                maxRowsHeight.push(maxRowHeight);
                            }
                            maxRowHeight = $(this).height();
                        } else if ($(this).height() > maxRowHeight) {
                            maxRowHeight = $(this).height();
                        }
                    });

                    if (maxRowHeight !== 0) {
                        maxRowsHeight.push(maxRowHeight);
                    }

                    // adjust the height for each row
                    maxRowsHeight.forEach(function (maxHeight, index) {
                        var startIndex = footerWidgetsNbColumns * index,
                            endIndex = footerWidgetsNbColumns * index + footerWidgetsNbColumns;
                        $(elementsClass).slice(startIndex, endIndex).height(maxHeight);
                    });
                }
            })

        }

        function hideBorderFromLastElementOfRow() {
            var childrenIndex = themeCustomOptions.footerWidgetsNbColumns + 'n+' + themeCustomOptions.footerWidgetsNbColumns;
            $('.widget-item:nth-child(' + childrenIndex + ')').css({'border': '1px solid rgba(255, 255, 255, 0)'});
        }

        function adjustArticlesSpeed(container, itemSelector) {

            var initContainer = function (postsContainer) {
                var maxHeightRowElClass = 'max-height-row-item',
                    highestRowElements = [],
                    items = postsContainer.find(itemSelector);

                return {
                    initItems: function () {
                        if (items.length < 2) {
                            return;
                        }

                        var maxHeightRowEl = 0,
                            highestRowEl;

                        items.each(function (index) {
                            var element = $(this),
                                elHeight = element.height(),
                                isFirstEl = index % 3 === 0;

                            if (isFirstEl && maxHeightRowEl > 0) {
                                highestRowEl.addClass(maxHeightRowElClass);
                                highestRowElements.push(highestRowEl);
                            }

                            if (isFirstEl || elHeight > maxHeightRowEl) {
                                maxHeightRowEl = elHeight;
                                highestRowEl = element;
                            }

                            if (items.length === index + 1) {
                                highestRowEl.addClass(maxHeightRowElClass);
                                highestRowElements.push(highestRowEl);
                            }
                        });
                    },

                    setItemsPosition: function () {
                        if (items.length < 2 || viewportWidth < 1025) {
                            items.each(function () {
                                $(this).css('transform', 'translateY(0px)');
                            });
                            return;
                        }

                        var windowScrollTop = $(window).scrollTop(),
                            windowHeight = $(window).height();

                        items.each(function (index) {
                            var item = $(this);

                            if (item.hasClass(maxHeightRowElClass)) {
                                return;
                            }

                            var highestRowElement = highestRowElements[parseInt(index / 3)],
                                highestRowElementVisiblePos = windowScrollTop + windowHeight - highestRowElement.offset().top;

                            if (highestRowElementVisiblePos > 0) {
                                var highestRowElementHeight = highestRowElement.height(),
                                    itemHeight = item.height(),
                                    itemHeightDiff = highestRowElementHeight - itemHeight,
                                    speedIndex = itemHeight > itemHeightDiff ? itemHeightDiff : itemHeight;

                                speedIndex = speedIndex > windowHeight ? windowHeight - 100 * speedIndex / windowHeight : speedIndex;
                                var offsetY = speedIndex * (1 - highestRowElementVisiblePos / windowHeight);

                                item.css('transform', 'translateY(' + offsetY + 'px)');
                            }
                        });
                    }
                }
            };

            if (!itemsSpeedActive(container)) {
                $(window).resize(function () {
                    container.isotope('layout');
                });
                return;
            }

            var postsContainer = initContainer(container);
            postsContainer.initItems();
            postsContainer.setItemsPosition();

            $(window).scroll(postsContainer.setItemsPosition);

            $(window).resize(function () {
                postsContainer.setItemsPosition();
                container.isotope('layout');
            });
        }

        function runIsotopeForMovingItems(containerSelector, itemSelector) {
            $(window).load(function () { // necessary to load all images for isotope
                $(containerSelector).each(function () {
                    var container = $(this);

                    // init Isotope
                    container.isotope({
                        isOriginLeft: !isRtl(),
                        itemSelector: itemSelector,
                        layoutMode: itemsSpeedActive(container) && viewportWidth > 1024 ? 'fitRows' : 'masonry'
                    });

                    adjustArticlesSpeed(container, itemSelector);
                });
            });
        }

        /* Isotope
         /*******************************************************/
        function runDiaryIsotope() {
            runIsotopeForMovingItems('.news', '.news__item');
        }

        function runShopIsotope() {
            runIsotopeForMovingItems('.woocommerce-products', '.product');
        }

        function runIsotopeAnimations() {
            $(window).load(function () { // necessary to load all images for isotope
                $('.mesh').each(function () {
                    var container = $(this);

                    // init Isotope
                    container.isotope({
                        isOriginLeft: !isRtl(),
                        itemSelector: '.mesh__item'
                    });

                    // setting the filter options
                    var optionLinks = $('.mesh__filter').find('.mesh__filter__options').find('a');

                    optionLinks.click(function (e) {
                        e.preventDefault();

                        var isotopeButton = $(this);

                        // don't proceed if already selected
                        if (isotopeButton.hasClass('btn--selected')) {
                            return;
                        }

                        var filterValue = isotopeButton.attr('data-option-value'),
                            filterContainer = isotopeButton.parents('.mesh__filter__options');

                        // Buttons Active State
                        filterContainer.find('.btn--selected').removeClass('btn--selected').addClass('btn--not-selected').animate(500);
                        isotopeButton.removeClass('btn--not-selected').addClass('btn--selected').animate(500);

                        // Isotope filter
                        container.isotope({filter: filterValue});
                    });

                    // adjusting speed elements
                    adjustFullGridProjectsSpeed();

                    function adjustFullGridProjectsSpeed() {
                        var initContainer = function (grid) {
                            var items = grid.find('.mesh__item'),
                                firstItem = items.first(),
                                thirdItem = items.filter(':eq(2)'),
                                referencePositions = [firstItem.offset().left],
                                maxRefHeight = firstItem.height();

                            if (thirdItem.length) {
                                maxRefHeight = Math.max(maxRefHeight, thirdItem.height());
                                referencePositions.push(thirdItem.offset().left);
                            }

                            var movingItems = items.filter(function () {
                                return referencePositions.indexOf($(this).offset().left) >= 0;
                            });

                            return {
                                setItemsPosition: function () {
                                    if (movingItems.length < 1) {
                                        return;
                                    }

                                    if (viewportWidth < 1025) {
                                        movingItems.each(function () {
                                            $(this).css('transform', 'translateY(0px)');
                                        });
                                        return;
                                    }

                                    var windowScrollTop = $(window).scrollTop(),
                                        windowHeight = $(window).height(),
                                        refHeight = Math.min(windowHeight, maxRefHeight),
                                        delta = 50,
                                        firstItemTop = firstItem.offset().top,
                                        firstItemVisiblePos = windowScrollTop + windowHeight - firstItemTop - refHeight - delta;

                                    if (firstItemVisiblePos > 0) {
                                        var coefficient = 4,
                                            offsetY;

                                        if (windowHeight > firstItemTop + refHeight + delta) {
                                            offsetY = -windowScrollTop / coefficient;
                                        } else {
                                            offsetY = -firstItemVisiblePos / coefficient;
                                        }

                                        movingItems.each(function () {
                                            $(this).css('transform', 'translateY(' + offsetY + 'px)');
                                        });
                                    }
                                }
                            };
                        };

                        var grid = container.closest('.page-builder--fullgrid');

                        if (grid.length < 1 || !itemsSpeedActive(grid)) {
                            $(window).resize(function () {
                                container.isotope('layout');
                            });
                            return;
                        }

                        var gridContainer = initContainer(grid);
                        gridContainer.setItemsPosition();

                        $(window).scroll(gridContainer.setItemsPosition);
                        $(window).resize(function () {
                            gridContainer.setItemsPosition();
                            container.isotope('layout');
                        });
                    }
                })
            });
        }

        function runSingleGalleryIsotope() {
            var mainSite = $('.site-main');

            if (!mainSite.hasClass('site-main--diary')) {
                mainSite.find('.gallery').each(function () {
                    if (!$(this).closest('.page-builder').hasClass('page-builder--diary')) {
                        $(this).addClass('pikartgallery');
                    }
                });
            }
            $(window).load(function () { // necessary to load all images for isotope
                $('.pikartgallery').each(function () {
                    var container = $(this);

                    container.isotope({
                        isOriginLeft: !isRtl(),
                        itemSelector: '.gallery-item'
                    });

                    // fixing windowResize problems
                    $(window).resize(function () {
                        container.isotope('layout');
                    });
                });
            });
        }

        /* Animations
         /*******************************************************/
        function runAnimatedItems() {
            $(window).load(function () {
                if (viewportWidth > 600) {
                    var animateElement = function () {
                        var elem = $(this);

                        if (!elem.hasClass('visible')) {
                            setTimeout(function () {
                                elem.addClass(elem.data('animation') + " visible");
                            }, parseInt(elem.data('animation-delay')));
                        }
                    };

                    if (parseInt(themeCustomOptions.projectsLazyLoad)) {
                        $('.animated').appear(animateElement);
                    } else {
                        $('.animated').each(animateElement);
                    }
                } else {
                    $('.animated').addClass("visible");
                }
            });
        }

        function animateProgressBars() {
            $(window).load(function () {
                $('.progressbar__progress').each(function () {
                    var element = $(this),
                        percentText = element.closest('.progressbar').find('.progressbar__number'),
                        percent = element.data('pro-bar-percent');

                    if (!element.hasClass('animated-bar')) {
                        element.css({'width': '0%'});
                    }

                    element.appear(function () {
                        setTimeout(function () {
                            element.animate(
                                {
                                    width: percent + '%'
                                },
                                {
                                    duration: 1000,
                                    progress: function () {
                                        percentText.text(percent);
                                    }
                                },
                                2000,
                                'easeInOutCirc'
                            ).addClass('animated-bar');
                        }, 750);
                    });
                });
            });
        }

        function initSinglePopupImage() {

            $('[class*=wp-image]').each(function () {
                var wpImage = $(this);
                if (!wpImage.parents().hasClass('gallery')) {
                    wpImage.parent('a').wrap("<div class='wp-image-container'></div>");
                }
            });

            $('.wp-image-container').magnificPopup({
                callbacks: {
                    close: function () {
                        $('html').css({'height': '', 'overflow-y': 'scroll'});
                        $('body').css({'height': ''});
                    },
                    imageLoadComplete: function () {
                        var self = this;
                        self.wrap.addClass('mfp-image-loaded');
                    },
                    open: function () {
                        $('html').css({'height': '100%', 'overflow-y': 'hidden'});
                        $('body').css({'height': '100%'});
                    }
                },
                delegate: 'a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".gif"]',
                fixedContentPos: true,
                image: {
                    markup: '<div class="mfp-figure">' +
                    '<div class="mfp-close"></div>' +
                    '<div class="mfp-img"></div>' +
                    '<div class="mfp-bottom-bar">' +
                    '<div class="mfp-title"></div>' +
                    '<div class="mfp-counter"></div>' +
                    '</div>' +
                    '</div>',
                    titleSrc: function (item) {
                        return '<span>' + item.el.find('img').attr('alt') + '</span>';
                    }
                },
                mainClass: 'mfp-zoom-in',
                removalDelay: 500,
                tLoading: '<div class="preloader"><div class="ball-pulse"><div></div><div></div><div></div></div></div>',
                type: 'image',
                zoom: {
                    enabled: true,
                    duration: 500, // don't forget to change the duration also in CSS
                    easing: 'ease-in-out'
                }
            });
        }

        function initGalleryPopupImages() {
            var lightBox = {

                init: function () {
                    var self = this,
                        popupWrapper = $('.gallery, .woocommerce div.product div.images, .page-builder--gallery .mesh--two-columns, .page-builder--gallery .mesh--three-columns, .page-builder--gallery .mesh--fullgrid');
                    popupWrapper.each(function () {
                        self.galleyBox($(this));
                    });
                },

                galleyBox: function (element) {
                    element.magnificPopup({
                        callbacks: {
                            close: function () {
                                $('html').css({'height': '', 'overflow-y': 'scroll'});
                                $('body').css({'height': ''});
                            },
                            imageLoadComplete: function () {
                                var self = this;
                                self.wrap.addClass('mfp-image-loaded');
                            },
                            open: function () {
                                $('html').css({'height': '100%', 'overflow-y': 'hidden'});
                                $('body').css({'height': '100%'});
                            }
                        },
                        delegate: 'a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".gif"]',
                        fixedContentPos: true,
                        gallery: {
                            enabled: true,
                            tPrev: 'Previous',
                            tNext: 'Next',
                            tCounter: '%curr% <span class="separator">/ </span><span class="sup-count">%total%</span>',
                            arrowMarkup: '<a class="mp-action mp-arrow-%dir% mfp-prevent-close" title="%title%"></a>'
                        },
                        image: {
                            markup: '<div class="mfp-figure">' +
                            '<div class="mfp-close"></div>' +
                            '<div class="mfp-img"></div>' +
                            '<div class="mfp-bottom-bar">' +
                            '<div class="mfp-title"></div>' +
                            '<div class="mfp-counter"></div>' +
                            '</div>' +
                            '</div>',
                            titleSrc: function (item) {
                                return '<span>' + item.el.find('img').attr('alt') + '</span>';
                            }
                        },
                        mainClass: 'mfp-zoom-in',
                        removalDelay: 500,
                        tLoading: '<div class="preloader"><div class="ball-pulse"><div></div><div></div><div></div></div></div>',
                        type: 'image',
                        zoom: {
                            enabled: true,
                            duration: 500, // don't forget to change the duration also in CSS
                            easing: 'ease-in-out',
                            opener: function (element) {
                                return element.find('img');
                            }
                        }
                    });
                }
            };

            lightBox.init();
        }


        /* Google Map
         /*******************************************************/
        function initCustomGmap() {
            var customGmap = {

                run: function (config) {
                    var initMap = function () {
                        customGmap.init(config);
                    };

                    google.maps.event.addDomListener(window, 'load', initMap);
                    google.maps.event.addDomListener(window, 'resize', initMap);
                },

                init: function (config) {
                    var latLong = new google.maps.LatLng(config.latitude, config.longitude),
                        isDraggable = !('ontouchstart' in document.documentElement),
                        map = new google.maps.Map(
                        document.getElementById(config.elementId),
                        {
                            center: latLong,
                            draggable: isDraggable,
                            scrollwheel: false,
                            styles: customGmap.styles,
                            zoom: 13
                        }
                    );

                    new google.maps.Marker({
                        map: map,
                        draggable: false,
                        icon: {
                            url: config.markerIconUrl,
                            scaledSize: new google.maps.Size(49, 80)
                        },
                        position: latLong,
                        title: "HALLO"
                    });
                },

                styles: [
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [
                            {"visibility": "on"}
                        ]
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.fill",
                        stylers: [
                            {"color": '#b7b7b7'}
                        ]
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [
                            {"visibility": 'on'},
                            {"color": getFeatureColor()},
                            {"weight": 1}
                        ]
                    },
                    {
                        featureType: "road.arterial",
                        elementType: "geometry.fill",
                        stylers: [
                            {"visibility": 'on'},
                            {"color": '#ffffff'}
                        ]
                    },
                    {
                        featureType: "road.arterial",
                        elementType: "geometry.stroke",
                        stylers: [
                            {"visibility": 'on'},
                            {"color": getFeatureColor()},
                            {"lightness": 40}
                        ]
                    },
                    {
                        featureType: "road.local",
                        elementType: "geometry.fill",
                        stylers: [
                            {"weight": 0.2},
                            {"color": getFeatureColor()},
                            {"lightness": 50}
                        ]
                    },
                    {
                        featureType: "road",
                        elementType: "labels.icon",
                        stylers: [
                            {"visibility": "off"}
                        ]
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.stroke",
                        stylers: [
                            {"visibility": "off"}
                        ]
                    },
                    {
                        featureType: "landscape",
                        elementType: "all",
                        stylers: [
                            {"visibility": "on"},
                            {"color": "#f7f7f7"}
                        ]
                    },
                    {
                        featureType: "landscape",
                        elementType: "labels.text.fill",
                        stylers: [
                            {"visibility": "on"},
                            {"color": "#363636"}
                        ]
                    },
                    {
                        featureType: "landscape",
                        elementType: "labels.text.stroke",
                        stylers: [
                            {"visibility": "off"}
                        ]
                    },
                    {
                        featureType: "poi",
                        elementType: "geometry",
                        stylers: [
                            {"color": "#e7e7e7"},
                            {"lightness": 50}
                        ]
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.icon",
                        stylers: [
                            {"visibility": "off"}
                        ]
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [
                            {"visibility": "on"},
                            {"color": "#363636"}
                        ]
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.stroke",
                        stylers: [
                            {"visibility": "off"}
                        ]
                    },
                    {
                        featureType: "transit",
                        elementType: "labels.icon",
                        stylers: [
                            {"visibility": "off"}
                        ]
                    },
                    {
                        featureType: "transit",
                        elementType: "labels.text.stroke",
                        stylers: [
                            {"visibility": "off"}
                        ]
                    },
                    {
                        featureType: "administrative",
                        elementType: "labels.text",
                        stylers: [
                            {"visibility": "simplified"},
                            {"color": getFeatureColor()}
                        ]
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [
                            {"color": getFeatureColor()}
                        ]
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [
                            {"visibility": "on"},
                            {"color": '#b7b7b7'}
                        ]
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.stroke",
                        stylers: [
                            {"visibility": "off"}
                        ]
                    }
                ]
            };

            $('.page-builder--gmap').each(function (index, element) {
                customGmap.run({
                    latitude: parseFloat($(element).data('gmap-latitude')),
                    longitude: parseFloat($(element).data('gmap-longitude')),
                    elementId: $(element).attr('id'),
                    markerIconUrl: $(element).data('marker-icon-url')
                });
            });
        }


        /* Sliders
         /*******************************************************/
        function runFullScreenSlider() {

            var adjustSliderDimensions = function () {
                $('.pikartslider--fullscreen').css({
                    width: viewportWidth,
                    height: $(window).height() - 96
                });
            };

            var pikartsliderFullscreen = $('.pikartslider--fullscreen');

            $(window).on('resize', adjustSliderDimensions);
            adjustSliderDimensions();

            pikartsliderFullscreen.royalSlider({
                arrowsNavAutoHide: false,
                autoPlay: {
                    enabled: true,
                    delay: 7000
                },
                controlNavigation: 'none',
                imageScaleMode: 'fill',
                imageScalePadding: 0,
                keyboardNavEnabled: true,
                loop: true,
                slidesSpacing: 0
            });
        }

        function mouseCursor() {
            $('.rsArrowLeft').mouseleave(function () {
                $(this).find('.rsArrowIcn').hide();
            }).mouseenter(function () {
                $(this).find('.rsArrowIcn').show();
            });

            $('.rsArrowRight').mouseleave(function () {
                $(this).find('.rsArrowIcn').hide();
            }).mouseenter(function () {
                $(this).find('.rsArrowIcn').show();
            });

            $('.rsArrow').mousemove(function (e) {
                var $this = $(this);
                $this.find('.rsArrowIcn').css('left', e.pageX - $this.offset().left).css('top', e.pageY - $this.offset().top);
            });
        }

        function runQuotesSlider() {

            $('.pikartslider--quote').each(function () {

                var $slider = $(this),
                    rs_arrows = typeof $slider.data('arrows') !== "undefined",
                    rs_bullets = typeof $slider.data('bullets') !== "undefined" ? "bullets" : "none",
                    rs_autoheight = typeof $slider.data('autoheight') !== "undefined",
                    rs_slidesSpacing = typeof $slider.data('slidesspacing') !== "undefined"
                        ? parseInt($slider.data('slidesspacing')) : 0,
                    rs_keyboardNav = typeof $slider.data('fullscreen') !== "undefined",
                    rs_transition = typeof $slider.data('slidertransition') !== "undefined" && $slider.data('slidertransition') != ''
                        ? $slider.data('slidertransition') : 'move',
                    rs_autoPlay = typeof $slider.data('sliderautoplay') !== "undefined",
                    rs_delay = typeof $slider.data('sliderdelay') !== "undefined" && $slider.data('sliderdelay') != ''
                        ? $slider.data('sliderdelay') : '1000',
                    rs_pauseOnHover = typeof $slider.data('sliderpauseonhover') !== "undefined",
                    rs_drag = true;


                var $children = $(this).children();

                if ($children.length == 1) {
                    rs_arrows = false;
                    rs_bullets = 'none';
                    rs_keyboardNav = false;
                    rs_drag = false;
                    rs_transition = 'fade';
                }

                var royalSliderParams = {
                    arrowsNav: rs_arrows,
                    arrowsNavAutoHide: false,
                    autoPlay: {
                        enabled: rs_autoPlay,
                        stopAtAction: true,
                        pauseOnHover: rs_pauseOnHover,
                        delay: rs_delay
                    },
                    controlNavigation: rs_bullets,
                    controlsInside: false,
                    keyboardNavEnabled: rs_keyboardNav,
                    loop: true,
                    numImagesToPreload: 2,
                    sliderDrag: rs_drag,
                    slidesSpacing: rs_slidesSpacing,
                    transitionType: rs_transition
                };

                if (rs_autoheight) {
                    royalSliderParams['autoHeight'] = true;
                    royalSliderParams['autoScaleSlider'] = false;
                    royalSliderParams['imageScaleMode'] = 'none';
                    royalSliderParams['imageAlignCenter'] = false;
                } else {
                    royalSliderParams['autoHeight'] = false;
                    royalSliderParams['autoScaleSlider'] = true;
                }

                $(window).load(function () {
                    $slider.royalSlider(royalSliderParams);
                })
            });
        }

        function runPostFormatGallerySlider() {

            var initRoyalSlider = function (gallery) {
                gallery.find('img').addClass('rsImg');

                gallery.royalSlider({
                    arrowsNavAutoHide: false,
                    autoPlay: {
                        enabled: true
                    },
                    controlNavigation: 'none',
                    controlsInside: false,
                    imageScaleMode: 'fill',
                    imageScalePadding: 0,
                    keyboardNavEnabled: true,
                    loop: true,
                    numImagesToPreload: 2,
                    slidesSpacing: 1
                });
            };

            var pikartGallery,
                galleryPostFormat = $('[class*=format-gallery]'),
                articleContent = galleryPostFormat.find('.article__content'),
                mainContent = galleryPostFormat.find('.main__content');

            // init RoyalSlider Gallery for Post Single Pages
            mainContent.find('.gallery').eq(0).addClass('pikartslider pikartslider--gallery').removeClass('gallery pikartgallery');
            pikartGallery = $('.site-main--single').find('.pikartslider--gallery');
            initRoyalSlider(pikartGallery);

            // init RoyalSlider for Diary Posts
            $('.site-main--diary, .page-builder--diary').find(galleryPostFormat).find('.article__footer').remove();

            articleContent.each(function () {
                $(this).find('.gallery').eq(0).addClass('pikartslider pikartslider--gallery').removeClass('gallery');
                $(this).children().not('.pikartslider--gallery').remove();
                $(this).css('border', 'none');
            });

            $(window).load(function () { // don't delete this => necessary to 'fill' RoyalSlider images (isotope dependency)
                $('.site-main--diary, .site-main--page-builder').find('.pikartslider--gallery').each(function () {
                    initRoyalSlider($(this));
                });
            });
        }

        function updateRoyalSliderCount() {
            var royalSliderVariables = $('.pikartslider--fullscreen, .pikartslider--gallery');

            $(window).load(function () { // dont't delete this => .pikartslider--gallery RoyalSlider requires it
                royalSliderVariables.each(function () {
                    var slider = $(this);
                    var sliderInstance = slider.data('royalSlider');

                    if (sliderInstance) {
                        var slideCounter = $('<div class="rsSlideCount"></div>').appendTo(slider);

                        var updCount = function () {
                            var content = ( ( (sliderInstance.currSlideId < 9) ? '0' : '') ) + (sliderInstance.currSlideId + 1)
                                + '<span class="separator"> / </span>' + '<span class="sup-count">'
                                + ( (sliderInstance.numSlides < 10) ? '0' : '') + sliderInstance.numSlides + '</span>';
                            slideCounter.html(content);
                        };

                        sliderInstance.ev.on('rsAfterSlideChange', updCount);
                        updCount();
                    }
                });
            });
        }


        /* Window Size
         /*******************************************************/
        function runDeviceSize() {
            $(window).load(function () {
                var siteHeaderHeight = $('#site-header').height(),
                    $body = $('body'),
                    bodyHasAdminBarClass = $body.hasClass('admin-bar');

                if (viewportWidth < 1025) {
                    $body.addClass('device--mobile');

                    if (bodyHasAdminBarClass) {
                        siteHeaderHeight = siteHeaderHeight - $('#wpadminbar').height();
                    }
                } else {
                    $body.addClass('device--static');
                }

                // push site content from site-header
                $('.site-main').css('padding-top', siteHeaderHeight);
            });
        }

        function runWindowResizeEvent() {

            $(window).resize(function () {
                var $body = $('body'),
                    siteHeader = $('#site-header'),
                    mainSiteTopMargin = siteHeader.height();

                var swapBodyClasses = function (fromClass, toClass) {
                    if (!$body.hasClass(toClass)) {
                        $body.removeClass(fromClass);
                        $body.addClass(toClass);
                    }
                };

                if (viewportWidth < 1025) {

                    // create body class depending on device width
                    swapBodyClasses('device--static', 'device--mobile');

                    if ($body.hasClass('admin-bar')) {
                        mainSiteTopMargin = siteHeader.height() - $('#wpadminbar').height();
                    }

                } else {

                    // create body class depending on device width
                    swapBodyClasses('device--mobile', 'device--static');
                }

                // push site content from site-header
                $('.site-main').css('padding-top', mainSiteTopMargin);
            });
        }


        /* Post Formats
         /*******************************************************/
        function setQuotePostFormat() {
            $('.site-main--diary, .page-builder--diary').find('[class*=format-quote]').each(function () {
                $(this).find('.article__content').children().not('blockquote:first').remove();
            });
        }

        function setVideoPostFormat() {
            $('.site-main--diary, .page-builder--diary').find('[class*=format-video]').each(function () {
                var $footer = $(this).find('.article__footer'),
                    $FirstVideo = $(this).find('.article__content').find('iframe').first(),
                    players = /www.youtube.com|player.vimeo.com|vine.co/; // Extend this if you need more players

                $(this).find('.article__content').remove();
                if ($FirstVideo[0].src.search(players) > 0) {
                    $footer.html($FirstVideo);
                }
            });
        }


        /* Adjustments
         /*******************************************************/
        function adjustPikodeColumnMargin() {
            $('.pikode--column').find('img').closest('p').css('margin-bottom', 0);
        }

        function adjustTeamMemberItems() {
            var teamMemberParent = $('.pikode--team-member').parent('.pikode--column'),
                teamMember = $('.pikode--row').find('.pikode--column').find('.team-member');

            if (teamMemberParent.length < 1 && teamMember.length < 1) {
                return;
            }

            var adjustItems = function () {
                teamMemberParent.css({'border-left-width': '0.2rem'});
                teamMemberParent.parent('.row').css({'margin-bottom': '0rem', 'margin-left': '0'});
                teamMember.css({'margin-bottom': '0.2rem'});
            };

            if (viewportWidth > 600) {
                adjustItems();
            }

            $(window).resize(function () {
                if (viewportWidth < 601) {
                    teamMemberParent.css({'border-left-width': '0'});
                    teamMember.css({'margin-bottom': '1.714rem'});
                } else {
                    adjustItems();
                }
            });
        }

        function fixIconColor() {
            $('.pikode--icon').each(function () {
                if (!$(this).hasClass('circle') && !$(this).hasClass('rectangle')) {
                    $(this).addClass('pikode--color');
                }
            })
        }

        function contentFilter() {
            var setTopBorderForIsotopeFilters = function () {
                var filterOptions = $('.mesh__filter__options, .wc-tabs'),
                    initOffset = filterOptions.find('li:first-child').find('a').offset().top;

                filterOptions.find('a').each(function () {
                    var itemOffsetDiff = $(this).offset().top - initOffset,
                        itemBorder = itemOffsetDiff >= -1 && itemOffsetDiff <= 1 ? '1px solid #ebebeb' : 'none';

                    $(this).css('border-top', itemBorder);
                })
            };

            var filterMaxWidth = function () {
                var filterOptions = $('.mesh__filter__options');

                filterOptions.css('width', $('.mesh__filter').width());

                var currentLineOffsetTop = filterOptions.find('li').first().offset().top,
                    maxLineWidth = 0,
                    currentLineWidth = 0;

                filterOptions.find('li').each(function () {
                    var offsetTop = $(this).offset().top;

                    if (offsetTop === currentLineOffsetTop) {
                        currentLineWidth += $(this).width();
                    } else {
                        if (currentLineWidth > maxLineWidth) {
                            maxLineWidth = currentLineWidth;
                        }

                        currentLineOffsetTop = offsetTop;
                        currentLineWidth = $(this).width();
                    }
                });

                if (currentLineWidth > maxLineWidth) {
                    maxLineWidth = currentLineWidth;
                }

                filterOptions.css('width', maxLineWidth + 1);
            };

            if ($('.page-builder').hasClass('page-builder--projects')) {
                filterMaxWidth();
                setTopBorderForIsotopeFilters();

                $(window).resize(function () {
                    filterMaxWidth();
                    setTopBorderForIsotopeFilters();
                });
            }

            if ($('.mesh__filter__options, .wc-tabs').length) {
                setTopBorderForIsotopeFilters();

                $(window).resize(function () {
                    setTopBorderForIsotopeFilters();
                });
            }
        }

        function moveProjectGalleryToBrowserMargin() {

            var moveSlider = function () {
                var gallerySlider = $('.pikartslider--fullscreen'),
                    body = $('body'),
                    bodyOffset = body.offset();
                if (body.hasClass('rtl single-project')) {
                    gallerySlider.offset({right: bodyOffset.right});
                } else {
                    gallerySlider.offset({left: bodyOffset.left});
                }
            };

            $(window).on('resize', moveSlider);
            moveSlider();
        }

        function removeDiaryUselessRows() {
            $('.site-main--diary, .page-builder--diary').find('.pikode--row, .pikode--column').each(function () {
                if (!$(this).text().trim().length) { // check if contains text
                    $(this).remove();
                }
            })
        }

        function runFluidVideos() {
            var iframes = $('iframe');

            iframes.each(function () {

                var iframe = this,
                    $iframe = $(this),
                    players = /www.youtube.com|player.vimeo.com|vine.co/; // Extend this if you need more players

                /* If pattern exists within the current iframe */
                if (iframe.src.search(players) > 0) {

                    /* Calculate the video ratio based on the iframe's w/h dimensions */
                    var videoRatio = ( iframe.height / iframe.width ) * 100;

                    /* Replace the iframe's dimensions and position the iframe absolute,
                     this is the trick to emulate the video ratio */
                    $iframe.css({
                        'height': '100%',
                        'width': '100%',
                        'position': 'absolute',
                        'top': '0',
                        'left': '0'
                    });

                    /* Wrap the iframe in a new <div> which uses a dynamically fetched
                     padding-top property based on the video's w/h dimensions */
                    $iframe.wrap("<div class='fluid-vids'></div>");

                    $iframe.closest($('.fluid-vids')).css({
                        'width': '100%',
                        'position': 'relative',
                        'padding-top': videoRatio + '%'
                    });
                }
            });
        }

        function runFluidAudio() {
            $('audio.audio-diary').mediaelementplayer({
                audioWidth: '100%',
                hideVolumeOnTouchDevices: false
            });
        }

        function setPageBuilderMargins() {
            var mainSite = $('.site-main'),
                pageBuilder = $('.page-builder'),
                nbArticles = mainSite.find('article').length;

            if ((pageBuilder.hasClass('page-builder--fullscreen') || pageBuilder.hasClass('page-builder--fullgrid') || pageBuilder.hasClass('page-builder--gmap'))
                && nbArticles == 1) {
                mainSite.css('margin-bottom', 0);
            }
        }

        function wooCommerceHooks() {
            // Single Product Page Review
            $('#rating').show();
            $('.stars').hide();

            // Woocommerce specific pages
            var wooCom = $('.woocommerce'),
                newSiteMainCssClass = wooCom.hasClass('single') ? 'site-main--single' : 'site-main--shop';

            wooCom.find('.site-main').addClass(newSiteMainCssClass);

            // Single Product Page Related Products
            if (wooCom.hasClass('single-product')) {
                $('.product__image--bottom').hide();
            }

            // Shop - Add to Cart
            var productBottom = $('.product__image--bottom'),
                productBottomCart = $('.product__image--bottom__cart');
            productBottomCart.after('<span class="flexbox__item--refresh"><i class="icon-refresh"></i></span>');
            productBottom.find('.flexbox__item--refresh').css({
                'opacity': 0
            });
            productBottomCart.each(function () {
                $(this).click(function () {
                    var $this = $(this),
                        thisContainer = $this.closest(productBottom),
                        refreshSpinner = thisContainer.find('.flexbox__item--refresh');
                    refreshSpinner.css({
                        'opacity': 1
                    });
                    $this.hide();
                    thisContainer.on('DOMNodeInserted', thisContainer.find('.added_to_cart'), function () {
                        refreshSpinner.css({
                            'opacity': 0
                        });
                    });
                });
            });

            // Shop sorting option
            var getOptionWidth = function (item) {
                $('.option-temp').html(item.find('option:selected').text());
                var selectTemp = $(".select-temp");
                item.height(selectTemp.height());
                item.width(selectTemp.width() + 1);
                selectTemp.hide();
            };

            var sortingSelect = $('.orderby');
            sortingSelect.after('<select class="select-temp"><option class="option-temp"></option></select>');
            sortingSelect.change(function () {
                getOptionWidth($(this));
            });
            getOptionWidth(sortingSelect);

            // Shop Filter
            $('.mesh__filter--shop').find('a').click(function () {
                if ($(this).hasClass('btn--not-selected')) {
                    $(this).parents('.mesh__filter__options').find('.btn--selected').removeClass('btn--selected').addClass('btn--not-selected').animate(500);
                    $(this).removeClass('btn--not-selected').addClass('btn--selected').animate(500);
                }
            });

            // Wrapping Product Status
            var wrappingProductStatus = function (container) {
                var onSale,
                    outOfStock,
                    detachedOutOfStock;
                container.each(function () {
                    onSale = $(this).find('.onsale');
                    outOfStock = $(this).find('.woocommerce-out-stock');

                    if (onSale.length > outOfStock.length) {
                        onSale.wrap('<div class="product-status"></div>');
                    } else if (onSale.length < outOfStock.length) {
                        outOfStock.wrap('<div class="product-status"></div>');
                    } else if (onSale.length == 1 && outOfStock.length == 1) {
                        detachedOutOfStock = outOfStock.detach();
                        onSale.wrap('<div class="product-status"></div>');
                        onSale.after(detachedOutOfStock);
                    }
                });
            };

            wrappingProductStatus($('.woocommerce-products').find('.product'));

            $('.product').find('>.onsale, >.woocommerce-out-stock').wrapAll('<div class="product-status"></div>');
        }

        function updateHeaderShoppingCart() {
            var headrCart = $('.flexbox__item--wc-cart');
            $(document.body).on('added_to_cart', function (event, fragments) {
                $('.wc-cart--items-number').text(fragments.total_count);

                if (fragments.total_count > 0) {
                    headrCart.show();
                } else {
                    headrCart.hide();
                }
            });
        }

        /* Ties
         /*******************************************************/
        function isRtl() {
            return $('body.rtl').length >= 1;
        }

        function getFeatureColor() {
            return themeCustomOptions.colors['feature_color'];
        }

        function itemsSpeedActive(container) {
            return parseInt(container.data('items-speed')) === 1;
        }
    });
})(jQuery);