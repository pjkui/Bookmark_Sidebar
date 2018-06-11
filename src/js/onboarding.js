($ => {
    "use strict";

    window.onboarding = function () {

        let configChanged = false;

        /*
         * ################################
         * PUBLIC
         * ################################
         */

        this.elm = {
            body: $("body"),
            title: $("head > title"),
            sidebar: {
                left: $("div#sidebar"),
                right: null
            }
        };

        /**
         * Constructor
         */
        this.run = () => {
            initHelpers();
            let loader = this.helper.template.loading().appendTo(this.elm.body);
            this.elm.body.addClass($.cl.general.initLoading);

            this.helper.model.init().then(() => {
                return this.helper.i18n.init();
            }).then(() => {
                this.elm.body.parent("html").attr("dir", this.helper.i18n.isRtl() ? "rtl" : "ltr");

                this.helper.font.init();
                this.helper.stylesheet.init();
                this.helper.stylesheet.addStylesheets(["onboarding"], $(document));

                this.helper.i18n.parseHtml(document);
                this.elm.title.text(this.elm.title.text() + " - " + this.helper.i18n.get("extension_name"));

                return this.helper.model.call("trackPageView", {page: "/onboarding", always: true});
            }).then(() => {
                this.elm.body.removeClass($.cl.general.building);

                this.elm.sidebar.right = $(this.elm.sidebar.left[0].outerHTML).appendTo(this.elm.body);
                this.elm.sidebar.right.attr($.attr.position, "right");

                initGeneralEvents();
                initIntroEvents();
                initPositionEvents();
                initSurfaceEvents();
                initOpenActionEvents();
                initHandsOnEvents();
                initFinishedEvents();

                $.delay(500).then(() => { // finish loading
                    this.elm.body.removeClass($.cl.general.initLoading);
                    gotoSlide("intro");
                    return $.delay(300);
                }).then(() => {
                    loader.remove();
                });
            });
        };

        /*
         * ################################
         * PRIVATE
         * ################################
         */

        /**
         * Initialises the helper objects
         */
        let initHelpers = () => {
            this.helper = {
                i18n: new window.I18nHelper(this),
                font: new window.FontHelper(this),
                stylesheet: new window.StylesheetHelper(this),
                template: new window.TemplateHelper(this),
                model: new window.ModelHelper(this)
            };
        };

        /**
         * Initialises the general eventhandlers
         */
        let initGeneralEvents = () => {
            $(window).on("beforeunload", () => { // reinitialize the other tabs after changing any configuration
                if (configChanged) {
                    this.helper.model.call("reinitialize");
                }
            });
        };

        /**
         * Initialises the eventhandlers for the intro slide
         */
        let initIntroEvents = () => {
            $("section." + $.cl.onboarding.slide + "[" + $.attr.name + "='intro'] a").on("click", (e) => {
                e.preventDefault();

                if ($(e.currentTarget).hasClass($.cl.onboarding.skip)) {
                    initHandsOn(true);
                } else {
                    gotoNextSlide();
                }
            });
        };

        /**
         * Initialises the eventhandlers for the position slide
         */
        let initPositionEvents = () => {
            $("section." + $.cl.onboarding.slide + "[" + $.attr.name + "='position'] a").on("mouseenter click", (e) => {
                e.preventDefault();
                let value = $(e.currentTarget).attr($.attr.value);
                this.elm.body.attr($.attr.position, value);

                Object.values(this.elm.sidebar).forEach((sidebar) => {
                    sidebar.removeClass($.cl.general.visible);
                });

                this.elm.sidebar[value].addClass($.cl.general.visible);

                if (e.type === "click") {
                    this.helper.model.setData({"b/sidebarPosition": value}).then(() => {
                        configChanged = true;
                        gotoNextSlide();
                    });
                }
            }).on("mouseleave", (e) => {
                let slide = $(e.currentTarget).parent();
                $.delay().then(() => {
                    if (slide.hasClass($.cl.general.visible)) {
                        Object.values(this.elm.sidebar).forEach((sidebar) => {
                            sidebar.removeClass($.cl.general.visible);
                        });
                    }
                });
            });

        };

        /**
         * Initialises the eventhandlers for the surface slide
         */
        let initSurfaceEvents = () => {
            $("section." + $.cl.onboarding.slide + "[" + $.attr.name + "='surface'] a").on("mouseenter click", (e) => {
                e.preventDefault();
                let value = $(e.currentTarget).attr($.attr.value);
                this.elm.body.attr($.attr.onboarding.surface, value);

                if (e.type === "click") {
                    let styles = this.helper.model.getData("a/styles");
                    styles.colorScheme = this.helper.model.getDefaultColor("colorScheme", value);
                    styles.textColor = this.helper.model.getDefaultColor("textColor", value);
                    styles.bookmarksDirColor = this.helper.model.getDefaultColor("textColor", value);
                    styles.sidebarMaskColor = this.helper.model.getDefaultColor("sidebarMaskColor", value);
                    styles.hoverColor = this.helper.model.getDefaultColor("hoverColor", value);

                    Object.values(this.elm.sidebar).forEach((sidebar) => {
                        sidebar.removeClass($.cl.general.visible);
                    });

                    this.helper.model.setData({
                        "a/darkMode": value === "dark",
                        "a/styles": styles
                    }).then(() => {
                        configChanged = true;
                        gotoNextSlide();
                    });
                }
            }).on("mouseleave", (e) => {
                let slide = $(e.currentTarget).parent();
                $.delay().then(() => {
                    if (slide.hasClass($.cl.general.visible)) {
                        this.elm.body.removeAttr($.attr.onboarding.surface);
                    }
                });
            });
        };

        /**
         * Initialises the eventhandlers for the openAction slide
         */
        let initOpenActionEvents = () => {
            $("section." + $.cl.onboarding.slide + "[" + $.attr.name + "='openAction'] a").on("mouseenter click", (e) => {
                e.preventDefault();
                let value = $(e.currentTarget).attr($.attr.value);

                if (value) {
                    if (e.type === "click") {
                        this.elm.body.addClass($.cl.onboarding.hideOpenTypeIcon);
                        this.helper.model.setData({"b/openAction": value}).then(() => {
                            configChanged = true;
                            initHandsOn();
                        });
                    } else {
                        this.elm.body.removeClass($.cl.onboarding.hideOpenTypeIcon);
                        this.elm.body.attr($.attr.onboarding.openType, value === "icon" ? "icon" : "mouse");
                    }
                }
            }).on("mouseleave", (e) => {
                if ($(e.currentTarget).parent("section").hasClass($.cl.general.visible)) {
                    this.elm.body.addClass($.cl.onboarding.hideOpenTypeIcon);
                }
            });
        };

        /**
         * Initialises the eventhandlers for the hands-on slide
         */
        let initHandsOnEvents = () => {
            $(document).on($.opts.events.sidebarOpened, () => {
                if (!$("section." + $.cl.onboarding.slide + "[" + $.attr.name + "='finished']").hasClass($.cl.general.visible)) {
                    this.elm.body.addClass($.cl.onboarding.hideOpenTypeIcon);
                    gotoSlide("finished");
                }
            });
        };

        /**
         * Initialises the eventhandlers for the last slide
         */
        let initFinishedEvents = () => {
            $("section." + $.cl.onboarding.slide + "[" + $.attr.name + "='finished'] a").on("click", (e) => {
                e.preventDefault();
                if ($(e.currentTarget).hasClass($.cl.onboarding.settings)) {
                    location.href = chrome.extension.getURL("html/settings.html");
                } else if ($(e.currentTarget).hasClass($.cl.onboarding.appearance)) {
                    location.href = chrome.extension.getURL("html/settings.html") + "#appearance_sidebar";
                }
            });
        };

        /**
         * Shows the next slide
         */
        let gotoNextSlide = () => {
            let name = $("section." + $.cl.onboarding.slide + "." + $.cl.general.visible).next("section." + $.cl.onboarding.slide).attr($.attr.name);
            gotoSlide(name);
        };

        /**
         * Shows the slide with the given name
         *
         * @param {string} name
         */
        let gotoSlide = (name) => {
            let slide = $("section." + $.cl.onboarding.slide + "." + $.cl.general.visible);
            slide.removeClass($.cl.general.visible);

            $.delay(300).then(() => {
                this.helper.model.call("trackEvent", {
                    category: "onboarding",
                    action: "view",
                    label: name,
                    always: true
                });

                $("section." + $.cl.onboarding.slide + "[" + $.attr.name + "='" + name + "']").addClass($.cl.general.visible);
            });
        };

        /**
         * Initialises the Hands-On slide with the actual sidebar loaded
         */
        let initHandsOn = () => {
            gotoSlide("handson");
            loadSidebar();

            Object.values(this.elm.sidebar).forEach((sidebar) => { // hide placeholder sidebar
                sidebar.removeClass($.cl.general.visible);
            });

            let slide = $("section." + $.cl.onboarding.slide + "[" + $.attr.name + "='handson']");

            let config = this.helper.model.getData(["b/openAction", "b/sidebarPosition"]);
            this.elm.body.attr($.attr.position, config.sidebarPosition);

            // change description how to open the sidebar based on sidebar position and configurated openAction
            if (config.openAction === "icon") {
                $("<p />").text(this.helper.i18n.get("onboarding_handson_icon_desc")).appendTo(slide);
            } else {
                let position = this.helper.i18n.get("onboarding_" + config.sidebarPosition);
                $("<p />").text(this.helper.i18n.get("onboarding_handson_mouse_desc_1", [position])).appendTo(slide);

                if (config.openAction !== "mousemove") {
                    let mouseButton = this.helper.i18n.get("onboarding_" + (config.openAction === "contextmenu" ? "right" : "left"));
                    $("<p />").text(this.helper.i18n.get("onboarding_handson_mouse_desc_2", [mouseButton])).appendTo(slide);
                }
            }

            $.delay(300).then(() => { // show icon as help
                this.elm.body.removeClass($.cl.onboarding.hideOpenTypeIcon);
                this.elm.body.attr($.attr.onboarding.openType, config.openAction === "icon" ? "icon" : "mouse");
            });
        };

        /**
         * Loads the sidebar with the specified configuration
         */
        let loadSidebar = () => {
            $.opts.manifest.content_scripts[0].css.forEach((css) => {
                $("head").append("<link href='" + chrome.extension.getURL(css) + "' type='text/css' rel='stylesheet' />");
            });

            let loadJs = (i = 0) => {
                let js = $.opts.manifest.content_scripts[0].js[i];

                if (typeof js !== "undefined") {
                    let script = document.createElement("script");
                    document.head.appendChild(script);
                    script.onload = () => loadJs(i + 1);
                    script.src = "/" + js;
                }
            };

            loadJs();
        };
    };

    new window.onboarding().run();

})(jsu);