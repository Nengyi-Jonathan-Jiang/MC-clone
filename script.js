const {gl, canvas} = wgllib.fullscreenCanvas();
const {core:{math:{toRad,toDeg,m4},Camera,Buffer,VertexArrayObject,Program,events},createAnimation} = wgllib;
const {sin,cos,tan,asin,acos,atan,min,max,sqrt,pow,PI,random} = Math;

const CLEAR_COLOR = [212, 248, 255];
gl.clearColor(...CLEAR_COLOR.map(i=>i/255),1.0);

//GLSL source code
const shaderProg = new Program(gl,`
attribute vec3 a_pos;
attribute vec2 a_tex;

varying vec2 v_tex;

uniform mat4 u_matrix;


void main(){
    gl_Position = u_matrix * vec4(a_pos, 1.0);
    v_tex = a_tex;
}
`,`
precision mediump float;

varying vec2 v_tex;

uniform sampler2D u_texture;

void main(void) {
    gl_FragColor = texture2D(u_texture, v_tex);
}
`);


var texture = new wgllib.core.Texture(gl,document.getElementById("atlas").src);

var VAO = new VertexArrayObject(gl);
VAO.bind();
var VBO = new Buffer(gl);
VBO.bind();
VAO.vertexAttribPointer(VBO, shaderProg.getAttribLoc("a_pos"), "FLOAT", 3, 24, 0);
VAO.vertexAttribPointer(VBO, shaderProg.getAttribLoc("a_tex"), "FLOAT", 3, 24, 12);


createAnimation((currTime,elapsedTime)=>{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

})