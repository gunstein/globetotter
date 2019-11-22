import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MeshLambertMaterial } from "three";

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
  _bigsphere = [];
  _all_transactions = [];

  _geometry = new THREE.BoxBufferGeometry(10, 10, 10);
  _materialMap = new Map();
  _min_begin = null;
  _max_end = null;
  _current_color = null;
  _use_random_color = true;

  //current_history_time = -1; //(attribute and property) -1 means now

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
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));

    this.globeid = this.getAttribute("globeid");
  }

  disconnectedCallback() {
    this.renderer.dispose();
    this.scene.dispose();
    this.controls.dispose();
  }

  get current_history_time() {
    return this.getAttribute("current_history_time");
  }
  set current_history_time(value) {
    this.setAttribute("current_history_time", value);
  }
  static get observedAttributes() {
    return ["current_history_time"];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "current_history_time") {
      //this.current_history_time = newVal;
      //Go through every mesh and set visible according to current_history_time
      this.scene.traverse(function(child) {
        if (
          child.userData.begin !== undefined &&
          child.userData.end !== undefined
        ) {
          const intNewVal = parseInt(newVal, 10);
          if (intNewVal === -1) {
            //This is now, means only interested in "living" objects, end=null
            if (child.userData.end === null) {
              child.visible = true;
            } else {
              child.visible = false;
            }
          } else {
            //only show objects where current_history_time is between begin and end.
            if (
              intNewVal > child.userData.begin &&
              (intNewVal < child.userData.end || child.userData.end === null)
            ) {
              child.visible = true;
            } else {
              child.visible = false;
            }
          }
        }
      });
      this.render();
    }
  }

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

    const sphere_geometry = new THREE.SphereGeometry(this.RADIUS, 32, 32);
    const sphere_material = new THREE.MeshStandardMaterial({
      color: 0x333344
    });

    const sphere_mesh = new THREE.Mesh(sphere_geometry, sphere_material);
    this.scene.add(sphere_mesh);
    sphere_geometry.dispose();
    sphere_material.dispose();

    this._bigsphere.push(sphere_mesh);

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
    const org_min_begin = this._min_begin;
    const org_max_end = this._max_end;

    const geomAction = JSON.parse(geomActionJSON);
    if (Array.isArray(geomAction)) {
      geomAction.forEach(singleaction => {
        singleaction.object_data = JSON.parse(singleaction.object_data);
        //Can have situations where transaction is received before. Check this.
        if (
          this._all_transactions.indexOf(singleaction.transaction_uuid) === -1
        ) {
          //Try to avoid hanging gui
          this.addGeometryActionToSphereSurface(singleaction);
        }
      });
    } else {
      geomAction.object_data = JSON.parse(geomAction.object_data);
      if (this._all_transactions.indexOf(geomAction.transaction_uuid) === -1) {
        this.addGeometryActionToSphereSurface(geomAction);
      }
    }
    this.render();

    if (this._min_begin !== org_min_begin || this._max_end !== org_max_end) {
      this.dispatchEvent(
        new CustomEvent("onHistoryLimitChange", {
          bubbles: true,
          detail: JSON.stringify({
            history_min: this._min_begin,
            history_max: this._max_end
          })
        })
      );
    }
  }

  addGeometryActionToSphereSurface(geomAction) {
    //one material for each color
    const getMaterial = color => {
      let material = this._materialMap.get(color);
      if (material === undefined) {
        material = new MeshLambertMaterial({ color: color });
        this._materialMap.set(color, material);
      }
      return material;
    };

    const buildMesh = geomAction => {
      let mesh = new THREE.Mesh(
        this._geometry,
        getMaterial(geomAction.object_data.color)
      );
      mesh.userData = { uuid: geomAction.object_uuid, begin: null, end: null };
      mesh.position.set(
        geomAction.object_data.position.x,
        geomAction.object_data.position.y,
        geomAction.object_data.position.z
      );

      return mesh;
    };

    //Add transaction to globe, can be insert, update or delete.
    //Insert is simplest, insert new object with begin set.
    //When update and delete: means there allready exist an object with this name.
    //  Find this object and set end. Update also must create new object.
    const obj = this.scene.getObjectByName(geomAction.object_uuid);
    if (!obj) {
      //Object does not exist? (same as insert)
      //legg til object med begin=konverter_unixepoch(transaction_timestamp)
      let mesh = buildMesh(geomAction);
      mesh.userData.begin = new Date(
        geomAction.transaction_timestamp
      ).getTime(); //unix epoch
      mesh.visible = true;

      if (this._min_begin === null) {
        this._min_begin = mesh.userData.begin;
      }
      this._all_transactions.push(geomAction.transaction_uuid);
      this.scene.add(mesh);
    } else {
      //this is update or delete
      //find object with correct name and where end is null.
      this.scene.traverse(function(child) {
        if (
          child.name === geomAction.objct_uuid &&
          child.userData.end === null
        ) {
          const temp_timestamp = new Date(
            geomAction.transaction_timestamp
          ).getTime(); //unix epoch
          if (this._max_end === null || temp_timestamp > this._max_end) {
            this._max_end = temp_timestamp;
          }
          child.userData.end = temp_timestamp;
          child.visible = false;
          this._all_transactions.push(geomAction.transaction_uuid);
          if (geomAction.operation_id === this.OperationEnum.update) {
            //Add new object if update
            let mesh = buildMesh(geomAction);
            mesh.userData.begin = temp_timestamp;
            mesh.visible = true;
            this.scene.add(mesh);
          }
        }
      });
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

  handleRaycast(point) {
    this.raycaster.setFromCamera(point, this.camera);

    const intersects = this.raycaster.intersectObjects(this._bigsphere);
    if (intersects.length > 0) {
      const INTERSECTED = intersects[0].object;
      if (INTERSECTED) {
        let geomAction = { operation_id: this.OperationEnum.insert };
        const position = intersects[0].point;
        const color = this.COLORS[
          Math.floor(Math.random() * this.COLORS.length)
        ];
        geomAction.object_data = { position, color };
        geomAction.object_uuid = this.uuidv4();
        geomAction.transaction_uuid = this.uuidv4();
        geomAction.globe_id = Number(this.globeid);
        geomAction.transaction_timestamp = new Date().toISOString();

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

  handleTouchEnd(event) {
    event.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const xtemp = event.changedTouches[0].clientX - rect.left;
    const ytemp = event.changedTouches[0].clientY - rect.top;

    const x = (xtemp / this.canvas.clientWidth) * 2 - 1;
    const y = -(ytemp / this.canvas.clientHeight) * 2 + 1;
    const point = new THREE.Vector2(x, y);
    this.handleRaycast(point);
  }

  handleMouseDown(event) {
    event.preventDefault();
    const x = (event.offsetX / this.canvas.clientWidth) * 2 - 1;
    const y = -(event.offsetY / this.canvas.clientHeight) * 2 + 1;
    const point = new THREE.Vector2(x, y);
    this.handleRaycast(point);
  }
}
/* Registration */
window.customElements.define("spheredraw-threejs-element", SphereDraw);
