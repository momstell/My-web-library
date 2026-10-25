plugins {
    id("com.android.application")
}

val commercialWebAssetsDir = layout.buildDirectory.dir("generated/commercialWebAssets")

android {
    namespace = "com.momstell.myweblibrary"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.momstell.myweblibrary.v511test"
        minSdk = 26
        targetSdk = 35
        versionCode = 52
        versionName = "5.1.1-test"
    }
}
android.sourceSets.getByName("main").assets.srcDir(commercialWebAssetsDir)

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}

val copyCommercialWebAssets by tasks.registering(Copy::class) {
    val projectRoot = rootProject.projectDir.parentFile
    from(projectRoot) {
        include("app.html", "commercial-preview.html", "commercial-cover-studio.js")
        include("patch-v*.js", "manifest.webmanifest", "sw.js", "library-icon-*.webp")
        include("cover-art/**")
    }
    into(commercialWebAssetsDir)
}

tasks.named("preBuild").configure {
    dependsOn(copyCommercialWebAssets)
}
