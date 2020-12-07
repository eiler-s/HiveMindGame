var Menu = {};
Menu.key = 'menu';
Menu.preload = function() {
    Menu.scene = this;
    Menu.options = ["tutorial", "stage1"];
    //https://www.needpix.com/photo/571005/wood-texture-background-structure-grain-textures-boards-plank-fence-table - wood
    Menu.scene.load.image('title', './Sprites/signs/title.png')
    Menu.scene.load.image('tutorial', './Sprites/signs/Tutorial.png');   
    //Menu.scene.load.image('select', './Sprites/signs/level select.png');
    Menu.scene.load.image('notutorial', './Sprites/signs/notutorial.png');
    Menu.scene.load.image('credits', './Sprites/signs/credits.png');
    
    Menu.scene.load.image('bigFlag', './Sprites/texasFlagBig.png');
    Menu.scene.load.audio('menuMusic', './Sound/Rolling_Hills_-_Cristiano_Corradetti.mp3');
}

Menu.create = function() {
    Menu.bkg = this.add.image(0,0,'bigFlag').setOrigin(0,0);
    Menu.title = this.add.image(400, 100, 'title').setScale(4);
    Menu.tutorial = this.add.image(400, 300, 'tutorial').setName('tutorial').setScale(2).setInteractive();
    Menu.tutorial.on('pointerover' , (pointer) => { Menu.tutorial.setTint(0x808080);});
    Menu.tutorial.on('pointerout' , (pointer) => Menu.tutorial.setTint(0xffffff));
    //Menu.select = this.add.image(300, 360, 'select').setName('select').setScale(2).setInteractive(true);
    Menu.notutorial = this.add.image(400, 420, 'notutorial').setName('notutorial').setScale(2).setInteractive();
    Menu.notutorial.on('pointerover' , (pointer) => { Menu.notutorial.setTint(0x808080);});
    Menu.notutorial.on('pointerout' , (pointer) => Menu.notutorial.setTint(0xffffff));
    Menu.credits = this.add.image(400, 540, 'credits').setName('credits').setScale(2).setInteractive();
    Menu.credits.on('pointerover' , (pointer) => { Menu.credits.setTint(0x808080);});
    Menu.credits.on('pointerout' , (pointer) => Menu.credits.setTint(0xffffff));
    
    Menu.music = Menu.scene.sound.add('menuMusic', { volume: 0.1, loop: true });
    Menu.music.play()
    
    this.input.once('gameobjectdown', function (pointer, gameObject){
        if (gameObject.name == 'tutorial'){
            Menu.tutorial.setTint(0x606060);
            setTimeout(function(){ Menu.tutorial.clearTint(); }, 300);
            setTimeout(function(){
                Menu.music.stop();
                game.scene.stop('menu');
                game.scene.start('tutorial');
            }, 600);
        }
        else if (gameObject.name == 'notutorial'){
            Menu.notutorial.setTint(0x606060);
            setTimeout(function(){ Menu.notutorial.clearTint(); }, 300);
            setTimeout(function(){
                Menu.music.stop();
                game.scene.stop('menu');
                game.scene.start('stage1');
            }, 600);
        }
        else if (gameObject.name == 'credits'){
            Menu.credits.setTint(0x606060);
            setTimeout(function(){ Menu.credits.clearTint(); }, 300);
            setTimeout(function(){
                Menu.music.stop();
                game.scene.stop('menu');
                game.scene.start('credits');
            }, 600);
        }
    }, Menu);
}