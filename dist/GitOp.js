"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
// import path from 'path';
var cross_spawn_1 = __importDefault(require("cross-spawn"));
var GitOp = /** @class */ (function () {
    function GitOp() {
    }
    /**
     * 在指定路径init git
     * @param path
     */
    GitOp.prototype.init = function (path) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.run('git', ['init'], path, function (data, err) {
                if (err) {
                    console.log('err', err);
                    reject(err);
                    return;
                }
                if (data) {
                    console.log('success', data.toString());
                    resolve(data);
                }
            });
        });
    };
    GitOp.prototype.getVersion = function (path) {
        return new Promise(function (resolve, reject) {
            fs_1.default.readFile(path, 'utf-8', function (err, str) {
                if (err) {
                    reject(err.toString());
                    return;
                }
                var version = JSON.parse(str).version;
                resolve(version);
            });
        });
    };
    GitOp.prototype.setTag = function (path, v, m) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            m = m || '.....version: ' + v;
            _this.run('git', ['tag', '-a', v, '-m', m], path, function (data, err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    };
    GitOp.prototype.showTag = function (path, v) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.run('git', ['show', v], path, function (data, err) {
                if (err) {
                    console.log('err', err);
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    };
    /**
     * 增加上传文件
     * @param path
     */
    GitOp.prototype.add = function (path, parm) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            parm = parm || '.';
            _this.run('git', ['add', parm], path, function (data, err) {
                if (err) {
                    console.log('err', err);
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    };
    /**
     * 上传到本地
     * @param path
     * 上传起名
     * @param m
     */
    GitOp.prototype.commit = function (path, m) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            m = m || 'up';
            _this.run('git', ['commit', '-m', m], path, function (data, err) {
                if (err) {
                    console.log('err', err);
                    reject(err);
                    return;
                }
                if (data) {
                    resolve(data);
                }
            });
        });
    };
    /**
     * 更到最新
     * @param path
     */
    GitOp.prototype.pull = function (path) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getCurBranch(path, function (name) {
                console.log('name', name);
                _this.run('git', ['pull', 'origin', name], path, function (data, err) {
                    if (err) {
                        console.log('err', err);
                        reject(err);
                        return;
                    }
                    console.log('success', data);
                    resolve(data);
                });
            });
        });
    };
    /**
     * 上传到当前分支
     * @param path
     * 上传起名
     * @param m
     */
    GitOp.prototype.push = function (path, m) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getCurBranch(path, function (name) {
                console.log('name', name);
                _this.run('git', ['push', 'origin', name], path, function (data, err) {
                    if (err) {
                        console.log('err', err);
                        reject(err);
                        return;
                    }
                    console.log('success', data);
                    resolve(data);
                });
            });
        });
    };
    /**
     * 切换到指定commit
     * @param path
     * @param commit
     */
    GitOp.prototype.checkoutCommit = function (path, commit) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.run('git', ['checkout', commit], path, function (data, err) {
                if (err) {
                    console.log('err', err);
                    reject(err);
                    return;
                }
                console.log('data', data);
                resolve(data);
            });
        });
    };
    /**
     * 直接删除目录就行
     * @param path
     */
    GitOp.prototype.deleteRepositiory = function (path) {
        var files = [];
        var self = this;
        if (fs_1.default.existsSync(path)) {
            files = fs_1.default.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs_1.default.statSync(curPath).isDirectory()) {
                    self.deleteRepositiory(curPath);
                }
                else {
                    fs_1.default.unlinkSync(curPath);
                }
            });
            fs_1.default.rmdirSync(path);
        }
    };
    /**
     * 获得历史上传
     * @param path
     */
    GitOp.prototype.listHistory = function (path) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.run('git', ['log'], path, function (data, err) {
                if (data) {
                    // console.log('data:  ',data);
                    resolve(_this.convertLog(data.toString()));
                }
                reject(err);
            });
        });
    };
    // $ git name-rev --name-only HEAD
    GitOp.prototype.getCurBranch = function (path, cb) {
        this.run('git', ['name-rev', '--name-only', 'HEAD'], path, function (stdout, err) {
            if (err) {
                cb(null);
                return;
            }
            cb(stdout);
        });
        // this.run('git',['branch'],path,(stdout:any,err:any)=>{
        //         if(err){
        //             cb(null);
        //             return;
        //         }
        //         let lines = stdout.replace('\t','').split('\n');
        //         for(let i=0;i<lines.length;++i){
        //             let line = lines[i].trim();
        //             if(line.startsWith('*')){
        //                 cb(line.split('*')[1].trim());
        //                return;
        //             }
        //         }
        //         cb(null)
        //     }
        // )
    };
    GitOp.prototype.run = function (cmd, args, cwd, cb) {
        var process = cross_spawn_1.default(cmd, args, {
            cwd: cwd,
        });
        process.stderr.on('data', function (err) {
            // console.log('err',err)
            cb(null, err.toString());
            // throw new Error(err.toString())
        });
        process.stdout.on('data', function (data) {
            cb(data.toString(), null);
        });
        process.on('exit', function (data) {
            cb(data.toString(), null);
        });
    };
    /**
     * 转换 git log
     *
     */
    GitOp.prototype.convertLog = function (str) {
        var lines = str.replace('\t', '').split('\n');
        var commits = [];
        var dates = [];
        var authors = [];
        lines.forEach(function (line) {
            line = line.trim();
            if (!line)
                return;
            if (line.startsWith('commit')) {
                commits.push(line.split('commit')[1].trim());
            }
            else if (line.startsWith('Author')) {
                authors.push(line.split('Author')[1].substring(1).trim());
            }
            else if (line.startsWith('Date')) {
                dates.push(line.split('Date')[1].substring(1).trim());
            }
        });
        var arr = [];
        for (var i = 0; i < commits.length; ++i) {
            arr.push({
                commit: commits[i],
                // authors:authors[i],
                date: dates[i]
            });
        }
        return arr;
    };
    return GitOp;
}());
exports.GitOp = GitOp;
