window.addEventListener('load', function(e){
    
    const initial_minx = -122.408061;
    const initial_miny = 37.601617;
    const initial_maxx = -122.354907;
    const initial_maxy = 37.640167;
        
    var current_minx;
    var current_miny;
    var current_maxx;
    var current_maxy;
        
    function showMap() {
        
        const target_el = document.querySelector("#target");
        const provider_el = document.querySelector("#provider");
        
        const target = target_el.value;
        const provider = provider_el.value;
        
        var tile_url;
        
        switch (target){
            case "sfo":
                tile_url = "http://localhost:8080/pmtiles/" + target + ".pmtiles";
                break;
            case "planet":
                tile_url = "http://localhost:8080/" + target + ".pmtiles";
                break;
            default:
                console.error("Invalid target", target);
                break;
        }
        
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
        
        map.on("move", function(){

            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            
            current_minx = sw.lng;
            current_miny = sw.lat;
            current_maxx = ne.lng;
            current_maxy = ne.lat;
        });
        
        const tile_theme = "light";
        const tile_layer = protomapsL.leafletLayer({url: tile_url, theme: tile_theme, flavor: tile_theme});
        tile_layer.addTo(map);
        
        var tile_bounds;
        
        if (current_minx){
            tile_bounds = [
                [ current_miny, current_minx],
                [ current_maxy, current_maxx],
                           ]
        } else {
            tile_bounds = [
                    [ initial_miny, initial_minx],
                    [ initial_maxy, initial_maxx],
            ];
        }
        
        map.fitBounds(tile_bounds);
        
        return map;
    }
    
    function withMapLibre(tile_url){
        
        map_el.innerHTML = "";
        
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol('pmtiles', protocol.tile);
        
        const p = new pmtiles.PMTiles(tile_url);
        protocol.add(p);
        
        if (current_minx){
            tile_bounds = [
                    [ current_minx, current_miny ],
                    [ current_maxx, current_maxy ],
            ];
        } else {
            
            tile_bounds = [
                    [ initial_minx, initial_miny ],
                    [ initial_maxx, initial_maxy ],
            ];
        }
                
        var map_args = {
            container: 'map',
            bounds: tile_bounds,
            style: {
                version: 8,
                sources: {
                    'protomaps': {
                        type: "vector",
                        url: "pmtiles://" + tile_url,
                    },
                },
                layers: basemaps.layers("protomaps",basemaps.namedFlavor("white"),{lang:"en"}),
            }
        };
        
        const map = new maplibregl.Map(map_args);
                
        map.on("move", function(){
            
            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            
            current_minx = sw.lng;
            current_miny = sw.lat;
            current_maxx = ne.lng;
            current_maxy = ne.lat;

        });
        
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

