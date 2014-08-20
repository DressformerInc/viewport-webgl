varying vec3 normalView;

void main() {
    gl_FragColor = vec4(vec3(normalView * 0.5 + 0.5), 1.0);
}