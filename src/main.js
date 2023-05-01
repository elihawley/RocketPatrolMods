// Elia Hawley
// Rocket Patrol 2
// Took around 8 hours to complete
// The mods I chose: create 4 new explosion sounds (10 points), create a new enemy spaceship (15 points),
// add time for successful hits (15 points), display remaining time on screen (10 points), 
// PARTICLE EXPLOSION (15 points), mouse control (15 points), background music (5 points)
let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    scene: [ Menu, Play ],
};

let game = new Phaser.Game(config);

let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;

let keyF, keyR, keyLEFT, keyRIGHT;