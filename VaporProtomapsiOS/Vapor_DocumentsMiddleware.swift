import Vapor

enum DocumentFileURLKey: StorageKey {
    typealias Value = URL
}

struct DocumentsMiddleware: Middleware {
    private let basePath: String?
    
    init(basePath: String? = nil) { self.basePath = basePath }
    
    func respond(to request: Request, chainingTo next: Responder) -> EventLoopFuture<Response> {
        var path = request.url.path
        if let prefix = basePath, !prefix.isEmpty, path.hasPrefix(prefix) {
            path = String(path.dropFirst(prefix.count))
        }
        path = path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        guard !path.isEmpty,
              let fileName = path.split(separator: "/").last,
              !fileName.isEmpty
        else {
            return request.eventLoop.makeFailedFuture(
                Abort(.notFound,
                      reason: "No file name could be derived from the request path.")
            )
        }
        
        guard let documentsURL = FileManager.default.urls(
            for: .documentDirectory,
            in: .userDomainMask
        ).first else {
            return request.eventLoop.makeFailedFuture(
                Abort(.internalServerError,
                      reason: "Unable to locate the Documents directory.")
            )
        }
        
        let fileURL = documentsURL.appendingPathComponent(String(fileName))
        
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            return request.eventLoop.makeFailedFuture(
                Abort(.notFound,
                      reason: "File \"\(fileName)\" not found in Documents.")
            )
        }
        
        request.storage[DocumentFileURLKey.self] = fileURL
        
        // Important: Do NOT enable advancedETagComparison as it triggers fatal errors
        // trying to derive the ETag hash for large files.
        // https://github.com/vapor/vapor/issues/3405#issuecomment-3598353429
        
        return request.fileio.streamFile(at: fileURL.path, advancedETagComparison: false)
    }
}
