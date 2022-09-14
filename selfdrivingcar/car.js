class Car {
    constructor (x, y, w, h, controlType, maxspeed = 6) {
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

        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this)
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

    draw (context, color) {
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


        if(this.sensor) {
            this.sensor.draw(context);
        }
    }
}