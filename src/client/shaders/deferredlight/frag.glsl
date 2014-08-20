varying vec3 lightView;

uniform sampler2D samplerDepth;
uniform sampler2D samplerNormals;
uniform sampler2D samplerLightBuffer;

uniform float lightRadius;
uniform float lightIntensity;
uniform float viewHeight;
uniform float viewWidth;

uniform vec3 lightColor;

uniform mat4 matProjInverse;

void main() {
    vec2 texCoord = gl_FragCoord.xy / vec2(viewWidth, viewHeight);
    float z = texture2D(samplerDepth, texCoord).x;
    if(z == 0.0) {
        gl_FragColor = vec4(vec3(0.0), 1.0);
        return;
    }
    float x = texCoord.x * 2.0 - 1.0;
    float y = texCoord.y * 2.0 - 1.0;

    vec4 projectedPos = vec4(x, y, z, 1.0);

    vec4 viewPos = matProjInverse * projectedPos;
    viewPos.xyz /= viewPos.w;
    viewPos.w = 1.0;

    vec3 lightDir = lightView - viewPos.xyz;
    float dist = length(lightDir);

    float cutoff = 0.3;
    float denom = dist/lightRadius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    attenuation = (attenuation - cutoff) / (1.0 - cutoff);
    attenuation = max(attenuation, 0.0);

    vec3 normal = texture2D( samplerNormals, texCoord).xyz * 2.0 - 1.0;
    float diffuse = max(dot(normal, normalize(lightDir)), 0.0);

    vec4 color = vec4(0.0);
    color.xyz = lightColor * lightIntensity;
    color.w = attenuation;
    gl_FragColor = color * diffuse;
}