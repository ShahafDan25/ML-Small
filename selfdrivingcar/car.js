class Car {
    constructor (x, y, w, h, controlType, maxspeed = 3) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxspeed = maxspeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4] //rayCount > 6 > 4
            );
        }

        this.controls = new Controls(controlType);
    }

    update(roadBorders, traffic) {
        if(!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        } 

        if(this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(s => s==null?0:1-s.offset);
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if(this.useBrain) {
                console.log(outputs)
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polyIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            if (polyIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    #createPolygon() {
        const points = [];
        const radius = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * radius,
            y: this.y - Math.cos(this.angle - alpha) * radius
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * radius,
            y: this.y - Math.cos(this.angle + alpha) * radius
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius
        });
        return points;
    }

    #move () {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxspeed) {
            this.speed = this.maxspeed;
        }
        if (this.speed < -this.maxspeed / 2) {
            this.speed = -this.maxspeed / 2;
        }

        if (this.speed > 0) {
            this.speed -= this.friction;
        }
         
        if (this.speed < 0) {
            this.speed += this.friction;
        }

        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1:-1; //1 or -1 based on the direction
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
    
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }
        
    
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw (context, color, drawSensor = false) {
        if(this.sensor && drawSensor) {
            this.sensor.draw(context);
        }
        
        if (this.damaged) {
            context.fillStyle = "gray";
        } else {
            context.fillStyle = color;
        }

        context.beginPath();
        context.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            context.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        context.fill();


        
    }
}