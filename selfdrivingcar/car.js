class Car {
    constructor (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxspeed = 6;
        this.friction = 0.05;
        this.angle = 0;

        this.controls = new Controls();
    }

    update() {
        this.#move();
        

        
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

    draw (context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(-this.angle);

        context.beginPath();
        context.rect (
            -this.width / 2, 
            -this.height / 2,
            this.width,
            this.height
        );

        context.fill();
        context.restore();
    }
}