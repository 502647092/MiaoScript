'use strict';
/**
 * Bukkit 命令相关类
 */

/*global Java, base, module, exports, require, __FILE__*/
var plugin = base.plugin;
var bukkit = require('bukkit');
var ref = require('kit/reflect');
var lookupNames = ref.on(bukkit.plugin.manager).get('lookupNames').get();
var knownCommands = ref.on(bukkit.plugin.manager).get('commandMap').get('knownCommands').get();
var PluginCommand = Java.type('org.bukkit.command.PluginCommand');

var Arrays = Java.type('java.util.Arrays')

function create(jsp, name) {
    var cmd = ref.on(PluginCommand).create(name, plugin).get();
    register(jsp, name, cmd);
    return cmd;
}

function register(jsp, name, cmd) {
    if (name.isEmpty()) {
        return;
    }
    knownCommands.put(name, cmd);
    knownCommands.computeIfAbsent(jsp.description.name + ":" + name, function () {
        return cmd;
    });
    knownCommands.computeIfAbsent('ms:' + jsp.description.name + ":" + name, function () {
        return cmd;
    });
    lookupNames.put(name, plugin);
}

// var exec = {
//     onCommand: function (sender, cmd, command, args) {
//
//     },
//     onTabComplete: function (sender, cmd, command, args) {
//
//     }
// };

exports.on = function (jsp, name, exec) {
    var c = create(jsp, name);
    if (exec.cmd) {
        c.setExecutor(function (sender, cmd, command, args) {
            return exec.cmd(sender, command, args);
        });
    }
    if (exec.tab) {
        c.setTabCompleter(function (sender, cmd, command, args) {
            return Arrays.asList(exec.tab(sender, command, args));
        });
    }
};

exports.off = function () {

};