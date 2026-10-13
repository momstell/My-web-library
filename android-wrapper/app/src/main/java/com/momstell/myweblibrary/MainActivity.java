package com.momstell.myweblibrary;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final String LIBRARY_URL = "https://momstell.github.io/My-web-library/";
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);

        webView.addJavascriptInterface(new AndroidBridge(this), "AndroidBridge");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                if ("momstell.github.io".equalsIgnoreCase(host)) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {}
                return true;
            }
        });

        webView.loadUrl(LIBRARY_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    public static class AndroidBridge {
        private final Activity activity;

        AndroidBridge(Activity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public void openPlatform(String platform, String url) {
            activity.runOnUiThread(() -> openPlatformNow(platform, url));
        }

        private void openPlatformNow(String platform, String url) {
            String pkg = packageFor(platform, url);
            Uri uri = safeUri(url);

            if (pkg == null) {
                if (uri != null) {
                    try {
                        activity.startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (Exception ignored) {}
                }
                return;
            }

            // 1순위: 해당 앱에 작품 URL을 직접 전달합니다.
            if (uri != null) {
                try {
                    Intent deep = new Intent(Intent.ACTION_VIEW, uri);
                    deep.setPackage(pkg);
                    deep.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    activity.startActivity(deep);
                    return;
                } catch (ActivityNotFoundException ignored) {
                    // 해당 앱이 이 URL을 직접 받지 않는 경우 아래 앱 홈 실행으로 폴백합니다.
                }
            }

            // 2순위: 앱 자체를 실행합니다.
            Intent launch = activity.getPackageManager().getLaunchIntentForPackage(pkg);
            if (launch != null) {
                activity.startActivity(launch);
                return;
            }

            // 3순위: 앱이 설치되지 않았다면 Play 스토어로 이동합니다.
            try {
                activity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + pkg)));
            } catch (ActivityNotFoundException e) {
                activity.startActivity(new Intent(Intent.ACTION_VIEW,
                        Uri.parse("https://play.google.com/store/apps/details?id=" + pkg)));
            }
        }

        private Uri safeUri(String url) {
            if (url == null || url.trim().isEmpty()) return null;
            try { return Uri.parse(url); }
            catch (Exception e) { return null; }
        }

        private String packageFor(String platform, String url) {
            String p = platform == null ? "" : platform;
            String u = url == null ? "" : url.toLowerCase();

            if (p.contains("리디") || u.contains("ridi")) return "com.initialcoms.ridi";
            if (p.contains("시리즈") || u.contains("series.naver") || u.contains("naver.me")) return "com.nhn.android.nbooks";
            if (p.contains("카카오") || u.contains("page.kakao") || u.contains("kakaopage") || u.contains("kko.to")) return "com.kakao.page";
            if (p.contains("미스터블루") || u.contains("mrblue")) return "com.mrblue.mrblue";
            return null;
        }
    }
}
