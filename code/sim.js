
// ============================================================================================
// Les deux classes de base : Sim et Acteur
//
// Une instance de Sim fait évoluer l'état des instances de la classe Acteur
// et les restitue
// ===========================================================================================


function Sim(){
	this.renderer   = null ; 
	this.scene      = null ;
	this.camera     = null ; 
	this.controleur = null ; 
	this.horloge    = 0.0 ; 
	this.chrono     = null ; 
	this.acteurs    = [] ; 
	this.acteursASupprimer = [];

	this.textureLoader = new THREE.TextureLoader() ; 
}

Sim.prototype.init = function(params){
	params = params || {} ; 
	var scn = new THREE.Scene() ; 
	var rd  = new THREE.WebGLRenderer({antialias:true, alpha:true}) ;
	rd.setSize(window.innerWidth, window.innerHeight) ; 
	document.body.appendChild(rd.domElement) ; 
	var cam = new THREE.PerspectiveCamera(45.0,window.innerWidth/window.innerHeight,0.1,1000.0) ; 
	cam.position.set(5.0,1.7,5.0) ; 
	this.controleur = new ControleurCamera(cam) ; 

	var that = this ; 
	window.addEventListener(
			'resize',
			function(){
				that.camera.aspect = window.innerWidth / window.innerHeight ;
				that.camera.updateProjectionMatrix() ; 
				that.renderer.setSize(window.innerWidth, window.innerHeight) ; 
				  }
				) ; 

	// Affectation de callbacks aux événements utilisateur
	document.addEventListener("keyup",    function(e){that.controleur.keyUp(e);}    ,false) ; 
	document.addEventListener("keydown",  function(e){that.controleur.keyDown(e);}  ,false) ;
	document.addEventListener("mousemove",function(e){that.controleur.mouseMove(e);},false) ;
	document.addEventListener("mousedown",function(e){that.controleur.mouseDown(e);},false) ;

	scn.add(new THREE.AmbientLight(0xffffff,1.0)) ;
	scn.add(new THREE.GridHelper(100,20)) ; 

	this.scene    = scn ; 
	this.camera   = cam ;
	this.renderer = rd ;    

	this.creerScene() ; 

	this.chrono   = new THREE.Clock() ; 
	this.chrono.start() ; 

}

// Méthode de création du contenu du monde : à surcharger
// ======================================================

Sim.prototype.creerScene = function(params){}

// Boucle de simulation
// ====================

Sim.prototype.actualiser = function(dt){

	var that     = this ; 

	var dt       = this.chrono.getDelta() ; 
	this.horloge += dt ;

	// Modification de la caméra virtuelle
	// ===================================

	this.controleur.update(dt) ; 

	// Boucle ACTION
	// =============

	//Actualisation des composants des acteurs
	var n = this.acteurs.length ; 
	
	for(var i=0; i<n; i++){
		var nc = this.acteurs[i].composants.length ; 
		for(var j=0; j<nc; j++){
			this.acteurs[i].composants[j].actualiser(dt) ; 
		} ;
	} ;

	//Actualisation des acteurs
	for(var i=0; i<n; i++){
		this.acteurs[i].actualiser(dt) ; 
	} ;

	this.supprimerLesActeurs();

	this.renderer.render(this.scene,this.camera) ; 

	requestAnimationFrame(function(){that.actualiser();}) ; 

}

Sim.prototype.addActeur = function(act){
	this.acteurs.push(act) ;
} 
 
Sim.prototype.supprimerActeur = function(act) {
	this.acteursASupprimer.push(act)
}

Sim.prototype.supprimerLesActeurs = function() {
	var n = this.acteursASupprimer.length ; 
	
	for(var i=0; i<n; i++){

		var m=this.acteurs.length;
		for(var j=0;j<m;j++) {
			if(this.acteurs[j] == this.acteursASupprimer[i]) {
				this.scene.remove(this.acteurs[j].objet3d) ;
				this.acteurs[j]=this.acteurs.pop();
				break;
			}
		}
	}
	this.acteursASupprimer=[];
}

// ===============================================================================================

function Composant(entite) {
	this.entite = entite;
}

Composant.prototype.actualiser = function(dt) {}

// ===============================================================================================
function Nimbus(entite) {
	this.entite = entite;
}

Nimbus.prototype.positionIncluDansNimbus = function(pos) {}
Nimbus.prototype.getRayon = function() {}

//---Sphere
function Sphere(entite,opts) {
	Nimbus.call(this,entite);
	this.rayon = opts.rayon || 1.0;
}

Sphere.prototype = Object.create(Nimbus.prototype);
Sphere.prototype.constructor = Sphere;
Sphere.prototype.positionIncluDansNimbus = function(pos) {
	var dist=this.entite.objet3d.position.distanceTo(pos);
	if(dist<this.rayon) {
		return true;
	}
	else {
		return false;
	}
}

Sphere.prototype.getRayon = function() {
	return this.rayon;
}

//---Cylindre
function Cylindre(entite,opts) {
	Nimbus.call(this,entite);
	this.rayon = opts.rayon || 1.0;
	this.hauteur = opts.hauteur || 1.0;
}

Cylindre.prototype = Object.create(Nimbus.prototype);
Cylindre.prototype.constructor = Cylindre;
Cylindre.prototype.positionIncluDansNimbus = function(pos) {
	if(this.entite.objet3d.position.y<=(pos.y+this.hauteur) && this.entite.objet3d.position.y>=pos.y) {
		var point1=new THREE.Vector3();
		point1.copy(this.entite.objet3d.position);
		point1.y=0;
		var point2=new THREE.Vector3();
		point2.copy(pos);
		point2.y=0;

		var dist=point1.distanceTo(point2);

		if(dist<this.rayon) {
			return true;
		}
		else {
			return false;
		}
	}
	else {
		return false;
	}
}

Cylindre.prototype.getRayon = function() {
	return this.rayon;
}

// ===============================================================================================
function Focus(entite,opts) {
	this.entite = entite;
	this.angle=opts.angle || 165; 
	this.distance=opts.distance || 10;
}
Focus.prototype = Object.create(Focus.prototype);
Focus.prototype.constructor = Focus;
Focus.prototype.positionIncluDansFocus = function(pos) {
	var dist=pos.distanceTo(this.entite.objet3d.position);
	if(dist>this.distance) return false;
	var vec1=new THREE.Vector3();
	var vec2=new THREE.Vector3(0,0,1);
	vec2.applyQuaternion(this.entite.objet3d.quaternion);

	vec1.subVectors(pos,this.entite.objet3d.position);

	//Calcul de l'angle entre le centre de la vision
	var ang=vec2.angleTo(vec1);
	ang=ang*180.0/Math.PI;
	if(ang<this.angle) return true;
	else return false;
}

// ===============================================================================================

function Acteur(nom,data,sim,nimbus,focus){
	this.nom = nom ; 
	this.objet3d = null ; 
	this.sim = sim ; 
	this.mass = 1.0;
	this.vitesse = new THREE.Vector3();
	this.acceleration = new THREE.Vector3();
	this.composants = [];
	this.nimbus=nimbus;
	this.focus=focus;

}

// Affectation d'une incarnation à un acteur
Acteur.prototype.setObjet3d = function(obj){
	this.objet3d = obj ; 
	this.sim.scene.add(this.objet3d) ; 
}

// Modification de la position de l'acteur
Acteur.prototype.setPosition = function(x,y,z){
	if(this.objet3d){
		this.objet3d.position.set(x,y,z) ; 
	}
}

// Recuperation de la position de l'acteur
Acteur.prototype.getPosition = function(){
	if(this.objet3d){
		return this.objet3d.position.clone() ; 
	}
}

// Modification de l'orientation de l'acteur
Acteur.prototype.setOrientation = function(cap){
	if(this.objet3d){
		this.objet3d.rotation.y = cap ; 
	}
}


// Modification de la visibilité de l'acteur
Acteur.prototype.setVisible = function(v){
	if(this.objet3d){
		this.objet3d.isVisible = v ;
	}
}

Acteur.prototype.appliquerForce = function(f) {
	if(this.acceleration) {
		this.acceleration.addScaledVector(f,1.0/this.mass);
	}
}

Acteur.prototype.ajouterComposant = function(comp) {
	if(this.composants) {
		this.composants.push(comp);
	}
}


Acteur.prototype.actualiser = function(dt){}
	 
