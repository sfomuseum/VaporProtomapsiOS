import Vapor

extension Application {
    
    func configure() throws {
                
        let corsConfiguration = CORSMiddleware.Configuration(
            allowedOrigin: .all,
            allowedMethods: [.GET, .OPTIONS],
            allowedHeaders: [.accept, .authorization, .contentType, .origin, .xRequestedWith, .userAgent, .accessControlAllowOrigin]
        )
        
        let cors = CORSMiddleware(configuration: corsConfiguration)
        self.middleware.use(cors, at: .beginning)
        self.middleware.use(DocumentsMiddleware())
        
        guard let wwwBundlePath = Bundle.main.path(forResource: "www", ofType: "bundle") else {
            fatalError("Could not find www.bundle in app resources")
        }
        
        self.middleware.use(StripPrefixMiddleware(prefix: "/pmtiles/"))
        self.middleware.use(FileMiddleware(publicDirectory: wwwBundlePath))
    }
}
