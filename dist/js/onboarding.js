/*! (c) Philipp König under GPL-3.0 */
(e=>{"use strict";window.onboarding=function(){let t=!1;this.elm={body:e("body"),title:e("head > title"),sidebar:{left:e("div#sidebar"),right:null}},this.run=(()=>{i();let t=this.helper.template.loading().appendTo(this.elm.body);this.elm.body.addClass(e.cl.general.initLoading),this.helper.model.init().then(()=>this.helper.i18n.init()).then(()=>(this.elm.body.parent("html").attr("dir",this.helper.i18n.isRtl()?"rtl":"ltr"),this.helper.font.init(),this.helper.stylesheet.init(),this.helper.stylesheet.addStylesheets(["onboarding"],e(document)),this.helper.i18n.parseHtml(document),this.elm.title.text(this.elm.title.text()+" - "+this.helper.i18n.get("extension_name")),this.helper.model.call("trackPageView",{page:"/onboarding",always:!0}))).then(()=>{this.elm.body.removeClass(e.cl.general.building),this.elm.sidebar.right=e(this.elm.sidebar.left[0].outerHTML).appendTo(this.elm.body),this.elm.sidebar.right.attr(e.attr.position,"right"),l(),n(),o(),a(),s(),r(),d(),e.delay(500).then(()=>(this.elm.body.removeClass(e.cl.general.initLoading),c("intro"),e.delay(300))).then(()=>{t.remove()})})});let i=()=>{this.helper={i18n:new window.I18nHelper(this),font:new window.FontHelper(this),stylesheet:new window.StylesheetHelper(this),template:new window.TemplateHelper(this),model:new window.ModelHelper(this)}},l=()=>{e(window).on("beforeunload",()=>{t&&this.helper.model.call("reinitialize")})},n=()=>{e("section."+e.cl.onboarding.slide+"["+e.attr.name+"='intro'] a").on("click",t=>{t.preventDefault(),e(t.currentTarget).hasClass(e.cl.onboarding.skip)?p(!0):h()})},o=()=>{e("section."+e.cl.onboarding.slide+"["+e.attr.name+"='position'] a").on("mouseenter click",i=>{i.preventDefault();let l=e(i.currentTarget).attr(e.attr.value);this.elm.body.attr(e.attr.position,l),Object.values(this.elm.sidebar).forEach(t=>{t.removeClass(e.cl.general.visible)}),this.elm.sidebar[l].addClass(e.cl.general.visible),"click"===i.type&&this.helper.model.setData({"b/sidebarPosition":l}).then(()=>{t=!0,h()})}).on("mouseleave",t=>{let i=e(t.currentTarget).parent();e.delay().then(()=>{i.hasClass(e.cl.general.visible)&&Object.values(this.elm.sidebar).forEach(t=>{t.removeClass(e.cl.general.visible)})})})},a=()=>{e("section."+e.cl.onboarding.slide+"["+e.attr.name+"='surface'] a").on("mouseenter click",i=>{i.preventDefault();let l=e(i.currentTarget).attr(e.attr.value);if(this.elm.body.attr(e.attr.onboarding.surface,l),"click"===i.type){let i=this.helper.model.getData("a/styles");i.colorScheme=this.helper.model.getDefaultColor("colorScheme",l),i.textColor=this.helper.model.getDefaultColor("textColor",l),i.bookmarksDirColor=this.helper.model.getDefaultColor("textColor",l),i.sidebarMaskColor=this.helper.model.getDefaultColor("sidebarMaskColor",l),i.hoverColor=this.helper.model.getDefaultColor("hoverColor",l),Object.values(this.elm.sidebar).forEach(t=>{t.removeClass(e.cl.general.visible)}),this.helper.model.setData({"a/darkMode":"dark"===l,"a/styles":i}).then(()=>{t=!0,h()})}}).on("mouseleave",t=>{let i=e(t.currentTarget).parent();e.delay().then(()=>{i.hasClass(e.cl.general.visible)&&this.elm.body.removeAttr(e.attr.onboarding.surface)})})},s=()=>{e("section."+e.cl.onboarding.slide+"["+e.attr.name+"='openAction'] a").on("mouseenter click",i=>{i.preventDefault();let l=e(i.currentTarget).attr(e.attr.value);l&&("click"===i.type?(this.elm.body.addClass(e.cl.onboarding.hideOpenTypeIcon),this.helper.model.setData({"b/openAction":l}).then(()=>{t=!0,p()})):(this.elm.body.removeClass(e.cl.onboarding.hideOpenTypeIcon),this.elm.body.attr(e.attr.onboarding.openType,"icon"===l?"icon":"mouse")))}).on("mouseleave",t=>{e(t.currentTarget).parent("section").hasClass(e.cl.general.visible)&&this.elm.body.addClass(e.cl.onboarding.hideOpenTypeIcon)})},r=()=>{e(document).on(e.opts.events.sidebarOpened,()=>{e("section."+e.cl.onboarding.slide+"["+e.attr.name+"='finished']").hasClass(e.cl.general.visible)||(this.elm.body.addClass(e.cl.onboarding.hideOpenTypeIcon),c("finished"))})},d=()=>{e("section."+e.cl.onboarding.slide+"["+e.attr.name+"='finished'] a").on("click",t=>{t.preventDefault(),e(t.currentTarget).hasClass(e.cl.onboarding.settings)?location.href=chrome.extension.getURL("html/settings.html"):e(t.currentTarget).hasClass(e.cl.onboarding.appearance)&&(location.href=chrome.extension.getURL("html/settings.html")+"#appearance_sidebar")})},h=()=>{let t=e("section."+e.cl.onboarding.slide+"."+e.cl.general.visible).next("section."+e.cl.onboarding.slide).attr(e.attr.name);c(t)},c=t=>{e("section."+e.cl.onboarding.slide+"."+e.cl.general.visible).removeClass(e.cl.general.visible),e.delay(300).then(()=>{this.helper.model.call("trackEvent",{category:"onboarding",action:"view",label:t,always:!0}),e("section."+e.cl.onboarding.slide+"["+e.attr.name+"='"+t+"']").addClass(e.cl.general.visible)})},p=()=>{c("handson"),m(),Object.values(this.elm.sidebar).forEach(t=>{t.removeClass(e.cl.general.visible)});let t=e("section."+e.cl.onboarding.slide+"["+e.attr.name+"='handson']"),i=this.helper.model.getData(["b/openAction","b/sidebarPosition"]);if(this.elm.body.attr(e.attr.position,i.sidebarPosition),"icon"===i.openAction)e("<p />").text(this.helper.i18n.get("onboarding_handson_icon_desc")).appendTo(t);else{let l=this.helper.i18n.get("onboarding_"+i.sidebarPosition);if(e("<p />").text(this.helper.i18n.get("onboarding_handson_mouse_desc_1",[l])).appendTo(t),"mousemove"!==i.openAction){let l=this.helper.i18n.get("onboarding_"+("contextmenu"===i.openAction?"right":"left"));e("<p />").text(this.helper.i18n.get("onboarding_handson_mouse_desc_2",[l])).appendTo(t)}}e.delay(300).then(()=>{this.elm.body.removeClass(e.cl.onboarding.hideOpenTypeIcon),this.elm.body.attr(e.attr.onboarding.openType,"icon"===i.openAction?"icon":"mouse")})},m=()=>{e.opts.manifest.content_scripts[0].css.forEach(t=>{e("head").append("<link href='"+chrome.extension.getURL(t)+"' type='text/css' rel='stylesheet' />")});let t=(i=0)=>{let l=e.opts.manifest.content_scripts[0].js[i];if(void 0!==l){let e=document.createElement("script");document.head.appendChild(e),e.onload=(()=>t(i+1)),e.src="/"+l}};t()}},(new window.onboarding).run()})(jsu);