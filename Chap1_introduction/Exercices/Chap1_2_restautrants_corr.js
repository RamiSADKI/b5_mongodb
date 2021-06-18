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
    "grades.score": { "$gte": 10 }
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
    "grades.score": { "$gte": 10 }
}, {
    name: 1,
    "grades.score": 1,
    "address.coord": 1,
    _id: 0
}).sort({ name: -1 })


// Ex 2 
// Quels sont les restaurants qui ont un grade A avec un score supérieur ou égal à 20 ? 
db.restaurants.find(
    {
        "grades.grade": "A",
        "grades.score": { $gte: 20 }
    },
    {
        _id: 0,
        "grades.grade": 1,
        "grades.score": 1
    }).pretty()

// ce n'est pas la même question les restaurants qui ont un score de A et de 20 pour le même
// sous doc


db.restaurants.find({
    grades: {
        $elemMatch: { "score": { $gte: 20 }, "grade": "A" }
    }
},
    {
        _id: 0,
        grades: 1
    }
).pretty()

// 3. A l'aide de la méthode distinct trouvez tous les quartiers distincts de NY.
// attention la méthode distinct renvoie un tableau
db.restaurants.distinct('borough')

/*
Trouvez tous les types de restaurants dans le quartiers du Bronx. 
Vous pouvez là encore utiliser distinct et un deuxième paramètre 
pour préciser sur quel ensemble vous voulez appliquer cette close :
*/

db.restaurants.distinct('name', { "borough": "Bronx" });


// 5. Sélectionnez les restaurants dont le grade est A ou B dans le Bronx.
db.restaurants.find({
    $and: [
        {
            $or: [{ "grades.grade": "A" }, { "grades.grade": "B" }]
        },
        {
            "borough": "Bronx"
        }
    ]
},
    { "_id": 0, "name": 1 }
)

// 6.
db.restaurants.find({
    $and: [
        {
            $or: [{ "grades.0.grade": "A" }, { "grades.0.grade": "B" }]
        },
        {
            "borough": "Bronx"
        }
    ]
},
    { "_id": 0, "name": 1, grades: 1 }
).pretty();


// 7. coeffe ou Coeffe

db.restaurants.find({ name: /coffee/i }, { _id: 0, name: 1 }).count()

db.restaurants.find({ name: /coffee/i }, { _id: 0, name: 1 })


db.restaurants.find({ name: /[Cc]offee/ }, { _id: 0, name: 1 }).pretty()

db.restaurants.aggregate(
    [
        {
            $group: {
                _id: {
                    name: /coffee/
                }
            }
        }
    ]
)


// 8.

/// 
db.restaurants.find({
    $and: [
        { "name": { $in: [/coffee/i, /restaurant/i] } },
        { "name": { $nin: [/Starbucks/i] } }
    ]
}, { "_id": 0, "name": 1 })

/// deuxième version TODO avec les Regex

// à étudier la Regex n'est vraiment pas simple à comprendre vous pouvez le regarder mais ce n'est pas
// fondamentale pour notre cours.
db.restaurants.find({
    $and: [
        { name: { $regex: /[rR]estaurant|[cC]offee/ } },
        // ? on ne garde ce qui se trouve dans les paranthèses capturantes, ! négation 
        // ça doit commencer par quelque chose qui n'est pas ce que l'on ne veut pas garder une ou plusieurs fois
        // n'importe où dans la chaîne
        { name: /^((?!Starbucks).)*$/ }
    ]
}, { _id: 0, name: 1 }).pretty()

// 9
db.restaurants.find(
    {
        name: /[cC]offee/,
        $or: [{ borough: /Bronx/i }, { borough: /Brooklyn/i }],
        grades: { $size: 4 },
        "grades.0.grade": "A",
        "grades.date": {
            $gte: ISODate("2012-10-24T00:00:00Z"),
            $not: { $lt: ISODate("2012-10-24T00:00:00Z") }
        }
    },
    {
        _id: 0,
        name: 1,
        grades: 1,
        address : 1,
        borough : 1
    }
).forEach( doc => {
    print(doc.name.toUpperCase())
    print(`Last date : ${doc.grades[0].date}`);
    print(`First date : ${doc.grades[3].date}`);
    print(`Borough : ${doc.borough}`);
    print(doc.address.street);
    print('------------');
});


// recherche

db.restaurants.aggregate([
    { $unwind: "$grades" },
    {
        $group: {
            _id: "$name",
            // gg: { $push: "$grades" },
            grade: { $addToSet: "$grades.grade" }, // sélectionne qu'une fois les grades
        }
    },
    { $project: { _id: 1, grade: 1 } },
    { $match: { grade: ["A"] } }, // puis on cherche que les groupements qui n'ont qu'un A <=> que des A
])

// ^((?!mot).)*$

db.restaurants.aggregate([
    { $unwind: "$grades" },
    {
        $group: {
            _id: { add: "$address", n: "$name" }, // on sélectionne par name de restaurant & address
            grade: { $addToSet: "$grades.grade" }, // sélectionne qu'une fois les grades
        }
    },
    { $project: { _id: 1, grade: 1 } },
    { $match: { grade: ["A"] } }, // puis on cherche que les groupements qui n'ont qu'un A <=> que des A
]).pretty()



// Jacques
db.restaurants.find(
    {
        name: /[cC]offee/,
        $or: [{ borough: /Bronx/i }, { borough: /Brooklyn/i }],
        grades: { $size: 4 },
        "grades.0.grade": "A",
        "grades.date": {
            $gte: ISODate("2012-10-24T00:00:00Z"),
            $not: { $lt: ISODate("2012-10-24T00:00:00Z") }
        }
    },
    {
        _id: 0,
        name: 1,
        grades: 1,
        address : 1,
        borough : 1
    }
).forEach( doc => {
    print(doc.name.toUpperCase())
    print(`Last date : ${doc.grades[0].date}`);
    print(`First date : ${doc.grades[3].date}`);
    print(`Borough : ${doc.borough}`);
    print(doc.address.street);
    print('------------');
});