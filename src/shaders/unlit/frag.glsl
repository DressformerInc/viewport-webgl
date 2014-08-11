varying vec4 clipPos;
uniform sampler2D samplerDepth;

uniform float viewHeight;
uniform float viewWidth;

uniform vec3 lightColor;

void main() {
    vec2 texCoord = gl_FragCoord.xy / vec2(viewWidth, viewHeight);
    float z = texture2D(samplerDepth, texCoord).x;
    vec4 color = vec4(lightColor, 1.0);
    float depth = (clipPos.z/clipPos.w);

    if(depth > z && z > 0.0) color.w = 0.0;
        gl_FragColor = color;
}