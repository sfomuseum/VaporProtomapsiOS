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
    }
}
