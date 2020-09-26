class Stage1 extends Phaser.Scene{
    constructor(){
        super({key: "stage1"});
        this.controls;
    }

    preload(){
        this.load.image('tilemap', "src/sprites/tilemap.png");
        this.load.tilemapTiledJSON('map', 'src/tilemaps/map.JSON')
    }

    create(){
        var config = {
            key: 'map',
            tileWidth: 32,
            tileHeight: 32
        }
        this.map = this.make.tilemap(config);
        this.tiles = this.map.addTilesetImage('tilemap');
        this.terrain = this.map.createStaticLayer('terrain', this.tiles, 0, 0);
        //this.entity = this.map.createStaticLayer('entity', this.tiles, 0, 0);
        this.bugs = this.map.createFromObjects('entity', 11, {key:'bug'});
        this.map.setLayer('terrain');
        this.cursors = this.input.keyboard.createCursorKeys();
        this.marker = this.add.graphics();
        this.marker.lineStyle(3, 0xffffff, 1);
        this.marker.strokeRect(0,0, this.map.tileWidth, this.map.tileHeight);
        this.finder = new EasyStar.js();
        this.terrainGrid =[];
        for (var y=0; y < this.map.height; y++){
            var col = [];
            for (var x = 0; x < this.map.width; x++){
                col.push(this.getTileID(x, y));
            }
            this.terrainGrid.push(col);
        }
        this.finder.setGrid(this.terrainGrid);
        var tileset = this.map.tilesets[0];
        var properties = tileset.tileProperties;
        this.acceptableTiles=[];
        for (var i = tileset.firstgid-1; i < this.tiles.total; i++){
            if(!properties.hasOwnProperty(i)) {
                this.acceptableTiles.push(i+1);
                continue;
            }
            if(!properties[i].collide)this.acceptableTiles.push(i+1);
            if(properties[i].cost) this.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
        }
        this.finder.setAcceptableTiles(this.acceptableTiles);
        var controlConfig = {
            camera: this.cameras.main,
            left: this.cursors.left,
            right: this.cursors.right,
            up: this.cursors.up,
            down: this.cursors.down,
            acceleration : 1,
            drag: 1,
            maxSpeed: 1
        };
        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
        this.cam = this.cameras.main;
        this.cam.setDeadzone(700,500);
        this.cam.startFollow(this.marker, true);
        this.cam.setBounds(0,0, (48)*32, 22*32);
        
        
    }

    update(time ,delta){
        this.controls.update(delta)
        
        //console.log(this.input.activePointer.worldX)
        //console.log(this.input.activePointer.worldY)
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        // Rounds down to nearest tile
        var pointerTileX = this.map.worldToTileX(worldPoint.x);
        var pointerTileY = this.map.worldToTileY(worldPoint.y);
        this.marker.x = this.map.tileToWorldX(pointerTileX);
        this.marker.y = this.map.tileToWorldY(pointerTileY);
        //this.marker.setVisible(!this.checkCollision(pointerTileX,pointerTileY));
    }

    getTileID(x,y){
        if (this.map.hasTileAt(x,y)){
            var tile = this.map.getTileAt(x,y);
            return tile.index;
        }
        else{
            return 0;
        }
    }
    
    checkCollision(x,y){
        var tile = this.map.getTileAt(x, y);
        return tile.properties.collide == true;
    }
    
    handleClick(pointer){
        var x = this.cam.scrollX + pointer.x;
        var y = this.cam.scrollY + pointer.y;
        var toX = Math.floor(x/32);
        var toY = Math.floor(y/32);

    }

}
export default Stage1;