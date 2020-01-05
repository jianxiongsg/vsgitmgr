import fs from 'fs';
// import path from 'path';
import spawn from 'cross-spawn';

export interface HistoryParams{
    commit:string,
    date:string,
}
export class GitOp{



    /**
     * 在指定路径init git
     * @param path 
     */
    
    init(path:string){
        return new Promise((resolve,reject)=>{
            this.run('git',['init'],path,(data:any,err:any)=>{
                if(err){
                    console.log('err',err);
                    reject(err);
                    return;
                }
                if(data){
                    console.log('success',data.toString())
                    resolve(data);
                }
            })
        })
        
    }

    getVersion(path:string){
        return new Promise((resolve,reject)=>{
            fs.readFile(path,'utf-8',(err,str)=>{
                if(err){
                    reject(err.toString());
                    return;
                }
                let version:string = JSON.parse(str).version;
                resolve(version);
            })
        })
    }

    setTag(path:string,v:string,m?:string){
        return new Promise((resolve,reject)=>{
            m = m || '.....version: ' + v;
            this.run('git',['tag','-a',v,'-m',m],path,(data:any,err:any)=>{
                if(err){
                   reject(err);
                   return;
                }
                resolve(data)
            })
        })
    }

    showTag(path:string,v:string){
        return new Promise((resolve,reject)=>{
            this.run('git',['show',v],path,(data:any,err:any)=>{
                if(err){
                   console.log('err',err);
                   reject(err);
                   return;
                }
                resolve(data)
            })
        })
    }

    /**
     * 增加上传文件
     * @param path
     */

    add(path:string,parm?:string){
        return new Promise((resolve,reject)=>{
            parm = parm || '.'
            this.run('git',['add',parm],path,(data:any,err:any)=>{
                if(err){
                   console.log('err',err);
                   reject(err);
                   return;
                }
                resolve(data)
            })
        })
    }


    /**
     * 上传到本地
     * @param path 
     * 上传起名
     * @param m
     */
    commit(path:string,m?:string){
        return new Promise((resolve,reject)=>{
            m = m || 'up';
            this.run('git',['commit','-m',m],path,(data:any,err:any)=>{
                if(err){
                    console.log('err',err);
                    reject(err);
                    return;
                }
                if(data){
                    resolve(data)
                }
            })
        }) 
    }


    /**
     * 更到最新
     * @param path 
     */
    pull(path:string){
        return new Promise((resolve,reject)=>{
            this.getCurBranch(path,(name:string)=>{
                console.log('name',name);
                this.run('git', ['pull','origin',name],path,(data:any,err:any)=>{
                    if(err){
                        console.log('err',err);
                        reject(err)
                        return;
                    }
                    console.log('success',data);
                    resolve(data)
                });
            })
        })
    }

    /**
     * 上传到当前分支
     * @param path 
     * 上传起名
     * @param m
     */
    push(path:string,m?:string){
        return new Promise((resolve,reject)=>{
            this.getCurBranch(path,(name:string)=>{
                console.log('name',name);
                this.run('git', ['push','origin',name],path,(data:any,err:any)=>{
                    
                    if(err){
                        console.log('err',err);
                        reject(err)
                        return;
                    }
                    console.log('success',data);
                    resolve(data)
                });
            })
        })
    }
    
    /**
     * 切换到指定commit
     * @param path 
     * @param commit 
     */
    checkoutCommit(path:string,commit:string){
        return new Promise((resolve,reject)=>{
            this.run('git',['checkout',commit],path,(data:any,err:any)=>{
                if(err){
                    console.log('err',err);
                    reject(err);
                    return;
                }
                console.log('data',data);
                resolve(data)
            })
            
        })
    }

    

    /**
     * 直接删除目录就行
     * @param path 
     */
    deleteRepositiory(path:string){
        let files = [];
        let self = this;
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                let curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) {
                    self.deleteRepositiory(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }

    

    /**
     * 获得历史上传
     * @param path 
     */
    listHistory(path:string):Promise<HistoryParams[]>{
        return new Promise((resolve,reject)=>{
            this.run('git',['log'],path,(data:any,err:any)=>{
                if(data){
                    // console.log('data:  ',data);
                    resolve(this.convertLog(data.toString()))
                }
                reject(err)
            })
        })
    }
    // $ git name-rev --name-only HEAD

    getCurBranch(path:string,cb:(branch:any)=>void){
        this.run('git',['name-rev','--name-only','HEAD'],path,(stdout:any,err:any)=>{
            if(err){
                cb(null);
                return;
            }
            cb(stdout)
        })
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
    }

    run(cmd:string,args:string[],cwd:string,cb:(data:any,err:any)=>void){
        let process:any = spawn(cmd,args,{
            cwd:cwd,
            // shell:true
        })
        process.stderr.on('data',(err:any)=>{
            // console.log('err',err)
            cb(null,err.toString())
            // throw new Error(err.toString())
        })
        process.stdout.on('data',(data:any)=>{
            cb(data.toString(),null)
        })
        process.on('exit',(data:any)=>{
            cb(data.toString(),null)
        })
    }
   


    /**
     * 转换 git log
     * 
     */
    convertLog(str:string){
        let lines = str.replace('\t','').split('\n');
        let commits:string[] = [];
        let dates:string[] = [];
        let authors:string[] = [];
        lines.forEach((line:string)=>{
            line = line.trim();
            if(!line) return;
            if(line.startsWith('commit')){
                commits.push(line.split('commit')[1].trim())
            }else if(line.startsWith('Author')){
                authors.push(line.split('Author')[1].substring(1).trim())
            }else if(line.startsWith('Date')){
                dates.push(line.split('Date')[1].substring(1).trim())
            }
        })
        let arr = [];
        for(let i=0;i<commits.length;++i){
            arr.push({
                commit:commits[i],
                // authors:authors[i],
                date:dates[i]
            })
        }
        return arr;
    }
}