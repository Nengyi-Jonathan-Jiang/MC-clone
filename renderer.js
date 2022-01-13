const renderer = (function(){
    const {gl, canvas} = wgllib.fullscreenCanvas(false);
    const {core:{math:{toRad,toDeg,m4},Camera,Buffer,VertexArrayObject,Program,Texture,events},createAnimation,gameUtil:{FirstPersonController,CubeMeshGenerator}} = wgllib;
    const {sin,cos,tan,asin,acos,atan,min,max,sqrt,pow,PI,random} = Math;
    events.init();
    // events.init();
    
    // const CLEAR_COLOR = [212, 248, 255];
    const CLEAR_COLOR = [21, 24, 25];
    gl.clearColor(...CLEAR_COLOR.map(i=>i/255),1.0);
    
    const shaderProgram = new Program(gl,`
    attribute vec3 a_pos;
    attribute vec2 a_tex;
    attribute float a_dark;
    
    varying vec2 v_tex;
    varying float v_dark;
    
    uniform mat4 u_mat;
    
    
    void main(){
        gl_Position = u_mat * vec4(a_pos, 1.0);
        v_tex = a_tex;
        v_dark = a_dark;
    }
    `,`
    precision mediump float;
    
    varying vec2 v_tex;
    varying float v_dark;
    
    uniform sampler2D u_texture;
    
    void main(void) {
        gl_FragColor = vec4((1.0 - v_dark) * vec3(texture2D(u_texture, v_tex)), 1.0);
    }
    `);
    
    
    var VAO = new VertexArrayObject(gl);
    VAO.bind();
    
    var VBO = new Buffer(gl);
    VBO.bind();
    VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_pos"), "FLOAT", 3, 24, 0);
    VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_tex"), "FLOAT", 2, 24, 12);
    VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_dark"),"FLOAT", 1, 24, 20);
    var texture = new Texture(gl,atlasSrc || "https://raw.githubusercontent.com/Nengyi-Jonathan-Jiang/MC-clone/main/atlas.png");
    texture.bind();
    
    const camera = new Camera(gl, [0,0,3],[0,0]);
    
    function draw(currTime,elapsedTime){
        camera.recompute_projection(toRad(70));
        shaderProgram.uniformMat("u_mat", camera.get_matrix());
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        camera.draw(shaderProgram, VAO, gl.TRIANGLES, 0, VBO.bytes / 24);
    };

    return {VBO:VBO,draw:draw,camera:camera};
})();