($ => {
    "use strict";

    /**
     * @param {object} ext
     * @constructor
     */
    $.StylesheetHelper = function (ext) {

        const themeableFiles = ["overlay", "sidebar", "content"];
        const addedStylesheets = [];
        let customCss = "";
        let theme = "";
        let defaultVal = false;

        /**
         * Retrieves the replacements for the stylesheets from the storage
         *
         * @param {object} opts
         */
        this.init = (opts) => {
            if (opts && opts.defaultVal && opts.defaultVal === true) { // use the default styles instead of the configured (will be used by the settings page, the changelog and the onboarding)
                defaultVal = true;
            }

            theme = ext.helper.model.getData("a/theme");
            customCss = ext.helper.model.getData("u/customCss");
            const surface = ext.helper.model.getData("a/surface");

            window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", async () => {
                if (ext.helper.utility) {
                    ext.helper.utility.triggerEvent("systemColorChanged", this.getSystemSurface());
                }

                if (surface === "auto") {
                    for (const k of addedStylesheets) {
                        await addParsedStylesheets(k.files, k.head, true);
                    }
                }
            });
        };

        /**
         * Returns the color scheme of the system (dark or light)
         *
         * @returns {string}
         */
        this.getSystemSurface = () => {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        };

        /**
         * Extends the given list of stylesheets with the ones of the currently selected theme
         *
         * @param files
         * @returns {Array}
         */
        this.getStylesheetFilesWithThemes = (files) => {
            const ret = files;
            if (theme && theme !== "default") { // add theme css files to the list, so that they will be loaded, too
                files.forEach((file) => {
                    if (themeableFiles.includes(file)) {
                        ret.push("themes/" + theme + "/" + file);
                    }
                });
            }
            return ret;
        };

        /**
         * Adds the stylesheets to the document
         *
         * @param {Array} files
         * @param {jsu} context
         */
        this.addStylesheets = async (files, context = null) => {
            if (context === null) { // page context
                context = $(document);
            } else { // extension context
                ext.helper.font.addStylesheet(context, defaultVal ? "default" : "config");

                if ($.cl && $.cl.page) {
                    if (ext.helper.model.getData("b/animations") === false && $.cl.page.noAnimations) {
                        context.find("body").addClass($.cl.page.noAnimations);
                    }
                }
            }

            let head = null;
            if (context.find("head").length() === 0) { // document does not have a head -> append styles to the body
                head = context.find("body");
            } else {
                head = context.find("head");
            }

            await addParsedStylesheets(files, head);
        };

        const addParsedStylesheets = (files, head, fromReload = false) => {
            return new Promise((resolve) => {
                if (fromReload === false) {
                    addedStylesheets.push({files: files, head: head});
                }
                const styles = ext.helper.model.getData("a/styles", defaultVal);

                let loaded = 0;
                this.getStylesheetFilesWithThemes(files).forEach((file) => {
                    $.xhr($.api.extension.getURL("css/" + file + ".css")).then((xhr) => {
                        if (xhr.response) {
                            let css = xhr.response;
                            css += customCss;

                            Object.keys(styles).forEach((key) => {
                                css = css.replace(new RegExp("\"?%" + key + "\"?", "g"), styles[key]);
                            });

                            if ($.cl && $.cl.page && $.cl.page.style && $.attr && $.attr.name) {
                                head.find("style." + $.cl.page.style + "[" + $.attr.name + "='" + file + "']").remove();
                                head.append("<style class='" + $.cl.page.style + "' " + $.attr.name + "='" + file + "'>" + css + "</style>");
                            } else {
                                head.append("<style>" + css + "</style>");
                            }
                        }

                        loaded++;
                        if (loaded >= files.length) {
                            resolve();
                        }
                    });
                });
            });
        };
    };

})(jsu);