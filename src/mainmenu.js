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
    
}

Menu.create = function() {
    Menu.title = this.add.image(400, 100, 'title').setScale(4);
    Menu.tutorial = this.add.image(400, 300, 'tutorial').setName('tutorial').setScale(2).setInteractive();
    //Menu.select = this.add.image(300, 360, 'select').setName('select').setScale(2).setInteractive(true);
    Menu.notutorial = this.add.image(400, 420, 'notutorial').setName('notutorial').setScale(2).setInteractive();
    this.input.on('gameobjectdown', function (pointer, gameObject){
        if (gameObject.name == 'tutorial'){
            game.scene.start('tutorial');
        }
        else if (gameObject.name == 'notutorial'){
            game.scene.start('stage1');
        }
    }, Menu);
}