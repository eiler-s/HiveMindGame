class Stage1 extends Phaser.Scene{
    constructor(){
        super({key: "stage1"});
        this.controls;
    }

    preload(){
        this.load.image("tilemap", "src/sprites/tilemap.png");
        this.load.tilemapCSV("map", "src/tilemaps/stage1.csv");
    }

    create(){
        var config = {
            key: "map",
            tileWidth: 16,
            tileHeight: 16
        }
        var map = this.make.tilemap(config);
        var tiles = map.addTilesetImage('tilemap');
        var layer = map.createStaticLayer(0, tiles, 0, 0);

    }

    update(){

    }
}
export default Stage1;