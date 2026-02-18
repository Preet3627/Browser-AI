import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/browser_model.dart';
import '../models/favorite_model.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import '../models/window_model.dart';
import '../webview_tab.dart';
import '../models/webview_model.dart';

class BookmarksPage extends StatelessWidget {
  const BookmarksPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final browserModel = Provider.of<BrowserModel>(context);
    final favorites = browserModel.favorites;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Bookmarks',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF00E5FF)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: favorites.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.bookmark_border,
                    size: 80,
                    color: Colors.white.withOpacity(0.2),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'No bookmarks yet',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 18,
                      fontFamily: 'Inter',
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: favorites.length,
              itemBuilder: (context, index) {
                final favorite = favorites[index];
                return _buildBookmarkTile(context, favorite, browserModel);
              },
            ),
    );
  }

  Widget _buildBookmarkTile(
    BuildContext context,
    FavoriteModel favorite,
    BrowserModel browserModel,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: const Color(0xFF00E5FF).withOpacity(0.2)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
        leading: CircleAvatar(
          backgroundColor: const Color(0xFF00E5FF).withOpacity(0.1),
          child: const Icon(Icons.link, color: Color(0xFF00E5FF)),
        ),
        title: Text(
          favorite.title ?? 'No Title',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          favorite.url.toString(),
          style: TextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: 12,
            fontFamily: 'Inter',
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        onTap: () {
          final windowModel = Provider.of<WindowModel>(context, listen: false);
          windowModel.addTab(
            WebViewTab(
              key: GlobalKey(),
              webViewModel: WebViewModel(url: favorite.url),
            ),
          );
          Navigator.pushNamed(context, '/browser');
        },
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
          onPressed: () {
            browserModel.removeFavorite(favorite);
            browserModel.save();
          },
        ),
      ),
    );
  }
}
