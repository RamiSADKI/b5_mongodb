// ## 1. Exercice compter le nombre de restaurants

const resBrooklyn = db.restaurants.find({ borough: "Brooklyn" }, { "name": 1 });

let count = 0;
// on utilise le curseur 
resBrooklyn.forEach(doc => {
    count = count + 1;
});

print(count);

// Comparaison avec la méthode d'agrégation pour compter
print(resBrooklyn.count());

// refaire la requête
const resBrooklyn2 = db.restaurants.find({ borough: "Brooklyn" }, { "name": 1 });
let count = 0;
while (resBrooklyn2.hasNext()) {
    count++;
    resBrooklyn2.next();
}

print(count);


/*
//- 1. Combien y a t il de restaurants qui font de la cuisine italienne et qui ont eu un score 
de 10 au moins une fois ? 
Affichez également le nom, les scores et les coordonnées GPS de ces restaurants. 

Ordonnez les résultats par ordre décroissant sur les noms des restaurants.

*/

db.restaurants.find({
    "cuisine": "Italian",
    "grades.score": { "$gte" : 10 }
}, {
    "grades.score": 1, _id: 0
}).count();

// Question bis : score >= 10 avec le not ce n'est pas évident mais on ne retourne pas de valeur plus petite que 
// 9 dans la requête ci-dessous, uniquement supérieur à 10
db.restaurants.find({
    "grades.score": { "$not": { "$lt": 10 } }
},
    { "grades.score": 1, "_id": 0 }
)

// par ordre décroissant et supérieur au égale à 10 au moins une fois   
db.restaurants.find({
    "cuisine": "Italian",
    "grades.score": { "$gte" : 10 }
}, {
    name : 1,
    "grades.score": 1, 
    "address.coord": 1 ,
    _id: 0
}).sort({ name : -1})