var wgllib = (_=>
{
	/** Various 3d math functions */
	var m4 = (function(){
        /** @typedef {ArrayBufferView} vec3 An array or typed array with 3 values */
        /** @typedef {ArrayBufferView} Vector4 An array or typed array with 4 values */
        /** @typedef {ArrayBufferView} Matrix4 An array or typed array with 16 values */
        /** Takes two 4-by-4 matrices, a and b, and computes the product in the order that pre-composes b with a.  In other words, the matrix returned will transform by b first and then a.  Note this is subtly different from just multiplying the matrices together.  For given a and b, this function returns the same object in both row-major and column-major mode.
         * @param {Matrix4} a A matrix. @param {Matrix4} b A matrix. @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function multiply(a,b,dst){dst||=new Float32Array(16);var b00=b[0],b01=b[1],b02=b[2],b03=b[3];var b10=b[4],b11=b[5],b12=b[6],b13=b[7];var b20=b[8],b21=b[9],b22=b[10],b23=b[11];var b30=b[12],b31=b[13],b32=b[14],b33=b[15];var a00=a[0],a01=a[1],a02=a[2],a03=a[3];var a10=a[4],a11=a[5],a12=a[6],a13=a[7];var a20=a[8],a21=a[9],a22=a[10],a23=a[11];var a30=a[12],a31=a[13],a32=a[14],a33=a[15];dst[0]=b00*a00+b01*a10+b02*a20+b03*a30;dst[1]=b00*a01+b01*a11+b02*a21+b03*a31;dst[2]=b00*a02+b01*a12+b02*a22+b03*a32;dst[3]=b00*a03+b01*a13+b02*a23+b03*a33;dst[4]=b10*a00+b11*a10+b12*a20+b13*a30;dst[5]=b10*a01+b11*a11+b12*a21+b13*a31;dst[6]=b10*a02+b11*a12+b12*a22+b13*a32;dst[7]=b10*a03+b11*a13+b12*a23+b13*a33;dst[8]=b20*a00+b21*a10+b22*a20+b23*a30;dst[9]=b20*a01+b21*a11+b22*a21+b23*a31;dst[10]=b20*a02+b21*a12+b22*a22+b23*a32;dst[11]=b20*a03+b21*a13+b22*a23+b23*a33;dst[12]=b30*a00+b31*a10+b32*a20+b33*a30;dst[13]=b30*a01+b31*a11+b32*a21+b33*a31;dst[14]=b30*a02+b31*a12+b32*a22+b33*a32;dst[15]=b30*a03+b31*a13+b32*a23+b33*a33;return dst}
        /** adds 2 vec3's
         * @param {vec3} a a @param {vec3} b b @param {vec3} dst optional vec3 to store result @return {vec3} dst or new vec3 if not provided */        
        function addVectors(a,b,dst){dst||=new Float32Array(3);dst[0]=a[0]+b[0];dst[1]=a[1]+b[1];dst[2]=a[2]+b[2];return dst}
        /** subtracts 2 vec3's
         * @param {vec3} a a @param {vec3} b b @param {vec3} dst optional vec3 to store result @return {vec3} dst or new vec3 if not provided */
        function subtractVectors(a,b,dst){dst||=new Float32Array(3);dst[0]=a[0]-b[0];dst[1]=a[1]-b[1];dst[2]=a[2]-b[2];return dst}
        /** scale vectors3
         * @param {vec3} v vector @param {Number} s scale @param {vec3} dst optional vec3 to store result @return {vec3} dst or new vec3 if not provided */
        function scaleVector(v,s,dst){dst||=new Float32Array(3);dst[0]=v[0]*s;dst[1]=v[1]*s;dst[2]=v[2]*s;return dst}
        /** normalizes a vector.
         * @param {vec3} v vector to normalize @param {vec3} dst optional vec3 to store result @return {vec3} dst or new vec3 if not provided */
        function normalize(v,dst){dst||=new Float32Array(3);var length=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);if(length>0.00001){dst[0]=v[0]/length;dst[1]=v[1]/length;dst[2]=v[2]/length}return dst}
        /** Computes the length of a vector
         * @param {vec3} v vector to take length of @return {number} length of vector
         */
        function length(v){return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2])}    
        /** Computes the length squared of a vector
         * @param {vec3} v vector to take length of @return {number} length sqaured of vector
         */
        function lengthSq(v){return v[0]*v[0]+v[1]*v[1]+v[2]*v[2]}
        /** Computes the cross product of 2 vectors3s
         * @param {vec3} a a @param {vec3} b b @param {vec3} dst optional vec3 to store result @return {vec3} dst or new vec3 if not provided */
        function cross(a,b,dst){dst||=new Float32Array(3);dst[0]=a[1]*b[2]-a[2]*b[1];dst[1]=a[2]*b[0]-a[0]*b[2];dst[2]=a[0]*b[1]-a[1]*b[0];return dst}
        /** Computes the dot product of two vectors; assumes both vectors have
         * three entries.
         * @param {vec3} a Operand vector. @param {vec3} b Operand vector. @return {number} dot product */
        function dot(a,b){return(a[0]*b[0])+(a[1]*b[1])+(a[2]*b[2])}
        /** Computes the distance squared between 2 points
         * @param {vec3} a @param {vec3} b @return {number} distance squared between a and b
         */
        function distanceSq(a,b){const dx=a[0]-b[0];const dy=a[1]-b[1];const dz=a[2]-b[2];return dx*dx+dy*dy+dz*dz}
        /** Computes the distance between 2 points
         * @param {vec3} a @param {vec3} b @return {number} distance between a and b
         */
        function distance(a,b){return Math.sqrt(distanceSq(a,b))}
        /** Makes an identity matrix.
         * @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function identity(dst){dst||=new Float32Array(16);dst[0]=1;dst[1]=0;dst[2]=0;dst[3]=0;dst[4]=0;dst[5]=1;dst[6]=0;dst[7]=0;dst[8]=0;dst[9]=0;dst[10]=1;dst[11]=0;dst[12]=0;dst[13]=0;dst[14]=0;dst[15]=1;return dst}
        /** Transposes a matrix.
         * @param {Matrix4} m matrix to transpose. @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function transpose(m,dst){dst||=new Float32Array(16);dst[0]=m[0];dst[1]=m[4];dst[2]=m[8];dst[3]=m[12];dst[4]=m[1];dst[5]=m[5];dst[6]=m[9];dst[7]=m[13];dst[8]=m[2];dst[9]=m[6];dst[10]=m[10];dst[11]=m[14];dst[12]=m[3];dst[13]=m[7];dst[14]=m[11];dst[15]=m[15];return dst}
        /** Creates a lookAt matrix. This is a world matrix for a camera. In other words it will transform from the origin to a place and orientation in the world. For a view matrix take the inverse of this.
         * @param {vec3} cameraPosition position of the camera @param {vec3} target position of the target @param {vec3} up direction @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function lookAt(cameraPosition,target,up,dst){dst||=new Float32Array(16);var zAxis=normalize(subtractVectors(cameraPosition,target));var xAxis=normalize(cross(up,zAxis));var yAxis=normalize(cross(zAxis,xAxis));dst[0]=xAxis[0];dst[1]=xAxis[1];dst[2]=xAxis[2];dst[3]=0;dst[4]=yAxis[0];dst[5]=yAxis[1];dst[6]=yAxis[2];dst[7]=0;dst[8]=zAxis[0];dst[9]=zAxis[1];dst[10]=zAxis[2];dst[11]=0;dst[12]=cameraPosition[0];dst[13]=cameraPosition[1];dst[14]=cameraPosition[2];dst[15]=1;return dst}
        /** Computes a 4-by-4 perspective transformation matrix given the angular height of the frustum, the aspect ratio, and the near and far clipping planes.  The arguments define a frustum extending in the negative z direction.  The given angle is the vertical angle of the frustum, and the horizontal angle is determined to produce the given aspect ratio.  The arguments near and far are the distances to the near and far clipping planes.  Note that near and far are not z coordinates, but rather they are distances along the negative z-axis.  The matrix generated sends the viewing frustum to the unit box. We assume a unit box extending from -1 to 1 in the x and y dimensions and from -1 to 1 in the z dimension.
         * @param {number} fieldOfViewInRadians - field of view in y axis. @param {number} aspect - aspect of viewport (width / height) @param {number} near - near Z clipping plane @param {number} far - far Z clipping plane @param {Matrix4} dst - optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function perspective(fieldOfViewInRadians,aspect,near,far,dst){dst||=new Float32Array(16);var f=Math.tan(Math.PI*0.5-0.5*fieldOfViewInRadians);var rangeInv=1.0/(near-far);dst[0]=f/aspect;dst[1]=0;dst[2]=0;dst[3]=0;dst[4]=0;dst[5]=f;dst[6]=0;dst[7]=0;dst[8]=0;dst[9]=0;dst[10]=(near+far)*rangeInv;dst[11]=-1;dst[12]=0;dst[13]=0;dst[14]=near*far*rangeInv*2;dst[15]=0;return dst}
        /** Computes a 4-by-4 orthographic projection matrix given the coordinates of the planes defining the axis-aligned, box-shaped viewing volume.  The matrix generated sends that box to the unit box.  Note that although left and right are x coordinates and bottom and top are y coordinates, near and far are not z coordinates, but rather they are distances along the negative z-axis.  We assume a unit box extending from -1 to 1 in the x and y dimensions and from -1 to 1 in the z dimension.
         * @param {number} left The x coordinate of the left plane of the box. @param {number} right The x coordinate of the right plane of the box. @param {number} bottom The y coordinate of the bottom plane of the box. @param {number} top The y coordinate of the right plane of the box. @param {number} near The negative z coordinate of the near plane of the box. @param {number} far The negative z coordinate of the far plane of the box. @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function orthographic(left,right,bottom,top,near,far,dst){dst||=new Float32Array(16);dst[0]=2/(right-left);dst[1]=0;dst[2]=0;dst[3]=0;dst[4]=0;dst[5]=2/(top-bottom);dst[6]=0;dst[7]=0;dst[8]=0;dst[9]=0;dst[10]=2/(near-far);dst[11]=0;dst[12]=(left+right)/(left-right);dst[13]=(bottom+top)/(bottom-top);dst[14]=(near+far)/(near-far);dst[15]=1;return dst}
        /** Computes a 4-by-4 perspective transformation matrix given the left, right, top, bottom, near and far clipping planes. The arguments define a frustum extending in the negative z direction. The arguments near and far are the distances to the near and far clipping planes. Note that near and far are not z coordinates, but rather they are distances along the negative z-axis. The matrix generated sends the viewing frustum to the unit box. We assume a unit box extending from -1 to 1 in the x and y dimensions and from -1 to 1 in the z dimension.
         * @param {number} left The x coordinate of the left plane of the box. @param {number} right The x coordinate of the right plane of the box. @param {number} bottom The y coordinate of the bottom plane of the box. @param {number} top The y coordinate of the right plane of the box. @param {number} near The negative z coordinate of the near plane of the box. @param {number} far The negative z coordinate of the far plane of the box. @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function frustum(left,right,bottom,top,near,far,dst){dst||=new Float32Array(16);var dx=right-left;var dy=top-bottom;var dz=far-near;dst[0]=2*near/dx;dst[1]=0;dst[2]=0;dst[3]=0;dst[4]=0;dst[5]=2*near/dy;dst[6]=0;dst[7]=0;dst[8]=(left+right)/dx;dst[9]=(top+bottom)/dy;dst[10]=-(far+near)/dz;dst[11]=-1;dst[12]=0;dst[13]=0;dst[14]=-2*near*far/dz;dst[15]=0;return dst}
        /** Makes a translation matrix
         * @param {number} tx x translation. @param {number} ty y translation. @param {number} tz z translation. @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function translation(tx,ty,tz,dst){dst||=new Float32Array(16);dst[0]=1;dst[1]=0;dst[2]=0;dst[3]=0;dst[4]=0;dst[5]=1;dst[6]=0;dst[7]=0;dst[8]=0;dst[9]=0;dst[10]=1;dst[11]=0;dst[12]=tx;dst[13]=ty;dst[14]=tz;dst[15]=1;return dst}
        /** Multiply by translation matrix.
         * @param {Matrix4} m matrix to multiply @param {number} tx x translation. @param {number} ty y translation. @param {number} tz z translation. @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function translate(m,tx,ty,tz,dst){dst||=new Float32Array(16);var m00=m[0];var m01=m[1];var m02=m[2];var m03=m[3];var m10=m[1*4+0];var m11=m[1*4+1];var m12=m[1*4+2];var m13=m[1*4+3];var m20=m[2*4+0];var m21=m[2*4+1];var m22=m[2*4+2];var m23=m[2*4+3];var m30=m[3*4+0];var m31=m[3*4+1];var m32=m[3*4+2];var m33=m[3*4+3];if(m!==dst){dst[0]=m00;dst[1]=m01;dst[2]=m02;dst[3]=m03;dst[4]=m10;dst[5]=m11;dst[6]=m12;dst[7]=m13;dst[8]=m20;dst[9]=m21;dst[10]=m22;dst[11]=m23}dst[12]=m00*tx+m10*ty+m20*tz+m30;dst[13]=m01*tx+m11*ty+m21*tz+m31;dst[14]=m02*tx+m12*ty+m22*tz+m32;dst[15]=m03*tx+m13*ty+m23*tz+m33;return dst}
        /** Makes an x rotation matrix
         * @param {number} angleInRadians amount to rotate @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function xRotation(angleInRadians,dst){dst||=new Float32Array(16);var c=Math.cos(angleInRadians);var s=Math.sin(angleInRadians);dst[0]=1;dst[1]=0;dst[2]=0;dst[3]=0;dst[4]=0;dst[5]=c;dst[6]=s;dst[7]=0;dst[8]=0;dst[9]=-s;dst[10]=c;dst[11]=0;dst[12]=0;dst[13]=0;dst[14]=0;dst[15]=1;return dst}
        /** Multiply by an x rotation matrix
         * @param {Matrix4} m matrix to multiply @param {number} angleInRadians amount to rotate @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function xRotate(m,angleInRadians,dst){dst||=new Float32Array(16);var m10=m[4];var m11=m[5];var m12=m[6];var m13=m[7];var m20=m[8];var m21=m[9];var m22=m[10];var m23=m[11];var c=Math.cos(angleInRadians);var s=Math.sin(angleInRadians);dst[4]=c*m10+s*m20;dst[5]=c*m11+s*m21;dst[6]=c*m12+s*m22;dst[7]=c*m13+s*m23;dst[8]=c*m20-s*m10;dst[9]=c*m21-s*m11;dst[10]=c*m22-s*m12;dst[11]=c*m23-s*m13;if(m!==dst){dst[0]=m[0];dst[1]=m[1];dst[2]=m[2];dst[3]=m[3];dst[12]=m[12];dst[13]=m[13];dst[14]=m[14];dst[15]=m[15]}return dst}
        /** Makes an y rotation matrix
         * @param {number} angleInRadians amount to rotate @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function yRotation(angleInRadians,dst){dst||=new Float32Array(16);var c=Math.cos(angleInRadians);var s=Math.sin(angleInRadians);dst[0]=c;dst[1]=0;dst[2]=-s;dst[3]=0;dst[4]=0;dst[5]=1;dst[6]=0;dst[7]=0;dst[8]=s;dst[9]=0;dst[10]=c;dst[11]=0;dst[12]=0;dst[13]=0;dst[14]=0;dst[15]=1;return dst}
        /** Multiply by an y rotation matrix
         * @param {Matrix4} m matrix to multiply @param {number} angleInRadians amount to rotate @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function yRotate(m,angleInRadians,dst){dst||=new Float32Array(16);var m00=m[0*4+0];var m01=m[0*4+1];var m02=m[0*4+2];var m03=m[0*4+3];var m20=m[2*4+0];var m21=m[2*4+1];var m22=m[2*4+2];var m23=m[2*4+3];var c=Math.cos(angleInRadians);var s=Math.sin(angleInRadians);dst[0]=c*m00-s*m20;dst[1]=c*m01-s*m21;dst[2]=c*m02-s*m22;dst[3]=c*m03-s*m23;dst[8]=c*m20+s*m00;dst[9]=c*m21+s*m01;dst[10]=c*m22+s*m02;dst[11]=c*m23+s*m03;if(m!==dst){dst[4]=m[4];dst[5]=m[5];dst[6]=m[6];dst[7]=m[7];dst[12]=m[12];dst[13]=m[13];dst[14]=m[14];dst[15]=m[15]}return dst}
        /** Makes an z rotation matrix
         * @param {number} angleInRadians amount to rotate @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function zRotation(angleInRadians,dst){dst||=new Float32Array(16);var c=Math.cos(angleInRadians);var s=Math.sin(angleInRadians);dst[0]=c;dst[1]=s;dst[2]=0;dst[3]=0;dst[4]=-s;dst[5]=c;dst[6]=0;dst[7]=0;dst[8]=0;dst[9]=0;dst[10]=1;dst[11]=0;dst[12]=0;dst[13]=0;dst[14]=0;dst[15]=1;return dst}
        /** Multiply by an z rotation matrix
         * @param {Matrix4} m matrix to multiply @param {number} angleInRadians amount to rotate @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function zRotate(m,angleInRadians,dst){dst||=new Float32Array(16);var m00=m[0*4+0];var m01=m[0*4+1];var m02=m[0*4+2];var m03=m[0*4+3];var m10=m[1*4+0];var m11=m[1*4+1];var m12=m[1*4+2];var m13=m[1*4+3];var c=Math.cos(angleInRadians);var s=Math.sin(angleInRadians);dst[0]=c*m00+s*m10;dst[1]=c*m01+s*m11;dst[2]=c*m02+s*m12;dst[3]=c*m03+s*m13;dst[4]=c*m10-s*m00;dst[5]=c*m11-s*m01;dst[6]=c*m12-s*m02;dst[7]=c*m13-s*m03;if(m!==dst){dst[8]=m[8];dst[9]=m[9];dst[10]=m[10];dst[11]=m[11];dst[12]=m[12];dst[13]=m[13];dst[14]=m[14];dst[15]=m[15]}return dst}
        /** Makes an rotation matrix around an arbitrary axis
         * @param {vec3} axis axis to rotate around @param {number} angleInRadians amount to rotate @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function axisRotation(axis,angleInRadians,dst){dst||=new Float32Array(16);var x=axis[0];var y=axis[1];var z=axis[2];var n=Math.sqrt(x*x+y*y+z*z);x/=n;y/=n;z/=n;var xx=x*x;var yy=y*y;var zz=z*z;var c=Math.cos(angleInRadians);var s=Math.sin(angleInRadians);var oneMinusCosine=1-c;dst[0]=xx+(1-xx)*c;dst[1]=x*y*oneMinusCosine+z*s;dst[2]=x*z*oneMinusCosine-y*s;dst[3]=0;dst[4]=x*y*oneMinusCosine-z*s;dst[5]=yy+(1-yy)*c;dst[6]=y*z*oneMinusCosine+x*s;dst[7]=0;dst[8]=x*z*oneMinusCosine+y*s;dst[9]=y*z*oneMinusCosine-x*s;dst[10]=zz+(1-zz)*c;dst[11]=0;dst[12]=0;dst[13]=0;dst[14]=0;dst[15]=1;return dst}
        /** Multiply by an axis rotation matrix
         * @param {Matrix4} m matrix to multiply @param {vec3} axis axis to rotate around @param {number} angleInRadians amount to rotate @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function axisRotate(m,axis,angleInRadians,dst){dst||=new Float32Array(16);var x=axis[0];var y=axis[1];var z=axis[2];var n=Math.sqrt(x*x+y*y+z*z);x/=n;y/=n;z/=n;var xx=x*x;var yy=y*y;var zz=z*z;var c=Math.cos(angleInRadians);var s=Math.sin(angleInRadians);var oneMinusCosine=1-c;var r00=xx+(1-xx)*c;var r01=x*y*oneMinusCosine+z*s;var r02=x*z*oneMinusCosine-y*s;var r10=x*y*oneMinusCosine-z*s;var r11=yy+(1-yy)*c;var r12=y*z*oneMinusCosine+x*s;var r20=x*z*oneMinusCosine+y*s;var r21=y*z*oneMinusCosine-x*s;var r22=zz+(1-zz)*c;var m00=m[0];var m01=m[1];var m02=m[2];var m03=m[3];var m10=m[4];var m11=m[5];var m12=m[6];var m13=m[7];var m20=m[8];var m21=m[9];var m22=m[10];var m23=m[11];dst[0]=r00*m00+r01*m10+r02*m20;dst[1]=r00*m01+r01*m11+r02*m21;dst[2]=r00*m02+r01*m12+r02*m22;dst[3]=r00*m03+r01*m13+r02*m23;dst[4]=r10*m00+r11*m10+r12*m20;dst[5]=r10*m01+r11*m11+r12*m21;dst[6]=r10*m02+r11*m12+r12*m22;dst[7]=r10*m03+r11*m13+r12*m23;dst[8]=r20*m00+r21*m10+r22*m20;dst[9]=r20*m01+r21*m11+r22*m21;dst[10]=r20*m02+r21*m12+r22*m22;dst[11]=r20*m03+r21*m13+r22*m23;if(m!==dst){dst[12]=m[12];dst[13]=m[13];dst[14]=m[14];dst[15]=m[15]}return dst}
        /** Makes a scale matrix
         * @param {number} sx x scale. @param {number} sy y scale. @param {number} sz z scale. @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function scaling(sx,sy,sz,dst){dst||=new Float32Array(16);dst[0]=sx;dst[1]=0;dst[2]=0;dst[3]=0;dst[4]=0;dst[5]=sy;dst[6]=0;dst[7]=0;dst[8]=0;dst[9]=0;dst[10]=sz;dst[11]=0;dst[12]=0;dst[13]=0;dst[14]=0;dst[15]=1;return dst}
        /** Multiply by a scaling matrix
         * @param {Matrix4} m matrix to multiply @param {number} sx x scale. @param {number} sy y scale. @param {number} sz z scale. @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function scale(m,sx,sy,sz,dst){dst||=new Float32Array(16);dst[0]=sx*m[0*4+0];dst[1]=sx*m[0*4+1];dst[2]=sx*m[0*4+2];dst[3]=sx*m[0*4+3];dst[4]=sy*m[1*4+0];dst[5]=sy*m[1*4+1];dst[6]=sy*m[1*4+2];dst[7]=sy*m[1*4+3];dst[8]=sz*m[2*4+0];dst[9]=sz*m[2*4+1];dst[10]=sz*m[2*4+2];dst[11]=sz*m[2*4+3];if(m!==dst){dst[12]=m[12];dst[13]=m[13];dst[14]=m[14];dst[15]=m[15]}return dst}
        /** creates a matrix from translation, quaternion, scale
         * @param {Number[]} translation [x, y, z] translation @param {Number[]} quaternion [x, y, z, z] quaternion rotation @param {Number[]} scale [x, y, z] scale @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided
         */
        function compose(translation,quaternion,scale,dst){dst||=new Float32Array(16);const x=quaternion[0];const y=quaternion[1];const z=quaternion[2];const w=quaternion[3];const x2=x+x;const y2=y+y;const z2=z+z;const xx=x*x2;const xy=x*y2;const xz=x*z2;const yy=y*y2;const yz=y*z2;const zz=z*z2;const wx=w*x2;const wy=w*y2;const wz=w*z2;const sx=scale[0];const sy=scale[1];const sz=scale[2];dst[0]=(1-(yy+zz))*sx;dst[1]=(xy+wz)*sx;dst[2]=(xz-wy)*sx;dst[3]=0;dst[4]=(xy-wz)*sy;dst[5]=(1-(xx+zz))*sy;dst[6]=(yz+wx)*sy;dst[7]=0;dst[8]=(xz+wy)*sz;dst[9]=(yz-wx)*sz;dst[10]=(1-(xx+yy))*sz;dst[11]=0;dst[12]=translation[0];dst[13]=translation[1];dst[14]=translation[2];dst[15]=1;return dst}
        function quatFromRotationMatrix(m,dst){const m11=m[0];const m12=m[4];const m13=m[8];const m21=m[1];const m22=m[5];const m23=m[9];const m31=m[2];const m32=m[6];const m33=m[10];const trace=m11+m22+m33;if(trace>0){const s=0.5/Math.sqrt(trace+1);dst[3]=0.25/s;dst[0]=(m32-m23)*s;dst[1]=(m13-m31)*s;dst[2]=(m21-m12)*s}else if(m11>m22&&m11>m33){const s=2*Math.sqrt(1+m11-m22-m33);dst[3]=(m32-m23)/s;dst[0]=0.25*s;dst[1]=(m12+m21)/s;dst[2]=(m13+m31)/s}else if(m22>m33){const s=2*Math.sqrt(1+m22-m11-m33);dst[3]=(m13-m31)/s;dst[0]=(m12+m21)/s;dst[1]=0.25*s;dst[2]=(m23+m32)/s}else{const s=2*Math.sqrt(1+m33-m11-m22);dst[3]=(m21-m12)/s;dst[0]=(m13+m31)/s;dst[1]=(m23+m32)/s;dst[2]=0.25*s}}
        function decompose(mat,translation,quaternion,scale){let sx=m4.length(mat.slice(0,3));const sy=m4.length(mat.slice(4,7));const sz=m4.length(mat.slice(8,11));const det=determinate(mat);if(det<0){sx=-sx}translation[0]=mat[12];translation[1]=mat[13];translation[2]=mat[14];const matrix=m4.copy(mat);const invSX=1/sx;const invSY=1/sy;const invSZ=1/sz;matrix[0]*=invSX;matrix[1]*=invSX;matrix[2]*=invSX;matrix[4]*=invSY;matrix[5]*=invSY;matrix[6]*=invSY;matrix[8]*=invSZ;matrix[9]*=invSZ;matrix[10]*=invSZ;quatFromRotationMatrix(matrix,quaternion);scale[0]=sx;scale[1]=sy;scale[2]=sz}
        function determinate(m){var m00=m[0*4+0];var m01=m[0*4+1];var m02=m[0*4+2];var m03=m[0*4+3];var m10=m[1*4+0];var m11=m[1*4+1];var m12=m[1*4+2];var m13=m[1*4+3];var m20=m[2*4+0];var m21=m[2*4+1];var m22=m[2*4+2];var m23=m[2*4+3];var m30=m[3*4+0];var m31=m[3*4+1];var m32=m[3*4+2];var m33=m[3*4+3];var tmp_0=m22*m33;var tmp_1=m32*m23;var tmp_2=m12*m33;var tmp_3=m32*m13;var tmp_4=m12*m23;var tmp_5=m22*m13;var tmp_6=m02*m33;var tmp_7=m32*m03;var tmp_8=m02*m23;var tmp_9=m22*m03;var tmp_10=m02*m13;var tmp_11=m12*m03;var t0=(tmp_0*m11+tmp_3*m21+tmp_4*m31)-(tmp_1*m11+tmp_2*m21+tmp_5*m31);var t1=(tmp_1*m01+tmp_6*m21+tmp_9*m31)-(tmp_0*m01+tmp_7*m21+tmp_8*m31);var t2=(tmp_2*m01+tmp_7*m11+tmp_10*m31)-(tmp_3*m01+tmp_6*m11+tmp_11*m31);var t3=(tmp_5*m01+tmp_8*m11+tmp_11*m21)-(tmp_4*m01+tmp_9*m11+tmp_10*m21);return 1.0/(m00*t0+m10*t1+m20*t2+m30*t3)}
        /** Computes the inverse of a matrix.
         * @param {Matrix4} m matrix to compute inverse of @param {Matrix4} [dst] optional matrix to store result @return {Matrix4} dst or a new matrix if none provided */
        function inverse(m,dst){dst||=new Float32Array(16);var m00=m[0*4+0];var m01=m[0*4+1];var m02=m[0*4+2];var m03=m[0*4+3];var m10=m[1*4+0];var m11=m[1*4+1];var m12=m[1*4+2];var m13=m[1*4+3];var m20=m[2*4+0];var m21=m[2*4+1];var m22=m[2*4+2];var m23=m[2*4+3];var m30=m[3*4+0];var m31=m[3*4+1];var m32=m[3*4+2];var m33=m[3*4+3];var tmp_0=m22*m33;var tmp_1=m32*m23;var tmp_2=m12*m33;var tmp_3=m32*m13;var tmp_4=m12*m23;var tmp_5=m22*m13;var tmp_6=m02*m33;var tmp_7=m32*m03;var tmp_8=m02*m23;var tmp_9=m22*m03;var tmp_10=m02*m13;var tmp_11=m12*m03;var tmp_12=m20*m31;var tmp_13=m30*m21;var tmp_14=m10*m31;var tmp_15=m30*m11;var tmp_16=m10*m21;var tmp_17=m20*m11;var tmp_18=m00*m31;var tmp_19=m30*m01;var tmp_20=m00*m21;var tmp_21=m20*m01;var tmp_22=m00*m11;var tmp_23=m10*m01;var t0=(tmp_0*m11+tmp_3*m21+tmp_4*m31)-(tmp_1*m11+tmp_2*m21+tmp_5*m31);var t1=(tmp_1*m01+tmp_6*m21+tmp_9*m31)-(tmp_0*m01+tmp_7*m21+tmp_8*m31);var t2=(tmp_2*m01+tmp_7*m11+tmp_10*m31)-(tmp_3*m01+tmp_6*m11+tmp_11*m31);var t3=(tmp_5*m01+tmp_8*m11+tmp_11*m21)-(tmp_4*m01+tmp_9*m11+tmp_10*m21);var d=1.0/(m00*t0+m10*t1+m20*t2+m30*t3);dst[0]=d*t0;dst[1]=d*t1;dst[2]=d*t2;dst[3]=d*t3;dst[4]=d*((tmp_1*m10+tmp_2*m20+tmp_5*m30)-(tmp_0*m10+tmp_3*m20+tmp_4*m30));dst[5]=d*((tmp_0*m00+tmp_7*m20+tmp_8*m30)-(tmp_1*m00+tmp_6*m20+tmp_9*m30));dst[6]=d*((tmp_3*m00+tmp_6*m10+tmp_11*m30)-(tmp_2*m00+tmp_7*m10+tmp_10*m30));dst[7]=d*((tmp_4*m00+tmp_9*m10+tmp_10*m20)-(tmp_5*m00+tmp_8*m10+tmp_11*m20));dst[8]=d*((tmp_12*m13+tmp_15*m23+tmp_16*m33)-(tmp_13*m13+tmp_14*m23+tmp_17*m33));dst[9]=d*((tmp_13*m03+tmp_18*m23+tmp_21*m33)-(tmp_12*m03+tmp_19*m23+tmp_20*m33));dst[10]=d*((tmp_14*m03+tmp_19*m13+tmp_22*m33)-(tmp_15*m03+tmp_18*m13+tmp_23*m33));dst[11]=d*((tmp_17*m03+tmp_20*m13+tmp_23*m23)-(tmp_16*m03+tmp_21*m13+tmp_22*m23));dst[12]=d*((tmp_14*m22+tmp_17*m32+tmp_13*m12)-(tmp_16*m32+tmp_12*m12+tmp_15*m22));dst[13]=d*((tmp_20*m32+tmp_12*m02+tmp_19*m22)-(tmp_18*m22+tmp_21*m32+tmp_13*m02));dst[14]=d*((tmp_18*m12+tmp_23*m32+tmp_15*m02)-(tmp_22*m32+tmp_14*m02+tmp_19*m12));dst[15]=d*((tmp_22*m22+tmp_16*m02+tmp_21*m12)-(tmp_20*m12+tmp_23*m22+tmp_17*m02));return dst}
        /** Takes a  matrix and a vector with 4 entries, transforms that vector by the matrix, and returns the result as a vector with 4 entries.
         * @param {Matrix4} m The matrix. @param {Vector4} v The point in homogenous coordinates. @param {Vector4} dst optional vector4 to store result @return {Vector4} dst or new Vector4 if not provided */
        function transformVector(m,v,dst){dst||=new Float32Array(4);for(var i=0;i<4;++i){dst[i]=0.0;for(var j=0;j<4;++j){dst[i]+=v[j]*m[j*4+i]}}return dst}
        /** Takes a 4-by-4 matrix and a vector with 3 entries, interprets the vector as a point, transforms that point by the matrix, and returns the result as a vector with 3 entries.
         * @param {Matrix4} m The matrix. @param {vec3} v The point. @param {Vector4} dst optional vector4 to store result @return {Vector4} dst or new Vector4 if not provided */
        function transformPoint(m,v,dst){dst||=new Float32Array(3);var v0=v[0];var v1=v[1];var v2=v[2];var d=v0*m[0*4+3]+v1*m[1*4+3]+v2*m[2*4+3]+m[3*4+3];dst[0]=(v0*m[0*4+0]+v1*m[1*4+0]+v2*m[2*4+0]+m[3*4+0])/d;dst[1]=(v0*m[0*4+1]+v1*m[1*4+1]+v2*m[2*4+1]+m[3*4+1])/d;dst[2]=(v0*m[0*4+2]+v1*m[1*4+2]+v2*m[2*4+2]+m[3*4+2])/d;return dst}
        /** Takes a 4-by-4 matrix and a vector with 3 entries, interprets the vector as a direction, transforms that direction by the matrix, and returns the result;
         * assumes the transformation of 3-dimensional space represented by the matrix is parallel-preserving, i.e. any combination of rotation, scaling and translation, but not a perspective distortion. Returns a vector with 3 entries.
         * @param {Matrix4} m The matrix. @param {vec3} v The direction. @param {Vector4} dst optional vector4 to store result @return {Vector4} dst or new Vector4 if not provided */
        function transformDirection(m,v,dst){dst||=new Float32Array(3);var v0=v[0];var v1=v[1];var v2=v[2];dst[0]=v0*m[0*4+0]+v1*m[1*4+0]+v2*m[2*4+0];dst[1]=v0*m[0*4+1]+v1*m[1*4+1]+v2*m[2*4+1];dst[2]=v0*m[0*4+2]+v1*m[1*4+2]+v2*m[2*4+2];return dst}
        /** Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector as a normal to a surface, and computes a vector which is normal upon transforming that surface by the matrix. The effect of this function is the same as transforming v (as a direction) by the inverse-transpose of m.  This function assumes the transformation of 3-dimensional space represented by the matrix is parallel-preserving, i.e. any combination of rotation, scaling and translation, but not a perspective distortion.  Returns a vector with 3 entries.
         * @param {Matrix4} m The matrix. @param {vec3} v The normal. @param {vec3} [dst] The direction. @return {vec3} The transformed direction. */
        function transformNormal(m,v,dst){dst||=new Float32Array(3);var mi=inverse(m);var v0=v[0];var v1=v[1];var v2=v[2];dst[0]=v0*mi[0*4+0]+v1*mi[0*4+1]+v2*mi[0*4+2];dst[1]=v0*mi[1*4+0]+v1*mi[1*4+1]+v2*mi[1*4+2];dst[2]=v0*mi[2*4+0]+v1*mi[2*4+1]+v2*mi[2*4+2];return dst}
        function copy(src,dst){dst||=new Float32Array(16);dst[0]=src[0];dst[1]=src[1];dst[2]=src[2];dst[3]=src[3];dst[4]=src[4];dst[5]=src[5];dst[6]=src[6];dst[7]=src[7];dst[8]=src[8];dst[9]=src[9];dst[10]=src[10];dst[11]=src[11];dst[12]=src[12];dst[13]=src[13];dst[14]=src[14];dst[15]=src[15];return dst}
		return {copy: copy,lookAt: lookAt,addVectors: addVectors,add:addVectors,subtractVectors: subtractVectors,scaleVector: scaleVector,distance: distance,distanceSq: distanceSq,normalize: normalize,compose: compose,cross: cross,decompose: decompose,dot: dot,identity: identity,transpose: transpose,length: length,lengthSq: lengthSq,orthographic: orthographic,frustum: frustum,perspective: perspective,translation: translation,translate: translate,xRotation: xRotation,yRotation: yRotation,zRotation: zRotation,xRotate: xRotate,yRotate: yRotate,zRotate: zRotate,axisRotation: axisRotation,axisRotate: axisRotate,scaling: scaling,scale: scale,multiply: multiply,inverse: inverse,transformVector: transformVector,transformPoint: transformPoint,transformDirection: transformDirection,transformNormal: transformNormal}
	})();
  
    //Core
    class Texture{
        /**
         * @param {WebGL2RenderingContext} gl
         * @param {string} src
         */
        constructor(gl,src){
            const texture = gl.createTexture();
            this.texture = texture;
            this.gl = gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
            const image = new Image();
            image.crossOrigin = "";
            image.src = src;
            image.addEventListener('load', function() {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            });
        }
        bind(){
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        }
    }
    class Buffer{
        /**
         * @param {WebGL2RenderingContext} gl
         * @param {ArrayBufferView} [data]
         */
        constructor(gl, data){
            this.gl = gl;
            this.buffer = gl.createBuffer();
            this.bytes = 0;
            if(data) this.setData(data);
        }
        /**
         * @param {ArrayBufferView} data - data to load into buffer
         * @param {boolean} dynamic_data - whether the data in this buffer will be changed frequently
         */
        setData(data,dynamic_data = true) {
            const gl = this.gl;
            this.bind();
            this.bytes = data.buffer.byteLength;
            gl.bufferData(gl.ARRAY_BUFFER,data,dynamic_data ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
        }
        /**
         * @param {ArrayBufferView} data
         * @param {number} offset
         */
        subData(data,offset=0) {
            const gl = this.gl;
            this.bind();
            gl.bufferSubData(gl.ARRAY_BUFFER,offset,data);
        }

        /** binds this buffer to gl.ARRAY_BUFFER */
        bind(){this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)}
    }
    class VertexArrayObject{
        /** @param {WebGL2RenderingContext} gl */
        constructor(gl){
            this.gl = gl;
            this.VAO = gl.createVertexArray();
        }

        bind(){this.gl.bindVertexArray(this.VAO)}

        /**
         * Tells OpenGL how to get data from the buffer
         * @param {Buffer} buf - buffer to read from
         * @param {number} loc - location of attribute
         * @param {"BYTE"|"SHORT"|"FLOAT"|"UNSIGNED_BYTE"|"UNSIGNED_SHORT"} type - type of data to be read
         * @param {1|2|3|4} size - number of components to be read.
         * @param {number} stride - distance in bytes between the beginning of consecutive vertex attributes
         * @param {number} offset - offset in bytes from the start of the buffer
         * @param {boolean} normalize (optional)
         */
        vertexAttribPointer(buf,loc,type,size,stride,offset,normalize = false){
            this.bind();
            buf.bind();
            const gl = this.gl;
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, size, gl[type], normalize, stride, offset);
        }

        /**
         * Tells OpenGL how to get matrix data from the buffer
         * @param {Buffer} buf - buffer to read from
         * @param {number} loc - location of attribute
         * @param {"BYTE"|"SHORT"|"FLOAT"|"UNSIGNED_BYTE"|"UNSIGNED_SHORT"} type - type of data to be read
         * @param {1|2|3|4} size - number of components to be read.
         * @param {number} stride - distance in bytes between the beginning of consecutive vertex attributes
         * @param {number} offset - offset in bytes from the start of the buffer
         * @param {boolean} normalize (optional)
         */
        vertexAttribPointerMat(buf,loc,type,size,stride,offset,normalize = false){
            this.bind();
            buf.bind();
            const gl = this.gl;
            const sizes = {FLOAT:4,BYTE:1,SHORT:2};
            for(let i = 0; i < size; i++)
                gl.enableVertexAttribArray(loc + i),
                gl.vertexAttribPointer(loc + i, size, gl[type], normalize, stride, offset + i * size * sizes[type]);
        }
    }
    class Program{
        /**
         * @param {WebGL2RenderingContext} gl - The WebGL2RenderingContext to use.
         * @param {string} vertSource - the source for the vertex shader
         * @param {string} fragSource - the source for the fragment shader
         */
        constructor(gl, vertSource, fragSource){
            this.gl = gl;
            this.program = wgllib.core.createProgramFromSources(gl,vertSource,fragSource);
            this.VAO = new VertexArrayObject(gl);
        }
        /**
         * @param {string} name - the name of the attribute
         * @returns {number}
         */
        getAttribLoc(name){return this.gl.getAttribLocation(this.program,name)}
        /**
         * @param {string} name - the name of the uniform
         * @returns {number}
         */
        getUniformLoc(name){return this.gl.getUniformLocation(this.program,name)}

        use(){this.gl.useProgram(this.program)}

        //#region function for uniforms (wrap webgl's methods)
        /** @param {string} name @param {number} x @param {number?} y @param {number?} z @param {number?} w @param {[]} args*/
        uniformf(name,x,y,z,w,...args){this.use(),this.gl[`uniform${arguments.length-1}f`](this.getUniformLoc(name),...Array.prototype.slice.call(arguments,1))}
        /** @param {string} name @param {Iterable<Number>} vals */
        uniformfv(name, vals){this.use(),this.gl[`uniform${[...vals].length}fv`](this.getUniformLoc(name),vals)}
        /** @param {string} name @param {number} x @param {number?} y @param {number?} z @param {number?} w @param {[]} args*/
        uniformi(name,x,y,z,w,...args){this.use(),this.gl[`uniform${arguments.length-1}i`](this.getUniformLoc(name),...Array.prototype.slice.call(arguments,1))}
        /** @param {string} name @param {Iterable<Number>} vals */
        uniformiv(name, vals){this.use(),this.gl[`uniform${[...vals].length}iv`](this.getUniformLoc(name),vals)}
        /** @param {string} name @param {Iterable<Number>} mat */
        uniformMat(name,mat){this.use(),this.gl[`uniformMatrix${Math.round(Math.sqrt([...mat].length))}fv`](this.getUniformLoc(name),false,mat)}
        //#endregion
    }
    class Camera{
        /**
         * @param {WebGL2RenderingContext} gl
         * @param {number[]} pos - position
         * @param {number[]} rot - rotation
         * @param {number} near - near clipping plane
         * @param {number} far - far clipping plane
         */
        constructor(gl,pos,rot,near,far){
            this.gl = gl;

            this.projection_matrix = m4.identity();
            this.near = near || 0.01;
            this.far = far || 100;
            this.aspect_ratio = undefined;
            this.fov = undefined;
            this.recompute_projection(wgllib.core.math.toRad(70));

            this.camera_matrix = m4.identity();
            this.isCamMatrixDirty = false;
            this.pos = pos || [0,0,0];
            this.rot = rot || [0,0];
            this.recompute_camera();

            this.matrix = m4.identity();
            this.isMatrixDirty = false;
            this.recompute_matrix();
        }
        rotate(a = 0,b = 0){
            if(a||b){
                this.rot[0] += a;
                this.rot[1] += b;
                this.rot[0] = Math.min(Math.max(this.rot[0],-Math.PI/2),Math.PI/2);
                this.isCamMatrixDirty = true;
            }
        }
        move(x = 0,y = 0,z = 0){
            if(x||y||z){
                this.pos[0] += Math.cos(this.rot[1]) * x - Math.sin(this.rot[1]) * z;
                this.pos[2] += Math.cos(this.rot[1]) * z + Math.sin(this.rot[1]) * x;
                this.pos[1] -= y;
                this.isCamMatrixDirty = true;
            }
        }
        get rotation(){
            return this.rot;
        }
        set rotation([a,b]){
            a = Math.min(Math.max(a,-Math.PI/2),Math.PI/2);
            if(a != this.rot[0] || b != this.rot[1]){
                this.rot[0] = a;
                this.rot[1] = b;
                this.isCamMatrixDirty = true;
            }
        }
        get position(){
            return this.pos.map(i=>-i);
        }
        set position([x,y,z]){
            if(x != this.pos[0] || y != this.pos[1] || z != this.pos[2]){
                this.pos[0] = -x;
                this.pos[1] = -y;
                this.pos[2] = -z;
                this.isCamMatrixDirty = true;
            }
        }
        recompute_camera(){
            m4.identity(this.camera_matrix);
            m4.xRotate(this.camera_matrix,this.rot[0],this.camera_matrix);
            m4.yRotate(this.camera_matrix,this.rot[1],this.camera_matrix);
            m4.translate(this.camera_matrix,this.pos[0],this.pos[1],this.pos[2],this.camera_matrix);
            this.isCamMatrixDirty = false;
            this.isMatrixDirty = true;
        }
        recompute_projection(fov){
            const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
            if(aspect !== this.aspect_ratio || fov !== this.fov){
                m4.perspective(fov,aspect,this.near,this.far,this.projection_matrix);
                this.aspect_ratio = aspect;this.fov = fov;
                this.isMatrixDirty = true;
            }
        }
        recompute_matrix(){
            m4.multiply(this.projection_matrix,this.camera_matrix,this.matrix);
            this.isMatrixDirty = false;
        }

        /**
         * 
         * @param {Program} program 
         * @param {VertexArrayObject} VAO
         * @param {string} matrix_uniform_name 
         * @param {GLenum} mode 
         * @param {GLint} offset 
         * @param {GLint} length 
         */
        draw(program,VAO,mode,offset,length){
            program.use();
            VAO.bind();
            this.gl.drawArrays(mode,offset,length);
        }

        get_matrix(){
            if(this.isCamMatrixDirty) this.recompute_camera();
            if(this.isMatrixDirty) this.recompute_matrix();
            return this.matrix;
        }
    }

    class OrthoCamera{
        /**
         * @param {WebGL2RenderingContext} gl
         * @param {number[]} pos - position
         * @param {number[]} rot - rotation
         * @param {number} scale - scale
         * @param {number} near - near clipping plane
         * @param {number} far - far clipping plane
         */
        constructor(gl,pos,rot,scale,near,far){
            this.gl = gl;
            this.projection_matrix = m4.identity();
            this.near = near || 0.01;
            this.far = far || 100;
            this.aspect_ratio = undefined;
            this.recompute_projection(wgllib.core.math.toRad(70));

            this.camera_matrix = m4.identity();
            this.isCamMatrixDirty = false;
            this.pos = pos || [0,0,0];
            this.rot = rot || [0,0];
            this.scale = scale || 1;
            this.recompute_camera();

            this.matrix = m4.identity();
            this.isMatrixDirty = false;
            this.recompute_matrix();
        }
        rotate(a = 0,b = 0){
            if(a||b){
                this.rot[0] += a;
                this.rot[1] += b;
                this.rot[0] = Math.min(Math.max(this.rot[0],-Math.PI/2),Math.PI/2);
                this.isCamMatrixDirty = true;
            }
        }
        move(x = 0,y = 0,z = 0){
            if(x||y||z){
                this.pos[0] += Math.sin(this.rot[1]) * z - Math.cos(this.rot[1]) * x;
                this.pos[2] -= Math.sin(this.rot[1]) * x + Math.cos(this.rot[1]) * z;
                this.pos[1] += y;
                this.isCamMatrixDirty = true;
            }
        }
        recompute_camera(){
            m4.identity(this.camera_matrix);
            m4.xRotate(this.camera_matrix,this.rot[0],this.camera_matrix);
            m4.yRotate(this.camera_matrix,this.rot[1],this.camera_matrix);
            m4.translate(this.camera_matrix,this.pos[0],this.pos[1],this.pos[2],this.camera_matrix);
            this.isCamMatrixDirty = false;
            this.isMatrixDirty = true;
        }
        recompute_projection(){
            const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
            if(aspect !== this.aspect_ratio){
                m4.orthographic(-aspect,aspect,-1,1,this.near,this.far,this.projection_matrix);
                this.aspect_ratio = aspect;
                this.isMatrixDirty = true;
            }
        }
        recompute_matrix(){
            m4.multiply(this.projection_matrix,this.camera_matrix,this.matrix);
            this.isMatrixDirty = false;
        }
    }

    class FirstPersonController{
        /**@param {Camera} camera*/
        constructor(camera,movementSpeed = 5,rotationSpeed = 2){
            this.camera = camera;
            this.movementSpeed = movementSpeed;
            this.rotationSpeed = rotationSpeed;
        }
        update(deltaTime){
            const mStep = this.movementSpeed * deltaTime,rStep = this.rotationSpeed * deltaTime;
            let x = 0, y = 0, z = 0, a = 0, b = 0;
            if(wgllib.core.events.keysDown['w'])         z -= mStep;
            if(wgllib.core.events.keysDown['a'])         x -= mStep;
            if(wgllib.core.events.keysDown['s'])         z += mStep;
            if(wgllib.core.events.keysDown['d'])         x += mStep;
            if(wgllib.core.events.keysDown[' '])         y -= mStep;
            if(wgllib.core.events.keysDown['shift'])     y += mStep;
            if(wgllib.core.events.keysDown['arrowup'])   a += rStep;
            if(wgllib.core.events.keysDown['arrowdown']) a -= rStep;
            if(wgllib.core.events.keysDown['arrowleft']) b += rStep;
            if(wgllib.core.events.keysDown['arrowright'])b -= rStep;
            // this.camera.rotation[0] += a;
            // this.camera.rotation[1] += b;
            // this.camera.position[0] += x;
            // this.camera.position[1] += y;
            // this.camera.position[2] += z;
            this.camera.rotate(a,b);
            this.camera.move(x,y,z);
        }
    }
    //Utility
    class CubeMeshGenerator{
        constructor(atlasWidth = 16,atlasHeight = 16){
            this.atlasWidth = atlasWidth;
            this.atlasHeight = atlasHeight;
            this.facev = "276723|450105|426240|735153|674547|032301".split("|").map(i=>i.split("").map(j=>Number.parseInt(j,10)).map(j=>[(j>>2)&1,(j>>1)&1,j&1]));
            this.facet = "501054|125652|69596A|849594|D9EAE9|9C8C9D".split("|").map(i=>i.split("").map(j=>Number.parseInt(j,16)).map(j=>[((j>>2)&3)/atlasWidth,(j&3)/atlasHeight]));
        }
        getPos(face,vertex,position){return this.facev[face][vertex].map((s,i)=>s + position[i])}
        getTex(face,vertex,atlas_pos){return Array.isArray(atlas_pos) ? [
            this.facet[face][vertex][0] / 3 + atlas_pos[0] / this.atlasWidth,
            this.facet[face][vertex][1] / 2 + atlas_pos[1] / this.atlasHeight
        ] : [
            this.facet[face][vertex][0] / 3 + Math.floor(atlas_pos / this.atlasHeight) / this.atlasWidth,
            this.facet[face][vertex][1] / 2 + (atlas_pos % this.atlasHeight) / this.atlasHeight
        ]}
    }
    return {
        core:{
            /**
             * @param {WebGL2RenderingContext} gl The WebGL2RenderingContext to use.
             * @param {string} shaderSource The shader source.
             * @param {number} shaderType The type of shader.
             * @returns {WebGLShader} The created shader.
             */
            createShader(gl, shaderSource, shaderType) {
                const shader = gl.createShader(shaderType);
                gl.shaderSource(shader, shaderSource);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.log(
                        "*** Error compiling shader '" + shader + "':" +
                        gl.getShaderInfoLog(shader) + `\n` +
                        shaderSource.split('\n').map((l, i) => (i + 1) + ':' + l).join('\n')
                    );
                    gl.deleteShader(shader);
                    return null;
                }
                return shader;
            },

            /**
             * @param {WebGL2RenderingContext} gl The WebGL2RenderingContext to use.
             * @param {WebGLShader[]} shaders The shaders to attach
             * @returns {WebGLProgram} The created program.
             */
            createProgram(gl, ...shaders) {
                const program = gl.createProgram();
                for (let shader of shaders) gl.attachShader(program, shader);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.log('Error in program linking:' + gl.getProgramInfoLog(program));
                    gl.deleteProgram(program);
                    return null;
                }
                return program;
            },

            /**
             * @param {WebGL2RenderingContext} gl - The WebGL2RenderingContext to use.
             * @param {string} vertSource the - source for the vertex shader
             * @param {string} fragSource the - source for the fragment shader
             * @returns {WebGLProgram}
             */
            createProgramFromSources(gl, vertSource, fragSource) {
                return this.createProgram(gl,
                    this.createShader(gl, vertSource, gl.VERTEX_SHADER),
                    this.createShader(gl, fragSource, gl.FRAGMENT_SHADER)
                );
            },
            Buffer: Buffer,
            VertexArrayObject:VertexArrayObject,
            Program: Program,
            Texture: Texture,
            Camera:Camera,
            OrthoCamera:OrthoCamera,
            events:{
                keysDown: {},
                init(){
                    window.addEventListener('keydown',e=>{wgllib.core.events.keysDown[e.key.toLowerCase()] = true});
                    window.addEventListener('keyup',e=>{wgllib.core.events.keysDown[e.key.toLowerCase()] = false});
                    window.addEventListener('blur', _=>(wgllib.core.events.keysDown = {}));
                },
            },
            math:{
                /**
                 * @param {number} r - angle in radians
                 * @returns {number}
                 */
                toDeg(r){return r * 180 / Math.PI},
                /**
                 * @param {number} d - angle in degrees
                 * @returns {number}
                 */
                toRad(d){return d * Math.PI / 180},
                m4:m4
            },
        },
        gameUtil:{
            CubeMeshGenerator:CubeMeshGenerator,
            FirstPersonController: FirstPersonController,
        },
        /**
         * Calls f(current time, elapsed time in milliseconds) 60 times per second (or tries to...)
         * @param {Function} f - the function to be called
         */
        createAnimation(f){
            let then = 0;
            const f2 = t=>{
                f(0.001 * t, 0.001 * (then - t));
                then = t;
                requestAnimationFrame(f2);
            };
            requestAnimationFrame(f2);
        },
        fullscreenCanvas(antialias=true){
            let c = document.createElement("canvas");
            let gl = c.getContext('webgl2',{antialias:antialias});
            if(!gl) throw Error("ERROR: WEBGL NOT SUPPORTED");

            c.style.setProperty("position","absolute");
            c.style.setProperty("top","0px");
            c.style.setProperty("left","0px");
            document.body.appendChild(c);
            c.width = c.clientWidth;
            c.height = c.clientHeight;
            gl.viewport(0, 0, c.width, c.height);
            gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            window.addEventListener("resize",_=>{
                c.width = c.clientWidth;
                c.height = c.clientHeight;
                gl.viewport(0, 0, c.width, c.height);
            });
            return {canvas:c,gl:gl};
        }
    };
})();