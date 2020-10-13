var Stage1 ={};

    Stage1.playSound=function(name){
        if (name == 'cowhandDeath'){
            Stage1.sfx.cowhandDeath.play();
        }
    }
    
    Stage1.preload=function(){
        Stage1.scene = this;

        //Load audio files
        //Thank you to Fesliyan Studios for background music.
        Stage1.scene.load.audio('music', './Sound/Old_West_Gunslingers_Steve_Oxen.mp3');
        Stage1.scene.load.audio('cowhandDeath', './src/sound/death.mp3');

        //loads background
        Stage1.scene.load.image('Backgrounds', "./src/sprites/bgSheet1.png");
        Stage1.scene.load.image('bg','./Sprites/bgSheet2.png');

        //Load tilemap images and map layout files
        Stage1.scene.load.image('tilemap', "./src/sprites/tilemap.png");
        Stage1.scene.load.image('red', './src/sprites/red.png');
        Stage1.scene.load.tilemapTiledJSON('map', './src/tilemaps/map.json');

        //Load next turn utton
        Stage1.scene.load.image('nextTurn', "./src/sprites/nextTurnButton.png");

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
    }

    Stage1.create=function(){

        //make the next turn button
        Stage1.nextTurn = this.add.image(70,550,'nextTurn').setDepth(5).setScrollFactor(0).setInteractive().setName("nextTurn");     

        //end turn on space
        this.input.keyboard.on('keydown-SPACE', Stage1.endTurn);

        //I forgot what this line is for
        var bg = Stage1.scene.add.image(0,0,'bg').setScale(16).setOrigin(0);
        
        //Create the music and sound effects using loaded audio
        Stage1.music = Stage1.scene.sound.add('music', { volume: 0.5, loop: true });
        Stage1.music.play();
        Stage1.sfx = {};
        Stage1.sfx.cowhandDeath = Stage1.scene.sound.add('cowhandDeath');
        
        //Stage1.playSound('cowboyDeath');
        //Stage1.playSound('hammer');

        //Defing user turn, selected unit, and path storage
        Stage1.myTurn = true;
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
        //console.log(Stage1.terrainGrid)
        
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

        //Instantiate the bugs on the map
        Stage1.bugLayer.forEach(object => {
            let obj = Stage1.bugs.create(object.x, object.y - object.height, "bug");
            obj.name = "bug";
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.setInteractive();
            obj.anims.play('bIdle');
            obj.spent = false;
            obj.health = 3;
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
            Stage1.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)]= 9;

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

        //Create movement tile group
        Stage1.moveTiles = this.add.group();

        //Assigns arrow keys to cursors
        Stage1.cursors = this.input.keyboard.createCursorKeys();

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

        //Camera moves when marker is outside dead zone
        Stage1.cam = this.cameras.main;
        Stage1.cam.setDeadzone(700,500);
        Stage1.cam.startFollow(Stage1.marker, true);
        Stage1.cam.setBounds(0,0, (48)*32, 22*32);

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

        //Stage1.graphics =Stage1.add.graphics();

        //CLICK LISTNER
        //We really should extract this function
        //Handles click events on units or on available move tiles
        this.input.on('gameobjectdown', function (pointer, gameObject) {


            //On their turn, the player can move units that have not yet done so
            if (gameObject.spent == false && Stage1.myTurn == true){
                Stage1.currentBug = gameObject;
                Stage1.map.setLayer('terrain');

                //Determine origin of unit's move range
                Stage1.originX = Math.floor(gameObject.x/32);
                Stage1.originY = Math.floor((gameObject.y)/32);
                //console.log(gameObject.x+" "+gameObject.y)
                //console.log(Stage1.originX+" "+Stage1.originY)

                //Identify tiles in the unit's move range
                var shape = new Phaser.Geom.Circle(Stage1.originX*32, Stage1.originY*32, 5*32);
                //need to specify the terrain layer for getting the tiles
                var squares = Stage1.map.getTilesWithinShape(shape, null, Stage1.cam, 'terrain');

                for (var i=0; i < squares.length; i++){
                    //Use a callback function to filter the path finder for acceptable paths
                    Stage1.finder.findPath(Stage1.originX, Stage1.originY, squares[i].x, squares[i].y, function(path){
                        if (path === null){ //Some tiles are simply not available destinations? Kevin here, if there is a tile that's chosen that's impossible to get to, path would be null.
                            //console.log("path not found")
                        }
                        else{
                            //If a path is longer than 5 then there is a more direct path available. Kevin here, the path given at this poin is the most direct path. If the most direct path is greater than 5, then it won't be displayed.
                            if (path.length <= 5 && path.length != 0){  //Store each acceptable path's tile destination
                                Stage1.pathStorage(path)
                            }
                        }
                    });
                    Stage1.finder.calculate();
                }
            }
            else if (gameObject.name == 'red'){     //If the player has already selected a unit, show available move tiles
                //Check each availble path to see if selected tile is in range
                for (var i = 0; i < Stage1.paths.length; i++){
                    //If a selected tile is a path destination, move the bug to that destination
                    if (Stage1.paths[i][Stage1.paths[i].length - 1].x == (gameObject.x/32) && Stage1.paths[i][Stage1.paths[i].length - 1].y == (gameObject.y/32)){
                        Stage1.moveBug(Stage1.paths[i]);
                        Stage1.paths = [];
                    }
                }
            }

            //end turn
            else if (gameObject.name == 'nextTurn'){
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
        
            //If the player moves the bug to a human then it will be killed
            else if ((gameObject.name == 'cowhand' || gameObject.name == 'farmer') && Stage1.myTurn && Stage1.currentBug != null && !Stage1.currentBug.inMotion){
                let bug = Stage1.currentBug;

                let attackRange = 1.8;
                //square of the range. Faster to compute. 32 added to make it match the pixel count
                let attackRangeS = Math.pow(attackRange*32, 2);
                //let distX = bug.x-gameObject.x;
                //let distY = bug.y-gameObject.y;

                //might be able to strip the /32 out of this
                let distanceS = Math.pow(bug.x - gameObject.x, 2) + Math.pow(bug.y - gameObject.y, 2)
                
                //Check attack can go ahead
                if (distanceS < attackRangeS && bug.spent != true){
                    Stage1.moveTiles.clear(true); //get rid of move tiles
                    Stage1.paths = [];
        
                    bug.spent = true;
                    Stage1.playSound('cowhandDeath');
                    Stage1.spawn(gameObject);
                }
            }
            
        }, Stage1);
        
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
            Stage1.currentBug = null;
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
                targets: Stage1.currentBug,
                x: xf*Stage1.map.tileWidth,
                y: yf*Stage1.map.tileHeight,
                duration: 10,
                onStart: function move() {  //play the anim when the tween starts
                    //console.log('here');
                    tempDir=animQueue.shift();
                    //console.log('   internal dir:', tempDir);
                    Stage1.currentBug.anims.play(tempDir);
                    
                    //set a timer to keep track of how long the animation has been running
                    /*
                    while (timer.now < 1000){console.log(timer.now)}
                    */
                },

                onComplete: function iddle() {   //stop anim when tween ends
                   // console.log('   stopping');
                    Stage1.currentBug.anims.play('bIdle');
                }
            });
        }
        timeline.play();
        Stage1.moveTiles.clear(true);
    }

    Stage1.update=function(time, delta){
        Stage1.controls.update(delta)
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        //Rounds the cursor location to the nearest tile
        var pointerTileX = Stage1.map.worldToTileX(worldPoint.x);
        var pointerTileY = Stage1.map.worldToTileY(worldPoint.y);

        //Places the marker around the selected tile
        Stage1.marker.x = Stage1.map.tileToWorldX(pointerTileX);
        Stage1.marker.y = Stage1.map.tileToWorldY(pointerTileY);

        //checks if space has been pressed, if so ends turn
        

    }

    //Returns the ID of a tile at a given coordinate
    Stage1.getTileID=function(x,y){
        /**
         * input x is the x coord given
         * input y is the y coord given
         * output gives the tile id of the tile at coords, if there isn't a tile, then it is assumed to be ground
         */
        if (Stage1.map.hasTileAt(x,y)){ //why would there not be a tile? Kevin Here, originally there wasn't a tile defined for ground
            var tile = Stage1.map.getTileAt(x,y);
            return tile.index;          //returns the tile ID
        }
        else{
            return 1;
        }
    }
    
    //Returns boolean for whether a tile is collidable
    Stage1.checkCollision=function(x,y){
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
        let obj = Stage1.bugs.create(enemyTarget.x, enemyTarget.y, "bug");
        obj.name = "bug";
        obj.setDepth(1);
        obj.setOrigin(0);
        obj.setInteractive();
        obj.anims.play('bIdle');
        obj.spent = true;
        obj.health = 1;
        Stage1.terrainGrid[Math.floor(enemyTarget.y/enemyTarget.height)][Math.floor(enemyTarget.x/enemyTarget.width)]=1;
        Stage1.finder.setGrid(Stage1.terrainGrid);
        enemyTarget.destroy();
    }

    Stage1.endTurn = function(){
        Stage1.returnFire();

        Stage1.bugs.getChildren().forEach(bug =>{
            bug.spent = false;
        });

    }

    Stage1.returnFire = function(){
        Stage1.cowhands.getChildren().forEach(cowhand =>{
            let targets1 = Stage1.bugs.getChildren();
            let targets2 = [];
            targets1.forEach(tar => {
                let attackRange = 3.01
                let attackRangeS = Math.pow(attackRange, 2);
                let distanceS = Math.pow(cowhand.x/32 - tar.x/32, 2) + Math.pow(cowhand.y/32 - tar.y/32, 2)
                if(distanceS < attackRangeS){targets2.push(tar);}
            })
            if (targets2.length == 0)return; //return if no targets found
            let rand = Math.floor(Math.random()*targets2.length); //Randomly selects a target
            //damage that target
            tar = targets2[rand];
            tar.health -= 1;
            if (tar.health < 1){
                tar.destroy();
            }
        });
    }

