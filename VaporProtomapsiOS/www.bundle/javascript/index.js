function withLeaflet(tile_url) {
    
    map_el.innerHTML = "";
    const map = L.map('map');

    const tile_theme = "light";
    const tile_bounds = [ [37.601617, -122.408061], [37.640167, -122.354907] ];
    const tile_layer = protomapsL.leafletLayer({url: tile_url, theme: tile_theme, flavor: tile_theme});

    tile_layer.addTo(map);
    map.fitBounds(tile_bounds);
    
    return map;
}

function withMapLibre(tile_url) {
    
    map_el.innerHTML = "";
    
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    
    const p = new pmtiles.PMTiles(tile_url);
    protocol.add(p);
    
    base_source = {
        type: "vector",
        url: "pmtiles://" + tile_url,
    };

    base_layer = {
        'id': 'base',
        'source': 'base',
        // I wish there were a way to specify "all the layers" ...
        'source-layer': 'roads',
        'type': "line",
        'paint': {
            "line-color": "#fc8d62",
        }
    };

    var map_args = {
        container: 'map',
        center: [ -122.408061, 37.601617 ],
        zoom: 15,
        style: {
            version: 8,
            sources: {
                'base': base_source,
            },
            layers: [
                base_layer,
            ]
        }
    };

    var legend = {
        'base': [ 'base' ],
    };

    const map = new maplibregl.Map(map_args);
    return map;
}

// Start!

const map_el = document.getElementById("map");
map_el.innerText = "Loading map";

var xhr = new XMLHttpRequest();
xhr.open('HEAD', "http://localhost:8080/");

xhr.onreadystatechange = function() {
    if (this.readyState == this.DONE) {
      
        // const tile_url = "http://localhost:8080/pmtiles/sfo.pmtiles";
        const tile_url = "http://localhost:8080/ca.pmtiles";

        withMapLibre(tile_url);
    }
};

xhr.send();


