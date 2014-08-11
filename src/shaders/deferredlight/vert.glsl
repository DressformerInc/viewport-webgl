varying vec3 lightView;
uniform vec3 lightPos;
uniform mat4 matView;

void main(){
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.),lightView=vec3(matView*vec4(lightPos,1.));
}