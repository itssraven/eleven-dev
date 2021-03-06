import GenericProjectile from "./generic-projectile.js";

const FIRE_TIMEOUT = 60;

const {FrameTimeout} = Eleven;

const makeProjectilePoint = (x,y,behind) => {
    return {x:x/16,y:y/16,behind};
};

const PROJECTILE_POINTS = Object.freeze({
    0: makeProjectilePoint(11.5,11.6,true), //up
    1: makeProjectilePoint(10,12.1,true),   //right
    2: makeProjectilePoint(4.6,11.6,false), //down
    3: makeProjectilePoint(6,12.1,true)     //left
});

function GenericBlaster(image) {

    let fireStart = null;

    this.render = (context,x,y,width,height) => {
        const {directionMatrix, direction} = this.owner;

        const textureX = directionMatrix[direction];
        context.drawImage(image,textureX,0,16,16,x,y,width,height);
    };

    const pewSound = Eleven.ResourceManager.getAudio("pew");

    const shoot = () => {
        let {x, y, direction} = this.owner;

        const offset = PROJECTILE_POINTS[direction];

        x += (offset.x * this.owner.width) + (this.owner.xOffset || 0);
        y += (offset.y * this.owner.height) + (this.owner.yOffset || 0);

        let soundX, soundY;

        if(this.owner.isPlayer) {
            soundX = this.world.camera.x, soundY = this.world.camera.y;
        } else {
            soundX = x; soundY = y;
        }
        this.world.playSound({buffer:pewSound,x:soundX,y:soundY});

        let zIndex = this.owner.zIndex;
        offset.behind ? zIndex-- : zIndex++;

        let projectileID;

        projectileID = this.world.spriteLayer.add(
            new GenericProjectile(this.world,this.owner,x,y,()=>{
                this.world.spriteLayer.remove(projectileID);
            }),zIndex
        );
    };

    const asyncFire = () => {
        const delay = performance.now();
        requestAnimationFrame(()=>{
            fireStart = performance.now() - delay;
            shoot();
            (async () => {
                await FrameTimeout(FIRE_TIMEOUT);
                fireStart = null;
            })();
        });
    };

    this.attack = () => {
        if(fireStart !== null) return;
        asyncFire();
    };

}

export default GenericBlaster;
