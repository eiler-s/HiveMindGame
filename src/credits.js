var Credits = {};
var text = 'Attributions\n'+
'easystar-0.4.3.js - https://easystarjs.com/\n'+
'phaser.js - phaser.io\n'+
'Music\n'+
'Background Music - Fesliyan Studios\n'+
'run - http://soundbible.com/1979-Cartoon-Running.html\n'+
'shoot - http://soundbible.com/2071-Winchester-1873-Single-Shots.html\n'+
'hawk - http://soundbible.com/1844-Hawk-Screeching.html\n'+
'train - http://soundbible.com/2177-Steam-Train-Whistle.html\n'+
'Credits\n'+
'Kevin Woo\n'+
'Eiler Schiotz\n'+
'Henry Arjet';
Credits.key = 'credits';
Credits.preload = function(){
    Credits.scene = this;
    Credits.scene.load.image('back', './Sprites/signs/back.png'); 
}

Credits.create = function(){
    Credits.text = this.add.text(0, 0, text);
    Credits.back = this.add.image(400, 540, 'back').setName('back').setScale(2).setInteractive();
    this.input.once('gameobjectdown', function (pointer, gameObject){
        if (gameObject.name == 'back'){
            Credits.back.setTintFill(0xffffff);
            setTimeout(function(){ Credits.back.clearTint(); }, 300);
            setTimeout(function(){
                game.scene.stop('credits');
                game.scene.start('menu');
            }, 600);
        }
    });
}
