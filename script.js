const {core:{math:{toDeg,toRad}}} = wgllib;

var camera = renderer.camera;
[camera.position,camera.rotation] = [[1.45, 2, 0.5], [1, 2]];

var VBO = renderer.VBO;

{
    let meshGen = new wgllib.gameUtil.CubeMeshGenerator(16, 16);
    class Chunk{
        static WIDTH = 16; 
        static HEIGHT = 256;
        static DEPTH = 16;
        static TOTAL_BLOCKS = Chunk.WIDTH * Chunk.HEIGHT * Chunk.DEPTH;
        /** @param {[number,number,number,number][]} [positions] */
        contructor(positions){
            this.blockIds =  new Uint8Array(TOTAL_BLOCKS);

            this.blockLight = new Uint8Array(TOTAL_BLOCKS);
            this.blockLightFrom = new Uint8Array(TOTAL_BLOCKS * 3);

            this.faceLight = new Uint8Array(TOTAL_BLOCKS * 6);

            this.blockData = new Uint8Array(TOTAL_BLOCKS);

            if(positions) setFromPositions(positions);
        }

        /** @param {[number,number,number,number][]} positions */
        setFromPositions(positions){
            this.blockIds.fill(0);
            this.blockLight.fill(0);
            this.faceLight.fill(0);
            this.blockData.fill(0);

            this.updateAllLighting();
        }

        updateAllLighting(){
            for(let y = 0; y < HEIGHT; y++){
                if(y == 255){
                    for(let x = 0; x < WIDTH; x++)
                        for(let z = 0; z < DEPTH; z++)
                            this.setBlockLightAt(x,y,z,this.getBlockIdAt(x,y,z)&&true);
                }
                else{
                    
                }
            }
        }

        /** @param {[number,number,number][]} positions */
        updateLighting(positions){

        }

        getBlockIdAt(x,y,z){return this.blockIds[(x * Chunk.WIDTH + y) * Chunk.HEIGHT + z]}
        setBlockIdAt(x,y,z,id){this.blockIds[(x * Chunk.WIDTH + y) * Chunk.HEIGHT + z] = id}
        getBlockDataAt(x,y,z){return this.blockData[(x * Chunk.WIDTH + y) * Chunk.HEIGHT + z]}
        setBlockDataAt(x,y,z,data){this.blockData[(x * Chunk.WIDTH + y) * Chunk.HEIGHT + z] = data}
        getBlockLightAt(x,y,z){return this.blockLight[(x * Chunk.WIDTH + y) * Chunk.HEIGHT + z]}
        setBlockLightAt(x,y,z,light){this.blockLight[(x * Chunk.WIDTH + y) * Chunk.HEIGHT + z] = light}
        getFaceLightAt(x,y,z,face){return this.blockLight[((x * Chunk.WIDTH + y) * Chunk.HEIGHT + z) * 6 + face]}
        setFaceLightAt(x,y,z,face,light){this.blockLight[((x * Chunk.WIDTH + y) * Chunk.HEIGHT + z) * 6 + face] = light}
        getBlockLightFromAt(x,y,z){let ind = ((x * Chunk.WIDTH + y) * Chunk.HEIGHT + z) * 3;return Array.prototype.slice.call(this.blockLightFrom, ind,ind + 3)}
        setBlockLightFromAt(x,y,z,fx,fy,fz){this.blockLightFrom.set([fx,fy,fz],((x * Chunk.WIDTH + y) * Chunk.HEIGHT + z) * 3)}
    }

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