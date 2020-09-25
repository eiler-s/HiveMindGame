class Stage1 extends Phaser.Scene{
    constructor(){
        super({key: "stage1"});
        this.controls;
    }

    preload(){
        this.load.image("tilemap", "src/sprites/tilemap.png");
        this.load.tilemapCSV("terrain", "src/tilemaps/stage1.csv");
        //this.load.tilemapCSV("entity", "src/tilemaps/stage1Entity.csv")
    }

    create(){
        var terrainConfig = {
            key: "terrain",
            tileWidth: 32,
            tileHeight: 32
        }
        /*var entityConfig = {
            key: 'enemy',
            tileWidth: 32,
            tileHeight: 32
        }*/
        var map = this.make.tilemap(terrainConfig);
        //var entityMap = this.maketilemap(entityConfig);
        //var entityTiles = entityMap.addTilesetImage('entity');
        var tiles = map.addTilesetImage('tilemap');
        var terrainLayer = map.createStaticLayer(0, tiles, 0, 0);
        terrainLayer.width = 800;
        terrainLayer.height = 600;
        //var entityLayer = map.createStaticLayer(1, entityTiles, 0, 0);
        this.cursors = this.input.keyboard.createCursorKeys();
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
        this.cam.setBounds(0,0, (26+21)*32,22*32)
    }

    update(time,delta){
        this.controls.update(delta)
    }
}
export default Stage1;