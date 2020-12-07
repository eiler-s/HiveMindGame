var Win = {};
Win.key = 'win';
Win.preload = function() {
    Win.scene = this;
    Win.scene.load.image('win', './Sprites/signs/win1.png')
    Win.scene.load.image('playAgainButton', './Sprites/signs/playAgainButton1.png');   
    Win.scene.load.audio('winMusic', './Sound/Western_Cowboy_Ride_-_David_Fesliyan.mp3');
    Win.scene.load.image('steaks', './Sprites/steaks.png');
}

Win.create = function() {
    console.log('you won!');
    Win.bkg = this.add.image(0, 0, 'steaks').setOrigin(0,0);
    Win.title = this.add.image(400, 100, 'win').setScale(4);
    
    Win.music = Win.scene.sound.add('winMusic', { volume: 0.1, loop: true });
    Win.music.play();

    Win.playAgain = this.add.image(400, 300, 'playAgainButton').setName('playAgain').setScale(2).setInteractive();
    Win.playAgain.on('pointerover' , (pointer) => Win.playAgain.setTint(0x808080));
    Win.playAgain.on('pointerover' , (pointer) => Win.playAgain.setTint(0xffffff));

    this.input.once('gameobjectdown', function (pointer, gameObject){
        if (gameObject.name == 'playAgain'){
            Win.playAgain.setTintFill(0xffffff);
            setTimeout(function(){ Win.playAgain.clearTint(); }, 300);
            setTimeout(function(){
                Win.music.stop();
                game.scene.stop('win');
                game.scene.start('menu');
            }, 600);
        }
    }, Win);
}