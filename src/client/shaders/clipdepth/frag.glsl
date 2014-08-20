varying vec4 clipPos;

void main() {
    gl_FragColor = vec4(clipPos.z / clipPos.w, 1.0, 1.0, 1.0);
}