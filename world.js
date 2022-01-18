class Block{
    /** @param {number} id @param {number} light @param {number} data */
    constructor(id,light,data=0){
        this.id = id;
        this.data = data;
        this.light = light;
    }

    static DEBUG = 0;
    static GRASS = 1;
    static DIRT = 2;
    static STONE = 3;

    static transparent = new Set([0,28]);
}

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
        this.blockData = new Uint16Array(Chunk.TOTAL_BLOCKS);

        this.setFromPositions(positions||[]);
    }

    /** @param {[number,number,number,number][]} positions */
    setFromPositions(positions){
        this.blockIds.fill(0);
        this.blockLight.fill(0);
        this.blockLightFrom.fill(65535);
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
                for(let y = HEIGHT - 2; y >= 0 && Block.transparent.has(this.getBlockIdAt(x,y,z)); y--){
                    queue.push([x,y,z,255]);
                    this.setBlockLightAt(x,y,z,255);
                    this.setBlockLightFromAt(x,y,z,x,y + 1,z);
                }
                
            }
        }
        
        let i = 0, MAX_UPDATES = TOTAL_BLOCKS * 64;
        while(++i < MAX_UPDATES && !queue.empty()){
            let [x,y,z,lvl] = queue.pop();

            const C = 32;

            for(let [dx,dy,dz,dl] of [[0,1,0,C],[0,-1,0,C],[1,0,0,C],[-1,0,0,C],[0,0,1,C],[0,0,-1,C]]){
                let [xx,yy,zz,ll] = [x + dx, y + dy, z + dz, lvl - dl];
                if(!this._inRange(xx,yy,zz)) continue;
                if(!Block.transparent.has(this.getBlockIdAt(xx,yy,zz))) continue;
                if(ll > this.getBlockLightAt(xx,yy,zz))
                    this.setBlockLightAt(xx,yy,zz,ll),
                    this.setBlockLightFromAt(xx,yy,zz,x,y,z),
                    queue.push([xx,yy,zz,ll]);
            }
        }
        
        if(log)
            if(i == MAX_UPDATES) console.warn("Too many lighting updates!");
            else console.log("Updated lighting in " + i + " steps (" + Math.round(i * 10000 / 65536) / 100 + "% of total chunk size)");
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
                if(this._inRange(xx,yy,zz) && Block.transparent.has(this.getBlockIdAt(xx,yy,zz)) && ll > this.getBlockLightAt(xx,yy,zz))
                    this.setBlockLightAt(xx,yy,zz,ll),
                    queue.push([xx,yy,zz,ll]);
            }
        }

        if(log)
            if(i == MAX_UPDATES) console.warn("Too many lighting updates!");
            else console.log("Updated lighting in " + i + steps);
    }

    getMesh(tx,ty,tz){
        let {WIDTH,HEIGHT,DEPTH,TOTAL_BLOCKS,MESH_GEN} = Chunk;

        let faceCount = 0;
        for(let x = 0; x < WIDTH; x++){
            for(let y = 0; y < HEIGHT; y++){
                for(let z = 0; z < DEPTH; z++){
                    if(this.getBlockIdAt(x,y,z) == 0) continue;
                    for(let [dx,dy,dz] of [[0,1,0],[0,-1,0],[0,0,-1],[0,0,1],[1,0,0],[-1,0,0]]){
                        let [xx,yy,zz] = [x + dx, y + dy, z + dz];
                        if(!this._inRange(xx,yy,zz) || Block.transparent.has(this.getBlockIdAt(xx,yy,zz)) && this.getBlockIdAt(x,y,z) != this.getBlockIdAt(xx,yy,zz)){
                            faceCount++;
                        }
                    }
                }
            }
        }

        const faceNormals = [[0,1,0],[0,-1,0],[0,0,-1],[0,0,1],[1,0,0],[-1,0,0]];
        const vertsDirections = [0,1,2,3,4,5].map(i=>[0,1,2,3,4,5].map(j=>MESH_GEN.getPos(i,j,[0,0,0]).map(k=>k*2-1)));
        // wgllib.core.math.m4.axisRotate()

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
                        if(!this._inRange(xx,yy,zz) || Block.transparent.has(this.getBlockIdAt(xx,yy,zz)) && this.getBlockIdAt(x,y,z) != this.getBlockIdAt(xx,yy,zz)){
                            let faceLight = this._inRange(xx,yy,zz) ? this.getBlockLightAt(xx,yy,zz) : 255;

                            for(let vertex = 0; vertex < 6; vertex++){

                                // vertsDirections[face][vertex]

                                let vertOffset = MESH_GEN.facev[face][vertex];

                                [data[i++],data[i++],data[i++]] = MESH_GEN.getPos(face,vertex,[x - tx,y - ty,z - tz]);
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

    // getBlockAt(x,y,z){return new Block(this.getBlockIdAt(x,y,z),this.getBlockLightAt(x,y,z),this.getBlockDataAt(x,y,z))}
    // setBlockAt(x,y,z,id,light,data){id!==undefined&&this.setBlockIdAt(x,y,z,id);light!==undefined&&this.setBlockLightAt(x,y,z,light);data!=undefined&&this.setBlockDataAt(x,y,z,data)}
}

class Chunks{
    constructor(){
        /** @type {Map<string, Chunk} */
        this.chunks = new Map();

        // this.dirty = new Map
    }
    chunkAt(X,Z){
        if(this.chunks.has(X+","+Z)) return this.chunks.get([X,Z]);
        return this.generateChunk(X,Z);
    }
    _placeChunkAt(X,Z,chunk){
        this.chunks.set(X+","+Z,chunk);
    }

    _noise2(x,y){
        return (noise.simplex2(x,y) + noise.simplex2(x / 2, y / 2) / 2 + noise.simplex2(x / 4, y / 4) / 4) / 2;
    }
    _noise3(x,y,z){
        return (noise.simplex3(x,y,z) + noise.simplex3(x / 2, y / 2, z / 2) / 2 + noise.simplex3(x / 4, y / 4, z / 4) / 4) / 2;
    }

    generateChunk(X,Z){
        let res = new Chunk();

        const scale = 16, offset = 10, yScale = 4, perturb = 8, perturbScale = 10;

        for(let x = 0; x < Chunk.WIDTH; x++){
            for(let z = 0; z < Chunk.WIDTH; z++){
                for(let y = 0; y < Chunk.HEIGHT; y++){
                    let trueX = x + X * 16, trueZ = z + Z * 16;
                    let trueY = y;
                    let perturbX = this._noise3((trueX + 3404) / perturbScale, (y + 7219) / perturbScale, (trueZ + 7827) / perturbScale) * perturb;
                    let perturbY = this._noise3((trueX +10360) / perturbScale, (y + 8904) / perturbScale, (trueZ + 2085) / perturbScale) * perturb;
                    let perturbZ = this._noise3((trueX +10095) / perturbScale, (y + 5274) / perturbScale, (trueZ + 2683) / perturbScale) * perturb;

                    trueX += perturbX;
                    trueY += perturbY;
                    trueZ += perturbZ;

                    let height = ~~((this._noise2(trueX / scale, trueZ / scale) + 1) * yScale + offset);
                    if(trueY < height)
                        res.setBlockIdAt(x,y,z,3);
                }
            }
        }

        res.updateAllLighting();
        this._placeChunkAt(X,Z,res);
        return res;
    }

    blockAt(x,y,z){
        if(y < 0 || y > 255) throw new Error(`Block out of bounds : (${x}, ${y}, ${z})`);
        return this.chunks.get([x>>4,z>>4]).getBlockAt(x&15,y,z&15);
    }
    setBlockAt(x,y,z,id,light,data){
        this.chunks.get([x>>4,z>>4]).setBlockAt(x&15,y,z&15,id,light,data);
    }
    getMeshes(x,y,z){
        const RENDER_DISTANCE = 3;
        let data = new Array((RENDER_DISTANCE * 2 + 1) * (RENDER_DISTANCE * 2 + 1));
        let i = 0;
        const X = x >> 4, Z = z >> 4;
        for(let chunkOffsetX = -RENDER_DISTANCE; chunkOffsetX <= RENDER_DISTANCE; chunkOffsetX++)
            for(let chunkOffsetZ = -RENDER_DISTANCE; chunkOffsetZ <= RENDER_DISTANCE; chunkOffsetZ++)
                data[i++] = this.chunkAt(X + chunkOffsetX,Z + chunkOffsetZ).getMesh(x - 16 * chunkOffsetX,y,z - 16 * chunkOffsetZ);
        return data;
    }
}