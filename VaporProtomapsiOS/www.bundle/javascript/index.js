window.addEventListener('load', function(e){
    
    function showMap() {
        
        const target_el = document.querySelector("#target");
        const provider_el = document.querySelector("#provider");
        
        const target = target_el.value;
        const provider = provider_el.value;
        
        const tile_url = "http://localhost:8080/pmtiles/" + target + ".pmtiles";
        console.debug("Show map", target, provider, tile_url);
        
        switch (provider) {
            case "leaflet":
                withLeaflet(tile_url);
                break;
            case "maplibre":
                withMapLibre(tile_url);
                break;
            default:
                console.error("Unsupported provider", provider);
                break;
        }
        
        return false;
    };
    
    function withLeaflet(tile_url) {
        
        var container = L.DomUtil.get('map');
        
        if (container != null){
            container._leaflet_id = null;
        }
        
        map_el.innerHTML = "";
        const map = new L.map('map');
        
        const tile_theme = "light";
        const tile_bounds = [ [37.601617, -122.408061], [37.640167, -122.354907] ];
        const tile_layer = protomapsL.leafletLayer({url: tile_url, theme: tile_theme, flavor: tile_theme});
        
        tile_layer.addTo(map);
        map.fitBounds(tile_bounds);
        
        return map;
    }
    
    function withMapLibre(tile_url){
        
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
            zoom: 13,
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
    
    const target_el = document.querySelector("#target");
    const provider_el = document.querySelector("#provider");
    
    target_el.onchange = showMap;
    provider_el.onchange = showMap;
    
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', "http://localhost:8080/");
    
    xhr.onreadystatechange = function() {
        if (this.readyState == this.DONE) {
            
            if (this.status != 200){
                alert("Failed to load website, " + this.statusText);
                return;
            }
            
            const xhr2 = new XMLHttpRequest();
            xhr2.open('HEAD', "http://localhost:8080/planet.pmtiles");
            
            xhr2.onreadystatechange = function() {
                if (this.readyState == this.DONE) {
                    
                    if (this.status == 200){
                        const opt = document.createElement("option");
                        opt.setAttribute("value", "planet");
                        opt.appendChild(document.createTextNode("Planet"));
                        target_el.appendChild(opt);
                    }
                }
            }
            
            xhr2.send();
            showMap();
        }
    };
    
    xhr.send();
});

