class TileData{
    static get TILE_TYPE(){
        return {
            '0': {
                'name': 'field',
                'moveType': Constants.TILE_PASS
            },
            '1': {
                'name': 'vertCanyon',
                'moveType': Constants.TILE_NOT_PASS
            },
            '2': {
                'name': 'horCanyon',
                'moveType': Constants.TILE_NOT_PASS
            },
            '3': {
                'name': 'northCanyon',
                'moveType': Constants.TILE_NOT_PASS
            },
            '4': {
                'name': 'eastCanyon',
                'moveType': Constants.TILE_NOT_PASS
            },
            '5': {
                'name': 'southCanyon',
                'moveType': Constants.TILE_NOT_PASS
            },
            '6': {
                'name': 'westCanyon',
                'moveType': Constants.TILE_NOT_PASS
            },
            '7': {
                'name': 'tree',
                'moveType': Constants.TILE_NOT_PASS
            }
        };
    }
}