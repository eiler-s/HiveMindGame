    var tutorial = {};
    tutorial.key = 'tutorial';

    tutorial.playSound=function(name){
        switch (name){
            case 'cowhandDeath':
                tutorial.sfx.cowhandDeath.play();
                break;
            case 'run':
                tutorial.sfx.run.play();
                break;
            case 'shoot':
                tutorial.sfx.shoot.play();
                break;
            case 'hawk':
                tutorial.sfx.hawk.play();
                break;
            case 'train':
                tutorial.sfx.train.play();
            case 'eat':
                tutorial.sfx.eat.play();
        }
    }

    tutorial.stopSound = function(name){
        switch (name){
            case 'run':
                tutorial.sfx.run.stop();
        }
    }

    tutorial.preload=function(){
        tutorial.scene = this;

        //Load audio files
        tutorial.scene.load.audio('music', './Sound/Old_West_Gunslingers_Steve_Oxen.mp3');
        tutorial.scene.load.audio('cowhandDeath', './src/sound/death.mp3');
        tutorial.scene.load.audio('run', './Sound/running_feet_-Cam-942211296.mp3');
        tutorial.scene.load.audio('shoot', './Sound/shoot.mp3');
        tutorial.scene.load.audio('hawk', './Sound/hawk_screeching-Mike_Koenig-1626170357.mp3');
        tutorial.scene.load.audio('train', './Sound/train.mp3');
        tutorial.scene.load.audio('eat', './Sound/eat.mp3');

        //loads background
        tutorial.scene.load.image('Backgrounds', "./src/sprites/bgSheet1.png");
        tutorial.scene.load.image('bg','./Sprites/bgSheet2.png');

        //Load tilemap images and map layout files
        tutorial.scene.load.image('tilemap', "./src/sprites/tilemap.png");
        tutorial.scene.load.image('red', './src/sprites/red.png');
        tutorial.scene.load.tilemapTiledJSON('tutmap', './src/tilemaps/tutorialMap.json');
        tutorial.scene.load.image('flag', './Sprites/terrain/Texas_flag.png');

        //Load next turn button
        tutorial.scene.load.image('nextTurn', "./src/sprites/nextTurnButton.png");

        //Load the aimcone
        tutorial.scene.load.image('aimcone', "./src/sprites/aimcone1.png");

        //Load character spritesheets
        tutorial.scene.load.spritesheet('bug', './Sprites/hunters/huntersheet.png',{
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2
        });
        tutorial.scene.load.spritesheet('cowboy', './Sprites/cowhands/cowboysheet.png',{
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2
        });
        tutorial.scene.load.spritesheet('cowgirl', './Sprites/cowhands/cowgirlsheet.png',{
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2
        });
        tutorial.scene.load.spritesheet('farmer', './Sprites/farmers/farmer.png',{
            frameWidth:32,
            frameHeight:32,
        });
        tutorial.scene.load.spritesheet('farmwoman', './Sprites/farmers/farmwoman.png',{
            frameWidth:32,
            frameHeight:32,
        });
        tutorial.scene.load.spritesheet('health1', './src/sprites/Health11.png',{
            frameWidth:32,
            frameHeight:32,
        });
        tutorial.scene.load.spritesheet('health2', './src/sprites/Health21.png',{
            frameWidth:32,
            frameHeight:32,
        });
        tutorial.scene.load.spritesheet('health3', './src/sprites/Health31.png',{
            frameWidth:32,
            frameHeight:32,
        });
        tutorial.scene.load.spritesheet('health4', './src/sprites/Health41.png',{
            frameWidth:32,
            frameHeight:32,
        });

        //Load images for textboxes
        tutorial.scene.load.image('farmerBig','./Sprites/farmers/farmer2.png');
        tutorial.scene.load.image('farmwomanBig','./Sprites/farmers/farmwoman2.png');
        tutorial.scene.load.image('cowboyBig','./Sprites/cowhands/cowboy2.png');
        tutorial.scene.load.image('cowgirlBig','./Sprites/cowhands/cowgirl2.png');
        tutorial.scene.load.image('alienBig','./Sprites/hunters/hunter2.png');
        tutorial.scene.load.spritesheet('arrows','./Sprites/arrows/arrows.png',{
            frameWidth:32,
            frameHeight:32,
            margin:1,
            spacing:2
        });
    }

    tutorial.create=function(){
        graphics = this.add.graphics();

        //turn counter
        tutorial.turnCounter = this.add.text(620,20, "Turns: 1").setDepth(12).setScrollFactor(0);
        tutorial.turnCounter.setFont('georgia').setFontSize(30).setFontStyle('bold').setColor('black');
        tutorial.turnCounter.turn = 1;
        tutorial.turnCounter.inc = () => {tutorial.turnCounter.turn++; tutorial.turnCounter.setText("Turns: " + tutorial.turnCounter.turn);}

        //used for consume function
        tutorial.eatMode = false;

        //make the next turn button
        tutorial.nextTurn = this.add.image(0,408,'nextTurn').setDepth(5).setScrollFactor(0).setInteractive().setName("nextTurn");
        tutorial.nextTurn.setOrigin(0,0);
        tutorial.nextTurn.on('pointerover' , (pointer) => tutorial.nextTurn.setTint(0x808080));
        tutorial.nextTurn.on('pointerout' , (pointer) => tutorial.nextTurn.setTint(0xffffff));

        //place an aimcone
        tutorial.aimcone = this.add.image(0,0,'aimcone').setDepth(5).setVisible(false);     

        //end turn on space, purposefully commented out
        //this.input.keyboard.on('keydown-SPACE', tutorial.endTurn);

        //Create the music and sound effects using loaded audio
        tutorial.music = tutorial.scene.sound.add('music', { volume: 0.1, loop: true });
        tutorial.music.play();
        tutorial.sfx = {};
        tutorial.sfx.cowhandDeath = tutorial.scene.sound.add('cowhandDeath', {volume: 0.1});
        tutorial.sfx.run = tutorial.scene.sound.add('run', {volume: 0.1});
        tutorial.sfx.shoot = tutorial.scene.sound.add('shoot', {volume: 0.1});
        tutorial.sfx.hawk = tutorial.scene.sound.add('hawk', {volume: 0.1});
        tutorial.sfx.train = tutorial.scene.sound.add('train', {volume: 0.1});
        tutorial.sfx.eat = tutorial.scene.sound.add('eat', {volume: 0.2});

        //Define user turn, selected unit, and path storage
        tutorial.currentBug = null;
        tutorial.paths = [];

        //Create game map and tileset
        var config = {
            key: 'tutmap',
            tileWidth: 32,
            tileHeight: 32
        }
        tutorial.map = this.make.tilemap(config);
        tutorial.tiles = tutorial.map.addTilesetImage('tilemap');
        tutorial.bgTiles = tutorial.map.addTilesetImage('Backgrounds');
        tutorial.background = tutorial.map.createStaticLayer('background', tutorial.bgTiles, 0, 0);
        tutorial.terrain = tutorial.map.createStaticLayer('terrain', tutorial.tiles, 0, 0);
        tutorial.top = tutorial.map.createBlankDynamicLayer('tilemap', tutorial.tiles, 0, 0);
        
        //Makes sure terrain layer is selected so that obstacles can be found
        tutorial.map.setLayer('terrain');

        //Make a matrix that corresponds each terrain map pixel to a tile ID
        tutorial.terrainGrid =[];
        for (var y=0; y < tutorial.map.height; y++){
            var col = [];
            for (var x = 0; x < tutorial.map.width; x++){
                col.push(tutorial.getTileID(x, y));
            }
            tutorial.terrainGrid.push(col);
        }

        //Create bug objectlayer from JSON then corresponding sprite group
        tutorial.bugLayer = tutorial.map.getObjectLayer('bug')['objects'];
        tutorial.bugs = this.add.group();

        //Create animations for bug movement
        this.anims.create({
            key: 'bDown',
            frames: this.anims.generateFrameNumbers('bug', { start: 1, end: 2 }),
            frameRate: 10,
            repeat: -1  //consider removing repeats depending on implementation?
        });
        this.anims.create({
            key: 'bLeft',
            frames: this.anims.generateFrameNumbers('bug', { start: 3, end: 4 }),
            frameRate: 10,
            repeat: -1  //consider removing repeats depending on implementation?
        });
        this.anims.create({
            key: 'bRight',
            frames: this.anims.generateFrameNumbers('bug', { start: 5, end: 6 }),
            frameRate: 10,
            repeat: -1  //consider removing repeats depending on implementation?
        });
        this.anims.create({
            key: 'bUp',
            frames: this.anims.generateFrameNumbers('bug', { start: 7, end: 8 }),
            frameRate: 10,
            repeat: -1  //consider removing repeats depending on implementation?
        });
        this.anims.create({
            key: 'bIdle',
            frames: [{ key: 'bug', frame: 0 }]
        });

        //Generate health bar frames
        this.anims.create({
            key: 'health1',
            frames: [{ key: 'health1', frame: 0 }]
        });
        this.anims.create({
            key: 'health2',
            frames: [{ key: 'health2', frame: 0 }]
        });
        this.anims.create({
            key: 'health3',
            frames: [{ key: 'health3', frame: 0 }]
        });
        this.anims.create({
            key: 'health4',
            frames: [{ key: 'health4', frame: 0 }]
        });

        //Instantiate the bugs on the map
        tutorial.bugLayer.forEach(object => {
            //create a container to do the logic, and to hold both the bug sprite and the health bar
            let con = this.add.container (object.x, object.y - object.height);
            tutorial.bugs.add(con);
            con.spr = this.add.sprite(0,0,"bug");
            con.bar = this.add.sprite(0,32,"bar");
            con.add(con.spr);
            con.add(con.bar);
            con.name = "bug";
            con.setDepth(1);
            con.spr.setDepth(1);
            con.bar.setDepth(2);
            con.spr.setOrigin(0);
            con.bar.setOrigin(0);
            var rect = new Phaser.Geom.Rectangle(0, 0, 32, 32);
            con.setInteractive(rect, Phaser.Geom.Rectangle.Contains); 
            con.spr.anims.play('bIdle');
            con.spent = false;
            con.health = 3;
            tutorial.updateHealth(con);
        });

        //Create cowhands objectlayer from JSON then corresponding sprite group
        tutorial.cowhandLayer = tutorial.map.getObjectLayer('cowhand')['objects'];
        tutorial.cowhands = this.add.group();

        //Create animations for cowboy movement
        this.anims.create({
            key: 'cbDown',
            frames: [{ key: 'cowboy', frame: 3 }]
        });
        this.anims.create({
            key: 'cbLeft', 
            frames: [{ key: 'cowboy', frame: 1 }] 
        });
        this.anims.create({
            key: 'cbRight',
            frames: [{ key: 'cowboy', frame: 2 }]
        });
        this.anims.create({
            key: 'cbUp',
            frames: [{ key: 'cowboy', frame: 0 }]
        });

        //Create animations for cowgirl movement
        this.anims.create({
            key: 'cgDown',
            frames: [{ key: 'cowgirl', frame: 0 }]
        });
        this.anims.create({
            key: 'cgLeft',
            frames: [{ key: 'cowgirl', frame: 1 }]
        });
        this.anims.create({
            key: 'cgRight',
            frames: [{ key: 'cowgirl', frame: 2 }]
        });
        this.anims.create({
            key: 'cgUp',
            frames: [{ key: 'cowgirl', frame: 3 }]
        });

        //Instantiate the cowhands on the map
        tutorial.genderCount = 0;
        tutorial.cowhandLayer.forEach(object => {
            //selects the gender of the cowhands
            tutorial.genderCount ++;
            var gender;
            var prefix;
            if (tutorial.genderCount == 1){
                gender = "cowboy";
                prefix = "cb";
            } else {
                gender = "cowgirl";
                prefix = "cg";
            }

            //create cowhand and identify position on grid
            let obj = tutorial.cowhands.create(object.x, object.y - object.height, gender);
            obj.name = "cowhand";
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.disableInteractive();
            obj.visible = false;
            tutorial.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)] = 9;
            
            obj.rotate = function(dir) {
                obj.dir = dir;
                switch (dir){
                    case 0:
                        obj.anims.play(prefix+"Up");
                        break;
                    case 1:
                        obj.anims.play(prefix+"Left");
                        break;
                    case 2:
                        obj.anims.play(prefix+"Right");
                        break;
                    case 3:
                        obj.anims.play(prefix+"Down");
                        break;
                }
            }

            //Randomly select the orientation of the cowhands
            var randInt03 = Math.floor(Math.random()*4); //Randomly selects 0, 1, 2, or 3

            obj.rotate(randInt03);
            
            obj.on('pointerover', function (pointer, lX, lY) {
                tutorial.aimcone.setVisible(true);
                if (this.dir == 0){
                    tutorial.aimcone.setRotation(1.5*3.14159).setPosition(this.x+16, this.y+80);
                }
                if (this.dir == 1){
                    tutorial.aimcone.setRotation(0).setPosition(this.x-48, this.y+16);
                }
                if (this.dir == 2){
                    tutorial.aimcone.setRotation(1*3.14159).setPosition(this.x+80, this.y+16);
                }
                if (this.dir == 3){
                    tutorial.aimcone.setRotation(0.5*3.14159).setPosition(this.x+16, this.y-48);
                }
            });
            obj.on('pointerout', function (pointer) {
               tutorial.aimcone.setVisible(false);
            });             
        });

        //Create farmer objectlayer from JSON then corresponding sprite group
        tutorial.farmerLayer = tutorial.map.getObjectLayer('farmer')['objects'];
        tutorial.farmers = this.add.group();

        //Instantiate the farmers on the map
        tutorial.farmerLayer.forEach(object => {
            //select the gender of the farmers
            var gender;
            tutorial.genderCount ++;
            if (tutorial.genderCount == 3){
                gender = "farmer";
            } else {
                gender = "farmwoman";
            }

            //create farmer and identify position on grid
            let obj = tutorial.farmers.create(object.x, object.y - object.height, gender);
            obj.name = "farmer";
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.disableInteractive();
            obj.visible = false;
            tutorial.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)]=10;
        });
        
        //Create a group for the objects representing the game objective
        tutorial.objectiveLayer = tutorial.map.getObjectLayer('objective')['objects'];
        tutorial.objectives = this.add.group();

        //Instantiate objectives on the map
        tutorial.objectiveLayer.forEach(object=>{
            let obj = tutorial.objectives.create(object.x, object.y - object.height, 'flag');
            obj.name = 'objective';
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.disableInteractive();
            obj.visible = false;
            tutorial.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)]=11;
        })

        //Create movement tile group
        tutorial.moveTiles = this.add.group();

        //Assigns arrow keys to cursors
        //tutorial.cursors = this.input.keyboard.createCursorKeys();
        //Assigns wasd keys to cursors
        tutorial.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        //Move main camera with cursors
        var controlConfig = {
            camera: this.cameras.main,
            left: tutorial.cursors.left,
            right: tutorial.cursors.right,
            up: tutorial.cursors.up,
            down: tutorial.cursors.down,
            acceleration : 1,
            drag: 1,
            maxSpeed: 1
        };
        tutorial.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        //Makes a square (marker) follow cursor
        tutorial.marker = this.add.graphics();
        tutorial.marker.lineStyle(3, 0xffffff, 1);
        tutorial.marker.strokeRect(0,0, tutorial.map.tileWidth, tutorial.map.tileHeight);

        //Set up camera and map bounds
        tutorial.cam = this.cameras.main;
        tutorial.cam.setBounds(0,0, 25*32, 15*32);
        //tutorial.temp = this.add.graphics().setScrollFactor(0); //shows dead zone for camera
        //tutorial.temp.strokeRect(50,50,tutorial.cam.deadzone.width,tutorial.cam.deadzone.height);
        
        //message when eat when full
        tutorial.famished = this.add.text(400,300, 'This alien is full').setDepth(3).setScrollFactor(0).setVisible(false).setOrigin(.5,.5);
        //transition screens
        tutorial.alienTransition = this.add.text(400, 300, 'Alien\'s Turn',{fontFamily:'Eater', fontSize: '50px', color: '#008040'}).setOrigin(.5,.5).setScrollFactor(0).setAlpha(0).setDepth(4);
        tutorial.cowboyTransition = this.add.text(400, 300, 'Cowboy\'s Turn',{fontFamily:'Rye', fontSize: '50px', color: '#000000'}).setOrigin(.5,.5).setScrollFactor(0).setAlpha(0).setDepth(4);

        //Initializes pathfinder
        tutorial.finder = new EasyStar.js();
        tutorial.finder.setGrid(tutorial.terrainGrid);

        //Check each tile to see if it can be moved on
        var tileset = tutorial.map.tilesets[0];
        var properties = tileset.tileProperties;
        tutorial.acceptableTiles=[];
        for (var i = tileset.firstgid-1; i < tutorial.tiles.total; i++){
            // tiles without any properties are assumed to be acceptable
            if(!properties.hasOwnProperty(i)) {
                tutorial.acceptableTiles.push(i+1);
                continue;
            }
            if(!properties[i].collide) tutorial.acceptableTiles.push(i+1); //registers tiles that are not collidable
            if(properties[i].cost) tutorial.finder.setTileCost(i+1, properties[i].cost); // registers cost
        }
        tutorial.finder.setAcceptableTiles(tutorial.acceptableTiles);

        //Event emitters used to control progress of tutorial, see listeners above the narrative json
        tutorial.emitter = new Phaser.Events.EventEmitter();

        //CLICK LISTENER
        tutorial.scene.input.on('gameobjectdown', function (pointer, gameObject) {
            //On their turn, the player can move units that have not yet done so
            if (gameObject.name == 'bug' && gameObject.spent == false && tutorial.currentBug == null){
                tutorial.moveTiles.clear(true, true); //get rid of move tiles
                tutorial.currentBug = gameObject;
                tutorial.map.setLayer('terrain');

                gameObject.isSelected = true;
                tutorial.emitter.emit('alienSelected');

                //Determine origin of unit's move range
                tutorial.originX = Math.floor(gameObject.x/32);
                tutorial.originY = Math.floor((gameObject.y)/32);

                //Identify tiles in the unit's move range
                var shape = new Phaser.Geom.Circle(tutorial.originX*32, tutorial.originY*32, 5*32);
                //need to specify the terrain layer for getting the tiles
                var squares = tutorial.map.getTilesWithinShape(shape, null, tutorial.cam, 'terrain');

                for (var i=0; i < squares.length; i++){
                    //Use a callback function to filter the path finder for acceptable paths
                    tutorial.finder.findPath(tutorial.originX, tutorial.originY, squares[i].x, squares[i].y, function(path){
                        if (path !== null){ //If there is a tile that's chosen that's impossible to get to, path would be null.
                            //If the most direct path is greater than 5, then it won't be displayed
                            if (path.length <= 5 && path.length != 0){  //Store each acceptable path's tile destination
                                tutorial.pathStorage(path)
                            }
                        }
                    });
                    tutorial.finder.calculate();
                }
            }
            //If the player has already selected a unit, show available move tiles
            else if (gameObject.name == 'red' && tutorial.alienDisabled !== true){
                //Check each availble path to see if selected tile is in range
                for (var i = 0; i < tutorial.paths.length; i++){
                    //If a selected tile is a path destination, move the bug to that destination
                    if (tutorial.paths[i][tutorial.paths[i].length - 1].x == (gameObject.x/32) && tutorial.paths[i][tutorial.paths[i].length - 1].y == (gameObject.y/32)){
                        tutorial.moveBug(tutorial.paths[i]);
                        tutorial.paths = [];
                        tutorial.emitter.emit('oneAlienMoved');

                        //Count the number of bugs moved
                        var numSpent = 0;
                        tutorial.bugs.getChildren().forEach(bug =>{
                            if (bug.spent == true){
                                numSpent ++;
                            }
                        });

                        let numBugs = tutorial.bugs.getChildren().length;
                        if (numBugs == numSpent){
                            tutorial.emitter.emit('allAliensMoved');
                        }
                    }
                }
                tutorial.moveTiles.clear(true, true); //get rid of move tiles
            }

            //end turn
            else if (gameObject.name == 'nextTurn'){
                tutorial.moveTiles.clear(true, true); //get rid of move tiles
                tutorial.currentBug = null;
                tutorial.endTurn();
                tutorial.emitter.emit('nextClick');
            }

            //ATTACK!
            //"Forward the Hive Brigade!"
            //Was there a bug dismayed?
            //Not though the hunter knew
            //  Hivemind had blundered.
            //  Theirs not to make reply,
            //  Theirs not to reason why,
            //  Theirs but to spawn and die
            //  Into the valley of Texas
            //  Swarmed the six hundred
        
            //If the player moves the bug to a human then the human will be killed
            else if ((gameObject.name == 'cowhand' || gameObject.name == 'farmer' || gameObject.name == 'objective') && tutorial.currentBug != null && !tutorial.currentBug.inMotion){
                let bug = tutorial.currentBug;

                let attackRange = 1.8;
                //square of the range. Faster to compute. 32 added to make it match the pixel count
                let attackRangeS = Math.pow(attackRange*32, 2);
                let distX = bug.x - gameObject.x;
                let distY = bug.y - gameObject.y;
                let distanceS = Math.pow(distX, 2) + Math.pow(distY, 2)
                
                //Check attack can go ahead
                if (distanceS < attackRangeS && bug.spent != true){
                    tutorial.currentBug = null;

                    tutorial.aimcone.setVisible(false);//no ghost aimcones

                    tutorial.moveTiles.clear(true, true); //get rid of move tiles
                    tutorial.paths = [];
                    
                    tutorial.currentBug = null;

                    if (gameObject.name != 'objective'){
                        tutorial.playSound('cowhandDeath');
                    }

                    if (gameObject.name == 'objective'){
                        tutorial.terrainGrid[Math.floor(gameObject.y/gameObject.height)][Math.floor(gameObject.x/gameObject.width)]=1;
                        tutorial.finder.setGrid(tutorial.terrainGrid);
                        gameObject.destroy();
                        
                        bug.spent = true;
                        bug.spr.setTint(0x808080);
                    }
                    else if (tutorial.eatMode){
                        if (bug.health >= 4){
                            tutorial.eatMode = false; //resets eatMode after a click
                            tutorial.famished.setPosition(bug.x + 16, bug.y).setVisible(true);
                            tutorial.scene.input.setDefaultCursor('default');
                            setTimeout(() => {tutorial.famished.setVisible(false);}, 3000);
                        } else {
                            tutorial.consume(gameObject, bug);
                            bug.spent = true;
                            bug.spr.setTint(0x808080);
                        }
                    }
                    else{
                        tutorial.spawn(gameObject);
                        gameObject.destroy();

                        bug.spent = true;
                        bug.spr.setTint(0x808080);
                    }

                    if (gameObject.name == 'farmer'){
                        tutorial.emitter.emit('oneFarmerDead');

                        let numFarmersAlive = tutorial.farmers.getChildren().length;
                        if (numFarmersAlive == 0){
                            tutorial.emitter.emit('allFarmersDead');
                        }
                    }

                    if (gameObject.name == 'cowhand'){
                        let numCowhandsAlive = tutorial.cowhands.getChildren().length;
                        if (numCowhandsAlive == 0){
                            tutorial.emitter.emit('allCowhandsDead');
                        }
                    }

                    //objectives check
                    if (tutorial.objectives.getChildren().length == 0){
                        tutorial.emitter.emit('allFlagsDestroyed');
                        tutorial.music.stop();                      
                        game.scene.stop('tutorial');
                        game.scene.start('win');
                    }
                }
            }
            //moves along tutorial narrative when textbutton clicked
            else if (gameObject.name == 'textBtn'){
                tutorial.emitter.emit('arrowClick');
            }
            //deselect a bug if it is already selected by clicking on it again
            else if (gameObject.name == 'bug' && gameObject.isSelected && gameObject.spent == false){
                tutorial.moveTiles.clear(true); //get rid of move tiles
                tutorial.currentBug = null;
                gameObject.isSelected = false;
            }

            tutorial.eatMode = false; //resets eatMode after a click
            tutorial.scene.input.setDefaultCursor('default');
        }, tutorial);
        
        //Periodically play environmental noises
        setInterval(function(){
            if (Math.random() < .7){
                tutorial.playSound('hawk');
            }
            else{
                tutorial.playSound('train');
            }
        }, 100000)

        //Create textbox images
        tutorial.textbox = this.add.rectangle(0, 472, 800, 128, 0x696969).setDepth(3).setScrollFactor(0).setOrigin(0,0);
        tutorial.speaker = this.add.image(0, 472, 'alienBig').setDepth(3).setScrollFactor(0).setOrigin(0,0);
        tutorial.text = this.add.text(128, 472, '').setDepth(3).setScrollFactor(0).setOrigin(0,0);
        tutorial.textBtn = this.add.sprite(640, 568, 'arrows').setDepth(3).setScrollFactor(0).setOrigin(0,0);
        tutorial.textBtn.name = 'textBtn';

        //Create animation for narration button
        this.anims.create({
            key: 'aDown',
            frames: this.anims.generateFrameNumbers('arrows', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        tutorial.textBtn.anims.play('aDown');

        //Start the tutorial narration
        tutorial.narIdx = 0;
        tutorial.progressStory();
    }

    //Create a movement tile at a path's destination
    tutorial.pathStorage = function(path){
        /**
         * input path is a possible path to take
         * output shows available paths as red squares
         */
        let obj = tutorial.moveTiles.create(path[path.length-1].x*32, path[path.length-1].y*32, 'red');
        obj.name = 'red';
        obj.setInteractive();
        obj.setOrigin(0);
        obj.setAlpha(.5);
        tutorial.paths.push(path);
    }

    //Moves the bug to a destination tile
    tutorial.moveBug = function(path){
        /**
         * input path is the chosen path
         * output moves the currentBug to destination
         */
        var timeline = tutorial.scene.tweens.createTimeline({useFrames:true});

        //don't let the bug do anything else
        tutorial.currentBug.spent = true;

        //let other functions know if the bug is moving
        tutorial.currentBug.inMotion = true;
        timeline.setCallback("onComplete", () => {
            tutorial.currentBug.inMotion = false;
            tutorial.currentBug.spr.setTint(0x808080);
            tutorial.currentBug = null;
        });

        var animQueue=[];

        //Creates a tween for each step of the bugs movement
        for (var i = 0; i < path.length-1; i++){
            //Get location of current tile in the path
            var xo = path[i].x;
            var yo = path[i].y;

            //Get location of next tile in the path
            var xf = path[i+1].x;
            var yf = path[i+1].y;

            //Get direction of next movement
            var xdir = xf - xo;
            var ydir = yf - yo;

            //Set animation frames to direction
            var dirKey;
            if (xdir > 0) {
                dirKey = 'bRight';
            } else if (xdir < 0) {
                dirKey = 'bLeft';
            } else if (ydir > 0) {
                dirKey = 'bUp';
            } else if (ydir < 0) {
                dirKey = 'bDown';
            }
            animQueue.push(""+dirKey);

            timeline.add({
                targets: tutorial.currentBug,
                x: xf*tutorial.map.tileWidth,
                y: yf*tutorial.map.tileHeight,
                duration: 10,

                onStart: function move() {  //play the anim when the tween starts
                    tutorial.playSound('run');
                    tempDir=animQueue.shift();
                    tutorial.currentBug.spr.anims.play(tempDir);
                },

                onComplete: function iddle() {   //stop anim when tween ends
                    tutorial.stopSound('run');
                    tutorial.currentBug.spr.anims.play('bIdle');
                }
            });
        }
        timeline.play();
        tutorial.moveTiles.clear(true, true);
    }

    tutorial.update = function(time, delta){
        tutorial.controls.update(delta)
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        
        //Rounds the cursor location to the nearest tile
        var pointerTileX = tutorial.map.worldToTileX(worldPoint.x);
        var pointerTileY = tutorial.map.worldToTileY(worldPoint.y);

        //Places the marker around the selected tile
        tutorial.marker.x = tutorial.map.tileToWorldX(pointerTileX);
        tutorial.marker.y = tutorial.map.tileToWorldY(pointerTileY);        
    }

    tutorial.toggleEatMode = function(){
        if (tutorial.eatMode){
            tutorial.eatMode = false; 
            tutorial.scene.input.setDefaultCursor('default');
            tutorial.emitter.emit('exitEat');

        }else{
            tutorial.eatMode = true; 
            tutorial.playSound('eat');
            tutorial.scene.input.setDefaultCursor('url(./src/sprites/eat2.cur), pointer');
            tutorial.emitter.emit('enterEat');
        }
    }

    //Returns the ID of a tile at a given coordinate
    tutorial.getTileID = function(x,y){
        /**
         * input x is the x coord given
         * input y is the y coord given
         * output gives the tile id of the tile at coords, if there isn't a tile, then it is assumed to be ground
         */
        if (tutorial.map.hasTileAt(x,y)){ //Originally there wasn't a tile defined for ground
            var tile = tutorial.map.getTileAt(x,y);
            return tile.index;          //returns the tile ID
        }
        else{
            return 1;
        }
    }

    //Returns boolean for whether a tile is collidable
    tutorial.checkCollision = function(x,y){
        /**
         * input x is the x coord given
         * input y is the y coord given
         * output is whether the tile at x, y is collidable
         */
        var tile = tutorial.map.getTileAt(x, y);
        return tile.properties.collide == true;
    }

    tutorial.spawn = function(enemyTarget){
        /***
         * input enemyTarget is the enemy that was just attacked
         * output destroys target and spawns a new bug, also updates the grid
         */
        if (Math.random() < .7){
            
            let con = tutorial.scene.add.container (enemyTarget.x, enemyTarget.y);
            tutorial.bugs.add(con);
            con.spr = tutorial.scene.add.sprite(0,0,"bug");
            con.bar = tutorial.scene.add.sprite(0,32,"bar");
            con.add(con.spr);
            con.add(con.bar);
            con.setDepth(1);
            con.name = "bug";
            con.spr.setDepth(1);
            con.bar.setDepth(2);
            con.spr.setOrigin(0);
            con.bar.setOrigin(0);
            var rect = new Phaser.Geom.Rectangle(0, 0, 32, 32);
            con.setInteractive(rect, Phaser.Geom.Rectangle.Contains); 
            con.spr.anims.play('bIdle');
            con.spr.setTint(0x808080);
            con.spent = true;
            con.health = 1;
            tutorial.updateHealth(con);
        }
        tutorial.terrainGrid[Math.floor(enemyTarget.y/enemyTarget.height)][Math.floor(enemyTarget.x/enemyTarget.width)]=1;
        tutorial.finder.setGrid(tutorial.terrainGrid);
    }

    tutorial.endTurn = function(){
        if (!tutorial.scene.input.enabled){
            return;
        }
        //Turn off user input
        tutorial.scene.input.enabled = false;

        //Make the end turn button show that it was clicked
        tutorial.nextTurn.setTint(0x606060);
        tutorial.turnCounter.inc();
        setTimeout(function(){ tutorial.nextTurn.clearTint(); }, 300);

        let waitTime;
        tutorial.scene.tweens.add({
            targets: tutorial.cowboyTransition,
            alpha: {value: 1, duration: 20, ease: 'Linear'},
            hold: 10,
            yoyo: true,
            loop: 0,
            useFrames:true,
            onComplete: function(){
                waitTime = tutorial.returnFire();
                setTimeout(function(){
                    //Reactivate user input
                    tutorial.cam.setBounds(0,0, 25*32, 15*32);
                    tutorial.scene.input.enabled = true;

                    //Reactivate bugs if the player's swarm has not been obliterated
                    if (tutorial.bugs.getChildren().length > 0){
                        tutorial.bugs.getChildren().forEach(bug =>{
                            bug.spent = false;
                            bug.spr.clearTint();
                            bug.isSelected = false;
                        });

                        tutorial.scene.tweens.add({
                            targets: tutorial.alienTransition,
                            alpha: {value: 1, duration: 20, ease: 'Linear'},
                            hold: 10,
                            yoyo: true,
                            loop: 0,
                            useFrames:true
                        });
                    }
                    else {  //if all aliens are dead then player loses
                        setTimeout(function(){
                            tutorial.music.stop();
                            game.scene.stop('tutorial');
                            game.scene.start('lose');
                        }, waitTime + 500);
                    }
                }, waitTime + 10);
            }
        });
    }

    tutorial.returnFire = function(){
        let shotHitPairs = tutorial.getCowhandShots();
        shotHitPairs = tutorial.dontShootDeadAliens(shotHitPairs);

        if (shotHitPairs.length > 0){
            let old_x = tutorial.cam.x;
            let old_y = tutorial.cam.y;
            tutorial.cam.setZoom(3);

            let i = 0;
            for (i; i < shotHitPairs.length; i++){
                //Camera is recentered on a new pair every 4 seconds
                let pair = shotHitPairs[i];
                let cowhand = pair.shooter;
                let alien = pair.target;
                
                //The cowboy tints white for 1/3 a second a second after centering camera, indicating shot
                setTimeout(function(){ 
                    tutorial.cam.centerOn((alien.x + cowhand.x)/2, (alien.y + cowhand.y)/2);
                    tutorial.playSound('shoot');  //takes two seconds to play
                    cowhand.setTintFill(0xFFFFFF);
                    tutorial.cam.flash(500);
                }, 1500*i, cowhand);
    
                //Cowboy returns to original tint 1/3 a second after the shot
                setTimeout(function(){ 
                    cowhand.clearTint();
                    tutorial.cam.resetFX();
                }, 500 + 1500*i, cowhand);
                
                //The alien tints red 1/3 a second after the cowboy untints white, indicating hit
                setTimeout(function(){ 
                    alien.health -= 1;
                    alien.spr.setTint(0xDC143C);
                    tutorial.updateHealth(alien); // update the healthbar to show the damage
                }, 1000 + 1500*i, alien);

                //Destroy dead aliens and record that they died.
                setTimeout(function(){ 
                    if (alien.health < 1){
                        alien.destroy();
                    }
                }, 1500 + 1500*i);
            } 

            //Reset camera after cowhands shots fired
            setTimeout(function(){
                tutorial.cam.setZoom(1);
                tutorial.cam.setPosition(old_x,old_y);
                tutorial.scene.input.enabled = true;
            }, 1500*i);

            return 1500*i;
        }
        else{
            return 0;
        }
    }
    
    //Removes cowhand shots at aliens that died earlier during the round of fire
    tutorial.dontShootDeadAliens = function (shotHitPairs){
        let shotsAtAliveAliens = [];

        //filter for shots at living aliens, not dead ones
        for (let i=0; i < shotHitPairs.length; i++){
            let thisAlien = shotHitPairs[i].target;
            let futureHealth = thisAlien.health;
            let alreadyCleaned = false;

            //check if shots at this alien were already filtered from shotHitPairs
            for (let j = 0; j < shotsAtAliveAliens.length; j++){
                let cleanedAlien = shotsAtAliveAliens[j].target;

                //if this alien is the same as a cleanedAlien, then it has already been cleaned
                if (thisAlien.x == cleanedAlien.x && thisAlien.y == cleanedAlien.y){
                    alreadyCleaned = true;
                    break;
                }
            }

            //if shots at this alien have not been cleaned, clean them
            if (!alreadyCleaned){
                //looks ahead to later shots at this alien
                for (let k=i; k < shotHitPairs.length; k++){
                    let thatAlien = shotHitPairs[i].target;

                    //if this alien is the same as that alien then it is being shot at again
                    if (thisAlien.x == thatAlien.x && thisAlien.y == thatAlien.y){
                        //if this alien is still alive at that time, shoot it again
                        if (futureHealth > 0){
                            shotsAtAliveAliens.push(shotHitPairs[k]);
                            futureHealth -= 1;
                        }
                        else {    //if this alien is dead, don't take any more shots at it
                            break;
                        }
                    }
                }
            }
        }
        return shotsAtAliveAliens;
    }

    //Gets all the aliens that cowhands will shoot
    tutorial.getCowhandShots = function (){
        var cowhandShots = [];

        tutorial.cowhands.getChildren().forEach(cowhand =>{
            let targets1 = tutorial.bugs.getChildren();
            let targets2 = [];

            targets1.forEach(tar => {
                let attackRange = 3.01
                let attackRangeS = Math.pow(attackRange*32, 2); //see the bug's attack for documentation
                let distX = tar.x - cowhand.x;
                let distY = tar.y - cowhand.y;
                let distanceS = Math.pow(distX, 2) + Math.pow(distY, 2);

                if(distanceS < attackRangeS){
                    //now check if the cowhand is facing the right way
                    //0,1,2,3 | down, left, right, up
                    if ((distY <= -1*Math.abs(distX) && cowhand.dir == 3) || (distX <= -1*Math.abs(distY) && cowhand.dir == 1) 
                        || (distX >= Math.abs(distY) && cowhand.dir == 2) || (distY >= Math.abs(distX) && cowhand.dir == 0)){
                        targets2.push(tar);
                    }
                }
            });

            if (targets2.length != 0){//if targets found
                let rand = Math.floor(Math.random()*targets2.length); //Randomly selects a target
                tar = targets2[rand];
                pair = {shooter: cowhand, target: tar};
                cowhandShots.push(pair);
            } 
            else{ //Only rotate if no contacts
                var randInt03 = Math.floor(Math.random()*4); //Randomly selects 0, 1, 2, or 3
                cowhand.rotate(randInt03);
            }
        });
        return cowhandShots;
    }

    tutorial.consume = function(enemyTarget, bug){
        bug.health++;
        tutorial.updateHealth(bug);
        tutorial.terrainGrid[Math.floor(enemyTarget.y/enemyTarget.height)][Math.floor(enemyTarget.x/enemyTarget.width)]=1;
        tutorial.finder.setGrid(tutorial.terrainGrid);
        enemyTarget.destroy();
    }

    tutorial.updateHealth = function(bug){
        if (bug.health == 1){
            bug.bar.anims.play('health1');
        }
        else if (bug.health == 2){
            bug.bar.anims.play('health2');
        }
        else if (bug.health == 3){
            bug.bar.anims.play('health3');
        }
        else if (bug.health == 4){
            bug.bar.anims.play('health4');
        }
    }

    //Makes a text box with progression button and image of speaker
    tutorial.makeTextBox = function (imageName, text, orientation = 'left', arrow = false, next = false){
        tutorial.speaker.setTexture(imageName);
        tutorial.text.setText(text);

        //Arrange textbox images so that speaker is on the left
        if (orientation == 'left'){
            tutorial.speaker.setPosition(0, 472).setFlipX(false);
            tutorial.text.setPosition(128, 472);
            tutorial.textBtn.setPosition(768, 568);
        } 
        //Arrange textbox images so that the speaker is on the right
        else if (orientation == 'right'){
            tutorial.speaker.setPosition(672, 472).setFlipX(true);
            tutorial.text.setPosition(0, 472);
            tutorial.textBtn.setPosition(640, 568);
        }

        if (arrow = undefined || arrow == false){
            tutorial.textBtn.visible = false;
            tutorial.textBtn.disableInteractive();
        }
        else{

            tutorial.textBtn.visible = true;
            tutorial.textBtn.setInteractive();
        }

        if (next = undefined || next == false){
            tutorial.nextTurn.visible = false;
            tutorial.nextTurn.disableInteractive();
        }
        else{
            tutorial.nextTurn.visible = true;
            tutorial.nextTurn.setInteractive();
        }
    }

    //Shifts the narrative and creates corresponding textbox
    tutorial.progressStory = function(){
        if (tutorial.narIdx < tutorial.narQueue.length){
            let dialogue = tutorial.narQueue[tutorial.narIdx];
            tutorial.makeTextBox(dialogue.speaker, dialogue.text, dialogue.orientation, dialogue?.arrow, dialogue?.next);
            tutorial.narIdx ++; //prepares the array index for the next progression

            //Run the callback functions associated with the dialogue
            dialogue.callbacks.forEach(func => {
                func();
            });
        }
        else{
            tutorial.narIdx = 0;
        }
    }

    //Makes all farmers interactive and visible
    tutorial.activateFarmers = function(){
        tutorial.farmers.getChildren().forEach(farmer =>{
            farmer.setInteractive();
            farmer.visible = true;
        });
    }

    //Makes all cowhands interactive and visible
    tutorial.activateCowhands = function(){
        tutorial.cowhands.getChildren().forEach(cowhand =>{
            cowhand.setInteractive();
            cowhand.visible = true;
        });
    }

    //Makes all flags interactive and visible
    tutorial.activateFlags = function(){
        tutorial.objectives.getChildren().forEach(flag =>{
            flag.setInteractive();
            flag.visible = true;
        });
    }

    //Makes eat mode accessible to the player
    tutorial.activateEatMode = function(){
        tutorial.scene.input.keyboard.on('keydown-E', tutorial.toggleEatMode);
    }

    //Makes aliens interactive
    tutorial.enableAliens = function(){
        tutorial.bugs.getChildren().forEach(alien =>{
            alien.setInteractive();
        });
    }

    //Makes aliens uninteractive
    tutorial.disableAliens = function(){
        tutorial.bugs.getChildren().forEach(alien =>{
            alien.disableInteractive();
        });
    }

    //Makes cowhands interactive
    tutorial.enableCowhands = function(){
        tutorial.cowhands.getChildren().forEach(cowhand =>{
            cowhand.setInteractive();
        });
    }

    //Makes cowhands uninteractive
    tutorial.disableCowhands = function(){
        tutorial.cowhands.getChildren().forEach(cowhand =>{
            cowhand.disableInteractive();
        });
    }

    //Makes turn transitions visible
    tutorial.enableTurnTrans = function(){
        tutorial.alienTransition.visible = true;
        tutorial.cowboyTransition.visible = true;
    }

    //Makes turn transitions invisible
    tutorial.disableTurnTrans = function(){
        tutorial.alienTransition.visible = false;
        tutorial.cowboyTransition.visible = false;
    }

    //Allows aliens to be moved
    tutorial.enableMoveTiles = function(){
        tutorial.emitter.off('alienSelected', tutorial.handleDisableMoveTiles, this);
        tutorial.alienDisabled = false;
    }
    
    //Activates and handles event listener for preventing a selected alien's movement
    tutorial.listenDisableMoveTiles = function(){
        tutorial.emitter.on('alienSelected', tutorial.handleDisableMoveTiles, this);
    }
    tutorial.handleDisableMoveTiles = function(){
        tutorial.alienDisabled = true;
    }

    //Activate and handle event listener for the arrow click
    tutorial.listenArrowClicked = function(){
        tutorial.emitter.on('arrowClick', tutorial.handleArrowClicked, this);
    }
    tutorial.handleArrowClicked = function(){
        tutorial.emitter.off('arrowClick', tutorial.handleArrowClicked, this);    //deactivate listener

        tutorial.textBtn.setTintFill(0xffffff);
        setTimeout(function(){ tutorial.textBtn.clearTint(); }, 300);
        setTimeout(function(){
            tutorial.progressStory();
        }, 600);
    }

    //Activate and handle event listener for when an alien is moved
    tutorial.listenAlienMoved = function(){
        tutorial.emitter.on('oneAlienMoved', tutorial.handleAlienMoved, this);
    }
    tutorial.handleAlienMoved = function(){
        tutorial.emitter.off('oneAlienMoved', tutorial.handleAlienMoved, this);    //deactivate listener
        tutorial.progressStory();
    }

    //Activate and handle event listener for when all the aliens are moved
    tutorial.listenAllAliensMoved = function(){
        tutorial.emitter.on('allAliensMoved', tutorial.handleAllAliensMoved, this);
    }
    tutorial.handleAllAliensMoved = function(){
        tutorial.emitter.off('allAliensMoved', tutorial.handleAllAliensMoved, this);    //deactivate listener
        tutorial.progressStory();
    }

    //Activate and handle event listener for when next turn butto is clicked
    tutorial.listenNextClicked = function(){
        tutorial.emitter.on('nextClick', tutorial.handleNextClicked, this);
    }
    tutorial.handleNextClicked = function(){
        tutorial.emitter.off('nextClick', tutorial.handleNextClicked, this);    //deactivate listener
        tutorial.progressStory();
    }

    //Activate and handle listener for when a farmer is killed
    tutorial.listenFarmerKilled = function(){
        tutorial.emitter.on('oneFarmerDead', tutorial.handleFarmerKilled, this);
    }
    tutorial.handleFarmerKilled = function(){
        tutorial.emitter.off('oneFarmerDead', tutorial.handleFarmerKilled, this);    //deactivate listener
        tutorial.progressStory();
    }

    //Activate and handle listener for when all the farmers are killed
    tutorial.listenAllFarmersKilled = function(){
        tutorial.emitter.on('allFarmersDead', tutorial.handleAllFarmersKilled, this);
    }
    tutorial.handleAllFarmersKilled = function(){
        tutorial.emitter.off('allFarmersDead', tutorial.handleAllFarmersKilled, this);    //deactivate listener
        tutorial.progressStory();
    }

    //Activate and handle listener for when eat mode is activated
    tutorial.listenEatModeEntered = function(){
        tutorial.emitter.on('enterEat', tutorial.handleEatModeEntered, this);
    }
    tutorial.handleEatModeEntered = function(){
        tutorial.emitter.off('enterEat', tutorial.handleEatModeEntered, this);    //deactivate listener
        tutorial.progressStory();
    }

    //Activate and handle listener for when eat mode is exited
    tutorial.listenEatModeExited = function(){
        tutorial.emitter.on('exitEat', tutorial.handleEatModeExited, this);
    }
    tutorial.handleEatModeExited = function(){
        tutorial.emitter.off('exitEat', tutorial.handleEatModeExited, this);    //deactivate listener
        tutorial.progressStory();
    }

    //Activate and handle listener for when all the cowhands are killed
    tutorial.listenAllCowhandsKilled = function(){
        tutorial.emitter.on('allCowhandsDead', tutorial.handleAllCowhandsKilled, this);
    }
    tutorial.handleAllCowhandsKilled = function(){
        tutorial.emitter.off('allCowhandsDead', tutorial.handleAllCowhandsKilled, this);    //deactivate listener
        tutorial.progressStory();
    }

    //Activate and handle listener for when all the flags are destroyed
    tutorial.listenAllFlagsDestroyed = function(){
        tutorial.emitter.on('allFlagsDestroyed', tutorial.handleAllFlagsDestroyed, this);
    }
    tutorial.handleAllFlagsDestroyed = function(){
        tutorial.emitter.off('allFlagsDestroyed', tutorial.handleAllFlagsDestroyed, this);    //deactivate listener
        tutorial.progressStory();
    }

    tutorial.narQueue = [
        {
            speaker: 'alienBig',
            orientation: 'left',
            arrow: true,
            callbacks: [tutorial.disableTurnTrans, tutorial.disableAliens, tutorial.listenArrowClicked],
            text: "Alien1:\n"+
            "Howdy! Ah know what yah must be thinkin': why in high hell \n"+
            "did we hafta land on this dusty backwater of a planet? Well, ah'll \n"+
            "have you know that our interstella' hiveminds been running low \n"+
            "on rations this season. Lets see what grub we can rustle up! \n"+
            "(Left-click the arrow to continue the narrative for game instructions)"
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            arrow: true,
            callbacks: [tutorial.listenArrowClicked],
            text: "Alien2:\n"+
            "Word around the galaxy has it that the locals here are some kind \n"+
            "of human primeape. They're dumb as a box of rocks too. Ah've heard \n"+
            "that they fry up real nice though, so lets get ranching! \n"+
            "(Left-click the arrow to continue the narrative for game instructions)"
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            callbacks: [tutorial.enableAliens, tutorial.listenAlienMoved],
            text: "Alien2:\n"+
            "Hey, you...Yeah, ah'm talking to you--the player of our alien \n"+
            "hivemind! Left-click on one of us aliens to see where ya can move \n"+
            "us. Click on a red tile to move the selected alien to that spot."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            callbacks: [tutorial.listenAllAliensMoved],
            text: "Alien1:\n"+
            "Did someone say primeape? Sounds mo' like primerib to me, ha! \n"+
            "Hey hivemind player, an alien can only do one action each turn. \n"+
            "That's why my partner there is greyed-out and ya can't select them. \n"+
            "Ah gotsta get mah primeape grilled medium-rare so move me too dammit!"
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            next: true,
            callbacks: [tutorial.listenNextClicked],
            text: "Alien2:\n"+
            "Alright, alright, you're doing just fine. Click the 'Next Turn' \n"+
            "button to reactivate us so that we can do more actions like movin' \n"+
            "an' killin'."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            callbacks: [tutorial.activateFarmers, tutorial.listenAllAliensMoved],
            text: "Alien1:\n"+
            "Why, we must be riding a gravy train with biscuit wheels! Lucky \n"+
            "fer us theres some primeape cattle nearby. Looks like a couple of \n"+
            "farmers. They won't hurt us none, but ah hope that thems good \n"+
            "eatin'. Hivemind player, move both of us directly next to, or \n"+
            "just diagonal of them so that we can attack them."
        },
        {
            speaker: 'farmerBig',
            orientation: 'left',
            arrow: true,
            callbacks: [tutorial.disableAliens, tutorial.listenArrowClicked],
            text: "Farmer:\n"+
            "I'll be, Marge! Those look like some Yankees or something over \n"+
            "yonder. I'll have them know that they're as welcome here as an \n"+
            "outhouse breeze. Quick, get the kids back to the homestead. \n"+
            "(Click the arrow button)"
        },
        {
            speaker: 'farmwomanBig',
            orientation: 'right',
            arrow: true,
            callbacks: [tutorial.listenArrowClicked],
            text: "Farmwoman:\n"+
            "Were you raised in a barn, Bill? Sure, they look about as friendly \n"+
            "as fire ants but come hell or high water we're going to show them \n"+
            "some southern hospitality. Kids, company's coming; add a cup of water \n"+
            "to the soup. \n"+
            "(Click the arrow button)"
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            next: true,
            callbacks: [tutorial.enableAliens, tutorial.listenFarmerKilled],
            text: "Alien1:\n"+
            "If that primeape cow's brain was dynamite she wouldn't even be \n"+
            "ble to blow her own nose. Once an alien is on a tile next to a \n"+
            "primeape, select that alien then click on the primeape to kill it. \n"+
            "Remember that an alien can only do one action each turn, so be sure \n"+
            "to click 'Next Turn' beforehand! We won't eat the calves of course, \n"+
            "they're as thin as fiddle strings, just ain't no meat on them."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            next: true,
            callbacks: [tutorial.listenAllFarmersKilled],
            text: "Alien2:\n"+
            "If we've gotsta round up so many primeape cattle we're goin' to \n"+
            "need a regular ranching team. Sometimes when a primeape is killed a \n"+
            "low-health alien will spawn where that primeape was. You can see an \n"+
            "alien's health shown in the green bar below it. Now slaughter the \n"+
            "other farmer so that we can lay some eggs in its hide. An' quit \n"+
            "draggin' your feet, will ya?"
        },
        {
            speaker: 'cowboyBig',
            orientation: 'left',
            arrow: true,
            callbacks: [tutorial.activateCowhands, tutorial.disableAliens, tutorial.listenArrowClicked],
            text: "Cowboy:\n"+
            "Those kids came running into town faster than greased lightnin'! \n"+
            "Bill may have been a snot-slinging drunk and Marge as dull as a \n"+
            "mashed-potato sandwich, but thems were damned good people. I'll \n"+
            "show whicheva' revolving sons of *****s that killed them some real \n"+
            "Texas justice. Mmmhm, yep, im'a string them up by a strong oak tree. \n"
        },
        {
            speaker: 'cowgirlBig',
            orientation: 'right',
            arrow: true,
            callbacks: [tutorial.listenArrowClicked],
            text: "Cowgirl:\n"+
            "Hey now, Sheriff, don't be getting as dark as the devil's riding \n"+
            "boots. We're gonna carry those vagabonds back to town and give \n"+
            "them a fair trial...THEN we'll have ourselves a hangin'! \n"+
            "(Cowhands have their own turn in the game and can shoot at aliens) \n"+
            "(Hover the cursor over each cowhand to see their current attack range)"
        },
        {
            speaker: 'cowboyBig',
            orientation: 'left',
            next: true,
            callbacks: [tutorial.enableTurnTrans, tutorial.enableAliens, tutorial.listenNextClicked],
            text: "Cowboy:\n"+
            "Well would'ya look at that, I can see them right over that there \n"+
            "gully. 'In lookit them, they're ugly as sin. Lets go teach them not \n"+
            "to mess with Texas. \n"+
            "(Each turn, cowhands can change the direction that they are facing) \n"+
            "(Click 'Next Turn')"
        },
        {
            speaker: 'cowgirlBig',
            orientation: 'right',
            next: true,
            callbacks: [tutorial.listenNextClicked],
            text: "Cowgirl:\n"+
            "Yee-haw!!! \n"+
            "(If aliens are in a cowhand's attack range, then the cowhand will \n"+
            "randomly shoot at a single alien on their turn instead of facing \n"+
            "a different direction) \n"+
            "(Move both the aliens towards the cowhands then click 'Next Turn')"
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            callbacks: [tutorial.listenDisableMoveTiles, tutorial.disableCowhands, tutorial.activateEatMode, tutorial.listenEatModeEntered],
            text: "Alien1:\n"+
            "Ah'll be damned, this planet is so dry ah'm spitting cotton! \n"+
            "Whelp, ah needta wet mah jaw with some sweet primeape barbeque. \n"+
            "Hivemind player, prepare to enter eat mode. If ya kill a primeape in \n"+
            "eat mode then the selected alien will gain more health. Select an \n"+
            "alien then press the 'E' key on the keyboard to enter eat mode."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            callbacks: [tutorial.disableAliens, tutorial.listenEatModeExited],
            text: "Alien2:\n"+
            "Wooowee! The teeth on that cursor look downright ferocious. \n"+
            "But ya best watch out, if ya kill a primeape in eat mode then there \n"+
            "is no chance in hell that an alien will spawn in their place, unlike \n"+
            "when ya kill it without eat mode. Also, an alien with full health \n"+
            "can't use eat mode to kill priemapes because its health is already \n"+
            "full. Exit eat mode by pressing the 'E' key again."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            next: true,
            callbacks: [tutorial.enableAliens, tutorial.enableMoveTiles, tutorial.enableCowhands, tutorial.listenAllCowhandsKilled],
            text: "Alien1:\n"+
            "Ah reckon that it's time for us to whip those cowhands like a \n"+
            "red-headed stepchild. Remember that using eat mode is just like \n"+
            "normal killin' 'cause you gotta be right next to a human to eat \n"+
            "them. We're burnin daylight so lets get to it!."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            arrow: true,
            callbacks: [tutorial.activateFlags, tutorial.disableAliens, tutorial.listenArrowClicked],
            text: "Alien1:\n"+
            "Fer a moment there, ah thought that we'd got ourselves caught in \n"+
            "our own lasso. Heck, ah was sweatin' like a whore in church when \n"+
            "they started shootin' at us! Anyhow, it's been a helluva time and \n"+
            "I think that we should set up ranch in these parts."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            next: true,
            callbacks: [tutorial.enableAliens, tutorial.listenAllFlagsDestroyed],
            text: "Alien2:\n"+
            "we gotsta do somethin' about those flags over there, I'll be damned \n"+
            "if we fly someone else's brand on our land. Destroy them the same \n"+
            "way that ya kill primeapes; its the only way to win a game level!"
        }
    ];