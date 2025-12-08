import Vapor

enum DocumentFileURLKey: StorageKey {
    typealias Value = URL
}

struct DocumentsMiddleware: Middleware {
    private let basePath: String?
    
    init(basePath: String? = nil) { self.basePath = basePath }
    
    func respond(to request: Request, chainingTo next: Responder) -> EventLoopFuture<Response> {
        let path = request.url.path
        
        guard let documentsURL = FileManager.default.urls(
            for: .documentDirectory,
            in: .userDomainMask
        ).first else {
            return request.eventLoop.makeFailedFuture(
                Abort(.internalServerError,
                      reason: "Unable to locate the Documents directory.")
            )
        }
        
        let fileURL = documentsURL.appendingPathComponent(String(path))
        
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            return request.eventLoop.makeFailedFuture(
                Abort(.notFound,
                      reason: "File \"\(path)\" not found in Documents.")
            )
        }
        
        request.storage[DocumentFileURLKey.self] = fileURL
        
        // Important: Do NOT enable advancedETagComparison as it triggers fatal errors
        // trying to derive the ETag hash for large files.
        // https://github.com/vapor/vapor/issues/3405#issuecomment-3598353429
        
        return request.fileio.streamFile(at: fileURL.path, advancedETagComparison: false)
    }
}
