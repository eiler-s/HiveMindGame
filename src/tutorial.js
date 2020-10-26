    var tutorial ={};

    tutorial.playSound=function(name){
        if (name == 'hammer'){
            tutorial.music.play();
        } else if (name == 'cowhandDeath'){
            tutorial.sfx.cowhandDeath.play();
        }
    }

    tutorial.preload=function(){
        tutorial.scene = this;

        //Load audio files
        //Thank you to Fesliyan Studios for background music.
        tutorial.scene.load.audio('music', './Sound/Old_West_Gunslingers_Steve_Oxen.mp3');
        tutorial.scene.load.audio('cowhandDeath', './src/sound/death.mp3');

        //loads background
        tutorial.scene.load.image('Backgrounds', "./src/sprites/bgSheet1.png");
        tutorial.scene.load.image('bg','./Sprites/bgSheet2.png');

        //Load tilemap images and map layout files
        tutorial.scene.load.image('tilemap', "./src/sprites/tilemap.png");
        tutorial.scene.load.image('red', './src/sprites/red.png');
        tutorial.scene.load.tilemapTiledJSON('map', './src/tilemaps/tutorialMap.json');

        //Load next turn utton
        tutorial.scene.load.image('nextTurn', "./src/sprites/nextTurnButton.png");

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

        //Load character images for textboxes
        tutorial.scene.load.image('farmerBig','./Sprites/farmers/farmer2.png');
        tutorial.scene.load.image('farmwBig','./Sprites/farmers/farmwoman2.png');
        tutorial.scene.load.image('cowboyBig','./Sprites/cowhands/cowboy2.png');
        tutorial.scene.load.image('cowgirlBig','./Sprites/cowhands/cowgirl2.png');
        tutorial.scene.load.image('alienBig','./Sprites/cowhands/farmer2.png');
        tutorial.scene.load.spritesheet('arrows','./Sprites/arrows/arrows.png',{
            frameWidth:32,
            frameHeight:32,
        });
    }

    tutorial.create=function(){

        //make the next turn button
        tutorial.nextTurn = this.add.image(70,550,'nextTurn').setDepth(2).setScrollFactor(0).setInteractive().setName("nextTurn");     

        //I forgot what this line is for?
        var bg = tutorial.scene.add.image(0,0,'bg').setScale(16).setOrigin(0);
        
        //Create the music and sound effects using loaded audio
        tutorial.music = tutorial.scene.sound.add('music', { volume: 0.5, loop: true });
        tutorial.music.play();
        tutorial.sfx = {};
        tutorial.sfx.cowhandDeath = tutorial.scene.sound.add('cowhandDeath');
        
        //tutorial.playSound('cowboyDeath');
        //tutorial.playSound('hammer');

        //Defing user turn, selected unit, and path storage
        tutorial.myTurn = true;
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
        //console.log(tutorial.terrainGrid)

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
        tutorial.cam.setPosition(0, 0);
        tutorial.cam.setDeadzone(700,500);
        tutorial.cam.startFollow(tutorial.marker, true);
        tutorial.cam.setBounds(0,0, (48)*32, 22*32);

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

        //Instantiate the bugs on the map
        tutorial.bugLayer.forEach(object => {
            let obj = tutorial.bugs.create(object.x, object.y - object.height, "bug");
            obj.name = "bug";
            obj.setDepth(1);
            obj.setOrigin(0,0);
            obj.setInteractive();
            obj.anims.play('bIdle');
            obj.spent = false;
        });
        
        //Start tutorial narative
        var curNar = narQueue.shift();
        var speech = curNar.shift();
        tutorial.makeTextBox(speech.speaker, speech.orientation, speech.text);

        var bugsMoved = false;
        if (bugsMoved == true){
            curNar = narQueue.shift();

            //Create farmer objectlayer from JSON then corresponding sprite group
            tutorial.farmerLayer = tutorial.map.getObjectLayer('farmer')['objects'];
            tutorial.farmers = this.add.group();

            //Instantiate the farmers on the map
            tutorial.farmerLayer.forEach(object => {
                //Randomly select the gender of the farmers
                var gender;
                var randInt = Math.floor(Math.random()*2 + 1); //Randomly selects 1 or 2
                if (randInt == 1){
                    gender = "farmer";
                } else {
                    gender = "farmwoman";
                }

                //create farmer and identify position on grid
                let obj = tutorial.farmers.create(object.x, object.y - object.height, gender);
                obj.name = "farmer";
                obj.setDepth(1);
                obj.setOrigin(0);
                obj.setInteractive();
                tutorial.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)]=10;
            });
        }

        //Once all the farmers are dead, introduce the cowhands
        var farmersDead = false;
        if (farmersDead == true){
            curNar = narQueue.shift();
            
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
                frames: [{ key: 'cowgirl', frame: 3 }]
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
                frames: [{ key: 'cowgirl', frame: 0 }]
            });

            //Instantiate the cowhands on the map
            tutorial.cowhandLayer.forEach(object => {
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
                let obj = tutorial.cowhands.create(object.x, object.y - object.height, gender);
                obj.name = "cowhand";
                obj.setDepth(1);
                obj.setOrigin(0);
                obj.setInteractive();
                tutorial.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)]= 9;

                //Randomly select the orientation of the cowhands
                var randInt03 = Math.floor(Math.random()*4); //Randomly selects 0, 1, 2, or 3
                switch (randInt03){
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
            });
        }

        //Create movement tile group
        tutorial.moveTiles = this.add.group();

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
        //We really should extract this function
        //Handles click events on units or on available move tiles
        this.input.on('gameobjectdown', function (pointer, gameObject) {
            
            //On their turn, the player can move units that have not yet done so
            if (gameObject.spent == false && tutorial.myTurn == true){
                console.log("test");
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
                            //the path given at this poin is the most direct path. If the most direct path is greater than 5, then it won't be displayed.
                            if (path.length <= 5 && path.length != 0){  //Store each acceptable path's tile destination
                                tutorial.pathStorage(path)
                            }
                        }
                    });
                    tutorial.finder.calculate();
                }
            }
            else if (gameObject.name == 'red'){     //If the player has already selected a unit, show available move tiles
                //Check each availble path to see if selected tile is in range
                for (var i = 0; i < tutorial.paths.length; i++){
                    //If a selected tile is a path destination, move the bug to that destination
                    if (tutorial.paths[i][tutorial.paths[i].length - 1].x == (gameObject.x/32) && tutorial.paths[i][tutorial.paths[i].length - 1].y == (gameObject.y/32)){
                        tutorial.moveBug(tutorial.paths[i]);
                        tutorial.paths = [];

                        //Check if all of the bugs have moved
                        var allMoved = true;
                        tutorial.bugs.getChildren().forEach(bug =>{
                            if (bug.spent == false){
                                allMoved = false;
                            }
                        });
                        if (allMoved == true){  //If all the bugs have moved, trigger instantiation of farmers
                            bugsMoved = true;
                        }
                    }
                }
            }

            //end turn
            else if (gameObject.name == 'nextTurn'){
                tutorial.bugs.getChildren().forEach(bug =>{
                    bug.spent = false;
                });
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
        
            //If the player moves the bug to a human then it will be killed
            else if ((gameObject.name == 'cowhand' || gameObject.name == 'farmer') && tutorial.myTurn && tutorial.currentBug != null && !tutorial.currentBug.inMotion){
                let bug = tutorial.currentBug;

                let attackRange = 1.8;
                //square of the range. Faster to compute
                let attackRangeS = Math.pow(attackRange, 2);
                let distanceS = Math.pow(bug.x/32 - gameObject.x/32, 2) + Math.pow(bug.y/32 - gameObject.y/32, 2)
                
                //Check attack can go ahead
                if (distanceS < attackRangeS && bug.spent != true){
                    tutorial.moveTiles.clear(true); //get rid of move tiles
                    tutorial.paths = [];
        
                    bug.spent = true;
                    tutorial.playSound('cowhandDeath');
                    tutorial.spawn(gameObject);
                }
            }

            else if (gameObject.name = 'arrows'){
                speech = curNar.shift();
                tutorial.makeTextBox(speech.speaker, speech.orientation, speech.text);
            }
        }, tutorial);
        
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
            tutorial.currentBug = null;
        });

        var animQueue=[];
        //Creates a tween for each step of the bugs movement
        for (var i = 0; i < path.length-1; i++){
            //Get location of current tile in the path
            var xo = path[i].x;
            var yo = path[i].y;
            //console.log('(external) xo:',xo,'yo:',yo);

            //Get location of next tile in the path
            var xf = path[i+1].x;
            var yf = path[i+1].y;
            //console.log('(external) xf:',xf,'xf:',yf);

            //Get direction of next movement
            var xdir = xf - xo;
            var ydir = yf - yo;
            //console.log('xdir:',xdir,'ydir:',ydir);

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
            //console.log('dirKey:',dirKey);
            animQueue.push(""+dirKey);

            timeline.add({
                targets: tutorial.currentBug,
                x: xf*tutorial.map.tileWidth,
                y: yf*tutorial.map.tileHeight,
                duration: 10,

                onStart: function move() {  //play the anim when the tween starts
                    //console.log('here');
                    tempDir = animQueue.shift();
                    //console.log('   internal dir:', tempDir);
                    tutorial.currentBug.anims.play(tempDir);
                    
                    //set a timer to keep track of how long the animation has been running
                    /*
                    while (timer.now < 1000){console.log(timer.now)}
                    */
                },

                onComplete: function iddle() {   //stop anim when tween ends
                    // console.log('   stopping');
                    tutorial.currentBug.anims.play('bIdle');
                }
            });
        }
        timeline.play();
        tutorial.moveTiles.clear(true);
    }

    tutorial.update=function(time, delta){
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
    tutorial.getTileID=function(x,y){
        /**
         * input x is the x coord given
         * input y is the y coord given
         * output gives the tile id of the tile at coords, if there isn't a tile, then it is assumed to be ground
         */
        if (tutorial.map.hasTileAt(x,y)){ //why would there not be a tile? Kevin Here, originally there wasn't a tile defined for ground
            var tile = tutorial.map.getTileAt(x,y);
            return tile.index;          //returns the tile ID
        }
        else{
            return 1;
        }
    }

    //Returns boolean for whether a tile is collidable
    tutorial.checkCollision=function(x,y){
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
        let obj = tutorial.bugs.create(enemyTarget.x, enemyTarget.y, "bug");
        obj.name = "bug";
        obj.setDepth(1);
        obj.setOrigin(0);
        obj.setInteractive();
        obj.anims.play('bIdle');
        obj.spent = true;
        tutorial.terrainGrid[Math.floor(enemyTarget.y/enemyTarget.height)][Math.floor(enemyTarget.x/enemyTarget.width)]=1;
        tutorial.finder.setGrid(tutorial.terrainGrid);
        enemyTarget.destroy();
    }

    tutorial.makeTextBox = function (imageName, orientation = 'left', end = false, text){
        tutorial.textbox = this.add.rectangle(0, 472, 800, 228, 0x696969).setDepth(3).setScrollFactor(0);

        if (orientation == 'left'){
            tutorial.speaker = this.add.image(0, 472, imageName).setDepth(3).setScrollFactor(0);
            tutorial.textBtn = this.add.image(768, 568, 'arrows').setDepth(3).setScrollFactor(0).setInteractive();
            tutorial.nextTurn.setPosition(0, 504);
        } 
        else if (orientation == 'right'){
            tutorial.speaker = this.add.image(672, 472, imageName).setDepth(3).setScrollFactor(0).flipX(true);
            tutorial.textBtn = this.add.image(640, 568, 'arrows').setDepth(3).setScrollFactor(0).setInteractive();
            tutorial.nextTurn.setPosition(672, 504);
        }

        if (end == true){
            tutorial.text = this.add.text(128, 472, text).setDepth(3).setScrollFactor(0);
            tutorial.txtBtn.visible = false;
            tutorial.txtBtn.disableInteractive();
        } else {
            tutorial.text = this.add.text(128, 472, text).setDepth(3).setScrollFactor(0);
            tutorial.txtBtn.visible = true;
            this.anims.create({
                key: 'aDown',
                frames: this.anims.generateFrameNumbers('arrows', { start: 0, end: 1 }),
                frameRate: 2,
                repeat: -1
            });
            textBtn.anims.play('aDown');
        }
    }

    var introBugNar = [
        {
            speaker: 'instructions',
            orientation: 'left',
            text: "Hive Queen:\n"+
            "Howdy y'all! Ah know what y'all must be thinkin': why in high hell \n"+
            "did we hafta land on this dustbowl of a planet? Well, ah'll have \n"+
            "ya'll know that our interstella' hiveminds been running low on rations \n"+
            "this season and we need fixins fast. Now conquer this backwater and \n"+
            "see what y'all can rustle up!"
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            text: "Alien1:\n"+
            "Ah'll be damned, this planet is so dry ah'm spitting cotton!"
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            text: "Alien2:\n"+
            "And its hot enough to fry eggs on the sidewalk too, ah reckon."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            text: "Alien1:\n"+
            "Word around the galaxy has it that the locals here are some sort \n"+
            "of bovine primeapes. Dumb as boxes of rocks too. Ah've heard that \n"+
            "they fry up real good though."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            text: "Alien2:\n"+
            "Primeape? Sounds mo' like primerib to me, ha! Lets grill 'em up medium-rare."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            text: "Alien1:\n"+
            "Ah know just what yer thinkin'; afterall we are a hivemind specie. Welp, \n"+
            "we're burnin daylight, lets get to it."
        },
        {
            speaker: 'instructions',
            orientation: 'left',
            end = true,
            text: "Instructions:\n"+
            "Use the cursor keys or move your touchpad pointer near the ege of the \n"+
            "game's screen to move the camera around the map. Left-click on one of \n"+
            "the aliens to see how far they can move. Available destinations are \n"+
            "indicated with red tiles. Click on a red tile to move the alien to the \n"+
            "destination. After moving one alien towards the two farmers, move the \n"+
            "other alien. Each of alien can only perform one action each turn."
        }
    ];

    var introFarmerNar = [
        {
            speaker: 'alienBig',
            orientation: 'left',
            text: "Alien1:\n"+
            "Why, we must be riding a gravy train with biscuit wheels! Lucky fer us, \n"+
            "theres some primeape cattle nearby."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            text: "Alien2:\n"+
            "Lets get huntin'!"
        },
        {
            speaker: 'farmerBig',
            orientation: 'left',
            text: "Farmer:\n"+
            "I'll be, Marge! Those look like some Yankees or something over yonder. \n"+
            "I'll have them know that they're as welcome here as an outhouse breeze. \n"+
            "Quick, get the kids back to the homestead."
        },
        {
            speaker: 'farmwomanBig',
            orientation: 'right',
            text: "Farmwoman:\n"+
            "Were you raised in a barn, Bill? Sure, they look about as friendly as \n"+
            "fire ants but thats no way to treat newcomers. Come hell or high water, \n"+
            "we're going to give them some southern hospitality."
        },
        {
            speaker: 'FarmerBig',
            orientation: 'left',
            text: "Farmer:\n"+
            "Bless your heart, Marge. Its may be rough living out here on the range \n"+
            "but you've never been nothing but sweetness and light. Kids, company’s \n"+
            "coming; add a cup of water to the soup."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            text: "Alien2:\n"+
            "Would ya look at that? If that primeape steer's brain was dynamite he \n"+
            "wouldn't even be able to blow his own nose. This is goin' to be easy \n"+
            "as pie."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            text: "Alien1:\n"+
            "Say, Ah've been doin' some thinkin'..."
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            text: "Alien2:\n"+
            "And ah know just what yer've thunk and ah suppose that yer right. \n"+
            "If we've gotsta round up so many primeape cattle we're goin' to  \n"+
            "need more help."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            text: "Alien1:\n"+
            "Damn straight. Once we slaughter the adults, lets lay some eggs in \n"+
            "their hides to make some more of us. Thata way we can gets ourselves \n"+
            "a regular ranching team. Let the primeape calves run off though; \n"+
            "they're as thin as fiddle strings, just ain't no meat on 'em."
        },
        {
            speaker: 'instructions',
            orientation: 'left',
            end = true,
            text: "Instructions:\n"+
            "Move the aliens so that the farmers are within their movement range. \n"+
            "An alien can only perform one of two actions in their turn: move or \n"+
            "kill. If possible, left-click on a human within a selected alien's \n"+
            "range to kill the human. A new alien will spawn in the dead human's \n"+
            "place. New aliens cannot move until the next turn. Eliminate the two \n"+
            "farmers."
        }
    ];

    var introCowhandNar = [
        {
            speaker: 'cowboyBig',
            orientation: 'left',
            text: "Cowboy:\n"+
            "Those kids came running into town faster than greased lightnin'! \n"+
            "Bill may have been a snot-slinging drunk and Marge as dull as a \n"+
            "mashed-potato sandwich, but thems were damned good people. I'll show \n"+
            "whicheva' revolving sons of *****s that ate those kids parents some \n"+
            "real Texas justice. Mmmhm yep, Ima string them up by a strong oak tree."
        },
        {
            speaker: 'cowgirlBig',
            orientation: 'right',
            text: "Cowgirl:\n"+
            "Hey now, Sheriff, don't be getting as dark as the devil's riding \n"+
            "boots. We're gonna carry those vagabonds back to town and give them \n"+
            "a fair trial...THEN we'll have ourselves a hangin'!"
        },
        {
            speaker: 'cowboyBig',
            orientation: 'left',
            text: "Cowboy:\n"+
            "Well would'ya look at that, I can see them right over that there gully. \n"+
            "gully. 'In lookit them, they're ugly as sin. Lets go show them not to \n"+
            "mess with Texas!"
        },
        {
            speaker: 'cowgirlBig',
            orientation: 'right',
            text: "Cowgirl:\n"+
            "Yee-haw!!!"
        },
        {
            speaker: 'instructions',
            orientation: 'left',
            end = true,
            text: "Instructions:\n"+
            "Kill the remaining humans. Be careful when approaching cowhands. \n"+
            "Moving an alien into a cowhand's attack range will result in the \n"+
            "alien being killed. Cowhands will sometimes also rotate to look \n"+
            "in another direction, so having patience can be advantagous. Be \n"+
            "aware of terrain tiles. Aliens cannot move through trees or over \n"+
            "trenches. However, placing an alien behind a tree will protect \n"+
            "from an opposite cowhands shooting. Also, cowhands can shoot over \n"+
            "trenches."
        }
    ];

    var introFlagNar = [
        {
            speaker: 'alienBig',
            orientation: 'left',
            text: "Alien1:\n"+
            "Fer a moment there, ah though that we'd get ourselves caught in \n"+
            "our own loop. Heck, ah was sweatin' like a whore in church!"
        },
        {
            speaker: 'alienBig',
            orientation: 'right',
            text: "Alien2:\n"+
            "Bah, ah reckon we whipped 'em like a redheaded stepchild. These \n"+
            "ones were tastier too, nice an' tender bites. Ah think we should \n"+
            "set up a ranch in these parts."
        },
        {
            speaker: 'alienBig',
            orientation: 'left',
            text: "Alien1:\n"+
            "Sho' thin', its been a hulluva time. We gotsta do somethin' about \n"+
            "that flag over there, ah'll be damned it we fly someone else's brand \n"+
            "on our land."
        },
        {
            speaker: 'instructions',
            orientation: 'left',
            end = true,
            text: "Instructions:\n"+
            "Move the aliens over the Texas flag to tear it down. The objective \n"+
            "of the game is to remove all the Texas flags in a game level."
        }
    ];

    var narQueue = [introBugNar, introFarmerNar, introCowhandNar, introFlagNar];