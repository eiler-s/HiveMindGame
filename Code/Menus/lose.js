var Lose = {};
Lose.key = 'lose';
Lose.preload = function() {
    Lose.scene = this;
    Lose.scene.load.image('loseTitle', '../../Sprites/signs/Lose1.png')
    Lose.scene.load.image('playAgainButton', '../../Sprites/signs/playAgainButton1.png');
    Lose.scene.load.audio('loseMusic', '../../Sound/Riding_Solo_-_David_Fesliyan.mp3');
    Lose.scene.load.image('comeTakeIt', '../../Sprites/comeTakeIt.png');
}

Lose.create = function() {
    console.log('you lost');
    Lose.bkg = this.add.image(0, 0, 'comeTakeIt').setOrigin(0,0);
    Lose.title = this.add.image(400, 100, 'loseTitle').setScale(4);
    Lose.playAgain = this.add.image(400, 300, 'playAgainButton').setName('playAgain').setScale(2).setInteractive();
    
    Lose.playAgain.on('pointerover' , (pointer) => Lose.playAgain.setTint(0x808080));
    Lose.playAgain.on('pointerout' , (pointer) => Lose.playAgain.setTint(0xffffff));
    Lose.music = Lose.scene.sound.add('loseMusic', { volume: 0.1, loop: true });
    Lose.music.play();

    this.input.once('gameobjectdown', function (pointer, gameObject){
        if (gameObject.name == 'playAgain'){
            Lose.playAgain.setTintFill(0xffffff);
            setTimeout(function(){ Lose.playAgain.clearTint(); }, 300);
            setTimeout(function(){
                Lose.music.stop();
                game.scene.stop('lose');
                game.scene.start('menu');
            }, 600);
        }
    }, Lose);
}