varying vec2 texCoord;
uniform sampler2D samplerLightBuffer;
uniform sampler2D samplerEmitter;
uniform vec3 lightPos;

void main() {
    vec3 color = texture2D(samplerLightBuffer, texCoord).xyz;
    vec3 emitter = texture2D(samplerEmitter, texCoord).xyz;
    if(emitter != vec3(0.0)){
        gl_FragColor = vec4(emitter, 1.0);
    }else{
        gl_FragColor = vec4(color, 1.0);
    }
}