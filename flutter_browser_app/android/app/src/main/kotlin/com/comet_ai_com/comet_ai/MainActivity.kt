package com.comet_ai_com.comet_ai

import android.app.SearchManager
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.speech.RecognizerResultsIntent
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugins.GeneratedPluginRegistrant


class MainActivity: FlutterActivity() {

    private var url: String? = null;
    //private var headers: Map<String, String>? = null;
    private val CHANNEL = "com.comet_ai_com.comet_ai.intent_data"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        var url: String? = null
        val action = intent.action
        
        if (RecognizerResultsIntent.ACTION_VOICE_SEARCH_RESULTS == action) {
            return
        }
        
        if (Intent.ACTION_VIEW == action) {
            val data: Uri? = intent.data
            if (data != null) url = data.toString()
        } else if (Intent.ACTION_SEARCH == action || MediaStore.INTENT_ACTION_MEDIA_SEARCH == action
                || Intent.ACTION_WEB_SEARCH == action) {
            url = intent.getStringExtra(SearchManager.QUERY)
        } else if (Intent.ACTION_SEND == action && "text/plain" == intent.type) {
            url = intent.getStringExtra(Intent.EXTRA_TEXT)
        } else if (Intent.ACTION_PROCESS_TEXT == action && "text/plain" == intent.type) {
            url = intent.getStringExtra(Intent.EXTRA_PROCESS_TEXT) 
                ?: intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString()
        } else if ("com.comet_ai.ACTION_SEARCH" == action) {
            url = "comet-ai://search"
        } else if ("com.comet_ai.ACTION_AI" == action) {
            url = "comet-ai://ai"
        } else if ("com.comet_ai.ACTION_VOICE" == action) {
            url = "comet-ai://voice"
        }

        this.url = url
        
        // Notify Flutter immediately if engine is running
        url?.let {
            flutterEngine?.let { engine ->
                MethodChannel(engine.dartExecutor.binaryMessenger, CHANNEL).invokeMethod("onIntentReceived", it)
            }
        }
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        GeneratedPluginRegistrant.registerWith(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
                .setMethodCallHandler { call: MethodCall, result: MethodChannel.Result ->
                    val methodName = call.method
                    if (methodName == "getIntentData") {
//                        val data = ArrayList<Any?>();
//                        data.add(url)
//                        data.add(headers)
                        result.success(url)
                        this.url = null;
                        //this.headers = null;
                    }
                }
    }
}
