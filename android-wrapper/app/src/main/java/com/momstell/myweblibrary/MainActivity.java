package com.momstell.myweblibrary;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {
    private static final String LIBRARY_URL = "https://momstell.github.io/My-web-library/";

    private static final String RIDI_PACKAGE = "com.initialcoms.ridi";
    private static final String SERIES_PACKAGE = "com.nhn.android.nbooks";
    private static final String SERIES_FULL_PACKAGE = "com.nhn.android.nbooks.full";
    private static final String KAKAO_PACKAGE = "com.kakao.page";

    private static final String MRBLUE_PLAY_PACKAGE = "com.mrblue.mrblue";
    private static final String MRBLUE_ONESTORE_PACKAGE = "com.mrblue.onestore_completion";
    private static final String MRBLUE_PLUS_PACKAGE = "com.mrblue.mrblue_completion";

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
                if ("momstell.github.io".equalsIgnoreCase(host)) return false;

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
        private final PackageManager pm;

        AndroidBridge(Activity activity) {
            this.activity = activity;
            this.pm = activity.getPackageManager();
        }

        @JavascriptInterface
        public void openPlatform(String platform, String url) {
            String p = platform == null ? "" : platform;
            String u = url == null ? "" : url;
            String low = u.toLowerCase(Locale.ROOT);

            if (p.contains("시리즈") || low.contains("series.naver") || low.contains("naver.me")) {
                new Thread(() -> {
                    String resolved = followRedirects(u);
                    String contentId = findSeriesContentId(resolved);
                    activity.runOnUiThread(() -> openSeries(resolved, contentId));
                }).start();
                return;
            }

            activity.runOnUiThread(() -> openPlatformNow(p, u));
        }

        private void openPlatformNow(String platform, String url) {
            String low = url == null ? "" : url.toLowerCase(Locale.ROOT);
            Uri uri = safeUri(url);

            if (platform.contains("미스터블루") || low.contains("mrblue")) {
                openMrBlue(uri);
                return;
            }

            String pkg = null;
            if (platform.contains("리디") || low.contains("ridi")) pkg = RIDI_PACKAGE;
            else if (platform.contains("카카오") || low.contains("page.kakao") || low.contains("kakaopage") || low.contains("kko.to")) pkg = KAKAO_PACKAGE;

            if (pkg != null) {
                if (tryOpenUriInPackage(uri, pkg)) return;
                if (launchPackage(pkg)) return;
                openPlayStore(pkg);
                return;
            }

            if (uri != null) {
                try { activity.startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                catch (Exception ignored) {}
            }
        }

        private void openSeries(String resolvedUrl, String contentId) {
            String pkg = firstInstalled(SERIES_PACKAGE, SERIES_FULL_PACKAGE);
            if (pkg == null) {
                openPlayStore(SERIES_PACKAGE);
                return;
            }

            if (contentId != null && !contentId.isEmpty()) {
                Uri deep = Uri.parse("naverbooks://titleEnd?contentId=" + Uri.encode(contentId));
                if (tryOpenUriInPackage(deep, pkg)) return;
            }

            Uri original = safeUri(resolvedUrl);
            if (tryOpenUriInPackage(original, pkg)) return;
            launchPackage(pkg);
        }

        private void openMrBlue(Uri uri) {
            String pkg = firstInstalled(
                    MRBLUE_ONESTORE_PACKAGE,
                    MRBLUE_PLUS_PACKAGE,
                    MRBLUE_PLAY_PACKAGE
            );

            if (pkg != null) {
                if (tryOpenUriInPackage(uri, pkg)) return;
                if (launchPackage(pkg)) return;
            }

            try {
                activity.startActivity(new Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://m.onestore.co.kr/v2/ko-kr/app/0000760861")
                ));
            } catch (Exception ignored) {}
        }

        private String firstInstalled(String... packages) {
            for (String pkg : packages) {
                try {
                    pm.getPackageInfo(pkg, 0);
                    return pkg;
                } catch (Exception ignored) {}
            }
            return null;
        }

        private boolean tryOpenUriInPackage(Uri uri, String pkg) {
            if (uri == null || pkg == null) return false;
            try {
                Intent deep = new Intent(Intent.ACTION_VIEW, uri);
                deep.setPackage(pkg);
                deep.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (deep.resolveActivity(pm) == null) return false;
                activity.startActivity(deep);
                return true;
            } catch (Exception ignored) {
                return false;
            }
        }

        private boolean launchPackage(String pkg) {
            try {
                Intent launch = pm.getLaunchIntentForPackage(pkg);
                if (launch == null) return false;
                launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(launch);
                return true;
            } catch (Exception ignored) {
                return false;
            }
        }

        private void openPlayStore(String pkg) {
            try {
                activity.startActivity(new Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("market://details?id=" + pkg)
                ));
            } catch (ActivityNotFoundException e) {
                try {
                    activity.startActivity(new Intent(
                            Intent.ACTION_VIEW,
                            Uri.parse("https://play.google.com/store/apps/details?id=" + pkg)
                    ));
                } catch (Exception ignored) {}
            }
        }

        private Uri safeUri(String url) {
            if (url == null || url.trim().isEmpty()) return null;
            try { return Uri.parse(url.trim()); }
            catch (Exception e) { return null; }
        }

        private String followRedirects(String raw) {
            if (raw == null || raw.trim().isEmpty()) return raw;
            String current = raw.trim();

            for (int n = 0; n < 6; n++) {
                HttpURLConnection c = null;
                try {
                    URL u = new URL(current);
                    c = (HttpURLConnection) u.openConnection();
                    c.setInstanceFollowRedirects(false);
                    c.setConnectTimeout(3500);
                    c.setReadTimeout(3500);
                    c.setRequestProperty("User-Agent", "Mozilla/5.0 Android MyWebLibrary/3.1");

                    int code = c.getResponseCode();
                    if (code >= 300 && code < 400) {
                        String loc = c.getHeaderField("Location");
                        if (loc == null || loc.isEmpty()) break;
                        current = new URL(u, loc).toString();
                        continue;
                    }
                    break;
                } catch (Exception ignored) {
                    break;
                } finally {
                    if (c != null) c.disconnect();
                }
            }
            return current;
        }

        private String findSeriesContentId(String pageUrl) {
            if (pageUrl == null || pageUrl.isEmpty()) return null;
            HttpURLConnection c = null;

            try {
                URL u = new URL(pageUrl);
                c = (HttpURLConnection) u.openConnection();
                c.setConnectTimeout(5000);
                c.setReadTimeout(5000);
                c.setRequestProperty("User-Agent", "Mozilla/5.0 Android MyWebLibrary/3.1");

                BufferedReader br = new BufferedReader(new InputStreamReader(c.getInputStream()));
                StringBuilder html = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) html.append(line).append('\n');
                br.close();

                Pattern[] patterns = new Pattern[] {
                        Pattern.compile("\\"title_id\\"\\\\s*:\\\\s*\\"(\\\\d+)\\""),
                        Pattern.compile("\\"content_id\\"\\\\s*:\\\\s*\\"(\\\\d+)\\""),
                        Pattern.compile("title_no=([0-9]+)")
                };

                for (Pattern p : patterns) {
                    Matcher m = p.matcher(html);
                    if (m.find()) return m.group(1);
                }
            } catch (Exception ignored) {
            } finally {
                if (c != null) c.disconnect();
            }
            return null;
        }
    }
}
