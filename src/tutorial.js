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
        //Thank you to Fesliyan Studios for background music.
        tutorial.scene.load.audio('music', './Sound/Old_West_Gunslingers_Steve_Oxen.mp3');
        tutorial.scene.load.audio('cowhandDeath', './src/sound/death.mp3');
        tutorial.scene.load.audio('run', './Sound/running_feet_-Cam-942211296.mp3');
        tutorial.scene.load.audio('shoot', './Sound/shoot.mp3')
        tutorial.scene.load.audio('hawk', './Sound/hawk_screeching-Mike_Koenig-1626170357.mp3')
        tutorial.scene.load.audio('train', './Sound/train.mp3')

        //loads background
        tutorial.scene.load.image('Backgrounds', "./src/sprites/bgSheet1.png");
        tutorial.scene.load.image('bg','./Sprites/bgSheet2.png');

        //Load tilemap images and map layout files
        tutorial.scene.load.image('tilemap', "./src/sprites/tilemap.png");
        tutorial.scene.load.image('red', './src/sprites/red.png');
        tutorial.scene.load.tilemapTiledJSON('map', './src/tilemaps/tutorialMap.json');
        tutorial.scene.load.image('flag', './Sprites/terrain/Texas_flag.png');

        //Load next turn utton
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

        //used for consume function
        tutorial.eatMode = false;
        this.input.keyboard.on('keydown-E', () => tutorial.eatMode = true);

        //make the next turn button
        tutorial.nextTurn = this.add.image(70,550,'nextTurn').setDepth(5).setScrollFactor(0).disableInteractive().setName("nextTurn");
        tutorial.nextTurn.setOrigin(0,0);  
        tutorial.nextTurn.visible = false;

        //place an aimcone
        tutorial.aimcone = this.add.image(0,0,'aimcone').setDepth(5).setVisible(false);     

        //end turn on space
        this.input.keyboard.on('keydown-SPACE', tutorial.endTurn);

        //Create the music and sound effects using loaded audio
        tutorial.music = tutorial.scene.sound.add('music', { volume: 0.1, loop: true });
        tutorial.music.play();
        tutorial.sfx = {};
        tutorial.sfx.cowhandDeath = tutorial.scene.sound.add('cowhandDeath', {volume: 0.1});
        tutorial.sfx.run = tutorial.scene.sound.add('run', {volume: 0.1});
        tutorial.sfx.shoot = tutorial.scene.sound.add('shoot', {volume: 0.1});
        tutorial.sfx.hawk = tutorial.scene.sound.add('hawk', {volume: 0.1});
        tutorial.sfx.train = tutorial.scene.sound.add('train', {volume: 0.1});

        //Define user turn, selected unit, and path storage
        tutorial.currentBug = null;
        tutorial.paths = [];

        //Create game map and tileset
        var config = {
            key: 'map',
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
            con.spr.setDepth(1);
            con.bar.setDepth(2);
            con.setDepth(1);
            con.spr.setOrigin(0);
            con.bar.setOrigin(0);
            var rect = new Phaser.Geom.Rectangle(0, 0, 32, 32);
            con.setInteractive(rect, Phaser.Geom.Rectangle.Contains); 
            con.spr.anims.play('bIdle');
            con.spent = false;
            con.health = 3;
            tutorial.updateHealth(con);
        });

        //Start tutorial narative
        tutorial.curNar = narQueue[0];
        tutorial.speech = tutorial.curNar.shift();

        //Create textbox images
        tutorial.textbox = this.add.rectangle(0, 472, 800, 228, 0x696969).setDepth(3).setScrollFactor(0).setOrigin(0,0);

        tutorial.speaker = this.add.image(0, 472, tutorial.speech.speaker).setDepth(3).setScrollFactor(0).setOrigin(0,0);
        tutorial.speaker.visible = false;

        tutorial.text = this.add.text(128, 472, tutorial.speech.text).setDepth(3).setScrollFactor(0).setOrigin(0,0);

        tutorial.textBtn = this.add.sprite(768, 568, 'arrows').setDepth(3).setScrollFactor(0).setInteractive().setOrigin(0,0);
        tutorial.textBtn.setPosition(640, 568);
        tutorial.textBtn.name = 'textBtn';

        //Create animation for narration button
        this.anims.create({
            key: 'aDown',
            frames: this.anims.generateFrameNumbers('arrows', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        tutorial.textBtn.anims.play('aDown');

        //Variables that activate tutorial events (make sets of characters visible/interactive)
        tutorial.bugsMoved = false;
        tutorial.farmersDead = false;
        tutorial.cowhandsDead = false;
        tutorial.flagDestroyed = false;

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
        tutorial.cursors = this.input.keyboard.createCursorKeys();

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

        //Camera moves when marker is outside dead zone
        tutorial.cam = this.cameras.main;
        tutorial.cam.centerOn(0, 0);
        //tutorial.cam.setDeadzone(700,500);
        //tutorial.cam.startFollow(tutorial.marker, true);
        tutorial.cam.setBounds(0,0, 48*32, 22*32);
        
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

        //CLICK LISTNER
        tutorial.scene.input.on('gameobjectdown', function (pointer, gameObject) {
            //On their turn, the player can move units that have not yet done so
            console.log('gameobject:',gameObject.name);//###
            if (gameObject.name == 'bug' && gameObject.spent == false && tutorial.currentBug == null){
                tutorial.moveTiles.clear(true); //get rid of move tiles
                tutorial.currentBug = gameObject;
                tutorial.map.setLayer('terrain');

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
                        if (path === null){ //If there is a tile that's chosen that's impossible to get to, path would be null.
                            //console.log("path not found")
                        }
                        else{
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
            else if (gameObject.name == 'red'){
                //Check each availble path to see if selected tile is in range
                for (var i = 0; i < tutorial.paths.length; i++){
                    //If a selected tile is a path destination, move the bug to that destination
                    if (tutorial.paths[i][tutorial.paths[i].length - 1].x == (gameObject.x/32) && tutorial.paths[i][tutorial.paths[i].length - 1].y == (gameObject.y/32)){
                        tutorial.moveBug(tutorial.paths[i]);
                        tutorial.paths = [];

                        //If all of the bugs have moved, activate the farmers
                        if (tutorial.bugsMoved == false){
                            tutorial.checkActFarmers();

                            if (tutorial.bugsMoved == true){ //once bugs have moved, go to next narrative phase
                                farmer1 = tutorial.farmers.getChildren()[0];
                                setTimeout(function(){
                                    tutorial.cam.centerOn(farmer1.x, farmer1.y);
                                    tutorial.curNar = narQueue[1];
                                    tutorial.speech = tutorial.curNar.shift();
                                    tutorial.makeTextBox(tutorial.speech.speaker, tutorial.speech.orientation, tutorial.speech.text, tutorial.speech.end);
                                }, 2000);
                            }
                        }
                    }
                }
                tutorial.moveTiles.clear(true); //get rid of move tiles
            }

            //end turn
            else if (gameObject.name == 'nextTurn'){
                tutorial.moveTiles.clear(true); //get rid of move tiles
                tutorial.endTurn();
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
                    tutorial.aimcone.setVisible(false);//no ghost aimcones

                    tutorial.moveTiles.clear(true); //get rid of move tiles
                    tutorial.paths = [];
        
                    bug.spent = true;
                    bug.spr.setTint(0x808080);
                    tutorial.currentBug = null;

                    if(gameObject.name != 'objective'){
                        tutorial.playSound('cowhandDeath');
                    }

                    if (gameObject.name == 'objective'){
                        gameObject.destroy();
                    }
                    else if (tutorial.eatMode){
                        tutorial.consume(gameObject, bug);
                    }
                    else{
                        tutorial.spawn(gameObject);
                        gameObject.destroy();
                    }
                    console.log('num obj:', tutorial.objectives.getChildren().length);//###
                    //objectives check
                    if (tutorial.objectives.getChildren().length == 0){
                        tutorial.music.stop();                      
                        game.scene.stop('tutorial');
                        game.scene.start('win');
                    }
                }

                //check if farmers/cowhands are alive with corresponding method
                if (tutorial.farmersDead == false){
                    tutorial.checkActCowhands();

                    if (tutorial.farmersDead == true){   //move along narrative if last farmer just killed
                        cowhand1 = tutorial.cowhands.getChildren()[0];
                        setTimeout(function(){
                            tutorial.cam.centerOn(cowhand1.x, cowhand1.y);
                            tutorial.curNar = narQueue[2];
                            tutorial.speech = tutorial.curNar.shift();
                            tutorial.makeTextBox(tutorial.speech.speaker, tutorial.speech.orientation, tutorial.speech.text, tutorial.speech.end);
                        }, 1000);
                    }
                } 
                else if (tutorial.cowhandsDead == false){
                    tutorial.checkActFlags();

                    if (tutorial.cowhandsDead == true){
                        flag1 = tutorial.objectives.getChildren()[0];
                        setTimeout(function(){
                            tutorial.cam.centerOn(flag1.x, flag1.y);
                            tutorial.curNar = narQueue[3];
                            tutorial.speech = tutorial.curNar.shift();
                            tutorial.makeTextBox(tutorial.speech.speaker, tutorial.speech.orientation, tutorial.speech.text, tutorial.speech.end);
                        }, 1000);
                    }
                }
            }

            else if (gameObject.name == 'textBtn'){
                if (tutorial.curNar.length != 0){
                    tutorial.speech = tutorial.curNar.shift();
                    tutorial.makeTextBox(tutorial.speech.speaker, tutorial.speech.orientation, tutorial.speech.text, tutorial.speech.end);
                }
            }
            tutorial.eatMode = false; //resets eatMode after a click
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
        tutorial.moveTiles.clear(true);
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
        tutorial.scene.input.enabled = false;
        tutorial.returnFire();

        //checks to see if that was the last alien. If so, you lose
        if(tutorial.bugs.getChildren().length == 0){
            tutorial.music.stop();
            game.scene.stop('stage1');
            game.scene.start('lose');
        }
        else{
            tutorial.bugs.getChildren().forEach(bug =>{
                bug.spent = false;
                bug.spr.clearTint();
            });
        }
    }

    tutorial.returnFire = function(){
        let shotHitPairs = tutorial.getCowhandShots();
        if (shotHitPairs.length > 0){
            let i = 0;
            let old_x = tutorial.cam.x;
            let old_y = tutorial.cam.y;
            tutorial.cam.stopFollow();
            tutorial.cam.setZoom(3);

            for (i; i < shotHitPairs.length; i++){
                //Camera is recentered on a new pair every 4 seconds
                let pair = shotHitPairs[i];
                let cowhand = pair.shooter;
                let alien = pair.target;
                
                //The cowboy tints white for 1 second a second after centering camera, indicating shot
                setTimeout(function(){
                    tutorial.cam.centerOn((alien.x + cowhand.x)/2, (alien.y + cowhand.y)/2);
                    tutorial.playSound('shoot');  //takes two seconds to play
                    cowhand.setTintFill(0xFFFFFF);
                    tutorial.cam.flash(300);
                },  900*i, cowhand);
    
                //Cowboy returns to original tint a second after the shot
                setTimeout(function(){ 
                    cowhand.clearTint();
                    tutorial.cam.resetFX();
                }, 300 + 900*i, cowhand);
                
                //The alien tints red a secnd after the cowboy untints white, indicating hit
                setTimeout(function(){ 
                    alien.health -= 1;
                    tutorial.updateHealth(alien); // update the healthbar to show the damage
                }, 600 + 900*i, alien);

                //Allow time for the user to see what happened
                setTimeout(function(){ 
                    if (alien.health < 1){
                        alien.destroy();
                    }
                }, 900 + 900*i);
            } 
            setTimeout(function(){
                tutorial.cam.startFollow(tutorial.marker, true);
                tutorial.cam.setPosition(old_x,old_y);
                tutorial.cam.setZoom(1);
                tutorial.scene.input.enabled = true;
            }, 900 + 900*i);
        }
        else{
            tutorial.scene.input.enabled = true;
        }
    }
    
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

    tutorial.checkActFarmers = function(){
        //Check for any unmoved bugs
        var allMoved = true;
        tutorial.bugs.getChildren().forEach(bug =>{
            if (bug.spent == false){
                allMoved = false;
            }
        });

        if (allMoved == true) //activate farmers if bugs have moved
        {
            tutorial.bugsMoved = true;

            tutorial.farmers.getChildren().forEach(farmer =>{
                farmer.setInteractive();
                farmer.visible = true;
            });
        }
    }

    tutorial.checkActCowhands = function(){
        var numFarmersAlive = tutorial.farmers.getChildren().length;
        if (numFarmersAlive == 0){
            tutorial.farmersDead = true;

            tutorial.cowhands.getChildren().forEach(cowhand =>{
                cowhand.setInteractive();
                cowhand.visible = true;
            });
        }
    }

    tutorial.checkActFlags = function(){
        var numCowhandsAlive = tutorial.cowhands.getChildren().length;
        if (numCowhandsAlive == 0){
            tutorial.cowhandsDead = true;
            
            tutorial.objectives.getChildren().forEach(flag =>{
                flag.setInteractive();
                flag.visible = true;
            });
        }
    }

    //Makes a text box with progression button and image of speaker
    tutorial.makeTextBox = function (imageName, orientation = 'left', text, end = false){
        
        //Arrange textbox images so that speaker is on the left
        if (orientation == 'left'){
            tutorial.speaker.setPosition(0, 472).setFlipX(false);
            tutorial.text.setPosition(128, 472);
            tutorial.nextTurn.setPosition(0, 504);
        } 
        //Arrange textbox images so that the speaker is on the right
        else if (orientation == 'right'){
            tutorial.speaker.setPosition(672, 472).setFlipX(true);
            tutorial.text.setPosition(0, 472);
            tutorial.nextTurn.setPosition(672, 504);
        }

        tutorial.speaker.visible = true;
        tutorial.speaker.setTexture(imageName);

        tutorial.textBtn.visible = true;
        tutorial.textBtn.setInteractive();

        tutorial.text.setText(text);

        tutorial.nextTurn.visible = false;
        tutorial.nextTurn.disableInteractive();

        //There is no speaker image when instructions are given
        if (imageName == 'instructions'){
            tutorial.speaker.visible = false;
            
            if (end == true){   //disable text button at the end of a narrative script
                tutorial.textBtn.visible = false;
                tutorial.textBtn.disableInteractive();

                if (tutorial.bugsMoved == true){    //Player can click next turn after learning to move the bugs
                    tutorial.nextTurn.visible = true;
                    tutorial.nextTurn.setInteractive();
                }
            }
        }
    }

    var introBugNar = [
        {
            speaker: 'instructions',
            orientation: 'left',
            end: false,
            text: "Hive Queen:\n"+
            "Howdy y'all! Ah know what y'all must be thinkin': why in high hell \n"+
            "did we hafta land on this dustbowl of a planet? Well, ah'll have \n"+
            "ya'll know that our interstella' hiveminds been running low on rations \n"+
            "this season and we need fixins fast. Now conquer this backwater and \n"+
            "see what y'all can rustle up! (Left-click the arrow to continue...)"
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            end: false,
            text: "Alien1:\n"+
            "Ah'll be damned, this planet is so dry ah'm spitting cotton!"
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            end: false,
            text: "Alien2:\n"+
            "And its hot enough to fry eggs on the sidewalk too, ah reckon."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            end: false,
            text: "Alien1:\n"+
            "Word around the galaxy has it that the locals here are some sort \n"+
            "of bovine primeapes. Dumb as boxes of rocks too. Ah've heard that \n"+
            "they fry up real good though."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            end: false,
            text: "Alien2:\n"+
            "Primeape? Sounds mo' like primerib to me, ha! Lets grill 'em up \n"+
            "medium-rare."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            end: false,
            text: "Alien1:\n"+
            "Ah know just what yer thinkin'; afterall we are a hivemind specie. \n"+
            "Whelp, we're burnin daylight, lets get to it."
        },
        {
            speaker: 'instructions',
            orientation: 'left',
            end: true,
            text: "Instructions:\n"+
            "Use the cursor keys to move the camera around the map.\n"+
            "Left-click on an alien to see where it can move.\n"+
            "Available move positions are indicated with red tiles.\n"+ 
            "Left-click on a red tile to move the alien to the destination.\n"+ 
            "Move each alien. An alien can only move once a turn."
        }
    ];

    var introFarmerNar = [
        {
            speaker: 'alienBig',
            orientation: 'left',
            end: false,
            text: "Alien1:\n"+
            "Why, we must be riding a gravy train with biscuit wheels! Lucky fer \n"+
            "us theres some primeape cattle nearby."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            end: false,
            text: "Alien2:\n"+
            "Lets get huntin'!"
        },
        {
            speaker: 'farmerBig',
            orientation: 'left',
            end: false,
            text: "Farmer:\n"+
            "I'll be, Marge! Those look like some Yankees or something over \n"+
            "yonder. I'll have them know that they're as welcome here as an \n"+
            "outhouse breeze. Quick, get the kids back to the homestead."
        },
        {
            speaker: 'farmwomanBig',
            orientation: 'right',
            end: false,
            text: "Farmwoman:\n"+
            "Were you raised in a barn, Bill? Sure, they look about as friendly \n"+
            "as fire ants but thats no way to treat newcomers. Come hell or high \n"+
            "water, we're going to give them some southern hospitality."
        },
        {
            speaker: 'farmerBig',
            orientation: 'left',
            end: false,
            text: "Farmer:\n"+
            "Bless your heart, Marge. Its may be rough living out here on the \n"+
            "range but you've never been nothing but sweetness and light. Kids, \n"+
            "companys coming; add a cup of water to the soup."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            end: false,
            text: "Alien2:\n"+
            "Would ya look at that? If that primeape steer's brain was dynamite \n"+
            "he wouldn't even be able to blow his own nose. This is goin' to be \n"+
            "easy as pie."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            end: false,
            text: "Alien1:\n"+
            "Say, Ah've been doin' some thinkin'..."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            end: false,
            text: "Alien2:\n"+
            "And ah know just what yer've thunk and ah suppose that yer right. \n"+
            "If we've gotsta round up so many primeape cattle we're goin' to  \n"+
            "need more help."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            end: false,
            text: "Alien1:\n"+
            "Damn straight. Once we slaughter the adults, lets lay some eggs in \n"+
            "their hides to make some more of us. Thata way we can gets ourselves \n"+
            "a regular ranching team. Let the primeape calves run off though; \n"+
            "they're as thin as fiddle strings, just ain't no meat on 'em."
        },
        {
            speaker: 'instructions',
            orientation: 'left',
            end: true,
            text: "Instructions:\n"+
            "Click the next turn button (or press spacebar) to start the next turn.\n"+
            "In a turn an alien can perform a single action: move, eat, or kill.\n"+
            "Move an alien to a tile next to or diagonal of a human to eat/kill it\n"+
            "in the next turn. To kill a human, click the alien then the human.\n"+
            "A low health alien may (or may not) spawn after killing a human.\n"+
            "To eat, left click the alien then press the 'e' key to enter eat mode.\n"+
            "Then click the human to be eaten. This will heal the aliens health."
        }
    ];

    var introCowhandNar = [
        {
            speaker: 'cowboyBig',
            orientation: 'left',
            end: false,
            text: "Cowboy:\n"+
            "Those kids came running into town faster than greased lightnin'! \n"+
            "Bill may have been a snot-slinging drunk and Marge as dull as a \n"+
            "mashed-potato sandwich, but thems were damned good people. I'll show \n"+
            "whicheva' revolving sons of *****s that ate those kids parents some \n"+
            "real Texas justice. Mmmhm yep, Ima string them up by a strong oak \n"+
            "tree."
        },
        {
            speaker: 'cowgirlBig',
            orientation: 'right',
            end: false,
            text: "Cowgirl:\n"+
            "Hey now, Sheriff, don't be getting as dark as the devil's riding \n"+
            "boots. We're gonna carry those vagabonds back to town and give them \n"+
            "a fair trial...THEN we'll have ourselves a hangin'!"
        },
        {
            speaker: 'cowboyBig',
            orientation: 'left',
            end: false,
            text: "Cowboy:\n"+
            "Well would'ya look at that, I can see them right over that there \n"+
            "gully. 'In lookit them, they're ugly as sin. Lets go teach them not \n"+
            "to mess with Texas!"
        },
        {
            speaker: 'cowgirlBig',
            orientation: 'right',
            end: false,
            text: "Cowgirl:\n"+
            "Yee-haw!!!"
        },
        {
            speaker: 'instructions',
            orientation: 'left',
            end: true,
            text: "Instructions:\n"+
            "Eliminate the remaining humans. Be careful when approaching cowhands. \n"+
            "After each turn, cowhands will either rotate their orientation or \n"+
            "shoot an alien. Hover the cursor over an cowhand to see their attack range.\n"+
            "Moving an alien into a cowhand's attack range will result in the \n"+
            "alien being shot and losing health.  Also, cowhands can shoot over \n"+
            "trenches and through trees."
        }
    ];

    var introFlagNar = [
        {
            speaker: 'alienBig',
            orientation: 'left',
            end: false,
            text: "Alien1:\n"+
            "Fer a moment there, ah though that we'd got ourselves caught in \n"+
            "our own lasso. Heck, ah was sweatin' like a whore in church!"
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            end: false,
            text: "Alien2:\n"+
            "Bah, ah reckon we whipped 'em like a redheaded stepchild. These \n"+
            "ones were tastier too, nice an' tender bites. Ah think we should \n"+
            "set up a ranch in these parts."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            end: false,
            text: "Alien1:\n"+
            "Sho' thin', its been a hulluva time. We gotsta do somethin' about \n"+
            "that flag over there, ah'll be damned it we fly someone else's \n"+
            "brand on our land."
        },
        {
            speaker: 'instructions',
            orientation: 'left',
            end: true,
            text: "Instructions:\n"+
            "Move the aliens over the Texas flag to tear it down. The objective \n"+
            "of the game is to remove all the Texas flags in a game level."
        }
    ];

    var narQueue = [introBugNar, introFarmerNar, introCowhandNar, introFlagNar];