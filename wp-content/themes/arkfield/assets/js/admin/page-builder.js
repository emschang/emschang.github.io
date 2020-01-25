if (typeof pageBuilderConfig === 'undefined') {
    pageBuilderConfig = {
        "projectIdsGroupedByCategoryIds": [],
        "projectNamesGroupedById": {}
    };
}

(function ($) {
    "use strict";

    var mergeObjects = function (obj1, obj2) {
        var key,
            obj3 = {};

        for (key in obj1) {
            if (obj1.hasOwnProperty(key)) {
                obj3[key] = obj1[key];
            }
        }

        for (key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj3[key] = obj2[key];
            }
        }

        return obj3;
    };

    $(document).ready(function () {
        var pageMetaBoxManager = {
            metaBoxMaxIndex: 0,
            addSectionElement: $('#page_builder_add_section'),
            sectionPrefix: 'page_builder_sections',
            metaBoxSelector: 'div[id^="page_builder_sections"]',
            addPageMetaBoxClickEventCallback: function (e) {
                e.preventDefault();

                $.ajax({
                    method: "POST",
                    url: wp.ajax.settings.url,
                    data: {
                        action: 'page_builder_add_meta_box',
                        metaBoxNewIndex: pageMetaBoxManager.metaBoxMaxIndex + 1
                    },
                    success: function (response) {
                        if (response.success) {
                            pageMetaBoxManager.setupSection(response.data);
                        }
                    }
                });
            },
            setupSection: function (data) {
                pageMetaBoxManager.addSectionElement.before(data);
                pageMetaBoxManager.metaBoxMaxIndex++;
                pageMetaBoxManager.disableMetaBoxDragging();
                pageMetaBoxManager.removePageMetaBoxClickEvent();
                sectionContentTypeManager.initSectionContent(pageMetaBoxManager.metaBoxMaxIndex);
                pageMetaBoxManager.resetPostboxToggles();
                pageMetaBoxManager.initWpEditor('section_content_' + pageMetaBoxManager.metaBoxMaxIndex);
                initGallery($);
            },

            initWpEditor: function (wpEditorId) {
                quicktags({id: wpEditorId});
                QTags._buttonsInit();
                tinyMCE.execCommand('mceAddEditor', false, wpEditorId);
            },

            addPageMetaBoxClickEvent: function () {
                pageMetaBoxManager.addSectionElement.find('span').click(this.addPageMetaBoxClickEventCallback);

                var boxAdded = false;
                pageMetaBoxManager.addSectionElement.find('span').click(function () {
                    var $this = $(this);

                    if (boxAdded == false) {
                        boxAdded = true;
                        $this.append('<i class="icon-refresh"></i>');
                        $('body').on('DOMNodeInserted', 'div[id^="page_builder_sections"]', function () {
                            $this.find('.icon-refresh').remove();
                            boxAdded = false;
                        });
                    }
                });
            },
            removePageMetaBoxClickEvent: function () {
                var removeSectionElements = $('.remove-page-meta-box-custom-button');
                removeSectionElements.off('click');
                removeSectionElements.on('click', function (e) {
                    e.preventDefault();
                    $(this).closest(pageMetaBoxManager.metaBoxSelector).remove();
                });
            },
            disableMetaBoxDragging: function () {
                $('.meta-box-sortables').sortable({disabled: true});
                $('.postbox .hndle').css('cursor', 'default');
            },
            initMetaBoxMaxIndex: function () {
                var metaBoxIndexes = [];

                $(pageMetaBoxManager.metaBoxSelector).each(function () {
                    metaBoxIndexes.push(parseInt($(this).attr('id').replace(pageMetaBoxManager.sectionPrefix, '')));
                });

                if (metaBoxIndexes.length > 0) {
                    this.metaBoxMaxIndex = Math.max.apply(Math, metaBoxIndexes);
                }
            },
            prepareAddSection: function () {
                var addSectionElement = pageMetaBoxManager.addSectionElement;
                addSectionElement.find('.inside').remove();
                addSectionElement.find('.handlediv').remove();
                addSectionElement.find('span').css('cursor', 'pointer');

                if (this.metaBoxMaxIndex > 0) {
                    $('#' + this.sectionPrefix + this.metaBoxMaxIndex).after(addSectionElement);
                } else {
                    $('#normal-sortables').prepend(addSectionElement);
                }
            },
            resetPostboxToggles: function () {
                var postboxElements = ['.postbox .hndle', '.postbox .handlediv', '.hide-postbox-tog',
                    '.postbox a.dismiss', '.columns-prefs input[type="radio"]'];

                postboxElements.forEach(function (element) {
                    $(element).off('click.postboxes');
                });

                $('.postbox .hndle a').unbind('click');
                postboxes.add_postbox_toggles('page');
            },
            hideSectionFromScreenOptions: function () {
                $('#screen-meta').find('.metabox-prefs').find('label[for^="page_builder_sections"]').remove();
            },
            run: function () {
                this.initMetaBoxMaxIndex();
                this.prepareAddSection();
                this.addPageMetaBoxClickEvent();
                this.disableMetaBoxDragging();
                this.removePageMetaBoxClickEvent();
                this.hideSectionFromScreenOptions();
            }
        };

        var sectionContentTypeManager = {
            initSectionContent: function (metaBoxMaxIndex) {
                var section = $('#page_builder_sections' + metaBoxMaxIndex);
                $('.page-builder-section-projects-display').change(this.changeProjectsDisplay);
                section.find('.page-builder-section-content-type').change(this.changeContentType).change();

                this.initProjectCategories(this.findSectionElement(section, 'project_categories'));
                this.initProjects(this.findSectionElement(section, 'project_list'));
            },

            findSectionElement: function (section, elementName) {
                return section.find('[name^="page_builder_sections"]').filter('[name*="[' + elementName + ']"]');
            },

            changeContentType: function () {
                var //sectionIndex = $(this).attr('id').replace(/\w+\[(\d+)\].+/i, '$1'),
                    sectionElement = $(this).closest(pageMetaBoxManager.metaBoxSelector),
                    contentType = $(this).val(),
                    sectionHiddenFields = ["content", "nb_projects", "projects_speed", "nb_posts", "gallery",
                        "posts_speed", "nb_products", "products_speed", "project_list", "project_categories",
                        "projects_display", "gmap_latitude", "gmap_longitude", "gallery_display", "display_order"],
                    sectionVisibleFields = ["content_type", "remove_section"],
                    contentTypeConfig = {
                        default: ["content"],
                        gallery: ["gallery", "gallery_display"],
                        projects: ["projects_display", "nb_projects", "project_categories", "project_list", "display_order"],
                        posts: ["nb_posts", "posts_speed", "display_order"],
                        products: ["nb_products", "products_speed"],
                        contact_map: ["gmap_latitude", "gmap_longitude"]
                    };
                var getSectionElementsSelectorByFieldName = function (fieldName, matcher) {
                    return '[id' + matcher + '="' + fieldName + '"], [name' + matcher + '="' + fieldName + '"]';
                };

                var sectionInputElements = sectionElement
                    .find(getSectionElementsSelectorByFieldName('page_builder_sections', '^'));

                var getMetaBoxByFieldName = function (fieldName) {
                    var selector = getSectionElementsSelectorByFieldName('[' + fieldName + ']', '*');
                    return sectionInputElements.filter(selector).closest('.meta-box-custom-field');
                };

                sectionHiddenFields.forEach(function (fieldName) {
                    getMetaBoxByFieldName(fieldName).hide();
                });

                sectionVisibleFields.concat(contentTypeConfig[contentType]).forEach(function (fieldName) {
                    getMetaBoxByFieldName(fieldName).show();
                });

                sectionElement.find('.page-builder-section-projects-display').change();
            },

            changeProjectsDisplay: function () {
                var sectionElement = $(this).closest(pageMetaBoxManager.metaBoxSelector),
                    contentType = sectionElement.find('.page-builder-section-content-type').val(),
                    projectsSpeedElement = sectionContentTypeManager.findSectionElement(sectionElement, 'projects_speed')
                        .closest('.meta-box-custom-field');

                if ($(this).val() === 'fullgrid' && contentType === 'projects') {
                    projectsSpeedElement.show();
                } else {
                    projectsSpeedElement.hide();
                }
            },

            doMultipleSelect: function (select, customConfig) {
                var config = {
                    //placeholder: "search me",
                    width: "300px",
                    //multiple: true,
                    //multipleWidth: 55,
                    filter: true
                };

                //http://wenzhixin.net.cn/p/multiple-select/
                select.multipleSelect(mergeObjects(config, customConfig || {}));
            },

            initProjectCategories: function (categorySelectElement) {
                var projectNamesGroupedById = pageBuilderConfig.projectNamesGroupedById,
                    projectListSelect = this.findSectionElement(
                        categorySelectElement.closest(pageMetaBoxManager.metaBoxSelector), 'project_list');

                var getProjectIdsByCategoryIds = function (categoryIds) {
                    var projectIdsGroupedByCategoryIds = pageBuilderConfig.projectIdsGroupedByCategoryIds,
                        projectIds = [];

                    if (categoryIds !== null && typeof categoryIds === 'object') {
                        categoryIds.forEach(function (categoryId) {
                            if (!projectIdsGroupedByCategoryIds.hasOwnProperty(categoryId)) {
                                return;
                            }

                            projectIds = projectIds.concat(projectIdsGroupedByCategoryIds[categoryId]);

                            projectIds = projectIds.filter(function (item, pos) {
                                return projectIds.indexOf(item) === pos;
                            });
                        });
                    }

                    return projectIds;
                };

                var updateProjectList = function (categoryElement) {
                    var projectIds = getProjectIdsByCategoryIds(categoryElement.val()),
                        sectionElement = categoryElement.closest(pageMetaBoxManager.metaBoxSelector),
                        projectListSelect = sectionContentTypeManager.findSectionElement(sectionElement, 'project_list'),
                        selectedProjects = projectListSelect.val();

                    projectListSelect.empty();

                    projectIds.forEach(function (id) {
                        if (projectNamesGroupedById.hasOwnProperty(id)) {
                            var selected = selectedProjects && selectedProjects.indexOf(id.toString()) >= 0
                                    ? 'selected' : '',
                                option = '<option value="' + id + '" ' + selected + '>'
                                    + projectNamesGroupedById[id] + '</option>';

                            projectListSelect.append(option);
                        }
                    });
                };

                updateProjectList(categorySelectElement);

                var refreshProjectsMultiSelect = function () {
                    updateProjectList(categorySelectElement);
                    projectListSelect.multipleSelect('refresh');
                };

                var customConfig = {
                    onCheckAll: refreshProjectsMultiSelect,
                    onUncheckAll: refreshProjectsMultiSelect,
                    onClick: refreshProjectsMultiSelect
                };

                this.doMultipleSelect(categorySelectElement, customConfig);
            },

            initProjects: function (projectSelectElement) {
                this.doMultipleSelect(projectSelectElement);
            },

            initAllProjectsAndCategories: function () {
                var selectElements = $("select[multiple='multiple']");

                selectElements.filter('[name*="[project_categories]"]').each(function () {
                    sectionContentTypeManager.initProjectCategories($(this));
                });

                selectElements.filter('[name*="[project_list]"]').each(function () {
                    sectionContentTypeManager.initProjects($(this));
                });
            },

            init: function () {
                $(pageMetaBoxManager.metaBoxSelector).find('.meta-box-custom-field ').hide();
                $('.page-builder-section-projects-display').change(this.changeProjectsDisplay);
                $('.page-builder-section-content-type').change(this.changeContentType).change();
                this.initAllProjectsAndCategories();
            }
        };

        var pageTemplateManager = {
            changeTemplate: function () {
                var templateName = $(this).val(),
                    metaBoxesData = {
                        page_builder_add_section: "page-builder"
                    };

                var sections = $(pageMetaBoxManager.metaBoxSelector),
                    wpEditor = $('#postdivrich');
                if (templateName.indexOf('page-builder') > -1) {
                    wpEditor.hide();
                    sections.show();
                } else {
                    wpEditor.show(100, function () {
                        $(this).find('#wp-content-wrap').css({'padding-top': '55px'});
                        $(this).find('#wp-content-editor-tools, .mce-toolbar-grp').css({'width': '100%'});
                    });
                    sections.hide();
                }

                Object.keys(metaBoxesData).forEach(function (metaBoxId) {
                    var metaBoxTemplateName = 'templates/' + metaBoxesData[metaBoxId] + '.php',
                        metaBox = $('#' + metaBoxId);
                    if (templateName === metaBoxTemplateName) {
                        metaBox.show();
                    } else {
                        metaBox.hide();
                    }
                });
            },

            init: function () {
                $('#page_template').change(this.changeTemplate).change();
            }
        };

        if (pagenow === 'page') {
            pageTemplateManager.init();
            pageMetaBoxManager.run();
            sectionContentTypeManager.init();
        }
    });
})(jQuery);