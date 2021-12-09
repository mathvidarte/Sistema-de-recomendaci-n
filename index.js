const listA = document.querySelector('.nombreA__input');
const listB = document.querySelector('.nombreB__input');
const listC = document.querySelector('.nombreC__input');
const listK = document.querySelector('.k__input');
const listAgregation = document.querySelector('.agregation__input');
const results = document.querySelector('.results');

let file;
let file2;
let upload;

let arrayProb;
var kNeighbors = [];

let users = [];
let bootcamp = [];
let similitudes = [];

let medias;

function cargarMedias(){

    medias = new Map();
  
    let habilidades = file[0].split(',');
    habilidades.forEach(habKey=>{

        medias.set(habKey, {suma:0, total:file.length-1, media:0})

    });
  
    

}

function preload() {
    file = loadStrings("./file/personas.csv");
    file2 = loadStrings("./file/bootcamps1.csv");  

}

function setup() {
    splitCsv();
    console.log(file[0]);
    cargarMedias();
}

function splitCsv() {
    for (let i = 1; i < file.length; i++) {

        upload = file[i].split(',');
        let name = upload[0];
        arrayProb = [];
        for (let j = 1; j < upload.length; j++) {

            arrayProb.push(parseInt(upload[j]));

        }
        users.push(new User(name, arrayProb));
  

    }

    for (let i = 1; i < file2.length; i++) {

        upload = file2[i].split(',');
        let name = upload[0];
        arrayProb = [];
        for (let j = 1; j < upload.length; j++) {

            arrayProb.push(parseInt(upload[j]));

        }
        bootcamp.push(new User(name, arrayProb));
    }

    let size = users.length;
    let htmlString = "";
    //generar la lista
    for (let j = 0; j < size; j++) {

        let user = users[j];
        htmlString += '<option value= "' + user.name + '">' + user.name + '</option>';
    }

    listA.innerHTML = htmlString;
    listB.innerHTML = htmlString;
    listC.innerHTML = htmlString;

    // For para generar la lista de valor k posibles a escoger
    htmlString = "";
    for (let i = 0; i < size - 1; i++) {
        htmlString += '<option value= "' + (i + 1) + '">' + (i + 1) + '</option>';
    }
    listK.innerHTML = htmlString;
}
//producto punto - suma de las multiplicaciones de valores oredenados de los vectores
//elemnto 1 vector 1 * elemento 1 vector 2 + elm 2 vec 1...
function scalarProduct(user1, user2) {
    let result = 0;
    for (let i = 0; i < user1.caracteristicas.length; i++) {
        result += user1.caracteristicas[i] * user2.caracteristicas[i];
    }
    return result;
}

function hasSameDirection(user1, user2) {

    let maxValue1 = Math.max(...user1.caracteristicas);
    let maxValue2 = Math.max(...user2.caracteristicas);
    let isSameDirection = true;
    for (let i = 0; i < user1.caracteristicas.length; i++) {
        isSameDirection = isSameDirection && (user1.caracteristicas[1] / maxValue1 == user2.caracteristicas[i] / maxValue2);
        if (!isSameDirection) {
            break;
        }
    }
    return isSameDirection;
}

function findSimilarity(user1, user2) {

    let magnitude1 = user1.magnitude();
    let magnitude2 = user2.magnitude();
    let similarity;

    if (hasSameDirection(user1, user2)) {
        similarity = magnitude1 / magnitude2;
        // similitud= cociente magnitudes - si van a la misma direccion la similitud 
        //es la division de las magnitudes
    } else {
        //  console.log(scalarProduct(user1, user2));
        //  console.log(magnitude1 * magnitude2);

        similarity = scalarProduct(user1, user2) / (magnitude1 * magnitude2);

        //producto punto/multiplicacion magnitudes -> similitud coseno
    }
    return similarity;
}

function calculate() {
    var select1 = document.getElementById('nombreA');
    var select2 = document.getElementById('nombreB');
    let similarity = findSimilarity(users[select1.selectedIndex], users[select2.selectedIndex]);
    var result = document.getElementById('result');
    result.innerText = 'similitud:' + Math.round(similarity * 100) + '%';
}


function calculateVecinos() {

    similitudes=[];
    let k = parseInt(listK.options[listK.selectedIndex].value);
    let nombreP = listC.options[listC.selectedIndex].value;

    let position = searchUser(nombreP);
    //console.log(position);
    let userP = users[position];
    userP.caracteristicas = multiplicacionDePesos(userP);
    //console.log(userP.caracteristicas);

    users.forEach(u => {
        //condicion para no comparra el mismo usuario
        if (!(u.name == nombreP)) {

            //console.log(u.name);
            //console.log(userP);
            let similarity = findSimilarity(userP, u);
            //console.log(similarity);
            //objeto que tiene name,distancia,vector
            similitudes.push({ name: u.name, dist: similarity, vector: u.caracteristicas });
            //console.log(similitudes);
        }
    });


    similitudes.sort(function comparator(u1, u2) {
        return u2.dist - u1.dist;
    });
    //se parte 
    similitudes = similitudes.slice(0, k);
    let htmlString = '';
    for (let i = 0; i < k; i++) {
        htmlString += ' <div>' + (i + 1) + ' ' + similitudes[i].name + ' <strong>' + (similitudes[i].dist *100).toFixed(1)+'%'+ '</strong></div>';
    }

    results.innerHTML = htmlString;
    getRecomendation(userP.caracteristicas);

}

function multiplicacionDePesos(userP) {
    let usuarioPeso = [];

    for (i = 0; i < userP.caracteristicas.length; i++) {
        //VALOR SLIDER=100
        let slider = document.getElementById('slider' + i);
        let sliderValue = slider.value / 100;
        usuarioPeso.push(userP.caracteristicas[i] * sliderValue);
    }

    return usuarioPeso;

}

function getRecomendation(userP) {

    let vectoresPeso = [];
    vectoresPeso.push(userP);
    for (i = 0; i < similitudes.length; i++) {

        let vectorPeso = similitudes[i].vector;
        vectoresPeso.push(vectorPeso);
        //console.log(vectoresPeso);
        //console.log(vectorPeso);
        //console.log(vectorPeso[0]);

    }

    let agregacion = getAgregacion(vectoresPeso);
    //console.log(agregacion);
    let htmlString = '<h3> Vector de agregación </h3>';
    for (let i = 0; i < agregacion.length; i++) {
        htmlString += ' <div>' + (i + 1) + ': <strong>' + agregacion[i].toFixed(1) + '</strong></div>';
    }
    
    results.innerHTML += htmlString;
    calculateBootCamp(agregacion);
    
    
}

function getAgregacion(vectoresPeso) {

    let selected = listAgregation.options[listAgregation.selectedIndex].value;
    console.log("seleccionado: "+selected);


    let vectorAgregado = []

    switch (selected) {
        case 'least':
            console.log("least here");

            //izq a derecha
            for (i = 0; i < vectoresPeso[0].length; i++) {
                let sumCaracteristica = 0;
                let colum;
                for (j = 0; j < vectoresPeso.length; j++) {
                    //console.log(vectoresPeso[j].name);
                    
                    if(vectoresPeso[j][i] == 1) {
                       //console.log("columna: "+i);
                       colum = i;
                    }

                    vectoresPeso[j][colum]= 1;

                    //console.log(vectoresPeso[j][i]);
                    sumCaracteristica += vectoresPeso[j][i];
                }
                let averageCaracteristica = sumCaracteristica / vectoresPeso.length;
                vectorAgregado.push(averageCaracteristica);        
            }
            return vectorAgregado;
            
            break;
        case 'naive':
            console.log("naive here");
            
            //izq a derecha
            for (i = 0; i < vectoresPeso[0].length; i++) {
                let sumCaracteristica = 0;
                //arriba abajo
                for (j = 0; j < vectoresPeso.length; j++) {
                    //suma y promedio
                    sumCaracteristica += vectoresPeso[j][i];
                    //console.log(sumCaracteristica);
                }
                let averageCaracteristica = sumCaracteristica / vectoresPeso.length;
                //console.log(vectoresPeso.length);
                //console.log(averageCaracteristica);
                vectorAgregado.push(averageCaracteristica);
                //console.log(vectorAgregado);
            }
            return vectorAgregado;
    
            break;
        case 'maximum':
            console.log("maximum here");

            //izq a derecha
            for (i = 0; i < vectoresPeso[0].length; i++) {
                let sumCaracteristica = 0;
                let colum;
                for (j = 0; j < vectoresPeso.length; j++) {
                    //console.log(vectoresPeso[j].name);
                    
                    if(vectoresPeso[j][i] == 0) {
                       //console.log("columna: "+i);
                       colum = i;
                    }

                    vectoresPeso[j][colum]= 0;
                    console.log(vectoresPeso[j].length);
                    //console.log(vectoresPeso[j][i]);
                    sumCaracteristica += vectoresPeso[j][i];
                }
                let averageCaracteristica = sumCaracteristica / vectoresPeso.length;
                vectorAgregado.push(averageCaracteristica);        
            }
            return vectorAgregado;

            break;
        case 'media':
            console.log("media here");
            //izq a derecha
            let desvest;

            for (i = 0; i < vectoresPeso[0].length; i++) {
                let sumCaracteristica = 0;
                for (j = 0; j < vectoresPeso.length; j++) {
                    sumCaracteristica += vectoresPeso[j][i];
                }
                let averageCaracteristica = sumCaracteristica / vectoresPeso.length;
              /*
                let numerador = (vectoresPeso[j][i] - averageCaracteristica);
                let numeradorFin = Math.pow(numerador, 2);
                let denominador = 7;
                                    */
            }


            //izq a derecha
            for (i = 0; i < vectoresPeso[0].length; i++) {
                let sumCaracteristica = 0;
                let colum;
                for (j = 0; j < vectoresPeso.length; j++) {
                    //console.log(vectoresPeso[j].name);
                    
                    console.log("columna: "+vectoresPeso[i]);

                    if(vectoresPeso[j][i] >= 8) {
                       //console.log("columna: "+i);
                       //colum = i;
                    }

                    vectoresPeso[j][colum]= 10;
                    //console.log(vectoresPeso[j].length);
                    //console.log(vectoresPeso[j][i]);
                    sumCaracteristica += vectoresPeso[j][i];
                }
                let averageCaracteristica = sumCaracteristica / vectoresPeso.length;
                vectorAgregado.push(averageCaracteristica);        
            }
            return vectorAgregado;


            break;            
    }

}

function calculateBootCamp(vectorAgregado) {

    let similitudesBoot=[];
    let k = parseInt(listK.options[listK.selectedIndex].value);
    let pizzaAgregation=new User('agregation', vectorAgregado);
    //console.log(pizzaAgregation);
    bootcamp.forEach(p => {
                let similarity = findSimilarity(pizzaAgregation, p);
                //objeto que tiene name,distancia,vector
                similitudesBoot.push({ name: p.name, dist: similarity });
        });


        similitudesBoot.sort(function comparator(u1, u2) {
            return u2.dist - u1.dist;
        });
        //se parte 
        similitudesBoot = similitudesBoot.slice(0, 6);
        let htmlString = '<h3> Bootcamp Recomendado </h3>';
        for (let i = 0; i < 6; i++) {
            htmlString += ' <div>' + (i + 1) + ' ' + similitudesBoot[i].name + ' <strong>' + (similitudesBoot[i].dist * 100).toFixed(1)+'%' + '</strong></div>';
        }

        results.innerHTML += htmlString;
}

function searchUser(name) {

    let = -1;

    let flag = false;
    for (let i = 0; i < users.length && !flag; i++) {
        if (name === users[i].name) {
            flag = true;
            return i;
        }
    }

    return -1;

}










