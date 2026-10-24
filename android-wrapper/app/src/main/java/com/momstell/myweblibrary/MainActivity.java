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
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;

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

        s.setSupportMultipleWindows(false);

        final AndroidBridge bridge = new AndroidBridge(this);
        webView.addJavascriptInterface(bridge, "AndroidBridge");
        webView.setWebViewClient(new WebViewClient() {
            private boolean routeKnownService(String rawUrl) {
                if (rawUrl == null || rawUrl.trim().isEmpty()) return false;
                String low = rawUrl.toLowerCase(Locale.ROOT);

                if (low.contains("momstell.github.io/my-web-library")) return false;

                if (low.contains("naver.me") || low.contains("series.naver.com")) {
                    bridge.openPlatform("시리즈", rawUrl);
                    return true;
                }
                if (low.contains("mrblue.com")) {
                    bridge.openPlatform("미스터블루", rawUrl);
                    return true;
                }
                if (low.contains("ridi.com") || low.contains("ridi.abr.ge") || low.contains("ridi.airbridge.io")) {
                    bridge.openPlatform("리디", rawUrl);
                    return true;
                }
                if (low.contains("page.kakao.com") || low.contains("kakaopage") || low.contains("kko.to")) {
                    bridge.openPlatform("카카오페이지", rawUrl);
                    return true;
                }
                return false;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String raw = uri == null ? "" : uri.toString();
                if (routeKnownService(raw)) return true;

                String host = uri == null ? null : uri.getHost();
                if ("momstell.github.io".equalsIgnoreCase(host)) return false;

                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {}
                return true;
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (routeKnownService(url)) return true;
                Uri uri = Uri.parse(url);
                String host = uri.getHost();
                if ("momstell.github.io".equalsIgnoreCase(host)) return false;

                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {}
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // target=_blank가 시스템 웹 앱 선택창으로 빠지지 않도록 네이티브 앱에서는 제거합니다.
                view.evaluateJavascript(
                        "document.querySelectorAll('a.open[target]').forEach(function(a){a.removeAttribute('target');});",
                        null
                );
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
                    String canonical = normalizeSeriesUrl(resolved);
                    String contentId = findSeriesContentIdWithFallback(canonical);
                    activity.runOnUiThread(() -> openSeries(canonical, contentId));
                }).start();
                return;
            }

            if (p.contains("미스터블루") || low.contains("mrblue")) {
                new Thread(() -> {
                    String resolved = followRedirects(u);
                    String target = normalizeMrBlueUrl(resolved);
                    activity.runOnUiThread(() -> openMrBlue(target));
                }).start();
                return;
            }

            activity.runOnUiThread(() -> openPlatformNow(p, u));
        }

        private void openPlatformNow(String platform, String url) {
            String low = url == null ? "" : url.toLowerCase(Locale.ROOT);
            Uri uri = safeUri(url);

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
                toast("시리즈 앱을 찾지 못했습니다");
                openPlayStore(SERIES_PACKAGE);
                return;
            }

            if (contentId != null && !contentId.isEmpty()) {
                toast("시리즈 작품 ID " + contentId);
                Uri deep = Uri.parse("naverbooks://titleEnd?contentId=" + Uri.encode(contentId));
                if (tryOpenUriInPackage(deep, pkg)) return;
            } else {
                toast("시리즈 작품 ID를 못 찾음 → 앱 홈");
            }

            Uri original = safeUri(resolvedUrl);
            if (tryOpenUriInPackage(original, pkg)) return;
            launchPackage(pkg);
        }

        private void openMrBlue(String targetUrl) {
            if (targetUrl != null && !targetUrl.isEmpty()) {
                String noScheme = targetUrl
                        .replaceFirst("^https://", "")
                        .replaceFirst("^http://", "");

                String deepText = "mrblue://act=goPage&url=" + noScheme;
                toast("미블 작품링크 시도");
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(deepText));
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    if (i.resolveActivity(pm) != null) {
                        activity.startActivity(i);
                        return;
                    }
                } catch (Exception ignored) {}

                String deepTextHttps = "mrblue://act=goPage&url=" + targetUrl;
                try {
                    Intent i2 = new Intent(Intent.ACTION_VIEW, Uri.parse(deepTextHttps));
                    i2.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    if (i2.resolveActivity(pm) != null) {
                        activity.startActivity(i2);
                        return;
                    }
                } catch (Exception ignored) {}
            }

            String pkg = firstInstalled(
                    MRBLUE_ONESTORE_PACKAGE,
                    MRBLUE_PLUS_PACKAGE,
                    MRBLUE_PLAY_PACKAGE
            );
            if (pkg != null && launchPackage(pkg)) {
                toast("미블 딥링크 실패 → 앱 홈");
                return;
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

            for (int n = 0; n < 8; n++) {
                HttpURLConnection c = null;
                try {
                    URL u = new URL(current);
                    c = (HttpURLConnection) u.openConnection();
                    c.setInstanceFollowRedirects(false);
                    c.setConnectTimeout(4500);
                    c.setReadTimeout(4500);
                    c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 MyWebLibrary/3.3");
                    c.setRequestProperty("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8");

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

        private String normalizeSeriesUrl(String raw) {
            if (raw == null) return "";
            String out = raw.trim();
            out = out.replace("http://m.series.naver.com/", "https://series.naver.com/");
            out = out.replace("https://m.series.naver.com/", "https://series.naver.com/");
            out = out.replace("http://series.naver.com/", "https://series.naver.com/");
            return out;
        }

        private String normalizeMrBlueUrl(String raw) {
            if (raw == null) return "";
            String out = raw.trim();
            out = out.replace("https://www.mrblue.com/", "https://m.mrblue.com/");
            out = out.replace("http://www.mrblue.com/", "https://m.mrblue.com/");
            out = out.replace("http://m.mrblue.com/", "https://m.mrblue.com/");
            return out;
        }

        private String findSeriesContentIdWithFallback(String canonicalUrl) {
            String id = findSeriesContentId(canonicalUrl);
            if (id != null) return id;

            String mobile = canonicalUrl.replace("https://series.naver.com/", "https://m.series.naver.com/");
            id = findSeriesContentId(mobile);
            if (id != null) return id;

            String productNo = findNumberAfter(canonicalUrl, "productNo=");
            if (productNo != null) {
                String[] kinds = new String[] {"novel", "comic", "ebook"};
                for (String kind : kinds) {
                    String alt = "https://series.naver.com/" + kind + "/detail.series?productNo=" + productNo;
                    id = findSeriesContentId(alt);
                    if (id != null) return id;
                }
            }
            return null;
        }

        private String findSeriesContentId(String pageUrl) {
            String source = fetchHtml(pageUrl);
            if (source == null || source.isEmpty()) return null;

            String[] keys = new String[] {
                    "content_id",
                    "title_id",
                    "contentId",
                    "titleId",
                    "title_no=",
                    "titleNo="
            };

            for (String key : keys) {
                String value = findDigitsNearKey(source, key);
                if (value != null) return value;
            }
            return null;
        }

        private String fetchHtml(String pageUrl) {
            if (pageUrl == null || pageUrl.isEmpty()) return null;
            HttpURLConnection c = null;

            try {
                URL u = new URL(pageUrl);
                c = (HttpURLConnection) u.openConnection();
                c.setConnectTimeout(5500);
                c.setReadTimeout(5500);
                c.setInstanceFollowRedirects(true);
                c.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36");
                c.setRequestProperty("Accept-Language", "ko-KR,ko;q=0.9,en;q=0.8");

                BufferedReader br = new BufferedReader(new InputStreamReader(c.getInputStream()));
                StringBuilder html = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) html.append(line).append('\n');
                br.close();
                return html.toString();
            } catch (Exception ignored) {
                return null;
            } finally {
                if (c != null) c.disconnect();
            }
        }

        private String findDigitsNearKey(String source, String key) {
            int from = 0;
            while (from < source.length()) {
                int start = source.indexOf(key, from);
                if (start < 0) return null;

                int limit = Math.min(source.length(), start + key.length() + 140);
                int p = start + key.length();

                while (p < limit && !Character.isDigit(source.charAt(p))) p++;
                if (p < limit) {
                    int end = p;
                    while (end < limit && Character.isDigit(source.charAt(end))) end++;
                    String value = source.substring(p, end);
                    if (value.length() >= 3 && value.length() <= 12) return value;
                }
                from = start + key.length();
            }
            return null;
        }

        private String findNumberAfter(String source, String marker) {
            int start = source.indexOf(marker);
            if (start < 0) return null;
            start += marker.length();

            int end = start;
            while (end < source.length() && Character.isDigit(source.charAt(end))) end++;
            if (end <= start) return null;

            return source.substring(start, end);
        }

        private void toast(String message) {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show();
        }
    }
}
