var Credits = {};
var text = 'Attributions:\n'+
'easystar-0.4.3.js pathfinding - https://easystarjs.com/ \n'+
'phaser.js game framework- phaser.io \n'+
'\n'+
'Background Music Credit Goes to Fesliyan Studios:\n'+
'Riding Solo by David Fesliyan \n'+
'Old West Gunslingers by Steve Oxen \n'+
'Western Cowboy Ride by David Fesliyan \n'+
'Rolling Hills by Cristiano Corradetti \n'+
'\n'+
'Sound Effects:\n'+
'run sound effect from http://soundbible.com/1979-Cartoon-Running.html \n'+
'shoot sound effect from http://soundbible.com/2071-Winchester-1873-Single-Shots.html \n'+
'hawk sound effect from http://soundbible.com/1844-Hawk-Screeching.html \n'+
'train sound effect from http://soundbible.com/2177-Steam-Train-Whistle.html \n'+
'\n'+
'Game Creation Credits:\n'+
'Kevin Woo - programmer, game architect \n'+
'Eiler Schiotz - programmer, sprite artist \n'+
'Henry Arjet - programmer, level designer \n';

Credits.key = 'credits';
Credits.preload = function(){
    Credits.scene = this;
    Credits.scene.load.image('back', './Sprites/signs/back.png'); 
}

Credits.create = function(){
    Credits.text = this.add.text(0, 0, text);
    Credits.back = this.add.image(400, 540, 'back').setName('back').setScale(2).setInteractive();
    Credits.back.on('pointerover' , (pointer) => Credits.back.setTint(0x808080));
    Credits.back.on('pointerout' , (pointer) => Credits.back.setTint(0xffffff));

    this.input.once('gameobjectdown', function (pointer, gameObject){
        if (gameObject.name == 'back'){
            Credits.back.setTint(0x606060);
            setTimeout(function(){ Credits.back.clearTint(); }, 300);
            setTimeout(function(){
                game.scene.stop('credits');
                game.scene.start('menu');
            }, 600);
        }
    });
}
