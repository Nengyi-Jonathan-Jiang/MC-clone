class Chunk{
    static WIDTH = 16; 
    static HEIGHT = 256;
    static DEPTH = 16;
    static TOTAL_BLOCKS = Chunk.WIDTH * Chunk.HEIGHT * Chunk.DEPTH;

    static MESH_GEN = new wgllib.gameUtil.CubeMeshGenerator(16, 16);

    /** @param {[number,number,number,number][]} [positions] */
    constructor(positions){
        this.blockIds =  new Uint16Array(Chunk.TOTAL_BLOCKS);
        this.blockLight = new Uint8Array(Chunk.TOTAL_BLOCKS);
        this.blockLightFrom = new Uint16Array(Chunk.TOTAL_BLOCKS * 3);
        this.faceLight = new Uint8Array(Chunk.TOTAL_BLOCKS * 6);
        this.blockData = new Uint16Array(Chunk.TOTAL_BLOCKS);

        this.setFromPositions(positions||[]);
    }

    /** @param {[number,number,number,number][]} positions */
    setFromPositions(positions){
        this.blockIds.fill(0);
        this.blockLight.fill(0);
        this.blockLightFrom.fill(65535);
        this.faceLight.fill(0);
        this.blockData.fill(0);

        for(let [x,y,z,id] of positions) this.setBlockIdAt(x,y,z,id);

        this.updateAllLighting();
    }

    updateAllLighting(log=true){
        const {WIDTH, HEIGHT, DEPTH, TOTAL_BLOCKS} = Chunk;

        this.blockLight.fill(0);

        /** @type {PriorityQueue<[number,number,number,number]>*/
        let queue = new PriorityQueue((a,b) => a[3] > b[3]);
        for(let x = 0; x < WIDTH; x++){
            for(let z = 0; z < DEPTH; z++){
                for(let y = HEIGHT - 2; y >= 0 && this.getBlockIdAt(x,y,z) == 0; y--){
                    queue.push([x,y,z,255]);
                    this.setBlockLightAt(x,y,z,255);
                    this.setBlockLightFromAt(x,y,z,x,y + 1,z);
                }
                
            }
        }
        
        let i = 0, MAX_UPDATES = TOTAL_BLOCKS * 64;
        while(++i < MAX_UPDATES && !queue.empty()){
            let [x,y,z,lvl] = queue.pop();

            const C = 16;

            for(let [dx,dy,dz,dl] of [[0,1,0,C],[0,-1,0,C],[1,0,0,C],[-1,0,0,C],[0,0,1,C],[0,0,-1,C]]){
                let [xx,yy,zz,ll] = [x + dx, y + dy, z + dz, lvl - dl];
                if(!this._inRange(xx,yy,zz)) continue;
                if(this.getBlockIdAt(xx,yy,zz) != 0) continue;
                if(ll > this.getBlockLightAt(xx,yy,zz))
                    this.setBlockLightAt(xx,yy,zz,ll),
                    this.setBlockLightFromAt(xx,yy,zz,x,y,z),
                    queue.push([xx,yy,zz,ll]);
            }
        }
        
        if(log)
            if(i == MAX_UPDATES) console.warn("Too many lighting updates!");
            else console.log("Updated lighting in " + i + "steps");
    }

    
    /** @param {[number,number,number][]} positions */
    updateLighting(positions, log=true){
        const {TOTAL_BLOCKS} = Chunk;

        this.blockLight.fill(0);

        /** @type {PriorityQueue<[number,number,number,number]>*/
        let queue = new PriorityQueue((a,b) => a[3] > b[3]);
        for(let [x,y,z] of positions){
            this.setBlockLightAt(x,y,z,0);
            if(this.getBlockIdAt(x,y - 1,z) == 0)
                queue.push([x,y - 1,z,0]);
        }
        
        let i = 0, MAX_UPDATES = TOTAL_BLOCKS * 64;
        while(++i < MAX_UPDATES && !queue.empty()){
            let [x,y,z,lvl] = queue.pop();

            for(let [dx,dy,dz,dl] of [[0,1,0,16],[0,-1,0,0],[1,0,0,16],[-1,0,0,16],[0,0,1,16],[0,0,-1,16]]){
                let [xx,yy,zz,ll] = [x + dx, y + dy, z + dz, lvl - dl];
                if(this._inRange(xx,yy,zz) && this.getBlockIdAt(xx,yy,zz) == 0 && ll > this.getBlockLightAt(xx,yy,zz))
                    this.setBlockLightAt(xx,yy,zz,ll),
                    queue.push([xx,yy,zz,ll]);
            }
        }

        if(log)
            if(i == MAX_UPDATES) console.warn("Too many lighting updates!");
            else console.log("Updated lighting in " + i + steps);
    }

    getMesh(){
        let {WIDTH,HEIGHT,DEPTH,TOTAL_BLOCKS,MESH_GEN} = Chunk;

        let faceCount = 0;
        for(let x = 0; x < WIDTH; x++){
            for(let y = 0; y < HEIGHT; y++){
                for(let z = 0; z < DEPTH; z++){
                    if(this.getBlockIdAt(x,y,z) == 0) continue;
                    for(let [dx,dy,dz] of [[0,1,0],[0,-1,0],[0,0,-1],[0,0,1],[1,0,0],[-1,0,0]]){
                        let [xx,yy,zz] = [x + dx, y + dy, z + dz];
                        if(!this._inRange(xx,yy,zz) || this.getBlockIdAt(xx,yy,zz) == 0){
                            faceCount++;
                        }
                    }
                }
            }
        }

        const vertCount = faceCount * 6;
        let data = new Float32Array(vertCount * 6);
        let i = 0;
        for(let x = 0; x < WIDTH; x++){
            for(let y = 0; y < HEIGHT; y++){
                for(let z = 0; z < DEPTH; z++){
                    const blockId = this.getBlockIdAt(x,y,z);
                    if(blockId == 0) continue;

                    for(let face = 0; face < 6; face++){
                        let [dx,dy,dz] = [[0,1,0],[0,-1,0],[0,0,-1],[0,0,1],[1,0,0],[-1,0,0]][face];
                        let [xx,yy,zz] = [x + dx, y + dy, z + dz];
                        if(!this._inRange(xx,yy,zz) || this.getBlockIdAt(xx,yy,zz) == 0){
                            let faceLight = this._inRange(xx,yy,zz) ? this.getBlockLightAt(xx,yy,zz) : 255;

                            for(let vertex = 0; vertex < 6; vertex++){
                                [data[i++],data[i++],data[i++]] = MESH_GEN.getPos(face,vertex,[x,y,z]);
                                [data[i++],data[i++]] = MESH_GEN.getTex(face, vertex, blockId);
                                data[i++] = 1 - [1,.64,.8,.8,.8,.8][face] * faceLight / 255;
                            }
                        }
                    }
                }
            }
        }

        return data;
    }

    logLighting(){
        function f(n){return " .:-=+*Q#M%@░▒▓█"[Math.floor(n / 16)].repeat(2)}
        for(let y = Chunk.HEIGHT; y --> 0;)
            console.log(
                "%c" + new Array(Chunk.WIDTH).fill(0).map(
                    (_,x)=>new Array(Chunk.DEPTH).fill(0).map(
                        (_,z)=>this.getBlockLightAt(x,y,z)
                    ).map(f).join("")
                ).join("\n"),
                "font-family:monospace;"
            )
    }

    _mapPos(x,y,z){return (x * Chunk.DEPTH + z) * Chunk.HEIGHT + y}
    _inRange(x,y,z){return x>=0&&y>=0&&z>=0&&x<Chunk.WIDTH&&y<Chunk.HEIGHT&&z<Chunk.DEPTH}

    getBlockIdAt(x,y,z){return this.blockIds[this._mapPos(x,y,z)]}
    setBlockIdAt(x, y, z, id) {this.blockIds[this._mapPos(x,y,z)] = id}
    getBlockDataAt(x,y,z){return this.blockData[this._mapPos(x,y,z)]}
    setBlockDataAt(x,y,z, data) {this.blockData[this._mapPos(x,y,z)] = data}
    getBlockLightAt(x,y,z){return this.blockLight[this._mapPos(x,y,z)]}
    setBlockLightAt(x,y,z, light){this.blockLight[this._mapPos(x,y,z)] = light}
    getBlockLightFromAt(x,y,z){return [...this.blockLightFrom.slice(this._mapPos(x,y,z) * 3, this._mapPos(x,y,z) * 3 + 3)]}
    setBlockLightFromAt(x,y,z,fx,fy,fz) {this.blockLightFrom.set([fx,fy,fz], this._mapPos(x,y,z) * 3)}
    getFaceLightAt(x,y,z,face){return this.blockLight[this._mapPos(x,y,z) * 6 + face]}
    setFaceLightAt(x,y,z,face, light){this.blockLight[this._mapPos(x,y,z) * 6 + face] = light}
}

class Chunks{
    constructor(){

    }
}