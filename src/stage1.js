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
        var tiles = this.map.addTilesetImage('tilemap');
        this.terrain = this.map.createStaticLayer('terrain', tiles, 0, 0);
        this.entity = this.map.createStaticLayer('entity', tiles, 0, 0);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.map.setLayer('terrain');
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
        this.cam.setBounds(0,0, (26+21)*32, 22*32)
        
    }

    update(time ,delta){
        this.controls.update(delta)
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

}
export default Stage1;