'use strict'
/*global Java, base, module, exports, require*/

var wrapper = require('api/wrapper')
var command = require('api/command')
var manager = require('api/plugin')
var task = require('api/task')

var http = require('http')
var fs = require('fs')

var pluginCache = []
var packageCache = []
var packageNameCache = []

var description = {
    name: 'MiaoScriptPackageManager',
    version: '1.0',
    author: '喵♂呜',
    description: 'MiaoScript包管理工具',
    commands: {
        'mpm': {
            description: 'MiaoScriptPackageManager主命令'
        }
    },
    config: {
        
    }
}

var help = [
    '==========   MiaoScript包管理工具   ==========',
    '/mpm list 查看现有插件列表',
    '/mpm install [插件名称] 安装插件',
    '/mpm update [插件名称] 更新缓存/更新插件'
]

function load() {
    task.async(function () {
        var result = http.get('https://ms.yumc.pw/api/package/list')
        JSON.parse(result).data.forEach(function cachePackageName(pkg) {
            packageCache[pkg.name] = pkg
            packageNameCache.push(pkg.name)
        })
        pluginCache = Object.keys(manager.plugins)
    })
}

function enable() {
    command.on(this, 'mpm', {
        cmd: function (sender, command, args) {
            if (args.length > 0) {
                switch (args[0]) {
                    case "list":
                        console.sender(sender, '§6当前 §bMiaoScriptPackageCenter §6中存在下列插件:')
                        for (var pkgName in packageCache) {
                            var pkg = packageCache[pkgName]
                            console.sender(sender, '§6插件名称: §b%s §6版本: §a%s'.format(pkg.name, pkg.version))
                        }
                        break
                    case "install":
                        if (args.length > 1) {
                            download(sender, args[1]);
                        } else {
                            console.sender(sender, '§c请输入插件名称!')
                        }
                        break
                    case "update":
                        if (args.length > 1) {
                            update(sender, args[1]);
                        } else {
                            load();
                            console.sender(sender, "§a仓库缓存刷新成功 共存在 §b" + pluginCache.length + " §a个插件!")
                        }
                        break
                    case "upgrade":
                        break
                    case "delete":
                        if (args.length > 1) {
                            del(sender, args[1]);
                        } else {
                            console.sender(sender, '§c请输入插件名称!')
                        }
                        break
                    case "reload":
                        if (args.length > 1) {
                            var pname = args[1]
                            if (pluginCache.indexOf(pname) !== -1) {
                                manager.reload(pname)
                            } else {
                                console.sender(sender, '§c插件 %s 不存在!'.format(pname))
                            }
                        } else {

                        }
                        break
                    case "help":
                        sendHelp(sender);
                        break;
                }
            } else {
                sendHelp(sender);
            }
        },
        tab: function (sender, command, args) {
            if (args.length === 1) return ['list', 'install', 'update', 'upgrade', 'reload']
            if (args.length > 1) {
                switch (args[0]) {
                    case "install":
                        return packageNameCache;
                    case "update":
                    case "upgrade":
                    case "reload":
                        return pluginCache;
                }
            }
        }
    })
}

function sendHelp(sender){
    [
        '§6========= §a' + description.name + ' §6帮助 §aBy §b喵♂呜 §6=========',
        '§6/mpm §ainstall <插件名称> §6- §3安装插件',
        '§6/mpm §alist §6- §3列出仓库插件',
        '§6/mpm §aupdate <插件名称> §6- §3更新插件(无插件名称则更新源)',
        '§6/mpm §aupgrade <插件名称> §6- §3及时更新插件(update需要重启生效)',
        '§6/mpm §areload <插件名称> §6- §3重载插件(无插件名称则重载自生)',
    ].forEach(function (msg) {
        console.sender(sender, msg);
    })
}

function del(sender, name) {
    if (pluginCache.indexOf(name) !== -1) {
        console.sender(sender, '§c插件 %s 不存在!'.format(name));
        return;
    }
    manager.disable(name);
    fs.delete(plugin.__FILE__);
}

function download(sender, name) {
    var plugin = packageCache[name];
    if (!plugin) {
        console.sender(sender, '§c插件§b', name, '§c不存在')
        return;
    }
    var pfile = fs.file(__dirname, pname + '.js')
    console.sender(sender, '§6开始下载插件: §b%s'.format(pkg.name))
    console.sender(sender, '§6插件下载地址: §b%s'.format(pkg.url))
    fs.save(pfile, http.get(pkg.url))
    console.sender(sender, '§6插件 §b%s §a下载完毕 开始加载 ...'.format(pname))
    manager.loadPlugin(pfile)
    console.sender(sender, '§6插件 §b%s §a安装成功!'.format(pname))
}

function disable() {

}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
}
