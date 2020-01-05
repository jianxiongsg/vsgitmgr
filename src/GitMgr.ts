import { GitOp } from "./GitOp";


export class GitMgr{
    private _gitOp:GitOp;
    private _preV:string;
    constructor(){
        this._gitOp = new GitOp();
        this._preV = '';
    }

    check(path:string,cb:()=>void){
        this._gitOp.getVersion(path).then((newV:unknown)=>{
            let v = newV as string;
            if(!this._preV || this._preV != v){
                this._preV = v;
                this._gitOp.add(path).then(()=>{
                    this._gitOp.commit(path).then(()=>{
                        this._gitOp.setTag(path,v).then(()=>{
                            cb();
                            console.log('commit success ',v);
                            // this._gitOp.showTag(this._path,v)
                        }).catch((err:string)=>{
                            console.log('err',err)
                        });
                    }).catch((err:string)=>{
                        console.log('err',err)
                    });
                }).catch((err:string)=>{
                    console.log('err',err)
                });
            }
        }).catch((err:string)=>{
            console.log('err',err);
        })
        
    }

}