const canvas = document.getElementById("main-canvas");
canvas.width = 200;

initialLane = 2;

const context = canvas.getContext("2d");
const road = new Road(canvas.width / 2, canvas.width * 0.9);


const N = 1500;
const cars = generateCars(N);//new Car(road.getLaneCenter(initialLane - 1), 100, 30, 50, "AI", 6);
let bestCar = cars[0];

if(localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.01);
        }
    }
    
}

const traffic = [
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",4, "red"),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",4, "red"),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",4, "red"),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",4, "red"),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",4, "red"),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",4, "red"),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",4, "red")
];

animate();

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}


function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 6));
    }
    return cars;
}

function animate() {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    const bestCar = cars.find(c => c.y == Math.min(...cars.map(c => c.y)));
    
    canvas.height = window.innerHeight;

    context.save();
    context.translate(0, -bestCar.y + canvas.height * 0.7);


    road.draw(context);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(context, "red");
    } 
    context.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(context, "blue");
    }
    context.globalAlpha = 1;
    bestCar.draw(context, "blue", true);
    

    context.restore();
    requestAnimationFrame(animate);
}
