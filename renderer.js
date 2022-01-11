const renderer = (function(){
    const {gl, canvas} = wgllib.fullscreenCanvas(false);
    const {core:{math:{toRad,toDeg,m4},Camera,Buffer,VertexArrayObject,Program,Texture,events},createAnimation,gameUtil:{FirstPersonController,CubeMeshGenerator}} = wgllib;
    const {sin,cos,tan,asin,acos,atan,min,max,sqrt,pow,PI,random} = Math;
    events.init();
    // events.init();
    
    const CLEAR_COLOR = [212, 248, 255];
    gl.clearColor(...CLEAR_COLOR.map(i=>i/255),1.0);
    
    const shaderProgram = new Program(gl,`
    attribute vec3 a_pos;
    attribute vec2 a_tex;
    
    varying vec2 v_tex;
    
    uniform mat4 u_mat;
    
    
    void main(){
        gl_Position = u_mat * vec4(a_pos, 1.0);
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
    
    
    var VAO = new VertexArrayObject(gl);
    VAO.bind();
    
    var VBO = new Buffer(gl);
    VBO.bind();
    let meshGen = new wgllib.gameUtil.CubeMeshGenerator(16, 16);
    let positions = [
        [0,0,0, 1], [1,0,0, 2], [2,0,0, 3], [3,0,0, 4], 
        [0,0,1, 5], [1,0,1, 6], [2,0,1, 7], [3,0,1, 8], 
        [0,0,2, 9], [1,0,2,10], [2,0,2,11], [3,0,2,12], 
    ]
    
    let dat = new Float32Array(positions.length * 36 * 5);
    {
        let i = 0;
        for(let [x,y,z,blockId] of positions){
            for(let face = 0; face < 6; face++){
                for(let vertex = 0; vertex < 6; vertex++){
                    [dat[i++],dat[i++],dat[i++]] = meshGen.getPos(face,vertex,[x,y,z]);
                    [dat[i++],dat[i++]] = meshGen.getTex(face, vertex, blockId);
                }
            }
        }
    }
    VBO.setData(dat);
    VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_pos"), "FLOAT", 3, 20, 0);
    VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_tex"), "FLOAT", 2, 20, 12);
    var texture = new Texture(gl,"https://raw.githubusercontent.com/Nengyi-Jonathan-Jiang/MC-clone/main/atlas.png");
    texture.bind();
    
    const camera = new Camera(gl, [0,0,3],[0,0]);
    
    function draw(currTime,elapsedTime){
        camera.recompute_projection(toRad(70));
        shaderProgram.uniformMat("u_mat", camera.get_matrix());
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        camera.draw(shaderProgram, VAO, gl.TRIANGLES, 0, 36 * positions.length);
    };

    return {VBO:VBO,draw:draw,camera:camera};
})();