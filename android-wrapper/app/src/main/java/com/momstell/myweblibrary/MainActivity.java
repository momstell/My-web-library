package com.momstell.myweblibrary;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.SystemClock;
import android.webkit.JavascriptInterface;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import org.json.JSONObject;
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
    // Android WebView does not open HTML <input type="file"> without a WebChromeClient.
    private static final int COVER_FILE_PICKER_REQUEST = 4930;
    private ValueCallback<Uri[]> pendingCoverFileCallback;

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

        // Route the HTML cover input to Android's system image picker.
        // This grants temporary read access to the selected Uri; no gallery/storage
        // permissions, filesystem paths or changes to external deep links are required.
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view,
                                             ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                if (pendingCoverFileCallback != null) {
                    pendingCoverFileCallback.onReceiveValue(null);
                }
                pendingCoverFileCallback = filePathCallback;
                Intent photoPicker = new Intent(Intent.ACTION_GET_CONTENT);
                photoPicker.addCategory(Intent.CATEGORY_OPENABLE);
                photoPicker.setType("image/*");
                photoPicker.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                if (fileChooserParams != null
                        && fileChooserParams.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) {
                    photoPicker.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                }
                try {
                    startActivityForResult(Intent.createChooser(photoPicker, "표지 사진 선택"),
                            COVER_FILE_PICKER_REQUEST);
                    return true;
                } catch (Exception e) {
                    pendingCoverFileCallback = null;
                    filePathCallback.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, "사진 선택 앱을 열 수 없습니다",
                            Toast.LENGTH_SHORT).show();
                    return true;
                }
            }
        });

        webView.loadUrl(libraryUrlForIntent(getIntent()));
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != COVER_FILE_PICKER_REQUEST) return;
        ValueCallback<Uri[]> callback = pendingCoverFileCallback;
        pendingCoverFileCallback = null;
        if (callback == null) return;
        // Always finish the callback, including cancel: otherwise WebView can
        // refuse to open the next file chooser.
        Uri[] selected = null;
        if (resultCode == RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                int count = data.getClipData().getItemCount();
                selected = new Uri[count];
                for (int i = 0; i < count; i++) {
                    selected[i] = data.getClipData().getItemAt(i).getUri();
                }
            } else if (data.getData() != null) {
                selected = new Uri[] { data.getData() };
            }
        }
        callback.onReceiveValue(selected);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (webView != null) {
            webView.loadUrl(libraryUrlForIntent(intent));
        }
    }

    private String libraryUrlForIntent(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) {
            return LIBRARY_URL;
        }

        String type = intent.getType();
        if (type == null || !type.startsWith("text/")) {
            return LIBRARY_URL;
        }

        CharSequence titleCs = intent.getCharSequenceExtra(Intent.EXTRA_SUBJECT);
        if (titleCs == null || titleCs.length() == 0) {
            try {
                titleCs = intent.getCharSequenceExtra(Intent.EXTRA_TITLE);
            } catch (Exception ignored) {}
        }
        CharSequence textCs = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);

        String title = titleCs == null ? "" : titleCs.toString().trim();
        String text = textCs == null ? "" : textCs.toString().trim();
        String url = firstHttpUrl(text);
        title = guessSharedTitle(title, text, url);

        Uri.Builder b = Uri.parse(LIBRARY_URL).buildUpon();
        if (!title.isEmpty()) b.appendQueryParameter("share_title", title);
        if (!text.isEmpty()) b.appendQueryParameter("share_text", text);
        if (!url.isEmpty()) b.appendQueryParameter("share_url", url);
        return b.build().toString();
    }

    private String guessSharedTitle(String subject, String text, String url) {
        String s = subject == null ? "" : subject.trim();
        if (!s.isEmpty()
                && !s.matches("(?i).*(NAVER\\s*로그인|네이버\\s*로그인|NAVER\\s*시리즈|공유).*")) {
            return s;
        }

        if (text == null || text.trim().isEmpty()) return s;

        String cleaned = text;
        if (url != null && !url.isEmpty()) cleaned = cleaned.replace(url, " ");
        String[] lines = cleaned.split("[\\r\\n]+");

        for (String line : lines) {
            String v = line.trim();
            if (v.length() < 2 || v.length() > 120) continue;
            if (v.matches("(?i)https?://.*")) continue;
            if (v.matches("(?i).*(NAVER\\s*로그인|네이버\\s*로그인|NAVER\\s*시리즈|네이버\\s*시리즈|공유하기|링크).*")) continue;
            return v;
        }
        return s;
    }

    private String firstHttpUrl(String text) {
        if (text == null || text.isEmpty()) return "";
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("https?://[^\\s<>\\\"']+", java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(text);
        if (!m.find()) return "";
        return m.group().replaceAll("[),.\\]]+$", "");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    public static class AndroidBridge {
        private final Activity activity;
        private final PackageManager pm;
        private long lastSeriesRequestAt = 0L;
        private long lastMrBlueRequestAt = 0L;

        AndroidBridge(Activity activity) {
            this.activity = activity;
            this.pm = activity.getPackageManager();
        }

        // KakaoPage stores the same work in several forms: its official share
        // link uses series_id, its older product URL ends in /home/slug/id.
        // Normalise both without rewriting saved data or another platform's URLs.
        private String kakaoWorkId(String raw) {
            if (raw == null || raw.isEmpty()) return "";
            try {
                Uri u = Uri.parse(raw);
                String host = u.getHost();
                if (host == null || !(host.equalsIgnoreCase("page.kakao.com")
                        || host.equalsIgnoreCase("link-page.kakao.com")
                        || host.equalsIgnoreCase("kko.to"))) return "";
                String id = u.getQueryParameter("series_id");
                if (id == null || !id.matches("[0-9]{5,12}")) id = u.getQueryParameter("seriesId");
                if (id != null && id.matches("[0-9]{5,12}")) return id;
                String path = u.getPath();
                if (path != null) {
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile(
                            "/(?:content/|home/(?:[^/]+/)?)([0-9]{5,12})(?:/|$)").matcher(path);
                    if (m.find()) return m.group(1);
                }
            } catch (Exception ignored) {}
            return "";
        }

        // Default: show the *specific work* in a browser, never launch
        // the KakaoPage application HOME as fallback.
        @JavascriptInterface
        public void openKakaoWorkWeb(String raw) {
            final String id = kakaoWorkId(raw);
            activity.runOnUiThread(() -> {
                if (id.isEmpty()) {
                    Toast.makeText(activity, "카카오페이지 작품 번호를 찾지 못했습니다", Toast.LENGTH_SHORT).show();
                    return;
                }
                Uri dest = Uri.parse("https://page.kakao.com/content/" + id);
                Intent browser = new Intent(Intent.ACTION_VIEW, dest);
                browser.addCategory(Intent.CATEGORY_BROWSABLE);
                browser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                for (String pkg : new String[]{"com.android.chrome","com.sec.android.app.sbrowser",
                                              "org.mozilla.firefox","com.microsoft.emmx"}) {
                    try {
                        Intent directed = new Intent(browser);
                        directed.setPackage(pkg);
                        activity.startActivity(directed);
                        return;
                    } catch (Exception ignored) {}
                }
                try {
                    activity.startActivity(Intent.createChooser(browser, "작품 상세를 열 브라우저 선택"));
                } catch (Exception e) {
                    Toast.makeText(activity, "웹 브라우저를 실행할 수 없습니다", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // Optional test: ask the installed KakaoPage application to handle
        // its official sharing URL. Never silently replace a rejected work
        // deep link with the app launcher.
        @JavascriptInterface
        public void tryKakaoWorkApp(String raw) {
            final String id = kakaoWorkId(raw);
            activity.runOnUiThread(() -> {
                if (id.isEmpty()) {
                    Toast.makeText(activity, "카카오페이지 작품 번호를 찾지 못했습니다", Toast.LENGTH_SHORT).show();
                    return;
                }
                Uri share = Uri.parse("https://link-page.kakao.com/open/content?series_id=" + id);
                if (tryOpenUriInPackage(share, KAKAO_PACKAGE)) return;
                Toast.makeText(activity, "앱 직접 연결이 지원되지 않아 웹 상세로 엽니다", Toast.LENGTH_LONG).show();
                openKakaoWorkWeb(share.toString());
            });
        }

        @JavascriptInterface
        public void openPlatformV2(String platform, String url, String title) {
            String p = platform == null ? "" : platform;
            String u = url == null ? "" : url;
            String t = title == null ? "" : title;
            String low = u.toLowerCase(Locale.ROOT);

            if (p.contains("시리즈") || low.contains("series.naver") || low.contains("naver.me") || low.contains("nid.naver.com")) {
                if (!claimSeriesRequest()) return;
                new Thread(() -> {
                    SeriesResolveResult result = resolveSeriesOnServer(u, t);
                    activity.runOnUiThread(() -> openSeriesResolved(result, u));
                }).start();
                return;
            }

            openPlatform(p, u);
        }

        @JavascriptInterface
        public void openPlatform(String platform, String url) {
            String p = platform == null ? "" : platform;
            String u = url == null ? "" : url;
            String low = u.toLowerCase(Locale.ROOT);

            if (p.contains("시리즈") || low.contains("series.naver") || low.contains("naver.me") || low.contains("nid.naver.com")) {
                if (!claimSeriesRequest()) return;
                new Thread(() -> {
                    SeriesResolveResult result = resolveSeriesOnServer(u);
                    activity.runOnUiThread(() -> openSeriesResolved(result, u));
                }).start();
                return;
            }

            if (p.contains("카카오") || low.contains("page.kakao.com")
                    || low.contains("link-page.kakao.com") || low.contains("kko.to")) {
                openKakaoWorkWeb(u);
                return;
            }

            if (p.contains("미스터블루") || low.contains("mrblue")) {
                if (!claimMrBlueRequest()) return;
                new Thread(() -> {
                    String resolved = followRedirects(u);
                    String target = normalizeMrBlueUrl(resolved);
                    activity.runOnUiThread(() -> openMrBlue(target));
                }).start();
                return;
            }

            activity.runOnUiThread(() -> openPlatformNow(p, u));
        }

        private synchronized boolean claimSeriesRequest() {
            long now = SystemClock.elapsedRealtime();
            if (now - lastSeriesRequestAt < 6000L) {
                return false;
            }
            lastSeriesRequestAt = now;
            return true;
        }

        private synchronized boolean claimMrBlueRequest() {
            long now = SystemClock.elapsedRealtime();
            if (now - lastMrBlueRequestAt < 4000L) {
                return false;
            }
            lastMrBlueRequestAt = now;
            return true;
        }

        private void openPlatformNow(String platform, String url) {
            String low = url == null ? "" : url.toLowerCase(Locale.ROOT);
            Uri uri = safeUri(url);

            String pkg = null;
            if (platform.contains("리디") || low.contains("ridi")) pkg = RIDI_PACKAGE;
            else if (platform.contains("카카오") || low.contains("page.kakao") || low.contains("kakaopage")
                    || low.contains("link-page.kakao") || low.contains("kko.to")) {
                openKakaoWorkWeb(url);
                return;
            }

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

        private void openSeriesResolved(SeriesResolveResult result, String originalUrl) {
            String pkg = firstInstalled(SERIES_PACKAGE, SERIES_FULL_PACKAGE);
            if (pkg == null) {
                toast("시리즈 앱을 찾지 못했습니다");
                openPlayStore(SERIES_PACKAGE);
                return;
            }

            if (result != null && result.ok && result.deepLink != null && !result.deepLink.isEmpty()) {
                if (result.productNo != null && !result.productNo.isEmpty()
                        && result.contentId != null && !result.contentId.isEmpty()) {
                    saveSeriesContentId(result.productNo, result.contentId);
                }
                toast("시리즈 작품 연결 · " + result.via);
                if (forceOpenUriInPackage(Uri.parse(result.deepLink), pkg)) return;
            }

            if (result != null && result.productNo != null && result.productNo.matches("\\d+")) {
                openProtectedSeries(result.productNo, pkg);
                return;
            }

            String fallbackUrl = result != null && result.canonical != null && !result.canonical.isEmpty()
                    ? result.canonical : originalUrl;
            String mobileUrl = toSeriesMobileUrl(fallbackUrl, null);
            if (mobileUrl != null && mobileUrl.contains("series.naver.com")) {
                toast("시리즈 작품주소 직접 연결");
                if (forceOpenUriInPackage(Uri.parse(mobileUrl), pkg)) return;
            }

            toast("시리즈 작품 연결 실패 → 앱 홈");
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

        private static class SeriesResolveResult {
            boolean ok;
            String deepLink;
            String canonical;
            String contentId;
            String via;
            String error;
            String productNo;
        }

        private SeriesResolveResult resolveSeriesOnServer(String rawUrl) {
            return resolveSeriesOnServer(rawUrl, "");
        }

        private SeriesResolveResult resolveSeriesOnServer(String rawUrl, String title) {
            SeriesResolveResult out = new SeriesResolveResult();
            HttpURLConnection c = null;

            try {
                String encoded = URLEncoder.encode(rawUrl, "UTF-8");
                String encodedTitle = URLEncoder.encode(title == null ? "" : title, "UTF-8");
                URL url = new URL("https://ncbdmzuwhphdstxcahxk.supabase.co/functions/v1/series-resolver?url=" + encoded + "&title=" + encodedTitle);
                c = (HttpURLConnection) url.openConnection();
                c.setConnectTimeout(7000);
                c.setReadTimeout(10000);
                c.setRequestMethod("GET");
                c.setRequestProperty("Accept", "application/json");
                c.setRequestProperty("User-Agent", "MyWebLibrary/4.6 Android");

                int status = c.getResponseCode();
                BufferedReader br = new BufferedReader(new InputStreamReader(
                        status >= 200 && status < 400 ? c.getInputStream() : c.getErrorStream()
                ));
                StringBuilder body = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) body.append(line);
                br.close();

                JSONObject j = new JSONObject(body.toString());
                out.ok = j.optBoolean("ok", false);
                out.deepLink = j.optString("deepLink", "");
                out.canonical = j.optString("canonical", "");
                out.contentId = j.optString("contentId", "");
                out.via = j.optString("via", "");
                out.error = j.optString("error", "");
                out.productNo = j.optString("productNo", "");

                if (!out.ok && (out.error == null || out.error.isEmpty())) {
                    out.error = "resolver status " + status;
                }
                return out;
            } catch (Exception e) {
                out.ok = false;
                out.error = e.getClass().getSimpleName();
                return out;
            } finally {
                if (c != null) c.disconnect();
            }
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

        private SharedPreferences seriesPrefs() {
            return activity.getSharedPreferences("mwl_series_links", Activity.MODE_PRIVATE);
        }

        private String cachedSeriesContentId(String productNo) {
            return seriesPrefs().getString("content_" + productNo, null);
        }

        private void saveSeriesContentId(String productNo, String contentId) {
            if (productNo == null || contentId == null) return;
            if (!productNo.matches("\\d+") || !contentId.matches("\\d+")) return;
            seriesPrefs().edit().putString("content_" + productNo, contentId).apply();
        }

        private void openProtectedSeries(String productNo, String pkg) {
            String cached = cachedSeriesContentId(productNo);
            if (cached != null && cached.matches("\\d+")) {
                toast("시리즈 보호작품 · 저장된 작품 ID");
                if (forceOpenUriInPackage(
                        Uri.parse("naverbooks://titleEnd?contentId=" + Uri.encode(cached)), pkg)) return;
            }

            CookieManager cm = CookieManager.getInstance();
            String cookie = cm.getCookie("https://series.naver.com");
            if (cookie != null && !cookie.trim().isEmpty()) {
                new Thread(() -> {
                    String id = resolveProtectedContentId(productNo, cookie);
                    activity.runOnUiThread(() -> {
                        if (id != null) {
                            saveSeriesContentId(productNo, id);
                            toast("시리즈 보호작품 · 기기 로그인으로 연결");
                            forceOpenUriInPackage(
                                    Uri.parse("naverbooks://titleEnd?contentId=" + Uri.encode(id)), pkg);
                        } else {
                            showSeriesLoginResolver(productNo, pkg);
                        }
                    });
                }).start();
                return;
            }

            showSeriesLoginResolver(productNo, pkg);
        }

        private void showSeriesLoginResolver(String productNo, String pkg) {
            final WebView auth = new WebView(activity);
            WebSettings ws = auth.getSettings();
            ws.setJavaScriptEnabled(true);
            ws.setDomStorageEnabled(true);
            ws.setDatabaseEnabled(true);
            ws.setSupportMultipleWindows(false);
            ws.setJavaScriptCanOpenWindowsAutomatically(false);

            auth.setFocusable(true);
            auth.setFocusableInTouchMode(true);
            auth.setOnTouchListener((v, event) -> {
                if (!v.hasFocus()) v.requestFocus(View.FOCUS_DOWN);
                return false;
            });

            CookieManager cm = CookieManager.getInstance();
            cm.setAcceptCookie(true);
            cm.setAcceptThirdPartyCookies(auth, true);

            final Dialog dialog = new Dialog(
                    activity,
                    android.R.style.Theme_DeviceDefault_Light_NoActionBar_Fullscreen
            );

            auth.setWebViewClient(new WebViewClient() {
                private boolean resolving = false;
                private long lastAttemptAt = 0L;

                private boolean handleExternalScheme(WebView view, String rawUrl) {
                    if (rawUrl == null || rawUrl.isEmpty()) return false;
                    String low = rawUrl.toLowerCase(Locale.ROOT);
                    if (low.startsWith("http://") || low.startsWith("https://")) return false;

                    try {
                        if (low.startsWith("intent://")) {
                            Intent intent = Intent.parseUri(rawUrl, Intent.URI_INTENT_SCHEME);
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            try {
                                activity.startActivity(intent);
                                return true;
                            } catch (Exception e) {
                                String fallback = intent.getStringExtra("browser_fallback_url");
                                if (fallback != null && !fallback.isEmpty()) {
                                    view.loadUrl(fallback);
                                    return true;
                                }
                            }
                        } else {
                            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(rawUrl));
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            activity.startActivity(intent);
                            return true;
                        }
                    } catch (Exception ignored) {
                    }

                    toast("네이버 앱 호출을 열지 못했어요 · 아이디 로그인으로 진행해 주세요");
                    return true;
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri uri = request.getUrl();
                    return handleExternalScheme(view, uri == null ? "" : uri.toString());
                }

                @Override
                @SuppressWarnings("deprecation")
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    return handleExternalScheme(view, url);
                }

                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);

                    // 로그인 입력란이 터치되면 WebView가 IME 포커스를 확실히 잡도록 합니다.
                    view.evaluateJavascript(
                            "(function(){var es=document.querySelectorAll('input');" +
                            "for(var i=0;i<es.length;i++){es[i].addEventListener('focus',function(){" +
                            "if(window.getSelection){window.getSelection().removeAllRanges();}" +
                            "});}})();",
                            null
                    );

                    long now = SystemClock.elapsedRealtime();
                    if (resolving || now - lastAttemptAt < 1500L) return;

                    String cookie = CookieManager.getInstance().getCookie("https://series.naver.com");
                    if (cookie == null || cookie.trim().isEmpty()) return;

                    lastAttemptAt = now;
                    resolving = true;

                    new Thread(() -> {
                        String id = resolveProtectedContentId(productNo, cookie);
                        activity.runOnUiThread(() -> {
                            if (id != null) {
                                saveSeriesContentId(productNo, id);
                                if (dialog.isShowing()) dialog.dismiss();
                                auth.destroy();
                                toast("시리즈 보호작품 연동 완료");
                                forceOpenUriInPackage(
                                        Uri.parse("naverbooks://titleEnd?contentId=" + Uri.encode(id)), pkg);
                            } else {
                                resolving = false;
                            }
                        });
                    }).start();
                }
            });

            dialog.setContentView(
                    auth,
                    new ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                    )
            );
            dialog.setOnDismissListener(d -> {
                try {
                    auth.stopLoading();
                    auth.clearFocus();
                } catch (Exception ignored) {}
            });

            dialog.show();

            Window window = dialog.getWindow();
            if (window != null) {
                window.setLayout(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                );
                window.setSoftInputMode(
                        WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
                                | WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN
                );
            }

            auth.requestFocus(View.FOCUS_DOWN);
            toast("시리즈 보호작품 1회 연동 · 로그인 후 자동 연결");

            String target = "https://m.series.naver.com/novel/detail.series?productNo=" + productNo;
            auth.loadUrl(target);
        }

        private String resolveProtectedContentId(String productNo, String cookie) {
            String[] kinds = new String[] {"novel", "ebook", "comic"};

            for (String kind : kinds) {
                HttpURLConnection conn = null;
                try {
                    URL u = new URL("https://series.naver.com/" + kind
                            + "/volumeList.series?productNo=" + productNo
                            + "&sortOrder=ASC&page=1");
                    conn = (HttpURLConnection) u.openConnection();
                    conn.setConnectTimeout(6000);
                    conn.setReadTimeout(8000);
                    conn.setInstanceFollowRedirects(true);
                    conn.setRequestProperty("User-Agent",
                            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/129 Mobile Safari/537.36");
                    conn.setRequestProperty("Accept", "application/json, text/javascript, */*; q=0.01");
                    conn.setRequestProperty("X-Requested-With", "XMLHttpRequest");
                    conn.setRequestProperty("Referer", "https://series.naver.com/");
                    conn.setRequestProperty("Cookie", cookie);

                    int status = conn.getResponseCode();
                    if (status >= 200 && status < 400) {
                        BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                        StringBuilder body = new StringBuilder();
                        String line;
                        while ((line = br.readLine()) != null) body.append(line).append('\n');
                        br.close();

                        String text = body.toString();
                        String[] keys = new String[] {
                                "upperOriginalProductId",
                                "upperOriginalProductNo",
                                "contentId",
                                "content_id",
                                "titleId",
                                "title_id"
                        };
                        for (String key : keys) {
                            String id = findDigitsNearKey(text, key);
                            if (id != null) return id;
                        }
                    }
                } catch (Exception ignored) {
                } finally {
                    if (conn != null) conn.disconnect();
                }
            }

            // 회차 API가 계속 막히는 경우 로그인된 상세 HTML도 한 번 확인합니다.
            HttpURLConnection conn = null;
            try {
                URL u = new URL("https://series.naver.com/novel/detail.series?productNo=" + productNo);
                conn = (HttpURLConnection) u.openConnection();
                conn.setConnectTimeout(6000);
                conn.setReadTimeout(8000);
                conn.setInstanceFollowRedirects(true);
                conn.setRequestProperty("User-Agent",
                        "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/129 Mobile Safari/537.36");
                conn.setRequestProperty("Accept-Language", "ko-KR,ko;q=0.9");
                conn.setRequestProperty("Cookie", cookie);

                if (conn.getResponseCode() >= 200 && conn.getResponseCode() < 400) {
                    BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder body = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) body.append(line).append('\n');
                    br.close();

                    String text = body.toString();
                    for (String key : new String[] {
                            "upperOriginalProductId", "content_id", "title_id", "contentId", "titleId"
                    }) {
                        String id = findDigitsNearKey(text, key);
                        if (id != null) return id;
                    }
                }
            } catch (Exception ignored) {
            } finally {
                if (conn != null) conn.disconnect();
            }
            return null;
        }

        private String toSeriesMobileUrl(String raw, String productNo) {
            String candidate = raw == null ? "" : raw.trim();

            try {
                Uri u = Uri.parse(candidate);
                String host = u.getHost();
                if ("nid.naver.com".equalsIgnoreCase(host)) {
                    String inner = u.getQueryParameter("url");
                    if (inner != null && !inner.isEmpty()) candidate = inner;
                }
            } catch (Exception ignored) {}

            for (int i = 0; i < 3; i++) {
                try {
                    String decoded = Uri.decode(candidate);
                    if (decoded.equals(candidate)) break;
                    candidate = decoded;
                } catch (Exception e) {
                    break;
                }
            }

            if (candidate.contains("series.naver.com")) {
                candidate = candidate
                        .replace("http://series.naver.com/", "https://m.series.naver.com/")
                        .replace("https://series.naver.com/", "https://m.series.naver.com/")
                        .replace("http://m.series.naver.com/", "https://m.series.naver.com/");
                return candidate;
            }

            if (productNo != null && productNo.matches("\\d+")) {
                return "https://m.series.naver.com/novel/detail.series?productNo=" + productNo;
            }
            return candidate;
        }

        private boolean forceOpenUriInPackage(Uri uri, String pkg) {
            if (uri == null || pkg == null) return false;
            try {
                Intent i = new Intent(Intent.ACTION_VIEW, uri);
                i.setPackage(pkg);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(i);
                return true;
            } catch (Exception ignored) {
                return false;
            }
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
                    c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 MyWebLibrary/4.6");
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

        private String resolveSeriesCanonical(String raw) {
            if (raw == null || raw.trim().isEmpty()) return raw;

            String candidate = raw.trim();

            // naver.me -> 실제 도착 주소까지 먼저 풉니다.
            if (candidate.contains("naver.me")) {
                candidate = followRedirects(candidate);
            }

            // nid.naver.com 로그인 래퍼 안의 url= 파라미터에 실제 시리즈 작품주소가 들어있는 경우가 많습니다.
            String unwrapped = unwrapSeriesUrl(candidate);
            if (unwrapped != null) candidate = unwrapped;

            // 리다이렉트 이후 다시 로그인 래퍼가 나올 수 있어 한 번 더 풉니다.
            if (candidate.contains("nid.naver.com")) {
                String redirected = followRedirects(candidate);
                String again = unwrapSeriesUrl(redirected);
                candidate = again != null ? again : redirected;
            }

            candidate = normalizeSeriesUrl(candidate);

            // URL 전체가 인코딩되어 있어도 productNo를 복구해 작품주소를 재구성합니다.
            String decoded = candidate;
            for (int i = 0; i < 3; i++) {
                String next = Uri.decode(decoded);
                if (next.equals(decoded)) break;
                decoded = next;
            }

            String embedded = extractEmbeddedSeriesUrl(decoded);
            if (embedded != null) {
                candidate = normalizeSeriesUrl(embedded);
            }

            String productNo = findNumberAfter(decoded, "productNo=");
            if (productNo != null && !candidate.contains("series.naver.com")) {
                candidate = "https://series.naver.com/novel/detail.series?productNo=" + productNo;
            }

            return candidate;
        }

        private String unwrapSeriesUrl(String raw) {
            if (raw == null || raw.isEmpty()) return null;
            try {
                Uri uri = Uri.parse(raw);
                String inner = uri.getQueryParameter("url");
                if (inner != null && inner.contains("series.naver.com")) {
                    return inner;
                }
            } catch (Exception ignored) {}

            String decoded = raw;
            for (int i = 0; i < 3; i++) {
                try {
                    String next = Uri.decode(decoded);
                    if (next.equals(decoded)) break;
                    decoded = next;
                } catch (Exception e) {
                    break;
                }
            }
            return extractEmbeddedSeriesUrl(decoded);
        }

        private String extractEmbeddedSeriesUrl(String text) {
            if (text == null) return null;
            int start = text.indexOf("http://m.series.naver.com/");
            if (start < 0) start = text.indexOf("https://m.series.naver.com/");
            if (start < 0) start = text.indexOf("https://series.naver.com/");
            if (start < 0) start = text.indexOf("http://series.naver.com/");
            if (start < 0) return null;

            int end = text.length();
            String[] stops = new String[] {"&surl=", "&svctype=", "\"", "'", " "};
            for (String stop : stops) {
                int p = text.indexOf(stop, start);
                if (p > start && p < end) end = p;
            }
            return text.substring(start, end);
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
