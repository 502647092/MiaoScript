var SpongeConsole = {
    createNew: function () {
        var console = Console.createNew();
        console.sender = function () {
            var Text = Java.type("org.spongepowered.api.text.Text");
            var sender = arguments[0];
            if (!(sender instanceof org.spongepowered.api.command.CommandSource)) {
                this.error("第一个参数未实现 org.spongepowered.api.command.CommandSource 无法发送消息!")
            }
            var args = Array.prototype.slice.call(arguments, 1);
            sender.sendMessage(Text.of(console.prefix + args.join(' ')));
        };
        console.console = function () {
            this.sender(MServer.server.console, Array.prototype.join.call(arguments, ' '));
        };
        console.warn = function () {
            log.warn(this.name + Array.prototype.join.call(arguments, ' '));
        };
        return console;
    }
}
global.Console = SpongeConsole;
exports = global.Console;