class Stage1 extends Phaser.Scene{
    constructor(){
        super({key: "stage1"});
        this.controls;
    }

    preload(){
        this.load.image('tilemap', "src/sprites/tilemap.png");
        //this.load.tilemapCSV('map', "src/tilemaps/stage1.csv");
        this.load.tilemapTiledJSON('map', 'src/tilemaps/map.JSON')
        //this.load.tilemapCSV('map', "src/tilemaps/stage1Entity.csv")
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

    update(time,delta){
        this.controls.update(delta)
    }
}
export default Stage1;