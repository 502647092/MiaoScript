'use strict';
/**
 * Bukkit 事件相关类
 */
/*global Java, base, module, exports, require, __FILE__*/

function EventHandlerDefault() {
    var Thread = Java.type("java.lang.Thread");

    this.plugin = require('./server').plugin.self;
    this.mapEvent = [];
    this.listenerMap = [];
    this.baseEventDir = '';

    /**
     * 扫描包 org.bukkit.event 下的所有事件
     * 映射简写名称 org.bukkit.event.player.PlayerLoginEvent => playerloginevent
     */
    this.mapEventName = function mapEventName() {
        if (this.baseEventDir === "") {
            throw new Error("事件基础包名为空 无法进行事件映射!");
        }
        var count = 0;
        var dirs = Thread.currentThread().getContextClassLoader().getResources(this.baseEventDir);
        while (dirs.hasMoreElements()) {
            var url = dirs.nextElement();
            var protocol = url.protocol;
            if (protocol === "jar") {
                // noinspection JSUnresolvedVariable
                var jar = url.openConnection().jarFile;
                var entries = jar.entries();
                while (entries.hasMoreElements()) {
                    var entry = entries.nextElement();
                    var name = entry.name;
                    // 以 org/bukkit/event 开头 并且以 .class 结尾
                    if (name.startsWith(this.baseEventDir) && name.endsWith(".class")) {
                        var i = name.replaceAll('/', '.');
                        try {
                            var clz = base.getClass(i.substring(0, i.length - 6));
                            // 继承于 org.bukkit.event.Event 访问符为Public
                            if (this.isVaildEvent(clz)) {
                                // noinspection JSUnresolvedVariable
                                var simpleName = this.class2Name(clz);
                                console.debug("Mapping Event [%s] => %s".format(clz.name, simpleName));
                                this.mapEvent[simpleName] = clz;
                                count++;
                            }
                        } catch (ex) {
                            //ignore already loaded class
                        }
                    }
                }
            }
        }
        return count;
    }

    this.class2Name = function class2Name(clazz) {
        return clazz.simpleName.toLowerCase();
    }

    this.name2Class = function name2Class(name, event) {
        var eventCls = this.mapEvent[event] || this.mapEvent[event.toLowerCase()] || this.mapEvent[event + 'Event'] || this.mapEvent[event.toLowerCase() + 'event'];
        if (!eventCls) {
            try {
                eventCls = base.getClass(eventCls);
                this.mapEvent[event] = eventCls;
            } catch (ex) {
                console.console("§6插件 §b%s §6注册事件 §c%s §6失败 §4事件未找到!".format(name, event));
                console.ex(new Error("插件 %s 注册事件 %s 失败 事件未找到!".format(name, event)))
                return;
            }
        }
        return eventCls;
    }

    /**
     * 判断是否为一个有效的事件类
     * @param clz
     * @returns {*|boolean}
     */
    this.isVaildEvent = function isVaildEvent(clz) {
        throw new Error("当前服务器不支持事件系统!");
    }

    this.register = function register(eventCls, listener, priority, ignoreCancel) {
        throw new Error("当前服务器不支持事件系统!");
    }
    
    this.unregister = function unregister(event, listener) {
        throw new Error("当前服务器不支持事件系统!");
    }
    
    /**
     * 添加事件监听
     * @param jsp
     * @param event
     * @param exec {function}
     * @param priority [LOWEST,LOW,NORMAL,HIGH,HIGHEST,MONITOR]
     * @param ignoreCancel
     */
    this.listen = function listen(jsp, event, exec, priority, ignoreCancel) {
        var name = jsp.description.name;
        if (ext.isNull(name)) throw new TypeError('插件名称为空 请检查传入参数!');
        var eventCls = this.name2Class(name, event);
        if (!eventCls) { return; }
        if (typeof priority === 'boolean') {
            ignoreCancel = priority;
            priority = 'NORMAL';
        }
        priority = priority || 'NORMAL';
        ignoreCancel = ignoreCancel || false;
        // noinspection JSUnusedGlobalSymbols
        var listener = this.register(eventCls, priority, ignoreCancel);
        var listenerMap = this.listenerMap;
        // 添加到缓存 用于关闭插件的时候关闭事件
        if (!listenerMap[name]) listenerMap[name] = [];
        var off = {
            event: eventCls,
            listener: listener,
            off: function () {
                this.unregister(eventCls, listener);
                console.debug('插件 %s 注销事件 %s'.format(name, this.class2Name(eventCls)));
            }
        };
        listenerMap[name].push(off);
        // noinspection JSUnresolvedVariable
        console.debug('插件 %s 注册事件 %s => %s'.format(name, eventCls.name.substring(eventCls.name.lastIndexOf(".") + 1), exec.name === '' ? '匿名方法' : exec.name));
        return off;
    }
}
var EventHandler = Object.assign({}, new EventHandlerDefault(), requireInternal('event'));
// 映射事件名称
console.info('%s 事件映射完毕 共计 %s 个事件!'.format(DetectServerType, EventHandler.mapEventName().toFixed(0)));
module.exports = {
    on: EventHandler.listen.bind(EventHandler),
    disable: function (jsp) {
        var jspl = EventHandler.listenerMap[jsp.description.name];
        if (jspl) {
            jspl.forEach(function (t) t.off.bind(EventHandler)());
            delete EventHandler.listenerMap[jsp.description.name];
        }
    }
};