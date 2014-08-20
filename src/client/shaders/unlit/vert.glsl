varying vec4 clipPos;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    clipPos = gl_Position;
}