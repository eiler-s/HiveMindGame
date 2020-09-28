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
        Stage1.scene.load.audio('music', 'src/sound/Crowd Hammer.mp3');
        Stage1.scene.load.audio('cowboyDeath', 'src/sound/death.mp3');
        Stage1.scene.load.image('tilemap', "src/sprites/tilemap.png");
        Stage1.scene.load.tilemapTiledJSON('map', 'src/tilemaps/map.JSON');
        Stage1.scene.load.image('red', 'src/sprites/red.png');
        Stage1.scene.load.spritesheet('bug', 'Sprites/hunter.png',{
            frameWidth:32,
            frameHeight:32,

        });
        Stage1.scene.load.spritesheet('man', 'Sprites/cowboy.png',{
            frameWidth:32,
            frameHeight:32,
        });
        Stage1.scene.load.spritesheet('girl', 'Sprites/cowgirl.png',{
            frameWidth:32,
            frameHeight:32,
        });
    }

    Stage1.create=function(){
        Stage1.sfx = {};
        Stage1.music = Stage1.scene.sound.add('music', { loop: true});
        //Stage1.playSound('hammer');
        Stage1.sfx.cowboyDeath = Stage1.scene.sound.add('cowboyDeath');
        Stage1.playSound('cowboyDeath');

        Stage1.myTurn = true;
        Stage1.pathed = false;
        Stage1.paths = [];
        Stage1.currentBug = null;
        var config = {
            key: 'map',
            tileWidth: 32,
            tileHeight: 32
        }
        Stage1.map = this.make.tilemap(config);
        Stage1.tiles = Stage1.map.addTilesetImage('tilemap');
        Stage1.terrain = Stage1.map.createDynamicLayer('terrain', Stage1.tiles, 0, 0);
        Stage1.top = Stage1.map.createBlankDynamicLayer('tilemap', Stage1.tiles, 0, 0);
        
        //place bugs
        Stage1.bug = Stage1.map.getObjectLayer('bug')['objects'];
        Stage1.bugs = this.add.group();
        Stage1.bug.forEach(object => {
            let obj = Stage1.bugs.create(object.x, object.y - object.height, "bug");
            obj.name = "bug";
            obj.setOrigin(0);
            obj.setInteractive();
            obj.spent = false;
        });
        //movement tiles group
        Stage1.moveTiles = this.add.group();
        //place men (male cowboys)
        Stage1.man = Stage1.map.getObjectLayer('man')['objects'];
        Stage1.mans = this.add.group();
        Stage1.man.forEach(object => {
            let obj = Stage1.mans.create(object.x, object.y - object.height, "man");
            obj.name = "man";
            obj.setOrigin(0);
        });
        //place girls (female cowgirls)
        Stage1.girl = Stage1.map.getObjectLayer('girl')['objects'];
        Stage1.girls = this.add.group();
        Stage1.girl.forEach(object => {
            let obj = Stage1.girls.create(object.x, object.y - object.height, "girl");
            obj.name = "girl";
            obj.setOrigin(0);
        });
        //makes assigns arrow keys to cursors
        Stage1.cursors = this.input.keyboard.createCursorKeys();
        //makes main camera move with cursors
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
        //makes a square (marker) follow cursor
        Stage1.marker = this.add.graphics();
        Stage1.marker.lineStyle(3, 0xffffff, 1);
        Stage1.marker.strokeRect(0,0, Stage1.map.tileWidth, Stage1.map.tileHeight);
        //cam moves when marker is outside dead zone
        Stage1.cam = this.cameras.main;
        Stage1.cam.setDeadzone(700,500);
        Stage1.cam.startFollow(Stage1.marker, true);
        Stage1.cam.setBounds(0,0, (48)*32, 22*32);
        //makes sure terrain layer is selected
        Stage1.map.setLayer('terrain');
        //initializes pathfinder
        Stage1.finder = new EasyStar.js();
        Stage1.terrainGrid =[];
        for (var y=0; y < Stage1.map.height; y++){
            var col = [];
            for (var x = 0; x < Stage1.map.width; x++){
                col.push(Stage1.getTileID(x, y));
            }
            Stage1.terrainGrid.push(col);
        }
        Stage1.finder.setGrid(Stage1.terrainGrid);
        var tileset = Stage1.map.tilesets[0];
        var properties = tileset.tileProperties;
        Stage1.acceptableTiles=[];
        for (var i = tileset.firstgid-1; i < Stage1.tiles.total; i++){
            // tiles without any properties are assumed to be acceptable
            if(!properties.hasOwnProperty(i)) {
                Stage1.acceptableTiles.push(i+1);
                continue;
            }
            if(!properties[i].collide)Stage1.acceptableTiles.push(i+1); //registers tiles that can be moved on
            if(properties[i].cost) Stage1.finder.setTileCost(i+1, properties[i].cost); // registers cost
        }
        Stage1.finder.setAcceptableTiles(Stage1.acceptableTiles);
        //Stage1.graphics =Stage1.add.graphics();
        //listeners
        this.input.on('gameobjectdown', function (pointer, gameObject) {
            if (gameObject.spent == false && Stage1.myTurn == true){// movement
                Stage1.currentBug = gameObject;
                Stage1.map.setLayer('terrain');
                Stage1.originX = Math.floor(gameObject.x/32);
                Stage1.originY = Math.floor(gameObject.y/32);
                console.log(Stage1.originX+" "+Stage1.originY)
                var shape = new Phaser.Geom.Circle(Stage1.originX*32, (Stage1.originY + 1)*32, 5*32);
                var squares = Stage1.map.getTilesWithinShape(shape);
                for (var i=0; i < squares.length; i++){
                    Stage1.finder.findPath(Stage1.originX, Stage1.originY, squares[i].x, squares[i].y, function(path){
                        if (path === null){
                            console.log("path not found")
                        }
                        else{
                            //console.log(path);
                            if (path.length <= 5){
                                Stage1.pathStorage(path)
                            }
                        }
                    });
                    Stage1.finder.calculate();
                }
            }
            else if (gameObject.name == 'red'){
                for (var i = 0; i < Stage1.paths.length; i++){
                    if (Stage1.paths[i][Stage1.paths[i].length - 1].x == (gameObject.x/32) && Stage1.paths[i][Stage1.paths[i].length - 1].y == (gameObject.y/32)){
                        Stage1.moveBug(Stage1.paths[i]);
                    }
                }
            }
        }, Stage1);
        
    }

    Stage1.pathStorage = function(path){
        let obj = Stage1.moveTiles.create(path[path.length-1].x*32,(path[path.length-1].y)*32, 'red');
        obj.name = 'red';
        obj.setInteractive();
        obj.setOrigin(0,1);
        Stage1.paths.push(path);
    }

    Stage1.moveBug = function(path){
        // Sets up a list of tweens
        var tweens = [];
        for (var i = 0; i < path.length-1; i++){
            var ex = path[i+1].x;
            var ey = path[i+1].y;
            tweens.push({
                targets: Stage1.currentBug,
                x: {value: ex*Stage1.map.tileWidth, duration: 100},
                y: {value: ey*Stage1.map.tileHeight, duration: 100}
            });
        }

        Stage1.scene.tweens.timeline({tweens: tweens});
        Stage1.moveTiles.clear(true);
    }

    Stage1.update=function(time ,delta){
        Stage1.controls.update(delta)
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        // Rounds down to nearest tile
        var pointerTileX = Stage1.map.worldToTileX(worldPoint.x);
        var pointerTileY = Stage1.map.worldToTileY(worldPoint.y);
        Stage1.marker.x = Stage1.map.tileToWorldX(pointerTileX);
        Stage1.marker.y = Stage1.map.tileToWorldY(pointerTileY);
        //Stage1.marker.setVisible(!Stage1.checkCollision(pointerTileX,pointerTileY));
    }

    Stage1.getTileID=function(x,y){
        if (Stage1.map.hasTileAt(x,y)){
            var tile = Stage1.map.getTileAt(x,y);
            return tile.index;
        }
        else{
            return 0;
        }
    }
    
    Stage1.checkCollision=function(x,y){
        var tile = Stage1.map.getTileAt(x, y);
        return tile.properties.collide == true;
    }


