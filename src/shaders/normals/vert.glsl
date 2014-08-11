varying vec3 normalView;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    normalView = normalize(normalMatrix * normal);
}