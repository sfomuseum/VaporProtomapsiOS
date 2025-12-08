import UIKit
import Vapor

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var vaporApp: Application?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        startVaporServer()
        return true
    }
    
    // MARK: UISceneSession Lifecycle
    
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
    
    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
        // If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
        // Use this method to release any resources that were specific to the discarded scenes, as they will not return.
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        // Shutdown the Vapor server
        vaporApp?.shutdown()
    }
    
    // MARK: Vapor application
    
    func startVaporServer()  {
        
        Task {
            
            do {
                let app = try await Application.make(.detect())
                try app.configure()
                
                // self.vaporApp = app
                
                try await app.execute()
                
            } catch {
                fatalError("Failed to start Vapor server: \(error)")
            }
        }
    }
}

