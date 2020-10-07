var Stage1 ={};

    Stage1.playSound=function(name){
        if (name == 'hammer'){
            Stage1.music.play();
        } else if (name == 'cowboyDeath'){
            Stage1.sfx.cowboyDeath.play();
        }
    }
    
    Stage1.preload=function(){
        Stage1.scene = this;

        //Load audio files
        Stage1.scene.load.audio('music', './src/sound/Crowd Hammer.mp3');
        Stage1.scene.load.audio('cowboyDeath', './src/sound/death.mp3');

        //loads background
        Stage1.scene.load.image('Backgrounds', "./src/sprites/bgSheet1.png");
        Stage1.scene.load.image('bg','./Sprites/bgSheet2.png');

        //Load tilemap images and map layout files
        Stage1.scene.load.image('tilemap', "./src/sprites/tilemap.png");
        Stage1.scene.load.image('red', './src/sprites/red.png');
        Stage1.scene.load.tilemapTiledJSON('map', './src/tilemaps/map.json');

        //Load character spritesheets
        Stage1.scene.load.spritesheet('bug', './Sprites/huntersheet.png',{
            frameWidth: 32,
            frameHeight: 32,
            margin: 1,
            spacing: 2
        });
        Stage1.scene.load.spritesheet('cowboy', './Sprites/cowhands/cowboy.png',{
            frameWidth:32,
            frameHeight:32,
        });
        Stage1.scene.load.spritesheet('cowgirl', './Sprites/cowhands/cowgirl.png',{
            frameWidth:32,
            frameHeight:32,
        });
    }

    Stage1.create=function(){

        var bg = Stage1.scene.add.image(0,0,'bg').setScale(16).setOrigin(0);
        //Create the music and sound effects using loaded audio
        Stage1.music = Stage1.scene.sound.add('music', { loop: true});
        Stage1.sfx = {};
        Stage1.sfx.cowboyDeath = Stage1.scene.sound.add('cowboyDeath');

        //Are these two lines just for testing purposes?
        Stage1.playSound('cowboyDeath');
        //Stage1.playSound('hammer');

        //Defing user turn, selected unit, and path storage
        Stage1.myTurn = true;
        Stage1.currentBug = null;
        Stage1.pathed = false;  //?
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
        
        //Create bug objectlayer from JSON then corresponding sprite group
        Stage1.bug = Stage1.map.getObjectLayer('bug')['objects'];
        Stage1.bugs = this.add.group();

        //Create animations for bug movement
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('bug', { start: 1, end: 2 }),
            frameRate: 10,
            repeat: -1  //consider removing repeats depending on implementation?
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('bug', { start: 3, end: 4 }),
            frameRate: 10,
            repeat: -1  //consider removing repeats depending on implementation?
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('bug', { start: 5, end: 6 }),
            frameRate: 10,
            repeat: -1  //consider removing repeats depending on implementation?
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('bug', { start: 7, end: 8 }),
            frameRate: 10,
            repeat: -1  //consider removing repeats depending on implementation?
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'bug', frame: 0 }],
            frameRate: 20,
            repeat: -1  //consider removing repeats depending on implementation?
        });

        //Instantiate the bugs on the map
        Stage1.bug.forEach(object => {
            let obj = Stage1.bugs.create(object.x, object.y - object.height, "bug");
            obj.name = "bug";
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.setInteractive();
            obj.anims.play('idle');
            obj.spent = false;
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

        //Makes sure terrain layer is selected so that obstacles can be found
        Stage1.map.setLayer('terrain');

        //Initializes pathfinder
        Stage1.finder = new EasyStar.js();
        //Make a matrix that corresponds each terrain map pixel to a tile ID
        Stage1.terrainGrid =[];
        for (var y=0; y < Stage1.map.height; y++){
            var col = [];
            for (var x = 0; x < Stage1.map.width; x++){
                col.push(Stage1.getTileID(x, y));
            }
            Stage1.terrainGrid.push(col);
        }
        
        //Create cowboys objectlayer from JSON then corresponding sprite group
        Stage1.cowboy = Stage1.map.getObjectLayer('man')['objects'];
        Stage1.cowboys = this.add.group();

        //Instantiate the cowboys on the map
        Stage1.cowboy.forEach(object => {
            let obj = Stage1.cowboys.create(object.x, object.y - object.height, "cowboy");
            obj.name = "cowboy";
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.setInteractive();
            Stage1.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)]=9;
        });

        //Create cowgirl objectlayer from JSON then corresponding sprite group
        Stage1.cowgirl = Stage1.map.getObjectLayer('girl')['objects'];
        Stage1.cowgirls = this.add.group();

        //Instantiate the cowgirls on the map
        Stage1.cowgirl.forEach(object => {
            let obj = Stage1.cowgirls.create(object.x, object.y - object.height, "cowgirl");
            obj.name = "cowgirl";
            //set interactive to test spawn
            //obj.setInteractive();
            obj.setDepth(1);
            obj.setOrigin(0);
            obj.setInteractive();
            Stage1.terrainGrid[Math.floor(obj.y/obj.height)][Math.floor(obj.x/obj.width)]=10;
        });

        Stage1.finder.setGrid(Stage1.terrainGrid);

        var tileset = Stage1.map.tilesets[0];
        var properties = tileset.tileProperties;

        //Check each tile to see if it can be moved on
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
                        if (path === null){ //Some tiles are simply not available destinations?
                            //console.log("path not found")
                        }
                        else{
                            //console.log(path);
                            //If a path is longer than 5 then there is a more direct path available
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
                    }
                }
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
            else if ((gameObject.name == 'cowboy' || gameObject.name == 'cowgirl') && Stage1.myTurn && Stage1.currentBug != null && !Stage1.currentBug.inMotion){
                let bug = Stage1.currentBug;

                let attackRange = 1.8;
                //square of the range. Faster to compute
                let attackRangeS = Math.pow(attackRange, 2);
                let distanceS = Math.pow(bug.x/32 - gameObject.x/32, 2) + Math.pow(bug.y/32 - gameObject.y/32, 2)
                
                //Check if target is in range
                if (distanceS < attackRangeS){
                    console.log("attack");
                }
            }

            
        }, Stage1);
        
    }

    //Create a movement tile at a path's destination
    Stage1.pathStorage = function(path){
        let obj = Stage1.moveTiles.create(path[path.length-1].x*32, path[path.length-1].y*32, 'red');
        obj.name = 'red';
        obj.setInteractive();
        obj.setOrigin(0);
        Stage1.paths.push(path);
    }

    //Moves the bug to a destination tile
    Stage1.moveBug = function(path){
        var timeline = Stage1.scene.tweens.createTimeline();

        //let other functions know if the bug is moving
        Stage1.currentBug.inMotion = true;
        timeline.setCallback("onComplete", () => Stage1.currentBug.inMotion = false);
        //var tween_list = [];
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
                dirKey = 'right';
            } else if (xdir < 0) {
                dirKey = 'left';
            } else if (ydir > 0) {
                dirKey = 'up';
            } else if (ydir < 0) {
                dirKey = 'down';
            }
            //console.log('dirKey:',dirKey);
            animQueue.push(""+dirKey);

            timeline.add({
                targets: Stage1.currentBug,
                x: xf*Stage1.map.tileWidth,
                y: yf*Stage1.map.tileHeight,
                duration: 1000,
                onStart: function move() {  //play the anim when the tween starts
                    //console.log('here');
                    tempDir=animQueue.shift();
                    //console.log('   internal dir:', tempDir);
                    Stage1.currentBug.anims.stop();
                    Stage1.currentBug.anims.play(tempDir);
                    
                    //set a timer to keep track of how long the animation has been running
                    /*
                    while (timer.now < 1000){console.log(timer.now)}
                    */
                },
                onComplete: function iddle() {   //stop anim when tween ends
                   // console.log('   stopping');
                    Stage1.currentBug.anims.stop();
                    Stage1.currentBug.anims.play('idle');
                }
            });
        }
        timeline.play();
        Stage1.moveTiles.clear(true);
        //tween_list = [];
        Stage1.paths = [];
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
    }

    //Returns the ID of a tile at a given coordinate
    Stage1.getTileID=function(x,y){
        if (Stage1.map.hasTileAt(x,y)){ //why would there not be a tile?
            var tile = Stage1.map.getTileAt(x,y);
            return tile.index;          //returns the tile ID
        }
        else{
            return 0;
        }
    }
    
    //Returns boolean for whether a tile is collidable
    Stage1.checkCollision=function(x,y){
        var tile = Stage1.map.getTileAt(x, y);
        return tile.properties.collide == true;
    }

    Stage1.spawn = function(enemyTarget){
        let obj = Stage1.bugs.create(enemyTarget.x, enemyTarget.y, "bug");
        obj.name = "bug";
        obj.setDepth(1);
        obj.setOrigin(0);
        obj.setInteractive();
        obj.anims.play('idle');
        obj.spent = true;
        enemyTarget.destroy();
    }

