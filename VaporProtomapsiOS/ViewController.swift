import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {

    @IBOutlet var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let wk_conf = WKWebViewConfiguration()
        
        // Note: http://localhost:8080 is setup and started in AppDelegate.swift
        
        guard let index_url = URL(string: "http://localhost:8080/index.html") else {
            fatalError("Failed to instantiate URL")
        }
        
        let request = URLRequest(url: index_url)
        
        webView = WKWebView(frame: .zero, configuration: wk_conf)
        webView.navigationDelegate = self
        webView.isInspectable = true
        
        view = webView
        webView.load(request)
    }


}

