varying vec2 vN;

void main() {

    vec4 p = vec4( position, 1. );

    vec3 e = normalize( vec3( modelViewMatrix * p ) );
    vec3 n = normalize( normalMatrix * normal );

    vec3 r = reflect( e, n );

    float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z+1.0 ) );

    vN = vec2(r.x / m + 0.5, r.y / m + 0.5);

    gl_Position = projectionMatrix * modelViewMatrix * p;

}