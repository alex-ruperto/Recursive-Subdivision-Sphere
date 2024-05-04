// import Three.js components
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// init scene, camera, renderer, controls, and geometry
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);

// set the size of the renderer to window width and height, then append the render to the document
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); 

// initalize an empty buffer geometry
const geometry = new THREE.BufferGeometry(); // geometry object to hold verticies and faces
const vertices = [];
const indices = [];

// subdivide a triangle into smaller triangles
function divideTriangle(a, b, c, count) {
    if (count > 0) {
        // calculate midpoints and normalize to push out to the radius of the sphere.
        let ab = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5).normalize();
        let ac = new THREE.Vector3().addVectors(a, c).multiplyScalar(0.5).normalize();
        let bc = new THREE.Vector3().addVectors(b, c).multiplyScalar(0.5).normalize();

        // subdivide the new triangles
        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count -1);
        divideTriangle(ab, bc, ac, count -1);
    } else {
        // add verticies of the final triangle to the geometry
        vertices.push(a.x, a.y, a.z);
        vertices.push(b.x, b.y, b.z);
        vertices.push(c.x, c.y, c.z);
        let index = vertices.length / 3 - 3; // calculate base index
        indices.push(index, index + 1, index +2);
    }
}
// function for recursive subdivision on a tetrahedron
function tetrahedron(a, b, c, d, n){
    // recursively subdivide each triangle face of the tetrahedron
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

// define initial vertices of the tetrahedron
// (0, 0, 1), (0, 2√2/3, −1/3), (−√6/3, −√2/3, −1/3), and (√6/3, −√2/3, −1/3)
const vector0 = new THREE.Vector3(0.0, 0.0, 1.0); 
const vector1 = new THREE.Vector3(0.0, 0.942809, -0.333333); 
const vector2 = new THREE.Vector3(-0.816497, -0.471405, -0.333333);  
const vector3 = new THREE.Vector3(0.816497, -0.471405, -0.333333);

// start recursive subdivision of the four vectors n subdivisions
tetrahedron(vector0, vector1, vector2, vector3, 5);

// verticies and indices go to buffer geometry
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
geometry.setIndex(indices);

// define the material, set color, and enable wireframe 
const material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});

// create mesh to combine the geometry and the material
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

// position camera so that the object is visible
camera.position.z = 2;

// function for animation loop for continuous rendering
function animate() {
    requestAnimationFrame(animate); // request next frame for animation
    controls.update(); // user input decides where the camera moves
    renderer.render(scene, camera); // render the scene from the perspective of the camera
}

animate();