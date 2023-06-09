class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        this.isFiring = false;
        this.moveSpeed = 2;

        this.sfxRocket = scene.sound.add('sfx_rocket');
        
        this.scene = scene;
    }

    update() {
        // moving
        if (!this.isFiring) {
            if (keyLEFT.isDown && this.x >= borderUISize + this.width) {
                this.x -= this.moveSpeed;
            } else if (keyRIGHT.isDown && this.x <= game.config.width - borderUISize - this.width) {
                this.x += this.moveSpeed;
            }
            else {
                this.x = this.scene.input.activePointer.worldX;
                if (this.x < borderUISize + this.width) {
                    this.x = borderUISize + this.width
                } else if (this.x > game.config.width - borderUISize - this.width) {
                    this.x = game.config.width - borderUISize - this.width
                }
            }
        }

        // firing
        if (Phaser.Input.Keyboard.JustDown(keyF) && !this.isFiring) {
            this.isFiring = true;
            this.sfxRocket.play();
        }
        if (this.scene.input.activePointer.isDown && !this.isFiring) {
            this.isFiring = true;
            this.sfxRocket.play();
        }

        // if firing, move up
        if (this.isFiring && this.y >= borderUISize * 3 + borderPadding) {
            this.y -= this.moveSpeed;
        }

        // reset on miss
        if (this.y <= borderUISize * 3 + borderPadding) {
            this.reset();
        }
    }

    reset() {
        this.isFiring = false;
        this.y = game.config.height - borderUISize - borderPadding;
    }
}
