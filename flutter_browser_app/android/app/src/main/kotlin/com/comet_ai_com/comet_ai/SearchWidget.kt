package com.comet_ai_com.comet_ai

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetProvider

class SearchWidget : HomeWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray, widgetData: android.content.SharedPreferences) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.search_widget).apply {
                // Open App on Click
                val intent = Intent(context, MainActivity::class.java).apply {
                    action = "com.comet_ai.ACTION_SEARCH"
                    data = Uri.parse("comet-ai://search")
                }
                val pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                setOnClickPendingIntent(R.id.widget_container, pendingIntent)
                
                // Mic Click
                val micIntent = Intent(context, MainActivity::class.java).apply {
                    action = "com.comet_ai.ACTION_VOICE"
                    data = Uri.parse("comet-ai://voice")
                }
                val micPendingIntent = PendingIntent.getActivity(context, 1, micIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                setOnClickPendingIntent(R.id.widget_mic_icon, micPendingIntent)

                // AI Click
                val aiIntent = Intent(context, MainActivity::class.java).apply {
                    action = "com.comet_ai.ACTION_AI"
                    data = Uri.parse("comet-ai://ai")
                }
                val aiPendingIntent = PendingIntent.getActivity(context, 2, aiIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                setOnClickPendingIntent(R.id.widget_ai_icon, aiPendingIntent)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
