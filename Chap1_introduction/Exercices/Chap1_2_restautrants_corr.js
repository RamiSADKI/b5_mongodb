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
while( resBrooklyn2.hasNext() ){
    count++;
    resBrooklyn2.next();
}

print(count);
