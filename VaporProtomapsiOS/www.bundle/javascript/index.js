window.addEventListener('load', function(e){
    
    const initial_minx = -122.408061;
    const initial_miny = 37.601617;
    const initial_maxx = -122.354907;
    const initial_maxy = 37.640167;
        
    var current_lat;
    var current_lon;
    var current_zoom;
    
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
        
        map.on("moveend", function(){

            const loc = map.getCenter();
            current_lat = loc.lat;
            current_lon = loc.lng;
            current_zoom = map.getZoom();
            console.debug("Set current (Leaflet)", current_lat, current_lon, current_zoom);
        });
        
        const tile_theme = "light";
        const tile_layer = protomapsL.leafletLayer({url: tile_url, theme: tile_theme, flavor: tile_theme});
        tile_layer.addTo(map);
                
        if (current_lat){
            console.debug("Set from current (Leaflet)", current_lat, current_lon, current_zoom);
            map.setView([current_lat, current_lon], current_zoom);
        } else {
            
            const tile_bounds = [
                    [ initial_miny, initial_minx],
                    [ initial_maxy, initial_maxx],
            ];
            
            map.fitBounds(tile_bounds);
        }
        
        return map;
    }
    
    function withMapLibre(tile_url){
        
        map_el.innerHTML = "";
        
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol('pmtiles', protocol.tile);
        
        const p = new pmtiles.PMTiles(tile_url);
        protocol.add(p);
        
        var map_args = {
            container: 'map',
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
        
        if (current_lat){
            console.debug("Set from current (MapLibre)", current_lat, current_lon, current_zoom);
            map_args.center = [ current_lon, current_lat ];
            map_args.zoom = current_zoom;
        } else {
            
             map_args.bounds = [
                    [ initial_minx, initial_miny ],
                    [ initial_maxx, initial_maxy ],
            ];
            
        }
        
        const map = new maplibregl.Map(map_args);
                
        map.on("moveend", function(){
            const loc = map.getCenter();
            current_lat = loc.lat;
            current_lon = loc.lng;
            current_zoom = map.getZoom();
            console.debug("Set current (MapLibre)", current_lat, current_lon, current_zoom);
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

