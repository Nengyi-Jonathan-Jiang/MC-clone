const {core:{math:{toDeg,toRad}}} = wgllib;

var camera = renderer.camera;
[camera.position,camera.rotation] = [[1.45, 2, 0.5], [1, 2]];

var VBO = renderer.VBO;

class Chunk{
    static WIDTH = 16; 
    static HEIGHT = 256;
    static DEPTH = 16;
    static TOTAL_BLOCKS = Chunk.WIDTH * Chunk.HEIGHT * Chunk.DEPTH;

    /** @param {[number,number,number,number][]} [positions] */
    constructor(positions){
        this.blockIds =  new Uint8Array(Chunk.TOTAL_BLOCKS);
        this.blockLight = new Uint8Array(Chunk.TOTAL_BLOCKS);
        this.faceLight = new Uint8Array(Chunk.TOTAL_BLOCKS * 6);
        this.blockData = new Uint8Array(Chunk.TOTAL_BLOCKS);

        this.setFromPositions(positions||[]);
    }

    /** @param {[number,number,number,number][]} positions */
    setFromPositions(positions){
        this.blockIds.fill(0);
        this.blockLight.fill(0);
        this.faceLight.fill(0);
        this.blockData.fill(0);

        for(let [x,y,z,id] of positions) this.setBlockIdAt(x,y,z,id);

        this.updateAllLighting();
    }

    updateAllLighting(){
        const {WIDTH, HEIGHT, DEPTH, TOTAL_BLOCKS} = Chunk;

        this.blockLight.fill(0);

        /** @type {PriorityQueue<[number,number,number,number]>*/
        let queue = new PriorityQueue((a,b) => a[1] > b[1]);
        for(let x = 0, y = HEIGHT - 1; x < WIDTH; x++)
            for(let z = 0; z < DEPTH; z++)
                if(this.getBlockIdAt(x,y,z) == 0)
                    this.setBlockLightAt(x,y,z,255),queue.push([x,y,z,255]);
        
        let x,y,z,lvl;
        let i = 0, MAX_UPDATES = TOTAL_BLOCKS * 2;
        while(++i < MAX_UPDATES && !queue.empty()){
            [x,y,z,lvl] = queue.pop();
            console.log(x,y,z,lvl);
            this.setBlockLightAt(x,y,z,lvl);
            if(y > 0          && this.getBlockIdAt(x,y - 1,z) == 0 && this.getBlockLightAt(x,y - 1,z) < lvl -  0) queue.push([x,y-1,z,lvl -  0]);
            if(x > 0          && this.getBlockIdAt(x - 1,y,z) == 0 && this.getBlockLightAt(x - 1,y,z) < lvl - 16) queue.push([x-1,y,z,lvl - 16]);
            if(x < WIDTH - 1  && this.getBlockIdAt(x + 1,y,z) == 0 && this.getBlockLightAt(x + 1,y,z) < lvl - 16) queue.push([x+1,y,z,lvl - 16]);
            if(z > 0          && this.getBlockIdAt(x,y,z - 1) == 0 && this.getBlockLightAt(x,y,z - 1) < lvl - 16) queue.push([x,y,z-1,lvl - 16]);
            if(z < DEPTH - 1  && this.getBlockIdAt(x,y,z + 1) == 0 && this.getBlockLightAt(x,y,z + 1) < lvl - 16) queue.push([x,y,z+1,lvl - 16]);
        }
        if(i == MAX_UPDATES) console.warn("Too many lighting updates!");
    }
    
    /** @param {[number,number,number][]} positions */
    updateLighting(positions){

    }

    logLighting(){
        function f(n){
            return "012345.:OM#@░▒▓█"[Math.floor(n / 16)].repeat(2);
        }
        for(let y = Chunk.HEIGHT; y --> 0;)
            console.log("%c" + new Array(Chunk.WIDTH).fill(0).map((_,x)=>new Array(Chunk.DEPTH).fill(0).map((_,z)=>this.getBlockLightAt(x,y,z)).map(f).join("")).join("\n"),
            "font-family:monospace;color:black"
            )
    }

    _mapPos(x,y,z){return (x * Chunk.WIDTH + z) * Chunk.DEPTH + y}

    getBlockIdAt(x,y,z){return this.blockIds[this._mapPos(x,y,z)]}
    setBlockIdAt(x, y, z, id) {this.blockIds[this._mapPos(x,y,z)] = id}
    getBlockDataAt(x,y,z){return this.blockData[this._mapPos(x,y,z)]}
    setBlockDataAt(x,y,z, data) {this.blockData[this._mapPos(x,y,z)] = data}
    getBlockLightAt(x,y,z){return this.blockLight[this._mapPos(x,y,z)]}
    setBlockLightAt(x,y,z, light){this.blockLight[this._mapPos(x,y,z)] = light}
    getFaceLightAt(x,y,z,face){return this.blockLight[this._mapPos(x,y,z) * 6 + face]}
    setFaceLightAt(x,y,z,face, light){this.blockLight[this._mapPos(x,y,z) * 6 + face] = light}
}

{
    let meshGen = new wgllib.gameUtil.CubeMeshGenerator(16, 16);

    let positions = [
        [0,0,0, 1], [1,0,0, 2], [2,0,0, 3], [3,0,0, 4], 
        [0,0,1, 5], [1,0,1, 6], [2,0,1, 7], [3,0,1, 8], 
        [0,0,2, 9], [1,0,2,10], [2,0,2,11], [3,0,2,12], 

        [0,1,0, 3], [0,2,0, 3], [0,3,0, 3], [1,3,0, 3],

        [3,1,2, 3], [3,1,1, 3], [2,1,2, 3], 
    ]
    
    let dat = new Float32Array(positions.length * 216);
    let i = 0;
    for(let [x,y,z,blockId,light] of positions){
        for(let face = 0; face < 6; face++){
            for(let vertex = 0; vertex < 6; vertex++){
                [dat[i++],dat[i++],dat[i++]] = meshGen.getPos(face,vertex,[x,y,z]);
                [dat[i++],dat[i++]] = meshGen.getTex(face, vertex, blockId);
                dat[i++] = 1 - [1,.64,.8,.8,.8,.8][face] * (1 - (light == undefined ? 0 : light[face]));
            }
        }
    }
    VBO.setData(dat);
}

var control = new wgllib.gameUtil.FirstPersonController(renderer.camera);

wgllib.createAnimation(function(currTime,elapsedTime){
    control.update(elapsedTime);
    renderer.draw(currTime,elapsedTime);
});