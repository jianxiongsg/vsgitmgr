"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var GitOp_1 = require("./GitOp");
var path_1 = __importDefault(require("path"));
var chokidar_1 = __importDefault(require("chokidar"));
var GitMgr = /** @class */ (function () {
    function GitMgr(fpath) {
        this._path = fpath;
        this._packagePath = path_1.default.join(this._path, 'package.json');
        this._gitOp = new GitOp_1.GitOp();
        this._preV = '';
    }
    GitMgr.prototype.autoStart = function () {
        var _this = this;
        console.log('开始监听文件：' + this._packagePath);
        chokidar_1.default.watch(this._packagePath).on('change', function (path, status) {
            _this.check();
        });
    };
    GitMgr.prototype.check = function () {
        var _this = this;
        this._gitOp.getVersion(this._packagePath).then(function (newV) {
            var v = newV;
            if (!_this._preV || _this._preV != v) {
                _this._preV = v;
                _this._gitOp.add(_this._path).then(function () {
                    _this._gitOp.commit(_this._path).then(function () {
                        _this._gitOp.setTag(_this._path, v).then(function () {
                            console.log('commit success ', v);
                            // this._gitOp.showTag(this._path,v)
                        }).catch(function (err) {
                            console.log('err', err);
                        });
                    }).catch(function (err) {
                        console.log('err', err);
                    });
                }).catch(function (err) {
                    console.log('err', err);
                });
            }
        }).catch(function (err) {
            console.log('err', err);
        });
    };
    return GitMgr;
}());
exports.GitMgr = GitMgr;
