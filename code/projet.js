
// ======================================================================================================================
// Spécialisation des classes Sim et Acteur pour un projet particulier
// ======================================================================================================================
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function Appli(){
	Sim.call(this) ; 
}

Appli.prototype = Object.create(Sim.prototype) ; 
Appli.prototype.constructor = Appli ; 

Appli.prototype.creerScene = function(params){
	params = params || {} ; 
	this.scene.add(new THREE.AxesHelper(3.0)) ; 
	this.scene.add(creerSol()) ; 

	

	//Ajout de pingouin de type 3
	var maxPos=100;
	for (let i = 0; i < 10; i++) {
		var x = getRandomInt(maxPos);
		var z = getRandomInt(maxPos);
		var name="tux3_"+i;
		var tux = new Acteur3(name,{path:"assets/obj/pingouin",obj:"penguin",mtl:"penguin"},this) ; 
		this.addActeur(tux) ;
		tux.setPosition(x-maxPos/2,0,z-maxPos/2) ;
	}

	//Ajout de pingouin de type 2
	var maxPos=100;
	for (let i = 0; i < 10; i++) {
		var x = getRandomInt(maxPos);
		var z = getRandomInt(maxPos);
		var name="tux2_"+i;
		var tux = new Acteur2(name,{path:"assets/obj/pingouin",obj:"penguin",mtl:"penguin"},this) ; 
		this.addActeur(tux) ;
		tux.setPosition(x-maxPos/2,0,z-maxPos/2) ;
	}


	var herbe1 = new Herbe("herbe1",{},this) ; 
	this.addActeur(herbe1) ;


	//Placement d'herbe aléatoire
	var maxPos=100; //Correspond à la taille de la map
	for (let i = 0; i < 100; i++) {
		//Calcul d'une position aléatoire
		var x = getRandomInt(maxPos);
		var z = getRandomInt(maxPos);
		var name="randomHerbe"+i;
		//Création de la touffe d'herbe
		var randomHerbe = new Herbe(name,{couleur:0xaaff55},this); 
		randomHerbe.setPosition(x-maxPos/2,0,z-maxPos/2); 
		this.addActeur(randomHerbe) ;
	}



	//Placement de rocher aléatoire
	var maxPos=100;
	for (let i = 0; i < 20; i++) {
		var x = getRandomInt(maxPos);
		var z = getRandomInt(maxPos);
		var name="randomRocher"+i;
		var randomRocher = new Rocher("rocher",{largeur:3,profondeur:2,hauteur:1.5,couleur:0xffaa22},this);
		randomRocher.setPosition(x-maxPos/2,0.75,z-maxPos/2) ; 
		this.addActeur(randomRocher) ;
	}
	var rocher = new Rocher("rocher",{largeur:3,profondeur:2,hauteur:1.5,couleur:0xffaa22},this);
	rocher.setPosition(-5,0.75,5) ; 
	this.addActeur(rocher) ; 
} 


// ========================================================================================================

function Acteur1(nom,data,sim){
	Acteur.call(this,nom,data,sim) ; 

	var repertoire = data.path + "/" ; 
	var fObj       = data.obj + ".obj" ; 
	var fMtl       = data.mtl + ".mtl" ; 

	var obj = chargerObj("tux1",repertoire,fObj,fMtl) ; 
	this.setObjet3d(obj) ; 
}

Acteur1.prototype = Object.create(Acteur.prototype) ; 
Acteur1.prototype.constructor = Acteur1 ; 

Acteur1.prototype.actualiser = function(dt){
	console.log(this.sim.horloge) ; 
	var t = this.sim.horloge  ; 
	this.setOrientation(t) ;  
	this.setPosition(2*Math.sin(t),0.0,3*Math.cos(2*t)) ; 
}

// ========================================================================================================

function Acteur2(nom,data,sim){
	Acteur.call(this,nom,data,sim,new Cylindre(this,{rayon:25,hauteur:1}),new Focus(this,{})) ; 

	var repertoire = data.path + "/" ; 
	var fObj       = data.obj + ".obj" ; 
	var fMtl       = data.mtl + ".mtl" ; 

	var obj = chargerObj("tux1",repertoire,fObj,fMtl) ; 
	this.setObjet3d(obj) ; 

	//Ajout des composants
	this.ajouterComposant(new MouvementAleatoire(this,{}));	//Le pingouin se déplace aléatoirement
	this.ajouterComposant(new Frottement(this,{}));	//Le pingouin subit les frottements qui le ralentissent
	this.ajouterComposant(new RegardeLaOuTuVas(this,{}));	//Le pingouin oriente son regard dans la direction dans laquelle il se déplace
	this.ajouterComposant(new HerbeAttirance(this,{}));	//Le pingouin est attiré par les touffes d'herbe
	this.ajouterComposant(new MangerHerbe(this,{}));	//Le pingouin mange l'herbe quand il est assez proche
	this.ajouterComposant(new EviterHumain(this,{}));	//Le pingouin évite les humains
	this.ajouterComposant(new Acteur2Attirance(this,{}));	//Le pingouin est attiré par ses congénères
	this.ajouterComposant(new LibererPheromone(this,{})); //Le pingouin relache des phéromones
	this.ajouterComposant(new PheromoneAttirance(this,{})); //Le pingouin est attiré par les phéromones
}

Acteur2.prototype = Object.create(Acteur.prototype) ; 
Acteur2.prototype.constructor = Acteur2 ; 

Acteur2.prototype.actualiser = function(dt){
	//console.log(this.objet3d.position) ; 
	var t = this.sim.horloge ; 

	//Actualisation de la position, de la vitesse et remise à 0 de l'accélération
	this.objet3d.position.addScaledVector(this.vitesse,dt) ;


	//Verification des bords de la map
	if(this.objet3d.position.x>50.0) this.objet3d.position.x=50.0;
	if(this.objet3d.position.z>50.0) this.objet3d.position.z=50.0;
	if(this.objet3d.position.x<-50.0) this.objet3d.position.x=-50.0;
	if(this.objet3d.position.z<-50.0) this.objet3d.position.z=-50.0;


	this.vitesse.addScaledVector(this.acceleration,dt) ;
	this.acceleration.set(0.0,0.0,0.0) ;

	//Limite la vitesse du pinguin à 15 ms
	var origin=new THREE.Vector3(0,0,0);
	var vit=this.vitesse.distanceTo(origin);
	if(vit > 15 ) {
		this.vitesse.normalize();
		this.vitesse.multiplyScalar(15);
	}
}

// ========================================================================================================



// La classe décrivant les touffes d'herbe
// =======================================

function Herbe(nom,data,sim){
	Acteur.call(this,nom,data,sim,new Sphere(this,{rayon:5}), null) ; 

	var rayon   = data.rayon || 0.25 ;  
	var couleur = data.couleur || 0x00ff00 ;  

	var sph = creerSphere(nom,{rayon:rayon, couleur:couleur}) ;
	this.setObjet3d(sph) ; 
}


Herbe.prototype = Object.create(Acteur.prototype) ; 
Herbe.prototype.constructor = Herbe ; 

// La classe décrivant les rochers
// ===============================

function Rocher(nom,data,sim){
	Acteur.call(this,nom,data,sim,new Sphere(this,{rayon:6}),null) ; 

	var l = data.largeur || 0.25 ;  
	var h = data.hauteur || 1.0 ; 
	var p = data.profondeur || 0.5 ;  
	var couleur = data.couleur || 0x00ff00 ;  

	var box = creerBoite(nom,{largeur:l, hauteur:h, profondeur:p, couleur:couleur}) ;
	this.setObjet3d(box) ; 
}
Rocher.prototype = Object.create(Acteur.prototype) ; 
Rocher.prototype.constructor = Rocher ; 


// La classe décrivant les touffes d'herbe
// =======================================

function Pheromone(nom,data,sim,proprietaire){
	Acteur.call(this,nom,data,sim,new Sphere(this,{rayon:5}), null) ; 

	var rayon   = data.rayon || 0.25 ;  
	var couleur = data.couleur || 0x0000ff ;  

	this.dureeDeVie =10.0; 
	this.count=0;
	this.createur = proprietaire;

	var sph = creerSphere(nom,{rayon:rayon, couleur:couleur}) ;
	sph.material.transparent = true;
	sph.material.opacity = 1; 
	this.setObjet3d(sph) ; 
}


Pheromone.prototype = Object.create(Acteur.prototype) ; 
Pheromone.prototype.constructor = Pheromone ; 
Pheromone.prototype.actualiser = function(dt){
	this.count=this.count+dt;
	//Duree de vie écoulée, suppression du phéromone
	if(this.count>this.dureeDeVie) {
		this.sim.supprimerActeur(this);
	}
	//Mettre à jour la transparence en fonction de la duree de vie restante
	this.objet3d.material.opacity = 1*(this.dureeDeVie-this.count)/this.dureeDeVie; 
	
}


//================================================
//============= Les composants ===================
//================================================

//---Mouvement aleatoire---
function MouvementAleatoire(entite, opts) {
	Composant.call(this,entite);
	this.force = new THREE.Vector3(opts.force  || 1.0, 0.0, 0.0 );
	this.alea = opts.alea || 0.1;
	this.puissance=opts.puiss || 10.0;
}

MouvementAleatoire.prototype = Object.create(Composant.prototype);
MouvementAleatoire.prototype.constructor = MouvementAleatoire;
MouvementAleatoire.prototype.actualiser = function(dt) {
	if(Math.random()<this.alea) {
		this.entite.appliquerForce(this.force);
		this.nouvelleForce();
	}
}

MouvementAleatoire.prototype.nouvelleForce = function() {
	var x=(Math.random()-0.5);
	var z=(Math.random()-0.5);
	this.force=new THREE.Vector3(x,0.0,z);
	this.force.normalize();
	this.force.multiplyScalar(this.puissance);
}

//---Frottement---
function Frottement(entite,opts) {
	Composant.call(this,entite);
	this.force = new THREE.Vector3(0.0,0.0,0.0);
	this.k = opts.k || 0.1 ;
}

Frottement.prototype = Object.create(Composant.prototype);
Frottement.prototype.constructor = Frottement;
Frottement.prototype.actualiser = function(dt) {
	this.force.copy(this.entite.vitesse);
	this.force.multiplyScalar(-this.k);
	this.entite.appliquerForce(this.force);
}

//---RegardeLaOuTuVas---
function RegardeLaOuTuVas(entite,opts) {
	Composant.call(this,entite);
}

RegardeLaOuTuVas.prototype = Object.create(Composant.prototype);
RegardeLaOuTuVas.prototype.constructor = RegardeLaOuTuVas;
RegardeLaOuTuVas.prototype.actualiser = function(dt) {
	var point=new THREE.Vector3();
	point.copy(this.entite.objet3d.position);
	point.addScaledVector(this.entite.vitesse,1.0);
	this.entite.objet3d.lookAt(point);
}

//---HerbeAttirance---
function HerbeAttirance(entite,opts) {
	Composant.call(this,entite);
	this.puissance=15.0;
	this.max=15;  //Acceleration maximale que ce composant peut prodiguer
	this.min=0.5;	//Acceleration minimale que ce composant peut prodiguer
}

HerbeAttirance.prototype = Object.create(Composant.prototype);
HerbeAttirance.prototype.constructor = HerbeAttirance;
HerbeAttirance.prototype.actualiser = function(dt) {
	if(this.entite) {
		var tab = this.entite.sim.acteurs;
		var n = tab.length ; 
		for(var i=0; i<n; i++){
			if(tab[i] instanceof Herbe) {
				if(tab[i].nimbus.positionIncluDansNimbus(this.entite.objet3d.position) && this.entite.focus.positionIncluDansFocus(tab[i].objet3d.position) ) {

					var force=new THREE.Vector3();
					force.subVectors(tab[i].objet3d.position,this.entite.objet3d.position);
					force.normalize();
					

					//Calcul de la distance entre l'herbe et le pingouin
					var dist=tab[i].objet3d.position.distanceTo(this.entite.objet3d.position);
					if(dist<0.01) dist=0.01;
					if(dist>50) dist=50;

					//Verification de la puissance de l'accélération par rapport à min et max
					var rapport=this.puissance/(dist*dist);
					if(rapport<this.min)rapport=this.min;
					if(rapport>this.max)rapport=this.max;
					force.multiplyScalar(rapport);

					this.entite.appliquerForce(force);
				}
			}
		} 
	}
}


//---MangerHerbe---
function MangerHerbe(entite,opts) {
	Composant.call(this,entite);
}

MangerHerbe.prototype = Object.create(Composant.prototype);
MangerHerbe.prototype.constructor = MangerHerbe;
MangerHerbe.prototype.actualiser = function(dt) {
	if(this.entite) {
		var tab = this.entite.sim.acteurs;
		var n = tab.length ; 
		for(var i=0; i<n; i++){
			if(tab[i] instanceof Herbe) {
				if(tab[i].objet3d.position.distanceTo(this.entite.objet3d.position)<=1.0) {
					this.entite.sim.supprimerActeur(tab[i])
					this.entite.vitesse=new THREE.Vector3(0,0,0);
				}	
			}
		} 
	}
}



//--EviterHumain---
function EviterHumain(entite,opts) {
	Composant.call(this,entite);
	this.puissance=10.0;
	this.max=10;
	this.min=0.5;
}

EviterHumain.prototype = Object.create(Composant.prototype);
EviterHumain.prototype.constructor = EviterHumain;
EviterHumain.prototype.actualiser = function(dt) {
	if(this.entite) {

		var dist=this.entite.objet3d.position.distanceTo(this.entite.sim.camera.position);
		if(dist<=10) {
			var force=new THREE.Vector3();
			force.subVectors(this.entite.objet3d.position,this.entite.sim.camera.position);
			force.normalize();
			force.y=0.0;
			if(dist<0.01) dist=0.01;
			if(dist>50) dist=50;

			var rapport=this.puissance/(dist*dist);
			if(rapport<this.min)rapport=this.min;
			if(rapport>this.max)rapport=this.max;
			force.multiplyScalar(rapport);

			force.multiplyScalar(this.puissance/(dist*dist));
			this.entite.appliquerForce(force);
		}

	}
}


//---HerbeAttirance---
function Acteur2Attirance(entite,opts) {
	Composant.call(this,entite);
	this.puissance=4.0;
	this.distance=2.0;
}

Acteur2Attirance.prototype = Object.create(Composant.prototype);
Acteur2Attirance.prototype.constructor = Acteur2Attirance;
Acteur2Attirance.prototype.actualiser = function(dt) {
	if(this.entite) {
		var tab = this.entite.sim.acteurs;
		var n = tab.length ; 
		for(var i=0; i<n; i++){
			if(tab[i] instanceof Acteur2) {
				if(tab[i].nimbus.positionIncluDansNimbus(this.entite.objet3d.position)) {

					var dist=this.entite.objet3d.position.distanceTo(tab[i].objet3d.position);
					var force=new THREE.Vector3();
					if(dist<this.distance) { //Trop proche

						force.subVectors(this.entite.objet3d.position,tab[i].objet3d.position);
					} 
					else { //Trop loin 
						
						force.subVectors(tab[i].objet3d.position,this.entite.objet3d.position);
					}

					force.normalize();
					if(dist<1) dist=1;
					if(dist>50) dist=50;

					force.multiplyScalar(this.puissance/(dist*dist));
					this.entite.appliquerForce(force);
				}
			}
		} 
	}
}


//---MangerHerbe---
function LibererPheromone(entite,opts) {
	Composant.call(this,entite);
	this.delai = 4.0;
	this.count = 0.0;
}

LibererPheromone.prototype = Object.create(Composant.prototype);
LibererPheromone.prototype.constructor = LibererPheromone;
LibererPheromone.prototype.actualiser = function(dt) {
	if(this.entite) {
		if(this.count>=this.delai) {
			var name="randomPheromone";
			var newPheromone = new Pheromone(name,{couleur:0x3333ee},this.entite.sim,this.entite) ; 
			newPheromone.setPosition(this.entite.getPosition().x,0,this.entite.getPosition().z) ; 
			this.entite.sim.addActeur(newPheromone) ;	
			this.count=0.0;		
		}
		this.count=this.count+dt;
	}
}

//---PheromoneAttirance---
function PheromoneAttirance(entite,opts) {
	Composant.call(this,entite);
	this.puissance=7.0;
	this.max=7;
	this.min=0.5;
}

PheromoneAttirance.prototype = Object.create(Composant.prototype);
PheromoneAttirance.prototype.constructor = PheromoneAttirance;
PheromoneAttirance.prototype.actualiser = function(dt) {
	if(this.entite) {
		var tab = this.entite.sim.acteurs;
		var n = tab.length ; 
		for(var i=0; i<n; i++){
			if(tab[i] instanceof Pheromone && tab[i].createur != this.entite) {
				if(tab[i].nimbus.positionIncluDansNimbus(this.entite.objet3d.position) && this.entite.focus.positionIncluDansFocus(tab[i].objet3d.position) ) {

					var force=new THREE.Vector3();
					force.subVectors(tab[i].objet3d.position,this.entite.objet3d.position);
					force.normalize();
					
					var dist=tab[i].objet3d.position.distanceTo(this.entite.objet3d.position);
					if(dist<0.01) dist=0.01;
					if(dist>50) dist=50;

					var rapport=this.puissance/(dist*dist);
					if(rapport<this.min)rapport=this.min;
					if(rapport>this.max)rapport=this.max;
					force.multiplyScalar(rapport);

					this.entite.appliquerForce(force);
				}
			}
		} 
	}
}


//---------------------------------------------------------
//======Acteur 3 et ses composants de l'acteur 3 ==========
//---------------------------------------------------------

function Acteur3(nom,data,sim){
	Acteur.call(this,nom,data,sim,new Cylindre(this,{rayon:10,hauteur:1}),new Focus(this,{})) ; 

	var repertoire = data.path + "/" ; 
	var fObj       = data.obj + ".obj" ; 
	var fMtl       = data.mtl + ".mtl" ; 

	var obj = chargerObj("tux1",repertoire,fObj,fMtl) ; 
	this.setObjet3d(obj) ; 

	this.vitesseMax = 5.0; //Vitesse max en m/s que le pingouin peut atteindre

	//Ajout des composants
	this.ajouterComposant(new MouvementAleatoire(this,{puiss:20})); //Le pingouin se déplace aléatoirement
	this.ajouterComposant(new Frottement(this,{})); 				//Le pingouin subit les frottements qui le ralentissent
	this.ajouterComposant(new RegardeLaOuTuVas(this,{})); 			//Le pingouin oriente son regard dans la direction dans laquelle il se déplace
	this.ajouterComposant(new Cohesion(this,{}));					//Régle de cohésion des boids
	this.ajouterComposant(new Separation(this,{}));					//Règle de séparation des boids
	this.ajouterComposant(new Alignement(this,{}));					//Règle d'alignement des boids
	this.ajouterComposant(new EvitementDeRocher(this,{}));			//Le pingouin évite les rochers
}

Acteur3.prototype = Object.create(Acteur.prototype) ; 
Acteur3.prototype.constructor = Acteur3 ; 

Acteur3.prototype.actualiser = function(dt){
	var t = this.sim.horloge ; 

	//Actualisation de la position
	this.objet3d.position.addScaledVector(this.vitesse,dt) ;


	//Verification des bords de la map
	var x=0;
	var z=0;
	if(this.objet3d.position.x>50.0) x=-1//this.objet3d.position.x=50.0;
	if(this.objet3d.position.z>50.0) z=-1; //this.objet3d.position.z=50.0;
	if(this.objet3d.position.x<-50.0) x=1; //this.objet3d.position.x=-50.0;
	if(this.objet3d.position.z<-50.0) z=1; //this.objet3d.position.z=-50.0;

	//Rebond si un bord de la map est atteint
	var rebond=new THREE.Vector3(x,0,z);
	rebond.multiplyScalar(20);
	this.appliquerForce(rebond);

	//Mise à jour de la vitesse
	this.vitesse.addScaledVector(this.acceleration,dt);

	//Reinitialisation de l'accélération
	this.acceleration.set(0.0,0.0,0.0) ;

	//Limite la vitesse du pinguin en fonction de this.vitesseMax
	var origin=new THREE.Vector3(0,0,0);
	var vit=this.vitesse.distanceTo(origin);
	if(vit > this.vitesseMax ) {
		this.vitesse.normalize();
		this.vitesse.multiplyScalar(this.vitesseMax);
	}
}


//---Cohesion---
function Cohesion(entite,opts) {
	Composant.call(this,entite);
	this.k=1.0;  //Force de la cohésion (laisser à 1 de préférence)
}


Cohesion.prototype = Object.create(Composant.prototype);
Cohesion.prototype.constructor = Cohesion;
Cohesion.prototype.actualiser = function(dt) {
	if(this.entite) {

		var count = 0; //Nombre de pingouins proches
		var g =new THREE.Vector3(); //Correspond à la position moyenne des pingouins proches

		//Parcours de la liste des acteurs
		var tab = this.entite.sim.acteurs;
		var n = tab.length ; 
		for(var i=0; i<n; i++){
			if(tab[i] instanceof Acteur3 && tab[i] != this.entite && this.entite.nimbus.positionIncluDansNimbus(tab[i].objet3d.position)) {
				count = count + 1;

				var p =tab[i].getPosition();

				g.addScaledVector(p,1.0); //Ajout de la position du pingouin au total	
			}
		}

		if(count>0) {
			var force=new THREE.Vector3();
			g.multiplyScalar(1/count);	
			force.subVectors(g,this.entite.objet3d.position); //Vecteur entre la position moyenne des pingouins proches et du pingouin
			force.normalize();
			force.multiplyScalar(this.k); 
			this.entite.appliquerForce(force);
		}
	}
}


//---Separation---
function Separation(entite,opts) {
	Composant.call(this,entite);
}


Separation.prototype = Object.create(Composant.prototype);
Separation.prototype.constructor = Separation;
Separation.prototype.actualiser = function(dt) {
	if(this.entite) {

		var count = 0; //Nombre de pingouin dans le nimbus
		var totalForce = new THREE.Vector3();

		//Parcours de la liste des acteurs
		var tab = this.entite.sim.acteurs;
		var n = tab.length ; 
		for(var i=0; i<n; i++){
			if(tab[i] instanceof Acteur3 && tab[i] != this.entite && this.entite.nimbus.positionIncluDansNimbus(tab[i].objet3d.position)) {


				count=count+1;

				//Calcul de la direction de la force (s'éloigner du pingouin)
				var force=new THREE.Vector3();
				force.subVectors(this.entite.objet3d.position,tab[i].objet3d.position);
				force.normalize();
				
				//Ajout de la force au total
				totalForce.addScaledVector(force,1.0);			
			}
		}
		if(count>0) {
			//Calcul de la moyenne
			totalForce.multiplyScalar(1/count);	
			//Ajout de la force
			this.entite.appliquerForce(totalForce);
		} 



	}
}

//---Alignement---
function Alignement(entite,opts) {
	Composant.call(this,entite);
	this.k=1.0;

}


Alignement.prototype = Object.create(Composant.prototype);
Alignement.prototype.constructor = Alignement;
Alignement.prototype.actualiser = function(dt) {
	if(this.entite) {

		var count = 0; //Nombre de pingouin dans le nimbus
		var vm = new THREE.Vector3();

		//Parcours de la liste des acteurs
		var tab = this.entite.sim.acteurs;
		var n = tab.length ; 
		for(var i=0; i<n; i++){
			if(tab[i] instanceof Acteur3 && tab[i] != this.entite && this.entite.nimbus.positionIncluDansNimbus(tab[i].objet3d.position)) {

				count=count+1;
				
				//Ajout de la force au total
				vm.addScaledVector(tab[i].vitesse,1.0);			}
		}
		if(count>0) {
			
			vm.multiplyScalar(1/count);	

			//Calcul de fa
			var fa=new THREE.Vector3();
			fa.subVectors(vm,this.entite.vitesse);
			vm.multiplyScalar(this.k);	

			//Ajout de la force
			this.entite.appliquerForce(vm);
		} 
	}
}


//---EvitementDeRocher---
function EvitementDeRocher(entite,opts) {
	Composant.call(this,entite);
	this.k=2.0;  //Distance du palpeur par rapport a l'acteur
}


EvitementDeRocher.prototype = Object.create(Composant.prototype);
EvitementDeRocher.prototype.constructor = EvitementDeRocher;
EvitementDeRocher.prototype.actualiser = function(dt) {
	if(this.entite) {
		//Calculer la position du palpeur
		var palpeur=this.entite.vitesse.clone();
		palpeur.normalize();
		palpeur.multiplyScalar(this.k);
		palpeur.addScaledVector(this.entite.getPosition(),1.0);


		var tab = this.entite.sim.acteurs;
		var n = tab.length ; 

		for(var i=0; i<n; i++){
			if(tab[i] instanceof Rocher && tab[i].nimbus.positionIncluDansNimbus(palpeur)) {

				//Calcul de "(r+d)"   {1}
				var r=this.entite.nimbus.getRayon();
				var d=tab[i].objet3d.position.distanceTo(this.entite.objet3d.position);
				var rd=r+d;

				//Calcul de " CP' / ||CP'|| "  {2}
				var cp=new THREE.Vector3();
				cp.subVectors(palpeur,tab[i].objet3d.position);
				cp.normalize();

				//Calcul final  "{1}*{2} - C"   {3}
				cp.multiplyScalar(rd);
				pFinale=new THREE.Vector3();
				pFinale.subVectors(cp,tab[i].objet3d.position);
				pFinale.y=0;

				//Seek({3})
				var force=new THREE.Vector3();
				force.subVectors(pFinale,this.entite.getPosition());
				force.normalize();
				force.multiplyScalar(10);
				
				//Ajout de la force
				this.entite.appliquerForce(force);	

			}
		} 
	}
}
