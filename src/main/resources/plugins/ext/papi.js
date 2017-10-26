'use strict';
/**
 * PAPI扩展类
 */
/*global Java, base, module, exports, require, __FILE__*/
var PlaceholderAPI;
var bukkit = require('modules/server');
if (bukkit.plugin.load("PlaceholderAPI")) {
    PlaceholderAPI = ext.getStatic("me.clip.placeholderapi.PlaceholderAPI");
} else {
    log.w("PlaceholderAPI 未找到 变量替换功能失效!");
    PlaceholderAPI = {
        setPlaceholders: function () {
            return arguments[1];
        }
    }
}
exports.$ = function () {
    if (arguments.length > 1) {
        return PlaceholderAPI.setPlaceholders(arguments[0], arguments[1]);
    } else {
        return PlaceholderAPI.setPlaceholders(null, arguments[0]);
    }
};