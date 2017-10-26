'use strict';

/*global Java, base, module, exports, require, __FILE__*/

var ZipFile = Java.type("java.util.zip.ZipFile");
var fs = require('fs');

/**
 * 解压文件
 * @param zipFile 压缩文件
 * @param target 目标目录(不传则为zip文件同级目录)
 */
function unzip(zipFile, target) {
    if (!zipFile.exists()) {
        console.warn("解压文件 %s 错误 文件不存在!".format(zipFile));
        return;
    }
    if (target === undefined) {
        var fname = zipFile.name;
        // noinspection JSUnresolvedVariable
        target = fs.file(zipFile.parentFile.canonicalPath, fname.substring(0, fname.length() - 4));
    }
    console.debug("解压文件 %s 到目录 %s".format(zipFile.canonicalPath, target));
    var zipObj = new ZipFile(zipFile);
    var e = zipObj.entries();
    while (e.hasMoreElements()) {
        var entry = e.nextElement();
        if (entry.isDirectory()) {
            continue;
        }
        var destinationFilePath = fs.file(target, entry.name);
        destinationFilePath.parentFile.mkdirs();
        fs.copy(zipObj.getInputStream(entry), destinationFilePath, true);
    }
    zipObj.close();
}

exports.unzip = unzip;