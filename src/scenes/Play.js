class Play extends Phaser.Scene {
    constructor() {
        super('playScene');
    }

    preload() {
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('fastship', './assets/ship2.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.spritesheet('explosion', './assets/explosion.png', { frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9 });
        this.load.image('explosion_particle', './assets/explosion_particle.png');
        this.load.audio('sfx_menu','./assets/menu_music.wav');
    }

    create() {
        let mmusic = this.sound.add("sfx_menu", {volume: 1, loop: true});
        mmusic.play()
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);

        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);

        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);

        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(.5, 0);
        this.ship01 = new Spaceship(this, game.config.width + borderUISize * 6, borderUISize * 4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize * 3, borderUISize * 5 + borderPadding * 2, 'spaceship', 0, 20).setOrigin(0, 0);
        this.ship03 = new Ship2(this, game.config.width, borderUISize * 6 + borderPadding * 4, 'fastship', 0, 10).setOrigin(0, 0);


        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
        
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0 }),
            frameRate: 30,
        });

        this.p1Score = 0;
        this.scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100,
        };
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding * 2, this.p1Score, this.scoreConfig);

        // game over
        this.gameOver = false;

        // clock
        this.scoreConfig.fixedWidth = 0;
        this.timeRemaining = game.settings.gameTimer;
        this.clock = this.time.delayedCall(this.timeRemaining, () => {
            this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', this.scoreConfig).setOrigin(.5);
            this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (R) to Restart or <- for Menu', this.scoreConfig).setOrigin(.5);
            this.gameOver = true;
        }, null, this);
        let timeConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100,
        };
        this.timeRemainingText = this.add.text(game.config.width - 2*(borderUISize + borderPadding) - (borderUISize + borderPadding * 2), borderUISize + borderPadding * 2, Math.round(this.timeRemaining / 1000), timeConfig);
        this.timeRemainingClock = this.time.addEvent({
            callback: () => {
                if (this.gameOver) {
                    this.timeRemainingClock.remove();
                }

                this.timeRemaining -= 100;
                this.add.text(game.config.width - 2*(borderUISize + borderPadding) - (borderUISize + borderPadding * 2), borderUISize + borderPadding * 2, Math.round(this.timeRemaining / 1000), timeConfig);  
            },
            callbackScope: this,
            delay: 100,
            loop: true,
        });
        
        // explosion particles
        this.particleEmitter = this.add.particles(0, 0, 'explosion_particle', {
            frequency: -1, // put in explode mode
            speed: 200,
            lifespan: 200,
            bounds: {
                x: borderUISize,
                y: borderUISize + borderPadding + borderUISize * 2,
                width: game.config.width - 2 * borderUISize,
                height: game.config.height - borderUISize - (borderUISize + borderPadding + borderUISize * 2),
            }
        })
    }

    update() {
        this.starfield.tilePositionX -= 4;

        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start('menuScene');
        }

        if (!this.gameOver) {
            this.p1Rocket.update();
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
        }

        if (this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
    }

    checkCollision(rocket, ship) {
        if (rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height && 
            rocket.height + rocket.y > ship.y) {
            return true;
        } else {
            return false;
        }
    }

    shipExplode(ship) {
        ship.alpha = 0;
        console.log("hi");
        this.particleEmitter.explode(15, ship.x, ship.y)

        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
        });

        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;

        this.timeRemaining += 2 * 1000;
        this.time.removeEvent(this.clock);
        this.clock = this.time.delayedCall(this.timeRemaining, () => {
            this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', this.scoreConfig).setOrigin(.5);
            this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (R) to Restart or <- for Menu', this.scoreConfig).setOrigin(.5);
            this.gameOver = true;
        }, null, this);
        
        let eChoice = Math.floor(Math.random() * 4);
        console.log(eChoice);
        console.log(typeof eChoice);
        if (eChoice === 0) {
            this.sound.play('sfx_explosion1');
        }
        else if (eChoice === 1) {
            this.sound.play('sfx_explosion2');
        }
        else if (eChoice === 2) {
            this.sound.play('sfx_explosion3');
        }
        else {
            this.sound.play('sfx_explosion4');
        }
    }
}
