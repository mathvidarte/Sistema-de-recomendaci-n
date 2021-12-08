class User {
    constructor(name, caracteristicas) {
        this.name = name;
        this.caracteristicas = caracteristicas;

    }

    //medir valor 
    magnitude() {
        let sumaCuadrados=0;
        for(let i=0; i<this.caracteristicas.length; i ++){
            sumaCuadrados+= Math.pow(this.caracteristicas[i], 2);
        }
        return Math.sqrt(sumaCuadrados); 
        //Math.pow(base, exponente);
    }
}



