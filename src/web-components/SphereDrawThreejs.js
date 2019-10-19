import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/* Template */
var template = document.createElement("template");
template.innerHTML = `
        		<style>
              body { margin: 0; width: 100%; height: 100%  }
              canvas { width: 100%; height: 100% }
            </style>
            <canvas id="c"></canvas>
      `;

class SphereDraw extends HTMLElement {
  COLORS = [
    0x69d2e7,
    0xa7dbd8,
    0xe0e4cc,
    0xf38630,
    0xfa6900,
    0xff4e50,
    0xf9d423
  ];
  RADIUS = 250;
  spheres = [];
  bigsphere = [];

  OperationEnum = Object.freeze({ insert: 1, update: 2, delete: 3 });

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.appendChild(template.content.cloneNode(true));
    this.canvas = this.shadowRoot.querySelector("#c");
  }

  connectedCallback() {
    this.init();
    this.render();

    this.controls.addEventListener("change", this.render.bind(this));

    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.globeid = this.getAttribute("globeid");
  }

  disconnectedCallback() {}

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });

    this.camera.position.z = 1000;

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.minDistance = 255;
    this.controls.maxDistance = 1000;
    this.controls.update();

    this.geometry = new THREE.SphereGeometry(this.RADIUS, 32, 32);
    this.material = new THREE.MeshStandardMaterial({
      color: 0x333344
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.bigsphere.push(this.mesh);

    this.ambientLight = new THREE.AmbientLight(0x404040, 4);
    this.scene.add(this.ambientLight);

    this.lights = [];
    this.lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    this.lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    this.lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    this.lights[0].position.set(0, 400, 400);
    this.lights[1].position.set(100, 200, 100);
    this.lights[2].position.set(-100, -200, -100);

    this.scene.add(this.lights[0]);
    //scene.add( lights[ 1 ] );
    this.scene.add(this.lights[2]);

    this.raycaster = new THREE.Raycaster();
  }

  resizeCanvasToDisplaySize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.controls.update();
    }
  }

  render() {
    this.resizeCanvasToDisplaySize();
    this.renderer.render(this.scene, this.camera);
  }

  addGeometryActionToSphereSurfaceJSON(geomActionJSON) {
    const geomAction = JSON.parse(geomActionJSON);

    if (Array.isArray(geomAction)) {
      geomAction.forEach(singleaction => {
        singleaction.object_data = JSON.parse(singleaction.object_data);
        //Can have situations where transaction is received before. Check this.
        if (this.spheres.indexOf(singleaction.transaction_uuid) === -1) {
          //Try to avoid hanging gui
          this.addGeometryActionToSphereSurface(singleaction);
        }
      });
    } else {
      geomAction.object_data = JSON.parse(geomAction.object_data);
      if (this.spheres.indexOf(geomAction.transaction_uuid) === -1) {
        this.addGeometryActionToSphereSurface(geomAction);
      }
    }
    this.render();
  }

  addGeometryActionToSphereSurface(geomAction) {
    if (geomAction.operation_id === this.OperationEnum.insert) {
      const vec3 = new THREE.Vector3(
        geomAction.object_data.position.x,
        geomAction.object_data.position.y,
        geomAction.object_data.position.z
      );
      //let geometry = new THREE.SphereGeometry(10, 20, 20);
      let geometry = new THREE.BoxGeometry(10, 10, 10);
      let material = new THREE.MeshStandardMaterial({
        color: geomAction.object_data.color
      });
      let mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { uuid: geomAction.object_uuid };
      mesh.position.copy(vec3);
      this.scene.add(mesh);
      this.spheres.push(geomAction.transaction_uuid);
      //this.render();
    }
  }

  uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  handleMouseDown(event) {
    event.preventDefault();
    this.px = (event.offsetX / this.canvas.clientWidth) * 2 - 1;
    this.py = -(event.offsetY / this.canvas.clientHeight) * 2 + 1;
    this.mousepoint = new THREE.Vector2(this.px, this.py);

    this.raycaster.setFromCamera(this.mousepoint, this.camera);

    this.intersects = this.raycaster.intersectObjects(this.bigsphere);
    if (this.intersects.length > 0) {
      this.INTERSECTED = this.intersects[0].object;
      if (this.INTERSECTED) {
        let geomAction = { operation_id: this.OperationEnum.insert };
        const position = this.intersects[0].point;
        const color = this.COLORS[
          Math.floor(Math.random() * this.COLORS.length)
        ];
        geomAction.object_data = { position, color };
        geomAction.object_uuid = this.uuidv4();
        geomAction.transaction_uuid = this.uuidv4();
        geomAction.globe_id = Number(this.globeid);

        this.addGeometryActionToSphereSurface(geomAction);
        this.render();
        this.dispatchEvent(
          new CustomEvent("onSphereDrawAction", {
            bubbles: true,
            detail: JSON.stringify(geomAction)
          })
        );
      }
    }
  }
}
/* Registration */
window.customElements.define("spheredraw-threejs-element", SphereDraw);
