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

    static getTransparency(blockId){
        return 1 - ({    //This object stores how much light passes through the block
            0: 1,
            28: 1,
        }[blockId] || 0);
    }
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

        //Initialize all lighting to 0
        this.blockLight.fill(0);

        //Priority queue containing lighting updates
        /** @type {PriorityQueue<[number,number,number,number]>*/
        let queue = new PriorityQueue((a,b) => a[3] > b[3]);

        //For each column
        for(let x = 0; x < WIDTH; x++){
            for(let z = 0; z < DEPTH; z++){
                //Set the light level of all blocks exposed to skylight to max
                for(let y = HEIGHT - 2; y >= 0 && Block.transparent.has(this.getBlockIdAt(x,y,z)); y--){
                    //Set the light level of the block
                    this.setBlockLightAt(x,y,z,255);
                    //The light comes from the block above
                    this.setBlockLightFromAt(x,y,z,x,y + 1,z);
                    //Add the update to the priority queue
                    queue.push([x,y,z,255]);
                }
                
            }
        }
        
        let i = 0, MAX_UPDATES = TOTAL_BLOCKS * 64;
        while(++i < MAX_UPDATES && !queue.empty()){
            const [x,y,z,lvl] = queue.pop();

            for(let [dx,dy,dz] of [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]){
                const [xx,yy,zz] = [x + dx, y + dy, z + dz];
                //Don't do lighting updates out of chunk (yet - will implement later)
                if(!this._inRange(xx,yy,zz)) continue;
                //This is the light value that will be propogated to the block
                const ll = lvl - Block.getTransparency(this.getBlockIdAt(xx,yy,zz));
                //Don't update the light level if it is lower than the current level
                if(ll > this.getBlockLightAt(xx,yy,zz))
                    //Set light level of the block
                    this.setBlockLightAt(xx,yy,zz,ll),
                    //Set where the light comes from
                    this.setBlockLightFromAt(xx,yy,zz,x,y,z),
                    //Add this update to the priority queue
                    queue.push([xx,yy,zz,ll]);
            }
        }
        
        if(log)
            if(i == MAX_UPDATES) console.warn("Too many lighting updates!");
            else console.log("Updated lighting in " + i + " steps (" + Math.round(i * 10000 / 65536) / 100 + "% of total chunk size)");
    }

    
    /** @param {[number,number,number][]} positions */
    updateLighting(positions, log=true){
        console.warn("This method is not implemented yet!");
    }

    getMesh(tx,ty,tz){
        const {m4,toRad} = wgllib.core.math;

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
        const vertsOffsets = MESH_GEN.facev.map((f,face)=>f.map((v,vert)=>v.map(i=>2*i-1)).map((v,vert)=>[
            v,
            m4.addVectors(m4.addVectors(
                v.map(i=>i*Math.cos(toRad(45))),
                m4.cross(faceNormals[face], v).map(i=>i*Math.sin(toRad(45)))
                ),faceNormals[face].map(i=>i*m4.dot(faceNormals[face], v)*(1-Math.cos(toRad(45))))
            ).map(Math.round),
            m4.addVectors(m4.addVectors(
                v.map(i=>i*Math.cos(toRad(45))),
                m4.cross(faceNormals[face], v).map(i=>i*Math.sin(toRad(-45)))
                ),faceNormals[face].map(i=>i*m4.dot(faceNormals[face], v)*(1-Math.cos(toRad(45))))
            ).map(Math.round)
        ]))

        const vertCount = faceCount * 6;
        let data = new Float32Array(vertCount * 6);
        let i = 0;
        for(let x = 0; x < WIDTH; x++){
            for(let y = 0; y < HEIGHT; y++){
                for(let z = 0; z < DEPTH; z++){
                    const blockId = this.getBlockIdAt(x,y,z);
                    if(blockId == 0) continue;

                    for(let face = 0; face < 6; face++){
                        let faceNormal = faceNormals[face];
                        let [dx,dy,dz] = faceNormal;
                        let [xx,yy,zz] = [x + dx, y + dy, z + dz];
                        if(!this._inRange(xx,yy,zz) || Block.transparent.has(this.getBlockIdAt(xx,yy,zz)) && this.getBlockIdAt(x,y,z) != this.getBlockIdAt(xx,yy,zz)){
                            let faceLight = this._inRange(xx,yy,zz) ? this.getBlockLightAt(xx,yy,zz) : 255;

                            for(let vertex = 0; vertex < 6; vertex++){

                                // vertsDirections[face][vertex]

                                let [vertOffset,vertOffset2,vertOffset3] = vertsOffsets[face][vertex];

                                // let vertOffset2 = m4.addVectors(m4.addVectors(
                                //     vertOffset.map(i=>i*Math.cos(toRad(45))),
                                //     m4.cross(faceNormal, vertOffset).map(i=>i*Math.sin(toRad(45)))
                                //     ),faceNormal.map(i=>i*m4.dot(faceNormal, vertOffset)*(1-Math.cos(toRad(45))))
                                // ).map(Math.round);
                                // let vertOffset3 = m4.addVectors(m4.addVectors(
                                //     vertOffset.map(i=>i*Math.cos(toRad(45))),
                                //     m4.cross(faceNormal, vertOffset).map(i=>i*Math.sin(toRad(-45)))
                                //     ),faceNormal.map(i=>i*m4.dot(faceNormal, vertOffset)*(1-Math.cos(toRad(45))))
                                // ).map(Math.round);
                                let [xxx,yyy,zzz] = [x + vertOffset[0], y + vertOffset[1], z + vertOffset[2]];
                                let [xx2,yy2,zz2] = [x + vertOffset2[0], y + vertOffset2[1], z + vertOffset2[2]];
                                let [xx3,yy3,zz3] = [x + vertOffset3[0], y + vertOffset3[1], z + vertOffset3[2]];
                                
                                let lf = faceLight / 255;
                                let lc = this.getBlockLightAt(xxx,yyy,zzz) / 255;
                                let l1 = this.getBlockLightAt(xx2,yy2,zz2) / 255;
                                let l2 = this.getBlockLightAt(xx3,yy3,zz3) / 255;
                                let vertexLight = (
                                    this._inRange(xxx,yyy,zzz) ?
                                    (lc + lf + l1 + l2) / 4
                                    : 1
                                ) * 255;
                                

                                [data[i++],data[i++],data[i++]] = MESH_GEN.getPos(face,vertex,[x - tx,y - ty,z - tz]);
                                [data[i++],data[i++]] = MESH_GEN.getTex(face, vertex, blockId);
                                data[i++] = 1 - [1,.64,.8,.8,.8,.8][face] * vertexLight / 255;
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
    isBlockTransparentAt(x,y,z){return Block.transparent.has(this.getBlockIdAt(x,y,z))}
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

        const scale = 16, offset = 10, yScale = 4, perturb = 20, perturbScale = 40;

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

                    if(~~trueY < height)
                        res.setBlockIdAt(x,y,z,27);
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
        const RENDER_DISTANCE = 1;
        let data = new Array((RENDER_DISTANCE * 2 + 1) * (RENDER_DISTANCE * 2 + 1));
        let i = 0;
        const X = x >> 4, Z = z >> 4;
        for(let chunkOffsetX = -RENDER_DISTANCE; chunkOffsetX <= RENDER_DISTANCE; chunkOffsetX++)
            for(let chunkOffsetZ = -RENDER_DISTANCE; chunkOffsetZ <= RENDER_DISTANCE; chunkOffsetZ++)
                data[i++] = this.chunkAt(X + chunkOffsetX,Z + chunkOffsetZ).getMesh(x - 16 * chunkOffsetX,y,z - 16 * chunkOffsetZ);
        return data;
    }
}