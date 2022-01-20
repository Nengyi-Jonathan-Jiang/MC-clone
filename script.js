const {core:{math:{toDeg,toRad}}} = wgllib;

var camera = renderer.camera;
[camera.position,camera.rotation] = [[1.45, 20, 0.5], [1, 1]];

var VBO = renderer.makeMesh();

// let positions = [
//     [0,0,0, 1], [1,0,0, 2], [2,0,0, 2], [3,0,0, 2], 
//     [0,0,1, 2], [1,0,1, 2], [2,0,1, 2], [3,0,1, 1], 
//     [0,0,2, 2], [1,0,2, 2], [2,0,2, 1], [3,0,2, 1], 

//     [0,1,0, 3], [0,2,0, 3], [0,3,0, 3], [1,3,0, 3],

//     [3,1,2, 2], [3,1,1, 2], [2,1,2, 2], 
// ]

// let positions = new Array(1 << 12).fill(0).map(i=>[
//     ~~(Math.random() * 16), ~~(Math.random() * 32), ~~(Math.random() * 16), 2
// ])
// positions.forEach(i=>{
//     for(let j of positions){
//         if(j[0] == i[0] && j[2] == i[2] && j[1] == i[1] + 1){
//             i[3] = 1;
//             break;
//         }
//     }
// })

let seed = Math.random();
noise.seed(seed);
let positions = [];
{
    let scale = 12, offset = 4, yScale = 4;
    for(let x = 0; x < Chunk.WIDTH; x++){
        for(let z = 0; z < Chunk.WIDTH; z++){
            let height = ~~(noise.simplex2(x / scale, z / scale) * yScale / 2 + yScale / 2 + offset);
            for(let y = 0; y < height; y++) positions.push([x,y,z,1]);
            positions.push([x,height,z,2]);
        }
    }
}

let c = new Chunk(positions);

let chunks = new Chunks();
/** @type {Float32Array[]} */
let meshes = chunks.getMeshes(0,0,0);
console.log(meshes);

// let dat = new Float32Array(positions.length * 216);
// let i = 0;
// for(let [x,y,z,blockId,light] of positions){
//     for(let face = 0; face < 6; face++){
//         for(let vertex = 0; vertex < 6; vertex++){
//             [dat[i++],dat[i++],dat[i++]] = meshGen.getPos(face,vertex,[x,y,z]);
//             [dat[i++],dat[i++]] = meshGen.getTex(face, vertex, blockId);
//             dat[i++] = 1 - [1,.64,.8,.8,.8,.8][face] * (1 - (light == undefined ? 0 : light[face]));
//         }
//     }
// }
// VBO.setData(dat);

VBO.setData(c.getMesh(0,0,0));

var control = new wgllib.gameUtil.FirstPersonController(renderer.camera);

wgllib.createAnimation(function(currTime,elapsedTime){
    control.update(elapsedTime);
    renderer.preDraw();
    renderer.bindMesh(VBO);
    for(let mesh of meshes){
        VBO.setData(mesh);
        renderer.draw(currTime,elapsedTime, VBO.bytes / 24);
    }
});