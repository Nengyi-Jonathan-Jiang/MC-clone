const renderer = (function(){
    const {gl} = wgllib.fullscreenCanvas(false);
    const {core:{math:{toRad,toDeg,m4},Camera,Buffer,VertexArrayObject,Program,Texture,events},createAnimation,gameUtil:{FirstPersonController,CubeMeshGenerator}} = wgllib;
    const {sin,cos,tan,asin,acos,atan,min,max,sqrt,pow,PI,random} = Math;
    events.init();
    // events.init();
    
    const CLEAR_COLOR = [212, 248, 255];
    gl.clearColor(...CLEAR_COLOR.map(i=>i/255),1.0);
    
    const shaderProgram = new Program(gl,`
    attribute vec3 a_pos;
    attribute vec2 a_tex;
    attribute float a_dark;

    attribute vec3 a_faceNormal;
    attribute vec4 a_darkc;

    varying vec2 v_tex;
    varying float v_dark;
    
    varying vec2 v_facePos;
    varying vec4 v_darkc;
    
    uniform mat4 u_mat;
    
    vec3 rotate(vec3 v, vec3 axis, float angle){
        return axis * dot(axis, v) + cos(angle) * cross(cross(axis, v), axis) + sin(angle) * cross(axis, v);
    }

    void main(){
        gl_Position = u_mat * vec4(a_pos, 1.0);
        v_tex = a_tex;
        v_dark = a_dark;
    }
    `,`
    precision mediump float;
    
    varying vec2 v_tex;
    varying float v_dark;

    varying vec2 v_facePos;
    varying vec4 v_darkc;
    
    float q_distance(vec2 a, vec2 b){
        return max(abs(a.x - b.x), abs(a.y - b.y));
    }

    uniform sampler2D u_texture;
    
    void main(void) {
        vec4 d = vec4(
            q_distance(v_facePos, vec2(0,0)),
            q_distance(v_facePos, vec2(0,1)),
            q_distance(v_facePos, vec2(1,0)),
            q_distance(v_facePos, vec2(1,1))
        );
        float q_dark = dot(d, v_darkc) / (d.w + d.x + d.y + d.z);

        vec4 color = texture2D(u_texture, v_tex);
        if(color.a <= 0.0001) discard;
        gl_FragColor = vec4((1.0 - v_dark * 1.0) * vec3(color), 1.0);
        // gl_FragColor = vec4(vec3(1.0 - v_dark * v_dark * 1.0), 1.0);
        // gl_FragColor = vec4(v_dark * (1.0 - v_dark), (1.0 - v_dark) * (1.0 - v_dark), v_dark * v_dark, 1.0);
    }
    `);
    
    
    var VAO = new VertexArrayObject(gl);
    VAO.bind();
    
    function makeMesh(){
        return new Buffer(gl);
    }
    function bindMesh(VBO){
        VBO.bind();
        VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_pos"), "FLOAT", 3, 24, 0);
        VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_tex"), "FLOAT", 2, 24, 12);
        VAO.vertexAttribPointer(VBO, shaderProgram.getAttribLoc("a_dark"),"FLOAT", 1, 24, 20);
    }

    bindMesh(new Buffer(gl));

    var texture = new Texture(gl,atlasSrc || "https://raw.githubusercontent.com/Nengyi-Jonathan-Jiang/MC-clone/main/atlas.png");
    texture.bind();
    
    const camera = new Camera(gl, [0,20,0],[0,0], .01, 1000);
    
    function preDraw(currTime,elapsedTime){
        camera.recompute_projection(toRad(70));
        shaderProgram.uniformMat("u_mat", camera.get_matrix());
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    function draw(currTime,elapsedTime,numTriangles){
        camera.draw(shaderProgram, VAO, gl.TRIANGLES, 0, numTriangles);
    };

    return {preDraw:preDraw,draw:draw,camera:camera, VAO:VAO,makeMesh:makeMesh,bindMesh:bindMesh};
})();
