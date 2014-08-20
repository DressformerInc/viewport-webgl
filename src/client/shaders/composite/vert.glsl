varying vec2 texCoord;
void main() {
    vec4 pos = vec4(sign(position.xy),0.0,1.0);
    texCoord=pos.xy*vec2(0.5,0.5)+0.5;
    gl_Position = pos;
}