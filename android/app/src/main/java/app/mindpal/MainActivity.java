package app.mindpal;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/** Bundles the real web app and GLB; exposes only an explicit document export bridge. */
public final class MainActivity extends Activity {
 private WebView web;
 private ValueCallback<Uri[]> fileCallback;
 private String pendingExport;
 private static final String APP_HOST="appassets.androidplatform.net";
 private static final int PICK_FILE=41,SAVE_FILE=42;
 @Override public void onCreate(Bundle saved) {
  super.onCreate(saved);
  web=new WebView(this);web.setBackgroundColor(Color.rgb(7,8,9));setContentView(web);
  WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(false);settings.setAllowContentAccess(true);settings.setAllowFileAccessFromFileURLs(false);settings.setAllowUniversalAccessFromFileURLs(false);
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);settings.setMediaPlaybackRequiresUserGesture(true);settings.setSupportMultipleWindows(false);
  settings.setSafeBrowsingEnabled(true);settings.setTextZoom(100);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
    Uri uri=request.getUrl();if("https".equals(uri.getScheme())&&APP_HOST.equals(uri.getHost()))return false;
    if(request.hasGesture()&&"https".equals(uri.getScheme())){try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception ignored){}}return true;
   }
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
    Uri uri=request.getUrl();if(!APP_HOST.equals(uri.getHost()))return null;
    String p=uri.getPath();if(p==null||!p.startsWith("/assets/")||p.contains("..")||p.contains("\\"))return missing();
    p=p.substring(8);if(p.isEmpty())p="index.html";
    try{InputStream bytes=getAssets().open(p);Map<String,String> headers=new HashMap<>();headers.put("X-Content-Type-Options","nosniff");headers.put("Cache-Control","no-cache");
     headers.put("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https:; media-src 'self' blob:; object-src 'none'; base-uri 'self'");
     return new WebResourceResponse(mime(p),"UTF-8",200,"OK",headers,bytes);
    }catch(Exception e){return missing();}
   }
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
    if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;
    Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);intent.setType("application/json");intent.addCategory(Intent.CATEGORY_OPENABLE);
    try{startActivityForResult(intent,PICK_FILE);return true;}catch(Exception e){fileCallback=null;return false;}
   }
  });
  web.addJavascriptInterface(new ExportBridge(),"MindPalNative");
  web.loadUrl("https://"+APP_HOST+"/assets/index.html");
 }
 private static WebResourceResponse missing(){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",new HashMap<String,String>(),new ByteArrayInputStream("Not found".getBytes(StandardCharsets.UTF_8)));}
 private static String mime(String p){if(p.endsWith(".js"))return "text/javascript";if(p.endsWith(".css"))return "text/css";if(p.endsWith(".html"))return "text/html";if(p.endsWith(".svg"))return "image/svg+xml";if(p.endsWith(".glb"))return "model/gltf-binary";if(p.endsWith(".woff2"))return "font/woff2";if(p.endsWith(".ttf"))return "font/ttf";if(p.endsWith(".json"))return "application/json";return "application/octet-stream";}
 private final class ExportBridge {
  @JavascriptInterface public void saveFile(final String name,final String type,final String contents){
   if(contents==null||contents.length()>20000000||(!"application/json".equals(type)&&!"text/csv".equals(type)))return;
   runOnUiThread(new Runnable(){@Override public void run(){if(pendingExport!=null){Toast.makeText(MainActivity.this,"Finish the current export first.",Toast.LENGTH_SHORT).show();return;}pendingExport=contents;Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType(type);intent.putExtra(Intent.EXTRA_TITLE,name.replaceAll("[^A-Za-z0-9._-]","_"));try{startActivityForResult(intent,SAVE_FILE);}catch(Exception e){pendingExport=null;Toast.makeText(MainActivity.this,"No document app is available.",Toast.LENGTH_LONG).show();}}});
  }
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);
  if(request==PICK_FILE&&fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK&&data!=null?new Uri[]{data.getData()}:null);fileCallback=null;}
  if(request==SAVE_FILE){boolean success=false;if(result==RESULT_OK&&data!=null&&pendingExport!=null){try(OutputStream stream=getContentResolver().openOutputStream(data.getData())){stream.write(pendingExport.getBytes(StandardCharsets.UTF_8));success=true;}catch(Exception e){Toast.makeText(this,"Could not save the file.",Toast.LENGTH_LONG).show();}}pendingExport=null;web.evaluateJavascript("window.mindpalExportResult&&window.mindpalExportResult("+success+")",null);}
 }
 @Override public void onBackPressed(){web.evaluateJavascript("window.mindpalBack ? window.mindpalBack() : false",new ValueCallback<String>(){@Override public void onReceiveValue(String result){if(!"true".equals(result))MainActivity.super.onBackPressed();}});}
 @Override protected void onPause(){web.evaluateJavascript("window.mindpalBackground&&window.mindpalBackground()",null);web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();web.evaluateJavascript("window.mindpalForeground&&window.mindpalForeground()",null);}}
 @Override protected void onDestroy(){if(web!=null){web.removeJavascriptInterface("MindPalNative");web.destroy();}super.onDestroy();}
}
