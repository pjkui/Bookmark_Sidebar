($ => {
    "use strict";

    $.ModelHelper = function (b) {
        let data = {};
        let licenseKey = null;
        let translationInfo = [];
        let shareInfo = {
            config: null,
            activity: null
        };

        /**
         *
         * @returns {Promise}
         */
        this.init = () => {
            return new Promise((resolve) => {
                $.api.storage.sync.get(["model", "shareInfo", "translationInfo", "licenseKey"], (obj) => {
                    data = obj.model || {};
                    if (typeof obj.shareInfo === "object") {
                        shareInfo = obj.shareInfo;
                    }

                    if (typeof obj.licenseKey === "string" && obj.licenseKey.length <= 29) {
                        licenseKey = obj.licenseKey;
                    }

                    if (typeof obj.translationInfo === "object") {
                        translationInfo = obj.translationInfo;
                    }

                    if (typeof data.installationDate === "undefined") {
                        data.installationDate = +new Date();
                    }

                    if (typeof data.lastUpdateDate === "undefined") {
                        data.lastUpdateDate = +new Date();
                    }

                    if (typeof data.premiumInfo === "undefined") { // no premium teaser displayed yet -> initialise with null
                        data.premiumInfo = null;
                    }

                    if (typeof data.translationReminder === "undefined") { // no reminder of missing translation variables displayed yet -> initialise with null
                        data.translationReminder = null;
                    }

                    saveModelData().then(resolve);
                });
            });
        };

        /**
         * Returns information about what the user allows to be tracked
         *
         * @returns {object}
         */
        this.getShareInfo = () => shareInfo;

        /**
         * Returns the stored license key
         *
         * @returns {Promise}
         */
        this.getLicenseKey = () => {
            return new Promise((resolve) => {
                resolve({licenseKey: "pjkui"});
            });
        };

        /**
         * Checks if there is any information the extension should display to the user and returns the name of this info
         *
         * @returns {Promise}
         */
        this.getInfoToDisplay = () => {
            return new Promise((resolve) => {
                if (data && data.installationDate) {
                    const daysSinceInstall = (+new Date() - data.installationDate) / 86400000;
                    const daysSinceTranslationReminder = data.translationReminder === null ? 365 : (+new Date() - data.translationReminder) / 86400000;

                    if (shareInfo.config === null && shareInfo.activity === null && daysSinceInstall > 7) { // user has installed the extension for at least 7 days and has not set his tracking preferences
                        resolve({info: "shareInfo"});
                    } else if (translationInfo.length > 0 && daysSinceTranslationReminder > 3) { // user has enabled translation reminder and didn't got one the last three days -> check whether a language the user wants to be notified about is incomplete
                        Promise.all([
                            b.helper.language.getIncompleteLanguages(),
                            this.setData("translationReminder", +new Date())
                        ]).then(([langList]) => {
                            translationInfo.some((lang) => {
                                if (langList.indexOf(lang) !== -1) { // a language of the list is incomplete -> show info box
                                    resolve({info: "translation"});
                                }
                            });
                            resolve({info: null});
                        });
                    } else {
                        this.getUserType().then((obj) => {
                            const daysSincePremiumInfo = data.premiumInfo === null ? 365 : (+new Date() - data.premiumInfo) / 86400000;

                            if (obj.userType !== "premium" && daysSincePremiumInfo > 200 && daysSinceInstall > 14) { // premium teaser hasn't been displayed for over 200 days and user has installed the extension for at least 14 days
                                this.setData("premiumInfo", +new Date()).then(() => {
                                    resolve({info: "premium"});
                                });
                            } else {
                                resolve({info: null});
                            }
                        });
                    }
                } else {
                    resolve({info: null});
                }
            });
        };

        /**
         * Determines the user type (default, legacy or premium)
         *
         * @returns {Promise}
         */
        this.getUserType = () => {
            return new Promise((resolve) => {
                let userType = "default";

                if (typeof licenseKey === "string" && licenseKey.length <= 29) { // license key is available
                    userType = "premium";
                } else if (data && data.installationDate && data.installationDate < 1538352000000) { // installed before 01.10.2018
                    userType = "legacy";
                }

                resolve({userType: userType});
            });
        };

        /**
         * Sets the information about what the users wants to be tracked
         *
         * @param {object} opts
         * @returns {Promise}
         */
        this.setShareInfo = (opts) => {
            return new Promise((resolve) => {
                shareInfo = {
                    config: opts.config || false,
                    activity: opts.activity || false
                };

                $.api.storage.sync.set({
                    shareInfo: shareInfo
                }, () => {
                    $.api.runtime.lastError; // do nothing specific with the error -> is thrown if too many save attempts are triggered
                    resolve();
                });
            });
        };

        /**
         * Stores the given license key in the sync storage
         *
         * @param {string} key
         * @returns {Promise}
         */
        this.setLicenseKey = (key) => {
            return new Promise((resolve) => {
                $.api.storage.sync.set({
                    licenseKey: key
                }, () => {
                    if ($.api.runtime.lastError) {
                        resolve({success: false, message: $.api.runtime.lastError.message});
                    } else {
                        licenseKey = key;
                        resolve({success: true});
                    }
                });
            });
        };

        /**
         * Saves the given value under the given name
         *
         * @param {string} key
         * @param {*} val
         * @returns {Promise}
         */
        this.setData = (key, val) => {
            return new Promise((resolve) => {
                data[key] = val;
                saveModelData().then(resolve);
            });
        };

        /**
         * Returns the value to the given name
         *
         * @param {string} key
         * @returns {*|null}
         */
        this.getData = (key) => {
            return data[key] || null;
        };

        /**
         * Saves the data object into the synced storage
         *
         * @returns {Promise}
         */
        const saveModelData = () => {
            return new Promise((resolve) => {
                if (Object.getOwnPropertyNames(data).length > 0) {
                    $.api.storage.sync.set({ // save to sync storage
                        model: data
                    }, () => {
                        $.api.runtime.lastError; // do nothing specific with the error -> is thrown if too many save attempts are triggered
                        resolve();
                    });
                }
            });
        };
    };

})(jsu);