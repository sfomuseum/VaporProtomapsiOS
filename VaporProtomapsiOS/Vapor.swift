import Vapor

extension Application {
    
    func configure() throws {
                
        let corsConfiguration = CORSMiddleware.Configuration(
            allowedOrigin: .all,
            allowedMethods: [.GET, .OPTIONS],
            allowedHeaders: [.accept, .authorization, .contentType, .origin, .xRequestedWith, .userAgent, .accessControlAllowOrigin]
        )
        
        // CORS stuff is necessary for PMTiles stuff
        let cors = CORSMiddleware(configuration: corsConfiguration)
        self.middleware.use(cors, at: .beginning)
        
        // I can not figure out how to make the default "Public" directory stuff work...
        // https://docs.vapor.codes/advanced/middleware/
        
        guard let wwwBundlePath = Bundle.main.path(forResource: "www", ofType: "bundle") else {
            fatalError("Could not find www.bundle in app resources")
        }
        
        self.middleware.use(FileMiddleware(publicDirectory: wwwBundlePath))
        
        // The order here is important
        self.middleware.use(DocumentsMiddleware())
    }
}
