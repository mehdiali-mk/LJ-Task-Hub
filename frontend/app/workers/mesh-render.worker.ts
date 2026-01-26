// OffscreenCanvas WebGL2 Mesh Gradient Worker
// Rebuilt from scratch for reliability

// === VERTEX SHADER ===
const vertexShaderSource = `#version 300 es
in vec2 aPosition;
out vec2 vUV;
void main() {
    vUV = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// === FRAGMENT SHADER - Flowing Gradient ===
const fragmentShaderSource = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
out vec4 fragColor;

// Simple 2D noise function
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // Smooth curve
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i = 0; i < 3; i++) { // Reduced octaves for cleaner "blob" shapes
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float aspect = uResolution.x / uResolution.y;
    
    vec2 st = uv;
    st.x *= aspect;
    
    // FASTER TIME (3x speed increase)
    float t = uTime * 0.35;
    
    // === BRAND COLORS ===
    vec3 colBase      = vec3(0.0, 0.102, 0.2);      // Midnight Blue #001A33
    vec3 colPrimary   = vec3(0.0, 0.588, 1.0);      // Electric Blue #0096FF
    vec3 colSecondary = vec3(0.0, 0.357, 0.733);    // Deep Sky Blue #005BBB
    vec3 colAccent    = vec3(0.902, 0.0, 0.0);      // Vibrant Red #E60000
    vec3 colMid       = vec3(0.2, 0.333, 0.467);    // Steel City #335577
    vec3 colHigh      = vec3(1.0, 1.0, 1.0);        // Spark White #FFFFFF

    // === CREATE DISTINCT "VECTOR" BLOBS ===
    // We use sharper thresholds and distinct orbital centers
    
    // 1. Electric Blue Blob (Fast, clockwise)
    vec2 p1 = st - vec2(0.5 * aspect, 0.5) + vec2(cos(t * 0.8), sin(t * 0.8)) * 0.3;
    float n1 = fbm(p1 * 2.0 - t * 0.2);
    float mask1 = smoothstep(0.4, 0.65, n1); // Sharper edge
    
    // 2. Vibrant Red Blob (Distinct, counter-clockwise) - reduced size
    vec2 p2 = st - vec2(0.5 * aspect, 0.5) + vec2(cos(-t * 0.6 + 2.0), sin(-t * 0.6 + 2.0)) * 0.25;
    float n2 = fbm(p2 * 3.0 + t * 0.1);
    float mask2 = smoothstep(0.52, 0.75, n2); // Tighter threshold
    
    // 3. Steel City Blob (Slow base movement)
    vec2 p3 = st - vec2(0.5 * aspect, 0.5) + vec2(sin(t * 0.4 + 4.0), cos(t * 0.4 + 4.0)) * 0.35;
    float n3 = fbm(p3 * 1.5 - t * 0.05);
    float mask3 = smoothstep(0.3, 0.6, n3);
    
    // 4. White Highlight (Spark - enhanced flow)
    vec2 p4 = st - vec2(0.5 * aspect, 0.5) + vec2(cos(t * 1.1 + 1.0), sin(t * 1.1 + 1.0)) * 0.28;
    float n4 = fbm(p4 * 2.5 + t * 0.25);
    float mask4 = smoothstep(0.55, 0.75, n4);
    
    // === COLOR COMPOSITION ===
    // Start with base
    vec3 color = colBase;
    
    // Add layers with "vector" feel (one on top of another)
    // Steel City (Background fill)
    color = mix(color, colMid, mask3 * 0.7);
    
    // Deep Sky Blue (Secondary fill)
    float maskSec = smoothstep(0.4, 0.6, fbm((st + vec2(sin(t), cos(t))*0.1) * 2.0));
    color = mix(color, colSecondary, maskSec * 0.6);
    
    // Electric Blue (Primary Pop)
    color = mix(color, colPrimary, mask1 * 0.8);
    
    // Vibrant Red (Accent - Subtle presence)
    color = mix(color, colAccent, mask2 * 0.55);
    
    // Spark White (Top Highlight - improved flow)
    color = mix(color, colHigh, mask4 * 0.55);
    
    // === VIGNETTE ===
    float vig = 1.0 - length(uv - 0.5) * 0.5;
    color *= smoothstep(0.0, 1.2, vig);
    
    // Dithering to prevent banding
    color += (hash(uv * uTime) - 0.5) * 0.02;

    fragColor = vec4(color, 1.0);
}
`;

// === BLUR SHADER ===
const blurFragmentSource = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uDirection;

in vec2 vUV;
out vec4 fragColor;

void main() {
    vec2 texelSize = 1.0 / uResolution;
    
    // 9-tap gaussian blur
    float weights[5];
    weights[0] = 0.227027;
    weights[1] = 0.1945946;
    weights[2] = 0.1216216;
    weights[3] = 0.054054;
    weights[4] = 0.016216;
    
    vec3 result = texture(uTexture, vUV).rgb * weights[0];
    
    for(int i = 1; i < 5; i++) {
        vec2 off = texelSize * float(i) * uDirection;
        result += texture(uTexture, vUV + off).rgb * weights[i];
        result += texture(uTexture, vUV - off).rgb * weights[i];
    }
    
    fragColor = vec4(result, 1.0);
}
`;

// === WebGL State ===
let canvas: OffscreenCanvas | null = null;
let gl: WebGL2RenderingContext | null = null;
let meshProgram: WebGLProgram | null = null;
let blurProgram: WebGLProgram | null = null;
let vao: WebGLVertexArrayObject | null = null;
let fbo1: WebGLFramebuffer | null = null;
let fbo2: WebGLFramebuffer | null = null;
let tex1: WebGLTexture | null = null;
let tex2: WebGLTexture | null = null;
let width = 0;
let height = 0;
let startTime = 0;
let isRunning = false;

// === Message Handler ===
self.onmessage = (e) => {
    const { type, payload } = e.data;
    
    switch(type) {
        case 'init':
            canvas = payload.canvas;
            width = payload.width;
            height = payload.height;
            startTime = performance.now();
            initWebGL();
            isRunning = true;
            requestAnimationFrame(render);
            break;
            
        case 'resize':
            width = payload.width;
            height = payload.height;
            if (gl) {
                setupFramebuffers();
            }
            break;
            
        case 'visibility':
            isRunning = payload.visible;
            if (isRunning) {
                requestAnimationFrame(render);
            }
            break;
    }
};

// === Shader Compilation ===
function compileShader(source: string, type: number): WebGLShader | null {
    if (!gl) return null;
    
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

function createProgram(vertSrc: string, fragSrc: string): WebGLProgram | null {
    if (!gl) return null;
    
    const vert = compileShader(vertSrc, gl.VERTEX_SHADER);
    const frag = compileShader(fragSrc, gl.FRAGMENT_SHADER);
    if (!vert || !frag) return null;
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program error:', gl.getProgramInfoLog(program));
        return null;
    }
    
    return program;
}

// === Initialize WebGL ===
function initWebGL() {
    if (!canvas) return;
    
    try {
        gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: 'low-power'
        });
    } catch (e) {
        console.error('WebGL2 init failed:', e);
        return;
    }
    
    if (!gl) {
        console.error('WebGL2 not available');
        return;
    }
    
    // Create shader programs
    meshProgram = createProgram(vertexShaderSource, fragmentShaderSource);
    blurProgram = createProgram(vertexShaderSource, blurFragmentSource);
    
    if (!meshProgram || !blurProgram) {
        console.error('Failed to create programs');
        return;
    }
    
    // Create fullscreen quad
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const posLoc = gl.getAttribLocation(meshProgram, 'aPosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    
    setupFramebuffers();
}

// === Setup Framebuffers for Blur ===
function setupFramebuffers() {
    if (!gl) return;
    
    // Clean up old resources
    if (tex1) gl.deleteTexture(tex1);
    if (tex2) gl.deleteTexture(tex2);
    if (fbo1) gl.deleteFramebuffer(fbo1);
    if (fbo2) gl.deleteFramebuffer(fbo2);
    
    const w = Math.floor(width * 0.5);
    const h = Math.floor(height * 0.5);
    
    // Texture 1
    tex1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    fbo1 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex1, 0);
    
    // Texture 2
    tex2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    fbo2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex2, 0);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

// === Render Loop ===
function render() {
    if (!isRunning || !gl || !meshProgram || !blurProgram || !vao) {
        return;
    }
    
    const time = (performance.now() - startTime) * 0.001;
    const w = Math.floor(width * 0.5);
    const h = Math.floor(height * 0.5);
    
    gl.bindVertexArray(vao);
    
    // Pass 1: Render gradient to FBO1
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
    gl.viewport(0, 0, w, h);
    gl.useProgram(meshProgram);
    gl.uniform1f(gl.getUniformLocation(meshProgram, 'uTime'), time);
    gl.uniform2f(gl.getUniformLocation(meshProgram, 'uResolution'), w, h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Pass 2: Horizontal blur -> FBO2
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);
    gl.useProgram(blurProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex1);
    gl.uniform1i(gl.getUniformLocation(blurProgram, 'uTexture'), 0);
    gl.uniform2f(gl.getUniformLocation(blurProgram, 'uResolution'), w, h);
    gl.uniform2f(gl.getUniformLocation(blurProgram, 'uDirection'), 1.0, 0.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Pass 3: Vertical blur -> Screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.uniform2f(gl.getUniformLocation(blurProgram, 'uDirection'), 0.0, 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    requestAnimationFrame(render);
}