import Stage1 from './src/stage1.js';
var config={
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    backgroundColor: '#4287f5'
}
const game = new Phaser.Game(config);
game.scene.add('stage1', Stage1);
game.scene.start('stage1');