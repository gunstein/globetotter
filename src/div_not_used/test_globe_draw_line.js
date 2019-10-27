<html>
	<head>
		<title>My first three.js app</title>
		<style>
			body { margin: 0; }
			canvas { width: 100%; height: 100% }
		</style>
	</head>
	<body>

		<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/108/three.min.js"></script>
    <script src="https://threejs.org/examples/js/controls/OrbitControls.js"></script>
    <script src=https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.core.min.js></script>

		<script>
      var renderer, 
        COLORS = [
          0x69d2e7,
          0xa7dbd8,
          0xe0e4cc,
          0xf38630,
          0xfa6900,
          0xff4e50,
          0xf9d423
        ],
        RADIUS = 250,
        spheres = [],
        bigsphere = [],
        camera,
        scene,
        controls,
        geometry,
        material,
        mesh,
        startvec3,
        endvec3,
        raycaster = new THREE.Raycaster(),
        INTERSECTED;
      
      /////////////// CustomArcOnSphere
         function CustomArcOnSphere( startvec3, endvec3 ) {

          console.log("CustomArcOnSphere constructor");
          THREE.Curve.call( this );
          //Convert to spherical
          this.startspherical = new THREE.Spherical().setFromVector3(startvec3);
          this.endspherical = new THREE.Spherical().setFromVector3(endvec3);
        }

      CustomArcOnSphere.prototype = Object.create( THREE.Curve.prototype );
      CustomArcOnSphere.prototype.constructor = CustomArcOnSphere;

      CustomArcOnSphere.prototype.getPoint = function ( t ) {
        console.log("CustomArcOnSphere getPoint start");
        var a=this.startspherical.radius+(this.endspherical.radius-this.startspherical.radius)*t
        var b=this.startspherical.phi+(this.endspherical.phi-this.startspherical.phi)*t
        var h=this.startspherical.theta+(this.endspherical.theta-this.startspherical.theta)*t

        var spherical = new THREE.Spherical(a, b, h);
        
        console.log("CustomArcOnSphere getPoint return");
        return new THREE.Vector3().setFromSpherical(spherical);
      };
           
      /////////////////
      
			init();
			animate();
      
			function init() {
        scene = new THREE.Scene();
			  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

			  renderer = new THREE.WebGLRenderer({alpha: true});
			  renderer.setSize( window.innerWidth, window.innerHeight );
			  document.body.appendChild( renderer.domElement );
        
        camera.position.z = 1000;

        controls = new THREE.OrbitControls( camera );
        controls.minDistance = 255;
        controls.maxDistance = 1000;
        controls.update();
        
        geometry = new THREE.SphereGeometry(RADIUS, 100, 100);
        material = new THREE.MeshStandardMaterial({ color: 0x333344 , specular: 0x000000,
  shininess: 20} );
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        bigsphere.push(mesh);

        /*
        for (var i = 0; i < 30; i++) {
          geometry = new THREE.SphereGeometry( Math.floor(Math.random() * 20) + 5, 20, 20);
          
          //var color1 = new THREE.Color( "#7833aa" );
          //material = new THREE.MeshPhongMaterial( {color: color1.getHex()});
          
          material = new THREE.MeshStandardMaterial({ color: COLORS[Math.floor(Math.random()*COLORS.length)] });
          geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, RADIUS, 0));
          mesh = new THREE.Mesh(geometry, material);

          mesh.rotation.x = Math.floor(Math.random() * 100);
          mesh.rotation.y = Math.floor(Math.random() * 100);
          mesh.rotation.z = Math.floor(Math.random() * 100);

          scene.add(mesh);
          //spheres.push(mesh);
          
        }
        */
        
        var ambientLight = new THREE.AmbientLight( 0x404040, 4);
        scene.add( ambientLight );

        var lights = [];
        lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
        lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

        lights[ 0 ].position.set( 0, 400, 400 );
        lights[ 1 ].position.set( 100, 200, 100 );
        lights[ 2 ].position.set( - 100, - 200, - 100 );

        scene.add( lights[ 0 ] );
        //scene.add( lights[ 1 ] );
        scene.add( lights[ 2 ] );
        
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );
				window.addEventListener( 'resize', onWindowResize, false );
			}
      
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
        //controls.update();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
            
			function onDocumentMouseDown( event ) {
				event.preventDefault();
				var px = ( event.clientX / window.innerWidth ) * 2 - 1;
				var py = - ( event.clientY / window.innerHeight ) * 2 + 1;
        var mousepoint = new THREE.Vector2(px, py);

        raycaster.setFromCamera(mousepoint, camera);
        //console.log("mouse");
        //console.log(this.mouse);
        var intersects = raycaster.intersectObjects(bigsphere);
        //console.log("test1");
        //console.log(intersects.length);
        if (intersects.length > 0) {
          //console.log("test2");
          //console.log(intersects[0].point);

          INTERSECTED = intersects[0].object;
          if (INTERSECTED) {
            startvec3 = intersects[0].point;
            controls.enableRotate = false;
            //controls.update();
            //console.log("test3");
          }
        }        
			}
      
			function onDocumentMouseUp( event ) {
				event.preventDefault();
				var px = ( event.clientX / window.innerWidth ) * 2 - 1;
				var py = - ( event.clientY / window.innerHeight ) * 2 + 1;
        var mousepoint = new THREE.Vector2(px, py);
        
        raycaster.setFromCamera(mousepoint, camera);
        console.log("mouseup");
        var intersects = raycaster.intersectObjects(bigsphere);
        if (intersects.length > 0) {
          console.log("test2");
          console.log(intersects[0].point);

          INTERSECTED = intersects[0].object;
          if (INTERSECTED) {
            endvec3 = intersects[0].point;
            //test = _.noConflict();
            //let _test2 = _.isEqual(endvec3, startvec3);
            //console.log("_test2");
            //console.log(_test2);
            if(_.isEqual(endvec3, startvec3)){
              console.log("_test2");
              console.log(startvec3);
              geometry = new THREE.SphereGeometry( Math.floor(Math.random() * 20) + 5, 20, 20);
              material = new THREE.MeshStandardMaterial({ color: COLORS[Math.floor(Math.random()*COLORS.length)] });
              //geometry.applyMatrix(new THREE.Matrix4().makeTranslation(startvec3));
              mesh = new THREE.Mesh(geometry, material);
              mesh.position.copy( startvec3 );
              //mesh.position.set( 50, 0, 300 );
              scene.add(mesh);              
            }
            else{
              var path = new CustomArcOnSphere( startvec3, endvec3 );
              var geometry = new THREE.TubeGeometry( path, 100, 10, 20, false );
              material = new THREE.MeshStandardMaterial( { color: COLORS[Math.floor(Math.random()*COLORS.length)] } );
                        //var color1 = new THREE.Color( "#7833aa" );
            //var material = new THREE.MeshPhongMaterial( {color: color1.getHex()});
              var mesh = new THREE.Mesh( geometry, material );
              scene.add( mesh );              
            }

          }
        }
        controls.enableRotate = true;
        //controls.update();
			}      
      
			//
			function animate() {
				requestAnimationFrame( animate );
				render();
			}
      
			function render() {
        controls.update();
				renderer.render( scene, camera );
			}
		</script>

	</body>
</html>