// OffscreenCanvas WebGL2 Rendering Worker
// All shaders are inlined for maximum compatibility

// === VERTEX SHADER ===
const meshVertSource = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// === MESH FRAGMENT SHADER (Simplex Noise + Color Blobs) ===
const meshFragSource = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

// Simplex 3D Noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    float time = u_time * 0.35; // Faster, more dynamic motion

    // Constant Palette: Starboy Album (The Weeknd)
    vec3 c_nearBlack = vec3(0.02, 0.02, 0.04);    // Deep dark base
    vec3 c_crimson   = vec3(0.70, 0.06, 0.10);    // Rich crimson red
    vec3 c_navy      = vec3(0.12, 0.12, 0.35);    // Navy blue (more visible)
    vec3 c_amber     = vec3(0.90, 0.50, 0.10);    // Warm amber (brighter)

    // Larger scale noise for smoother, more fluid blobs
    float n1 = snoise(vec3(st * 0.8, time * 0.7));
    float n2 = snoise(vec3(st * 0.9 + vec2(5.2, 1.3), time * 0.5 + 10.0));
    float n3 = snoise(vec3(st * 1.0 - vec2(2.1, 4.4), time * 0.8 - 5.0));
    float n4 = snoise(vec3(st * 0.6 + vec2(3.1, -2.2), time * 0.4 + 3.0));
    float n5 = snoise(vec3(st * 1.1 + vec2(-1.5, 2.8), time * 0.6));

    // Color mixing - balanced between crimson, navy and amber
    vec3 color = c_nearBlack;
    color = mix(color, c_crimson, smoothstep(-0.3, 0.6, n1) * 0.85);
    color = mix(color, c_navy, smoothstep(-0.4, 0.5, n2) * 0.75);        // More navy visibility
    color = mix(color, c_amber, smoothstep(-0.3, 0.5, n3) * 0.55);       // More amber visibility
    color = mix(color, c_crimson * 0.7, smoothstep(-0.4, 0.6, n4) * 0.4);
    color = mix(color, c_navy * 0.8 + c_amber * 0.2, smoothstep(-0.2, 0.4, n5) * 0.5);

    outColor = vec4(color, 1.0);
}
`;

// === BLUR FRAGMENT SHADER (Separable Gaussian) ===
const blurFragSource = `#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_direction;

in vec2 v_uv;
out vec4 outColor;

void main() {
    vec2 tex_offset = 1.0 / u_resolution;
    
    // 13-tap Gaussian weights
    float weight[7];
    weight[0] = 0.198596;
    weight[1] = 0.17467;
    weight[2] = 0.120985;
    weight[3] = 0.065596;
    weight[4] = 0.027407;
    weight[5] = 0.008764;
    weight[6] = 0.002196;
    
    vec3 result = texture(u_image, v_uv).rgb * weight[0];

    for(int i = 1; i < 7; ++i) {
        vec2 offset = vec2(tex_offset.x * float(i) * u_direction.x, tex_offset.y * float(i) * u_direction.y);
        result += texture(u_image, v_uv + offset).rgb * weight[i];
        result += texture(u_image, v_uv - offset).rgb * weight[i];
    }
    
    outColor = vec4(result, 1.0);
}
`;

// === WebGL Setup ===
let canvas: OffscreenCanvas | null = null;
let gl: WebGL2RenderingContext | null = null;
let meshProgram: WebGLProgram | null = null;
let blurProgram: WebGLProgram | null = null;
let vao: WebGLVertexArrayObject | null = null;
let fbo1: WebGLFramebuffer | null = null;
let tex1: WebGLTexture | null = null;
let fbo2: WebGLFramebuffer | null = null;
let tex2: WebGLTexture | null = null;
let width = 0;
let height = 0;
let time = 0;
let isRunning = false;
let lastFrameTime = 0;

self.onmessage = (evt) => {
  const { type, payload } = evt.data;
  if (type === 'init') {
    canvas = payload.canvas;
    width = payload.width;
    height = payload.height;
    initGL();
    isRunning = true;
    requestAnimationFrame(renderLoop);
  } else if (type === 'resize') {
    width = payload.width;
    height = payload.height;
    if (gl) {
      gl.viewport(0, 0, width, height);
      resizeFramebuffers();
    }
  } else if (type === 'visibility') {
    isRunning = payload.visible;
    if (isRunning) requestAnimationFrame(renderLoop);
  }
};

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertSource: string, fragSource: string): WebGLProgram | null {
  const vert = createShader(gl, gl.VERTEX_SHADER, vertSource);
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fragSource);
  if (!vert || !frag) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function initGL() {
  if (!canvas) return;
  
  try {
    gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: false
    });
  } catch (e) {
    console.warn('WebGL2 context creation failed:', e);
    return;
  }
  
  if (!gl) {
    console.warn('WebGL2 not supported - mesh background disabled');
    return;
  }

  meshProgram = createProgram(gl, meshVertSource, meshFragSource);
  blurProgram = createProgram(gl, meshVertSource, blurFragSource);

  if (!meshProgram || !blurProgram) {
    console.error('Failed to create shader programs');
    return;
  }

  // Create fullscreen quad
  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  resizeFramebuffers();
}

function createTexture(w: number, h: number): WebGLTexture | null {
  if (!gl) return null;
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

function resizeFramebuffers() {
  if (!gl) return;
  if (tex1) gl.deleteTexture(tex1);
  if (tex2) gl.deleteTexture(tex2);
  if (fbo1) gl.deleteFramebuffer(fbo1);
  if (fbo2) gl.deleteFramebuffer(fbo2);

  const scale = 0.5;
  const w = Math.max(1, Math.floor(width * scale));
  const h = Math.max(1, Math.floor(height * scale));

  tex1 = createTexture(w, h);
  tex2 = createTexture(w, h);

  fbo1 = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex1, 0);

  fbo2 = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex2, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function renderLoop(timestamp: number) {
  if (!isRunning || !gl || !meshProgram || !blurProgram || !vao) {
    return;
  }

  // Framerate independence: use delta time
  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  time += delta * 0.001;

  const scale = 0.5;
  const w = Math.max(1, Math.floor(width * scale));
  const h = Math.max(1, Math.floor(height * scale));

  // Pass 1: Render mesh to FBO1
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1);
  gl.viewport(0, 0, w, h);
  gl.useProgram(meshProgram);
  gl.uniform1f(gl.getUniformLocation(meshProgram, 'u_time'), time);
  gl.uniform2f(gl.getUniformLocation(meshProgram, 'u_resolution'), w, h);
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Pass 2: Horizontal blur (FBO1 -> FBO2)
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);
  gl.useProgram(blurProgram);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex1);
  gl.uniform1i(gl.getUniformLocation(blurProgram, 'u_image'), 0);
  gl.uniform2f(gl.getUniformLocation(blurProgram, 'u_resolution'), w, h);
  gl.uniform2f(gl.getUniformLocation(blurProgram, 'u_direction'), 1.0, 0.0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Pass 3: Vertical blur (FBO2 -> Screen)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, width, height);
  gl.bindTexture(gl.TEXTURE_2D, tex2);
  gl.uniform2f(gl.getUniformLocation(blurProgram, 'u_resolution'), w, h);
  gl.uniform2f(gl.getUniformLocation(blurProgram, 'u_direction'), 0.0, 1.0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(renderLoop);
}
