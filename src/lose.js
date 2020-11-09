var Lose = {};
Lose.key = 'lose';
Lose.preload = function() {
    Lose.scene = this;
    Lose.options = ["tutorial", "stage1"];
    //https://www.needpix.com/photo/571005/wood-texture-background-structure-grain-textures-boards-plank-fence-table - wood
    Lose.scene.load.image('title', './Sprites/signs/title.png')
    Lose.scene.load.image('tutorial', './Sprites/signs/Tutorial.png');   
    //Menu.scene.load.image('select', './Sprites/signs/level select.png');
    Lose.scene.load.image('notutorial', './Sprites/signs/notutorial.png');
    
}

Lose.create = function() {
    Lose.title = this.add.image(400, 100, 'title').setScale(4);
    Lose.tutorial = this.add.image(400, 300, 'tutorial').setName('tutorial').setScale(2).setInteractive();
    //Menu.select = this.add.image(300, 360, 'select').setName('select').setScale(2).setInteractive(true);
    Lose.notutorial = this.add.image(400, 420, 'notutorial').setName('notutorial').setScale(2).setInteractive();
    this.input.once('gameobjectdown', function (pointer, gameObject){
        if (gameObject.name == 'tutorial'){
            console.log('tutorial');
            //game.scene.remove('lose');
            game.scene.start('tutorial');
        }
        else if (gameObject.name == 'notutorial'){
            console.log("hmmmmmn");
            //game.scene.remove('lose');
            game.scene.stop('lose');
            game.scene.start('stage1');
        }
    }, Lose);
}