#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = __importDefault(require("commander"));
var GitMgr_1 = require("./GitMgr");
// let gitOP = new GitOp();
// gitOP.add('D:/demos/preact_ts').then((data)=>{
//     console.log('...data',data)
// }).catch((err)=>{
//     console.log('....err ',err)
// })
commander_1.default
    .usage("<command> [options]")
    .option("-v, --verbose", "显示详细执行过程")
    .option("-d, --dirctory <value>", "文件根目录(package.json存在的目录)")
    .parse(process.argv);
if (!commander_1.default.dirctory) {
    commander_1.default.help();
}
else {
    var d = commander_1.default.dirctory;
    var gitMgr = new GitMgr_1.GitMgr(d);
    gitMgr.autoStart();
}
