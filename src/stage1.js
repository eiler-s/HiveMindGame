var Stage1 = {};
Stage1.key = 'stage1';

    Stage1.playSound=function(name){
        switch (name){
            case 'cowhandDeath':
                Stage1.sfx.cowhandDeath.play();
                break;
            case 'run':
                Stage1.sfx.run.play();
                break;
            case 'shoot':
                Stage1.sfx.shoot.play();
                break;
            case 'hawk':
                Stage1.sfx.hawk.play();
                break;
            case 'train':
                Stage1.sfx.train.play();
            case 'eat':
                Stage1.sfx.eat.play();
        }
    }

    Stage1.stopSound = function(name){
        switch (name){
            case 'run':
                Stage1.sfx.run.stop();
        }
    }
    
    Stage1.preload=function(){
        Stage1.scene = this;

        //Load audio files
        Stage1.scene.load.audio('music', './Sound/Old_West_Gunslingers_Steve_Oxen.mp3');
        Stage1.scene.load.audio('cowhandDeath', './src/sound/death.mp3');
        Stage1.scene.load.audio('run', './Sound/running_feet_-Cam-942211296.mp3');
        Stage1.scene.load.audio('shoot', './Sound/shoot.mp3');
        Stage1.scene.load.audio('hawk', './Sound/hawk_screeching-Mike_Koenig-1626170357.mp3');
        Stage1.scene.load.audio('train', './Sound/train.mp3');
        Stage1.scene.load.audio('eat', './Sound/eat.mp3');

        //loads background
        Stage1.scene.load.image('Backgrounds', "./src/sprites/bgSheet1.png");
        Stage1.scene.load.image('bg','./Sprites/bgSheet2.png');

        //Load tilemap images and map layout files
        Stage1.scene.load.image('tilemap', "./src/sprites/tilemap.png");
        Stage1.scene.load.image('red', './src/sprites/red.png');
        Stage1.scene.load.tilemapTiledJSON('map', './src/tilemaps/map.json');
        Stage1.scene.load.image('flag', './Sprites/terrain/Texas_flag.png');

        //Load next turn button
        Stage1.scene.load.image('nextTurn', "./src/sprites/nextTurnButton.png");

        //Load the aimcone
        Stage1.scene.load.image('aimcone', "./src/sprites/aimcone1.png");

        //Load character spritesheets
        Stage1.scene.load.spritesheet('bug', './Sprites/hunters/huntersheet.png',{
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2
        });
        Stage1.scene.load.spritesheet('cowboy', './Sprites/cowhands/cowboysheet.png',{
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2
        });
        Stage1.scene.load.spritesheet('cowgirl', './Sprites/cowhands/cowgirlsheet.png',{
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2
        });
        Stage1.scene.load.spritesheet('farmer', './Sprites/farmers/farmer.png',{
            frameWidth:32,
            frameHeight:32,
        });
        Stage1.scene.load.spritesheet('farmwoman', './Sprites/farmers/farmwoman.png',{
            frameWidth:32,
            frameHeight:32,
        });
        Stage1.scene.load.spritesheet('health1', './src/sprites/Health11.png',{
            frameWidth:32,
            frameHeight:32,
        });
        Stage1.scene.load.spritesheet('health2', './src/sprites/Health21.png',{
            frameWidth:32,
            frameHeight:32,
        });
        Stage1.scene.load.spritesheet('health3', './src/sprites/Health31.png',{
            frameWidth:32,
            frameHeight:32,
        });
        Stage1.scene.load.spritesheet('health4', './src/sprites/Health41.png',{
            frameWidth:32,
            frameHeight:32,
        });

        //Load images for textboxes
        Stage1.scene.load.image('alienBig','./Sprites/hunters/hunter2.png');
        Stage1.scene.load.spritesheet('arrows','./Sprites/arrows/arrows.png',{
            frameWidth:32,
            frameHeight:32,
            margin:1,
            spacing:2
        });
    }

    Stage1.create=function(){
        graphics = this.add.graphics();

        //turn counter
        Stage1.turnCounter = this.add.text(620,20, "Turns: 1").setDepth(12).setScrollFactor(0);
        Stage1.turnCounter.setFont('georgia').setFontSize(30).setFontStyle('bold').setColor('black');
        Stage1.turnCounter.turn = 1;
        Stage1.turnCounter.inc = () => {Stage1.turnCounter.turn++; Stage1.turnCounter.setText("Turns: " + Stage1.turnCounter.turn);}
        
        //used for consume function
        Stage1.eatMode = false;
        this.input.keyboard.on('keydown-E', Stage1.toggleEatMode);

        //make the next turn button
        Stage1.nextTurn = this.add.image(25,511,'nextTurn').setDepth(5).setScrollFactor(0).setInteractive().setName("nextTurn");  
        Stage1.nextTurn.setOrigin(0,0);  
        Stage1.nextTurn.on('pointerover' , (pointer) => Stage1.nextTurn.setTint(0x808080));
        Stage1.nextTurn.on('pointerout' , (pointer) => Stage1.nextTurn.setTint(0xffffff));

        //place an aimcone
        Stage1.aimcone = this.add.image(0,0,'aimcone').setDepth(5).setVisible(false);     
        
        //end turn on space
        this.input.keyboard.on('keydown-SPACE', Stage1.endTurn);
        
        //Create the music and sound effects using loaded audio
        Stage1.music = Stage1.scene.sound.add('music', { volume: 0.1, loop: true });
        Stage1.music.play();
        Stage1.sfx = {};
        Stage1.sfx.cowhandDeath = Stage1.scene.sound.add('cowhandDeath', {volume: 0.1});
        Stage1.sfx.run = Stage1.scene.sound.add('run', {volume: 0.1});
        Stage1.sfx.shoot = Stage1.scene.sound.add('shoot', {volume: 0.1});
        Stage1.sfx.hawk = Stage1.scene.sound.add('hawk', {volume: 0.1});
        Stage1.sfx.train = Stage1.scene.sound.add('train', {volume: 0.1});
        Stage1.sfx.eat = Stage1.scene.sound.add('eat', {volume: 0.2});

        //Define user turn, selected unit, and path storage
        Stage1.currentBug = null;
        Stage1.paths = [];

        //Create game map and tileset
        var config = {
            key: 'map',
            tileWidth: 32,
            tileHeight: 32
        }
        Stage1.map = this.make.tilemap(config);
        Stage1.tiles = Stage1.map.addTilesetImage('tilemap');
        Stage1.bgTiles = Stage1.map.addTilesetImage('Backgrounds');
        Stage1.background = Stage1.map.createStaticLayer('background', Stage1.bgTiles, 0, 0);
        Stage1.terrain = Stage1.map.createStaticLayer('terrain', Stage1.tiles, 0, 0);
        Stage1.top = Stage1.map.createBlankDynamicLayer('tilemap', Stage1.tiles, 0, 0);
        
        //Makes sure terrain layer is selected so that obstacles can be found
        Stage1.map.setLayer('terrain');

        //Make a matrix that corresponds each terrain map pixel to a tile ID
        Stage1.terrainGrid =[];
        for (var y=0; y < Stage1.map.height; y++){
            var col = [];
            for (var x = 0; x < Stage1.map.width; x++){
                col.push(Stage1.getTileID(x, y));
            }
            Stage1.terrainGrid.push(col);
        }
        
        //Create bug objectlayer from JSON then corresponding sprite group
        Stage1.bugLayer = Stage1.map.getObjectLayer('bug')['objects'];
        Stage1.bugs = this.add.group();

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
        Stage1.bugLayer.forEach(object => {
            //create a container to do the logic, and to hold both the bug sprite and the health bar
            let con = this.add.container (object.x, object.y - object.height);
            Stage1.bugs.add(con);
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
            Stage1.updateHealth(con);
        });
        
        //Create cowhands objectlayer from JSON then corresponding sprite group
        Stage1.cowhandLayer = Stage1.map.getObjectLayer('cowhand')['objects'];
        Stage1.cowhands = this.add.group();

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
        Stage1.cowhandLayer.forEach(object => {
            //Randomly select the gender of the cowhands
            var gender;
            var prefix;
            var randInt01 = Math.floor(Math.random()*2); //Randomly selects 0 or 1
            if (randInt01 == 1){
                gender = "cowboy";
                prefix = "cb";
            } else {
                gender = "cowgirl";
                prefix = "cg";
            }
            
            //create cowhand and identify position on grid
            let obj = Stage1.cowhands.create(object.x, object.y - object.height, gender);
            obj.name = "cowhand";
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.setInteractive();
            Stage1.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)] = 9;
            
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
                Stage1.aimcone.setVisible(true);
                if (this.dir == 0){
                    Stage1.aimcone.setRotation(1.5*3.14159).setPosition(this.x+16, this.y+80);
                }
                if (this.dir == 1){
                    Stage1.aimcone.setRotation(0).setPosition(this.x-48, this.y+16);
                }
                if (this.dir == 2){
                    Stage1.aimcone.setRotation(1*3.14159).setPosition(this.x+80, this.y+16);
                }
                if (this.dir == 3){
                    Stage1.aimcone.setRotation(0.5*3.14159).setPosition(this.x+16, this.y-48);
                }
            });
            obj.on('pointerout', function (pointer) {
               Stage1.aimcone.setVisible(false);
            });             
        });

        //Create farmer objectlayer from JSON then corresponding sprite group
        Stage1.farmerLayer = Stage1.map.getObjectLayer('farmer')['objects'];
        Stage1.farmers = this.add.group();

        //Instantiate the farmers on the map
        Stage1.farmerLayer.forEach(object => {
            //Randomly select the gender of the farmers
            var gender;
            var randInt = Math.floor(Math.random()*2 + 1); //Randomly selects 1 or 2
            if (randInt == 1){
                gender = "farmer";
            } else {
                gender = "farmwoman";
            }

            //create farmer and identify position on grid
            let obj = Stage1.farmers.create(object.x, object.y - object.height, gender);
            obj.name = "farmer";
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.setInteractive();
            Stage1.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)]=10;
        });

        //Create a group for the objects representing the game objective
        Stage1.objectiveLayer = Stage1.map.getObjectLayer('objective')['objects'];
        Stage1.objectives = this.add.group();

        //Instantiate objectives on the map
        Stage1.objectiveLayer.forEach(object=>{
            let obj = Stage1.objectives.create(object.x, object.y - object.height, 'flag');
            obj.name = 'objective';
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.setInteractive();
            Stage1.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)]=10
        })

        //Create movement tile group
        Stage1.moveTiles = this.add.group();

        //Assigns arrow keys to cursors
        //Stage1.cursors = this.input.keyboard.createCursorKeys();
        //Assigns wasd keys to cursors
        Stage1.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        //Move main camera with cursors
        var controlConfig = {
            camera: this.cameras.main,
            left: Stage1.cursors.left,
            right: Stage1.cursors.right,
            up: Stage1.cursors.up,
            down: Stage1.cursors.down,
            acceleration : 1,
            drag: 1,
            maxSpeed: 1
        };
        Stage1.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        //Makes a square (marker) follow cursor
        Stage1.marker = this.add.graphics();
        Stage1.marker.lineStyle(3, 0xffffff, 1);
        Stage1.marker.strokeRect(0,0, Stage1.map.tileWidth, Stage1.map.tileHeight);

        //Set up camera and map bounds, pan from flags to starting position
        Stage1.cam = this.cameras.main;
        Stage1.scene.input.enabled = false;
        Stage1.cam.setBounds(0,0, 48*32, 22*32);
        Stage1.cam.centerOn(44*32, 11*32);
        setTimeout(function(){
            Stage1.cam.pan(4*32, 11*32, 2000);
        }, 1000);
        setTimeout(function(){
            Stage1.cam.setDeadzone(700,500);
            Stage1.scene.input.enabled = true;
            Stage1.cam.startFollow(Stage1.marker, true);
            //Stage1.temp = this.add.graphics().setScrollFactor(0); //shows dead zone for camera
            //Stage1.temp.strokeRect(50,50,Stage1.cam.deadzone.width,Stage1.cam.deadzone.height);
        }, 3000);
        
        //message when eat when full
        Stage1.famished = this.add.text(400,300, 'This alien is full').setDepth(3).setScrollFactor(0).setVisible(false).setOrigin(.5,.5);
        //transition screens
        Stage1.alienTransition = this.add.text(400, 300, 'Alien\'s Turn',{fontFamily:'Eater', fontSize: '50px', color: '#008040'}).setOrigin(.5,.5).setScrollFactor(0).setAlpha(0).setDepth(4);
        Stage1.cowboyTransition = this.add.text(400, 300, 'Cowboy\'s Turn',{fontFamily:'Rye', fontSize: '50px', color: '#000000'}).setOrigin(.5,.5).setScrollFactor(0).setAlpha(0).setDepth(4);

        //Initializes pathfinder
        Stage1.finder = new EasyStar.js();
        Stage1.finder.setGrid(Stage1.terrainGrid);

        //Check each tile to see if it can be moved on
        var tileset = Stage1.map.tilesets[0];
        var properties = tileset.tileProperties;
        Stage1.acceptableTiles=[];
        for (var i = tileset.firstgid-1; i < Stage1.tiles.total; i++){
            // tiles without any properties are assumed to be acceptable
            if(!properties.hasOwnProperty(i)) {
                Stage1.acceptableTiles.push(i+1);
                continue;
            }
            if(!properties[i].collide) Stage1.acceptableTiles.push(i+1); //registers tiles that are not collidable
            if(properties[i].cost) Stage1.finder.setTileCost(i+1, properties[i].cost); // registers cost
        }
        Stage1.finder.setAcceptableTiles(Stage1.acceptableTiles);

        //Event emitters used to control progress of Stage1, see listeners above the narrative json
        Stage1.emitter = new Phaser.Events.EventEmitter();

        //CLICK LISTENER
        Stage1.scene.input.on('gameobjectdown', function (pointer, gameObject) {
            //On their turn, the player can move units that have not yet done so
            if (gameObject.name == 'bug' && gameObject.spent == false && Stage1.currentBug == null){
                Stage1.moveTiles.clear(true, true); //get rid of move tiles
                Stage1.currentBug = gameObject;
                Stage1.map.setLayer('terrain');
                gameObject.isSelected = true;

                //Determine origin of unit's move range
                Stage1.originX = Math.floor(gameObject.x/32);
                Stage1.originY = Math.floor((gameObject.y)/32);

                //Identify tiles in the unit's move range
                var shape = new Phaser.Geom.Circle(Stage1.originX*32, Stage1.originY*32, 5*32);
                //need to specify the terrain layer for getting the tiles
                var squares = Stage1.map.getTilesWithinShape(shape, null, Stage1.cam, 'terrain');

                for (var i=0; i < squares.length; i++){
                    //Use a callback function to filter the path finder for acceptable paths
                    Stage1.finder.findPath(Stage1.originX, Stage1.originY, squares[i].x, squares[i].y, function(path){
                        if (path !== null){ //If there is a tile that's chosen that's impossible to get to, path would be null.
                            //If the most direct path is greater than 5, then it won't be displayed
                            if (path.length <= 5 && path.length != 0){  //Store each acceptable path's tile destination
                                Stage1.pathStorage(path)
                            }
                        }
                    });
                    Stage1.finder.calculate();
                }
            }
            //If the player has already selected a unit, show available move tiles
            else if (gameObject.name == 'red'){
                //Check each availble path to see if selected tile is in range
                for (var i = 0; i < Stage1.paths.length; i++){
                    //If a selected tile is a path destination, move the bug to that destination
                    if (Stage1.paths[i][Stage1.paths[i].length - 1].x == (gameObject.x/32) && Stage1.paths[i][Stage1.paths[i].length - 1].y == (gameObject.y/32)){
                        Stage1.moveBug(Stage1.paths[i]);
                        Stage1.paths = [];
                    }
                }
                Stage1.moveTiles.clear(true, true); //get rid of move tiles
            }

            //end turn
            else if (gameObject.name == 'nextTurn'){
                Stage1.moveTiles.clear(true, true); //get rid of move tiles
                Stage1.endTurn();
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
            else if ((gameObject.name == 'cowhand' || gameObject.name == 'farmer' || gameObject.name == 'objective') && Stage1.currentBug != null && !Stage1.currentBug.inMotion){
                let bug = Stage1.currentBug;

                let attackRange = 1.8;
                //square of the range. Faster to compute. 32 added to make it match the pixel count
                let attackRangeS = Math.pow(attackRange*32, 2);
                let distX = bug.x - gameObject.x;
                let distY = bug.y - gameObject.y;
                let distanceS = Math.pow(distX, 2) + Math.pow(distY, 2)
                
                //Check attack can go ahead
                if (distanceS < attackRangeS && bug.spent != true){
                    Stage1.currentBug = null;

                    Stage1.aimcone.setVisible(false);//no ghost aimcones

                    Stage1.moveTiles.clear(true, true); //get rid of move tiles
                    Stage1.paths = [];
                    
                    Stage1.currentBug = null;

                    if (gameObject.name != 'objective'){
                        Stage1.playSound('cowhandDeath');
                    }

                    if (gameObject.name == 'objective'){
                        Stage1.terrainGrid[Math.floor(gameObject.y/gameObject.height)][Math.floor(gameObject.x/gameObject.width)]=1;
                        Stage1.finder.setGrid(Stage1.terrainGrid);
                        gameObject.destroy();
                        
                        bug.spent = true;
                        bug.spr.setTint(0x808080);
                    }
                    else if (Stage1.eatMode){
                        if (bug.health >= 4){
                            Stage1.eatMode = false; //resets eatMode after a click
                            Stage1.famished.setPosition(bug.x + 16, bug.y).setVisible(true);
                            Stage1.scene.input.setDefaultCursor('default');
                            setTimeout(() => {Stage1.famished.setVisible(false);}, 3000);
                        } else {
                            Stage1.consume(gameObject, bug);
                            bug.spent = true;
                            bug.spr.setTint(0x808080);
                        }
                    }
                    else{
                        Stage1.spawn(gameObject);
                        gameObject.destroy();
                        
                        bug.spent = true;
                        bug.spr.setTint(0x808080);
                    }
                    //objectives check
                    if (Stage1.objectives.getChildren().length == 0){
                        Stage1.music.stop();                      
                        game.scene.stop('stage1');
                        game.scene.start('win');
                    }
                }
            }
            //moves along Stage1 narrative when textbutton clicked
            else if (gameObject.name == 'textBtn'){
                Stage1.emitter.emit('arrowClick');
            }
            //deselect a bug if it is already selected by clicking on it again
            else if (gameObject.name == 'bug' && gameObject.isSelected && gameObject.spent == false){
                Stage1.moveTiles.clear(true); //get rid of move tiles
                Stage1.currentBug = null;
                gameObject.isSelected = false;
            }

            Stage1.eatMode = false; //resets eatMode after a click
            Stage1.scene.input.setDefaultCursor('default');
        }, Stage1);

        //Periodically play environmental noises
        setInterval(function(){
            if (Math.random() < .7){
                Stage1.playSound('hawk');
            }
            else{
                Stage1.playSound('train');
            }
        }, 100000)

        setTimeout(function(){
            Stage1.nextTurn.setPosition(0,408);

            //Create textbox images
            Stage1.textbox = Stage1.scene.add.rectangle(0, 472, 800, 128, 0x696969).setDepth(3).setScrollFactor(0).setOrigin(0,0);
            Stage1.speaker = Stage1.scene.add.image(0, 472, 'alienBig').setDepth(3).setScrollFactor(0).setOrigin(0,0);
            Stage1.text = Stage1.scene.add.text(128, 472, '').setDepth(3).setScrollFactor(0).setOrigin(0,0);
            Stage1.textBtn = Stage1.scene.add.sprite(640, 568, 'arrows').setDepth(3).setScrollFactor(0).setOrigin(0,0);
            Stage1.textBtn.name = 'textBtn';

            //Create animation for narration button
            Stage1.scene.anims.create({
                key: 'aDown',
                frames: Stage1.scene.anims.generateFrameNumbers('arrows', { start: 0, end: 1 }),
                frameRate: 2,
                repeat: -1
            });
            Stage1.textBtn.anims.play('aDown');

            //Start the Stage1 narration
            Stage1.progressStory();
        }, 3000);
    }

    //Create a movement tile at a path's destination
    Stage1.pathStorage = function(path){
        /**
         * input path is a possible path to take
         * output shows available paths as red squares
         */
        let obj = Stage1.moveTiles.create(path[path.length-1].x*32, path[path.length-1].y*32, 'red');
        obj.name = 'red';
        obj.setInteractive();
        obj.setOrigin(0);
        obj.setAlpha(.5);
        Stage1.paths.push(path);
    }

    //Moves the bug to a destination tile
    Stage1.moveBug = function(path){
        /**
         * input path is the chosen path
         * output moves the currentBug to destination
         */
        var timeline = Stage1.scene.tweens.createTimeline({useFrames:true});

        //don't let the bug do anything else
        Stage1.currentBug.spent = true;

        //let other functions know if the bug is moving
        Stage1.currentBug.inMotion = true;
        timeline.setCallback("onComplete", () => {
            Stage1.currentBug.inMotion = false;
            Stage1.currentBug.spr.setTint(0x808080);
            Stage1.currentBug = null;
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
                targets: Stage1.currentBug,
                x: xf*Stage1.map.tileWidth,
                y: yf*Stage1.map.tileHeight,
                duration: 10,

                onStart: function move() {  //play the anim when the tween starts
                    Stage1.playSound('run');
                    tempDir=animQueue.shift();
                    Stage1.currentBug.spr.anims.play(tempDir);
                },

                onComplete: function iddle() {   //stop anim when tween ends
                    Stage1.stopSound('run');
                    Stage1.currentBug.spr.anims.play('bIdle');
                }
            });
        }
        timeline.play();
        Stage1.moveTiles.clear(true, true);
    }

    Stage1.update = function(time, delta){
        Stage1.controls.update(delta)
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        //Rounds the cursor location to the nearest tile
        var pointerTileX = Stage1.map.worldToTileX(worldPoint.x);
        var pointerTileY = Stage1.map.worldToTileY(worldPoint.y);

        //Places the marker around the selected tile
        Stage1.marker.x = Stage1.map.tileToWorldX(pointerTileX);
        Stage1.marker.y = Stage1.map.tileToWorldY(pointerTileY);
    }

    Stage1.toggleEatMode = function(){
        if (Stage1.eatMode){
            Stage1.eatMode = false; 
            Stage1.scene.input.setDefaultCursor('default');
            Stage1.emitter.emit('exitEat');

        }else{
            Stage1.eatMode = true;
            Stage1.playSound('eat'); 
            Stage1.scene.input.setDefaultCursor('url(./src/sprites/eat2.cur), pointer');
            Stage1.emitter.emit('enterEat');
        }
    }

    //Returns the ID of a tile at a given coordinate
    Stage1.getTileID = function(x,y){
        /**
         * input x is the x coord given
         * input y is the y coord given
         * output gives the tile id of the tile at coords, if there isn't a tile, then it is assumed to be ground
         */
        if (Stage1.map.hasTileAt(x,y)){ //Originally there wasn't a tile defined for ground
            var tile = Stage1.map.getTileAt(x,y);
            return tile.index;          //returns the tile ID
        }
        else{
            return 1;
        }
    }
    
    //Returns boolean for whether a tile is collidable
    Stage1.checkCollision = function(x,y){
        /**
         * input x is the x coord given
         * input y is the y coord given
         * output is whether the tile at x, y is collidable
         */
        var tile = Stage1.map.getTileAt(x, y);
        return tile.properties.collide == true;
    }

    Stage1.spawn = function(enemyTarget){
        /***
         * input enemyTarget is the enemy that was just attacked
         * output destroys target and spawns a new bug, also updates the grid
         */
        if (Math.random() < .7){
            
            let con = Stage1.scene.add.container (enemyTarget.x, enemyTarget.y);
            Stage1.bugs.add(con);
            con.spr = Stage1.scene.add.sprite(0,0,"bug");
            con.bar = Stage1.scene.add.sprite(0,32,"bar");
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
            Stage1.updateHealth(con);
        }
        Stage1.terrainGrid[Math.floor(enemyTarget.y/enemyTarget.height)][Math.floor(enemyTarget.x/enemyTarget.width)]=1;
        Stage1.finder.setGrid(Stage1.terrainGrid);
    }

    Stage1.endTurn = function(){
        if (!Stage1.scene.input.enabled){
            return;
        }
        //Turn off user input
        Stage1.scene.input.enabled = false;
        Stage1.cam.stopFollow();

        //Make the end turn button show that it was clicked
        Stage1.nextTurn.setTint(0x606060);
        Stage1.turnCounter.inc();
        setTimeout(function(){ Stage1.nextTurn.clearTint(); }, 300);
        
        let waitTime;
        Stage1.scene.tweens.add({
            targets: Stage1.cowboyTransition,
            alpha: {value: 1, duration: 20, ease: 'Linear'},
            hold: 10,
            yoyo: true,
            loop: 0,
            useFrames:true,
            onComplete: function(){
                waitTime = Stage1.returnFire();

                setTimeout(function(){
                    //Reactivate user input
                    Stage1.cam.startFollow(Stage1.marker, true);
                    Stage1.cam.setBounds(0,0, 48*32, 22*32);
                    Stage1.scene.input.enabled = true;

                    //Reactivate bugs if the player's swarm has not been obliterated
                    if (Stage1.bugs.getChildren().length > 0){
                        Stage1.bugs.getChildren().forEach(bug =>{
                            bug.spent = false;
                            bug.spr.clearTint();
                            bug.isSelected = false;
                        });

                        Stage1.scene.tweens.add({
                            targets: Stage1.alienTransition,
                            alpha: {value: 1, duration: 20, ease: 'Linear'},
                            hold: 10,
                            yoyo: true,
                            loop: 0,
                            useFrames:true
                        });
                    }
                    else {  //if all aliens are dead then player loses
                        setTimeout(function(){
                            Stage1.music.stop();
                            game.scene.stop('stage1');
                            game.scene.start('lose');
                        }, waitTime + 500);
                    }
                }, waitTime+10);
            }
        });
    }

    Stage1.returnFire = function(){
        let shotHitPairs = Stage1.getCowhandShots();
        shotHitPairs = Stage1.dontShootDeadAliens(shotHitPairs);

        if (shotHitPairs.length > 0){
            let old_x = Stage1.cam.x;
            let old_y = Stage1.cam.y;
            Stage1.cam.setZoom(3);

            let i = 0;
            for (i; i < shotHitPairs.length; i++){
                //Camera is recentered on a new pair every 4 seconds
                let pair = shotHitPairs[i];
                let cowhand = pair.shooter;
                let alien = pair.target;
                
                //The cowboy tints white for 1/3 a second a second after centering camera, indicating shot
                setTimeout(function(){ 
                    Stage1.cam.centerOn((alien.x + cowhand.x)/2, (alien.y + cowhand.y)/2);
                    Stage1.playSound('shoot');  //takes two seconds to play
                    cowhand.setTintFill(0xFFFFFF);
                    Stage1.cam.flash(500);
                }, 1500*i, cowhand);
    
                //Cowboy returns to original tint 1/3 a second after the shot
                setTimeout(function(){ 
                    cowhand.clearTint();
                    Stage1.cam.resetFX();
                }, 500 + 1500*i, cowhand);
                
                //The alien tints red 1/3 a second after the cowboy untints white, indicating hit
                setTimeout(function(){ 
                    alien.health -= 1;
                    alien.spr.setTint(0xDC143C);
                    Stage1.updateHealth(alien); // update the healthbar to show the damage
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
                Stage1.cam.setZoom(1);
                Stage1.cam.setPosition(old_x,old_y);
                Stage1.scene.input.enabled = true;
            }, 1500*i);

            return 1500*i;
        }
        else{
            return 0;
        }
    }
    
    //Removes cowhand shots at aliens that died earlier during the round of fire
    Stage1.dontShootDeadAliens = function (shotHitPairs){
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
    Stage1.getCowhandShots = function (){
        var cowhandShots = [];

        Stage1.cowhands.getChildren().forEach(cowhand =>{
            let targets1 = Stage1.bugs.getChildren();
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

    Stage1.consume = function(enemyTarget, bug){
        bug.health++;
        Stage1.updateHealth(bug);
        Stage1.terrainGrid[Math.floor(enemyTarget.y/enemyTarget.height)][Math.floor(enemyTarget.x/enemyTarget.width)]=1;
        Stage1.finder.setGrid(Stage1.terrainGrid);
        enemyTarget.destroy();
    }

    Stage1.updateHealth = function(bug){
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
    Stage1.makeTextBox = function (imageName, text, orientation = 'left', arrow = false, next = false){
        Stage1.speaker.setTexture(imageName);
        Stage1.text.setText(text);

        //Arrange textbox images so that speaker is on the left
        if (orientation == 'left'){
            Stage1.speaker.setPosition(0, 472).setFlipX(false);
            Stage1.text.setPosition(128, 472);
            Stage1.textBtn.setPosition(768, 568);
        } 
        //Arrange textbox images so that the speaker is on the right
        else if (orientation == 'right'){
            Stage1.speaker.setPosition(672, 472).setFlipX(true);
            Stage1.text.setPosition(0, 472);
            Stage1.textBtn.setPosition(640, 568);
        }

        if (arrow = undefined || arrow == false){
            Stage1.textBtn.visible = false;
            Stage1.textBtn.disableInteractive();
        }
        else{

            Stage1.textBtn.visible = true;
            Stage1.textBtn.setInteractive();
        }

        if (next = undefined || next == false){
            Stage1.nextTurn.visible = false;
            Stage1.nextTurn.disableInteractive();
        }
        else{
            Stage1.nextTurn.visible = true;
            Stage1.nextTurn.setInteractive();
        }
    }

    //Shifts the narrative and creates corresponding textbox
    Stage1.progressStory = function(){
        let dialogue = ""+
        "If you don't know how to play, please reload and try the tutorial.\n"+
        "Game Objective: Destroy all the Texas flags on the hivemind ranch!\n\n"+
        "Use the W,A,S, and D keys to move the viewport around the map, or \n"+
        "move the mouse near the edge of the map to move it in that direction.\n\n"+
        "Press the 'Next Turn' button (or spacebar) to start the next turn.\n"+
        "Click the arrow button to close this dialogue."

        Stage1.makeTextBox('alienBig', dialogue, 'left', true, true);

        //Run the callback functions associated with the dialogue
        Stage1.listenArrowClicked();
    }

    //Activate and handle event listener for the arrow click
    Stage1.listenArrowClicked = function(){
        Stage1.emitter.on('arrowClick',Stage1.handleArrowClicked, this);
    }
    Stage1.handleArrowClicked = function(){
        Stage1.emitter.off('arrowClick',Stage1.handleArrowClicked, this);    //deactivate listener

        Stage1.textBtn.setTintFill(0xffffff);
        setTimeout(function(){ Stage1.textBtn.clearTint(); }, 300);
        setTimeout(function(){
            Stage1.textbox.destroy();
            Stage1.speaker.destroy();
            Stage1.text.destroy();
            Stage1.textBtn.destroy();
            Stage1.nextTurn.setPosition(25, 511);
        }, 600);
    }