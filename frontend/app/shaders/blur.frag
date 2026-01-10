#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_direction; // (1.0, 0.0) or (0.0, 1.0)

in vec2 v_uv;
out vec4 outColor;

// 13-tap Gaussian Blur (Sigma ~ 4.0)
float weight[7] = float[](0.198596, 0.17467, 0.120985, 0.065596, 0.027407, 0.008764, 0.002196);
// Offsets would be 0, 1, 2, 3...

void main() {
    vec2 tex_offset = 1.0 / u_resolution; // gets size of single texel
    vec3 result = texture(u_image, v_uv).rgb * weight[0]; // current fragment's contribution

    for(int i = 1; i < 7; ++i) {
        result += texture(u_image, v_uv + vec2(tex_offset.x * float(i) * u_direction.x, tex_offset.y * float(i) * u_direction.y)).rgb * weight[i];
        result += texture(u_image, v_uv - vec2(tex_offset.x * float(i) * u_direction.x, tex_offset.y * float(i) * u_direction.y)).rgb * weight[i];
    }
    
    outColor = vec4(result, 1.0);
}
