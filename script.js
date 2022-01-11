// const {gl, canvas} = wgllib.fullscreenCanvas();
// const {core:{math:{toRad,toDeg,m4},Camera,Buffer,VertexArrayObject,Program,Texture,events},createAnimation,gameUtil:{FirstPersonController}} = wgllib;
// const {sin,cos,tan,asin,acos,atan,min,max,sqrt,pow,PI,random} = Math;
// events.init();

// gl.disable(gl.CULL_FACE);

// const CLEAR_COLOR = [212, 248, 255];
// gl.clearColor(...CLEAR_COLOR.map(i=>i/255),1.0);


// const shaderProgram = new Program(gl,`
// attribute vec3 a_pos;
// attribute vec2 a_tex;

// varying vec2 v_tex;

// uniform mat4 u_mat;


// void main(){
//     gl_Position = u_mat * vec4(a_pos, 1.0);
//     v_tex = a_tex;
// }
// `,`
// precision mediump float;

// varying vec2 v_tex;

// uniform sampler2D u_texture;

// void main(void) {
//     //gl_FragColor = texture2D(u_texture, v_tex);
//     gl_FragColor = vec4(vec3(0),1);
// }
// `);


// var VAO = new VertexArrayObject(gl);
// VAO.bind();
// var VBO = new Buffer(gl);
// VBO.bind();
// VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_pos"), "FLOAT", 3, 20, 0);
// VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_tex"), "FLOAT", 2, 20, 12);
// var texture = new Texture(gl,"https://raw.githubusercontent.com/Nengyi-Jonathan-Jiang/MC-clone/main/atlas.png");
// texture.bind();


// let meshGen = new wgllib.gameUtil.CubeMeshGenerator(16, 16);
// let positions = [
//     [0,0,0, 1], [1,0,0, 2], [2,0,0, 3], [3,0,0, 4], 
//     [0,0,1, 5], [1,0,1, 6], [2,0,1, 7], [3,0,1, 8], 
//     [0,0,2, 9], [1,0,2,10], [2,0,2,11], [3,0,2,12], 
// ]

// let dat = new Float32Array(positions.length * 36 * 5);
// {
//     let i = 0;
//     for(let [x,y,z,blockId] of positions){
//         for(let face = 0; face < 6; face++){
//             for(let vertex = 0; vertex < 6; vertex++){
//                 [dat[i++],dat[i++],dat[i++]] = meshGen.getPos(face,vertex,[x,y,z]);
//                 [dat[i++],dat[i++]] = meshGen.getTex(face, vertex, blockId);
//             }
//         }
//     }
// }
// console.log(dat);

// VBO.setData(dat);



// const camera = new Camera(gl, [0,0,-3], [0,0]);
// const control = new FirstPersonController(camera, 10, 10);

// createAnimation((currTime,elapsedTime)=>{
//     camera.recompute_projection(toRad(70));

//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//     shaderProgram.uniformMat("u_mat", camera.get_matrix());
//     camera.draw(shaderProgram, VertexArrayObject, gl.TRIANGLES, 0, 2);
// })

wgllib.core.events.init();
const {canvas,gl} = wgllib.fullscreenCanvas(false);
gl.clearColor(0.8,1,1,1);

const vertexCode = `
attribute vec3 a_position;
attribute vec2 a_texcoords;

uniform mat4 u_matrix;

varying highp vec2 vTextureCoord;

void main(void) {
    gl_Position = u_matrix * vec4(a_position, 1.0);
    vTextureCoord = a_texcoords;
}
`
const fragmentCode = `
varying highp vec2 vTextureCoord;

uniform sampler2D u_texture;

void main(void) {
    gl_FragColor = texture2D(u_texture, vTextureCoord);
}
`
var program = new wgllib.core.Program(gl,vertexCode,fragmentCode);
var texture = new wgllib.core.Texture(gl,atlasSrc || "https://raw.githubusercontent.com/Nengyi-Jonathan-Jiang/MC-clone/main/atlas.png");

var fieldOfViewRadians = wgllib.core.math.toRad(70);

// Create VBO
var VBO = new wgllib.core.Buffer(gl);
const positions = [
    [0,0,0,1],[0,1,0,5],[0,-2,0,9],[1,0,0,4],[3,0,0,8],[0,-5,0,3],
    [0,0,1,2],[0,1,1,6],[0,-2,1,1],[1,0,1,5],[3,0,1,9],[0,-5,1,4],
    [0,0,2,3],[0,1,2,7],[0,-2,2,2],[1,0,2,6],[3,0,2,1],[0,-5,2,5],
    [0,0,3,4],[0,1,3,8],[0,-2,3,3],[1,0,3,7],[3,0,3,2],[0,-5,3,6],
];
//Fill VBO data
const cubeMeshGenerator = new wgllib.gameUtil.CubeMeshGenerator(16,16);
{
    let data = new Float32Array(180 * positions.length);
    for(let i = 0; i < positions.length; i++){
        const p = positions[i];
        for(let f = 0; f < 6; f++){
            for(let v = 0; v < 6; v++){
                let pos = cubeMeshGenerator.getPos(f,v,p);
                let tex = cubeMeshGenerator.getTex(f,v,[0,p[3]]);
                data.set([...pos,...tex],((i * 6 + f) * 6 + v) * 5);
            }
        }
    }
    VBO.setData(data);
}
//Configure vertex attributes

program.vertexAttribPointer(VBO,"a_position", "FLOAT",3,20,0);
program.vertexAttribPointer(VBO,"a_texcoords","FLOAT",2,20,12);

const camera = new wgllib.core.Camera(gl,[0.5892,0.3214,-8.432],[0,0.3241]);
const fpc = new wgllib.gameUtil.FirstPersonController(camera);
// Draw the scene.
function drawScene(now, deltaTime) {
    camera.recompute_projection(fieldOfViewRadians);
    fpc.update(deltaTime);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.draw(program,"u_matrix",gl.TRIANGLES,0,36 * positions.length);
}

wgllib.createAnimation(drawScene);