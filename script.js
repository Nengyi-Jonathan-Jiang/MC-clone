const {core:{math:{toDeg,toRad}}} = wgllib;

var camera = renderer.camera;
[camera.position,camera.rotation] = [[1.45, 2, 0.5], [1, 2]];

var VBO = renderer.VBO;

let positions = [
    [0,0,0, 1], [1,0,0, 2], [2,0,0, 2], [3,0,0, 2], 
    [0,0,1, 2], [1,0,1, 2], [2,0,1, 2], [3,0,1, 1], 
    [0,0,2, 2], [1,0,2, 2], [2,0,2, 1], [3,0,2, 1], 

    [0,1,0, 3], [0,2,0, 3], [0,3,0, 3], [1,3,0, 3],

    [3,1,2, 2], [3,1,1, 2], [2,1,2, 2], 
]

let c = new Chunk(positions);

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

VBO.setData(c.getMesh());

var control = new wgllib.gameUtil.FirstPersonController(renderer.camera);

wgllib.createAnimation(function(currTime,elapsedTime){
    control.update(elapsedTime);
    renderer.draw(currTime,elapsedTime);
});