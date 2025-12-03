import Vapor

// https://docs.vapor.codes/advanced/middleware/#creating-a-middleware

/// Middleware to strip a specific prefix from the request path.
struct StripPrefixMiddleware: Middleware {

    let prefix: String

    init(prefix: String) {
        self.prefix = prefix
    }

    func respond(to request: Vapor.Request, chainingTo next: any Vapor.Responder) -> NIOCore.EventLoopFuture<Vapor.Response> {
        // Check if the request's path starts with the prefix
        
        if request.url.path.hasPrefix(prefix) {
            // Strip the prefix from the path
            let newPath = request.url.path.dropFirst(prefix.count)
            // Update the request's URL with the new path
            request.url.path = String(newPath)
        }

        // Pass the modified request to the next responder in the chain
        return  next.respond(to: request)
    }
}
