/**
 * 服务器探测类
 */
/*global base*/
var ServerType = {
    Bukkit: 1,
    Sponge: 2
};
var MServer;
var DetectServerType = ServerType.Bukkit;
try {
    MServer = Java.type("org.bukkit.Bukkit");
    DetectServerType = ServerType.Bukkit;
} catch (ex) {
    // IGNORE
}
try {
    MServer = Java.type("org.spongepowered.api.Sponge");
    DetectServerType = ServerType.Sponge;
} catch (ex) {
    // IGNORE
}