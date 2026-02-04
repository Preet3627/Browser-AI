package com.example.comet_ai

import android.content.Intent
import androidx.annotation.NonNull
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.example.comet_ai/browser"
    private var methodChannel: MethodChannel? = null

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        methodChannel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
        methodChannel!!.setMethodCallHandler { call, result ->
            if (call.method == "analyzeWebPage") {
                val url = call.argument<String>("url")
                val analysis = "Native analysis for $url: Safe, Educational, Verified."
                result.success(analysis)
            } else if (call.method == "createShortcut") {
                val url = call.argument<String>("url")
                val title = call.argument<String>("title")
                createShortcut(url, title)
                result.success(true)
            } else {
                result.notImplemented()
            }
        }
        
        handleIntent(intent)
    }

    private fun createShortcut(url: String?, title: String?) {
        if (url == null || title == null) return
        
        val shortcutIntent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
        shortcutIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        shortcutIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        
        val addIntent = Intent()
        addIntent.putExtra(Intent.EXTRA_SHORTCUT_INTENT, shortcutIntent)
        addIntent.putExtra(Intent.EXTRA_SHORTCUT_NAME, title)
        addIntent.putExtra(Intent.EXTRA_SHORTCUT_ICON_RESOURCE, Intent.ShortcutIconResource.fromContext(this, R.mipmap.ic_launcher))
        
        addIntent.action = "com.android.launcher.action.INSTALL_SHORTCUT"
        sendBroadcast(addIntent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        val action = intent.action
        val data = intent.dataString

        if (Intent.ACTION_VIEW == action && data != null) {
            methodChannel?.invokeMethod("openUrl", data)
        } else if (Intent.ACTION_PROCESS_TEXT == action) {
            val text = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)
            if (text != null) {
                // If readonly, we can't replace text, only read it
                // val readonly = intent.getBooleanExtra(Intent.EXTRA_PROCESS_TEXT_READONLY, false)
                methodChannel?.invokeMethod("processText", text.toString())
            }
        }
    }
}
