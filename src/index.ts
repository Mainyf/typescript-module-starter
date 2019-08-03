const VERTEX_SHADER_SOURCE = `
    attribute vec4 a_Position;
    
    void main() {
        gl_Position = a_Position;
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

let currentProgram = null;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl');

if (!initShader(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE)) {
    alert('Failed to init shaders.');
}

const N = 100;
const vertexData = [0.0, 0.0];
const r = 0.5;

for (let i = 0; i <= N; i++) {
    const theta = i * 2 * Math.PI / N;
    const x = r * Math.sin(theta);
    const y = r * Math.cos(theta);
    vertexData.push(x, y);
}

const vertices = new Float32Array(vertexData);
initVertexBuffers(gl, vertices);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);

function initVertexBuffers(gl: WebGLRenderingContext, vertices: any) {
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create buffer object.');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(currentProgram, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
}

function initShader(gl: WebGLRenderingContext, vertex: string, fragment: string) {
    const program = createProgram(gl, vertex, fragment);
    if (!program) {
        console.log('Failed to create program');
        return false;
    }
    gl.useProgram(program);
    currentProgram = program;
    return true;
}

function createProgram(gl: WebGLRenderingContext, vertex: string, fragment: string) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertex);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragment);
    if (!(vertexShader && fragmentShader)) {
        return;
    }
    const program = gl.createProgram();
    if (!program) {
        console.log('create shader program failed.');
        return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        const error = gl.getProgramInfoLog(program);
        console.log(`Failed to link program: ${error}`);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return;
    }
    return program;
}

function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader | undefined {
    const shader = gl.createShader(type);
    if (!shader) {
        console.log('unable to create shader');
        return;
    }
    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        const error = gl.getShaderInfoLog(shader);
        console.log(`Failed to compile shader: ${error}`);
        return;
    }
    return shader;
}