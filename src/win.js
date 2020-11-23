var Win = {};
Win.key = 'win';
Win.preload = function() {
    Win.scene = this;
    Win.scene.load.image('win', './Sprites/signs/win1.png')
    Win.scene.load.image('playAgainButton', './Sprites/signs/playAgainButton1.png');   
    
}

Win.create = function() {
    console.log('you won!');
    Win.title = this.add.image(400, 100, 'win').setScale(4);
    Win.playAgain = this.add.image(400, 300, 'playAgainButton').setName('playAgain').setScale(2).setInteractive();
    this.input.once('gameobjectdown', function (pointer, gameObject){
        if (gameObject.name == 'playAgain'){
            Win.playAgain.setTintFill(0xffffff);
            setTimeout(function(){ Win.playAgain.clearTint(); }, 300);
            setTimeout(function(){
                game.scene.stop('win');
                game.scene.start('menu');
            }, 600);
        }
    }, Win);
}