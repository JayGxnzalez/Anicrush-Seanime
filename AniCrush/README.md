# AniCrush Seanime Extension

A streaming provider extension for [Seanime](https://github.com/5rahim/seanime) that enables streaming from AniCrush.

## Status: ✅ WORKING (v1.3.0)

### Latest Updates (v1.3.0)
- **🔧 Enhanced MegaCloud Stream Extraction**: Completely redesigned MegaCloud extraction with multiple fallback patterns
- **🎯 Multiple API Pattern Detection**: Uses 5+ different regex patterns to find MegaCloud API endpoints
- **🔄 Robust Fallback System**: HTML parsing fallbacks + generic URL detection for maximum compatibility
- **📊 Comprehensive Logging**: Detailed debug logs to help troubleshoot extraction issues
- **🎬 Multiple Video Qualities**: Supports 1080p, 720p, 480p with both M3U8 and MP4 formats
- **📝 Enhanced Subtitle Support**: Better English subtitle detection and attachment

### Features
- ✅ **Search Functionality**: Find anime by title
- ✅ **Episode Lists**: Fetch available episodes for series
- ✅ **Multi-Server Support**: Tries servers 4, 1, 3, 5, 6 in order of preference
- ✅ **Sub & Dub Support**: Both subtitle and dubbed content
- ✅ **MegaCloud Stream Extraction**: Extracts direct M3U8/MP4 URLs from MegaCloud iframes
- ✅ **Multiple Video Qualities**: 1080p, 720p, 480p options when available
- ✅ **Subtitle Support**: English subtitles included when available
- ✅ **Robust Fallback**: Multiple extraction methods for maximum compatibility
- ✅ **Enhanced Logging**: Comprehensive debug information for troubleshooting

### Recent Fixes Applied
1. **Multi-Server Fallback System** (v1.0.9)
   - Tries multiple AniCrush servers if primary fails
   - Skips servers returning error responses
   - Improved server selection logic

2. **Enhanced MegaCloud Extraction** (v1.2.0 → v1.3.0)
   - Multiple regex patterns for API detection
   - HTML parsing fallbacks for direct video URLs
   - Generic URL pattern matching as last resort
   - Comprehensive error handling and logging

3. **Stream Compatibility** (v1.1.0+)
   - Direct M3U8/MP4 URL extraction instead of iframe embedding
   - Better compatibility with Seanime's video player
   - Multiple quality options with proper type detection

### Installation

#### Method 1: Direct URL (Recommended)
Add this URL in Seanime's extension settings:
```
https://raw.githubusercontent.com/JayGxnzalez/Anicrush-Seanime/main/AniCrush/manifest.json
```

#### Method 2: Manual Installation
1. Download `manifest-inline.json` from this repository
2. In Seanime, go to Settings → Extensions → Online Stream Providers
3. Click "Add Extension" → "Upload file"
4. Select the downloaded `manifest-inline.json` file

### Troubleshooting

#### If streams are not playing:
1. **Check the logs** in Seanime for `[_extractMegaCloudSources]` messages
2. **Clear Seanime's cache** (Settings → Clear cache)
3. **Try different episodes** - some may be on different servers
4. **Check server status** - the logs will show which servers are being tried

#### Common Issues:
- **"Movie not found"**: Make sure you're using search results from AniCrush, not manual IDs
- **"No working servers found"**: The anime may not be available or servers may be down
- **"MegaCloud extraction failed"**: Check logs for specific error messages

### API Endpoints Used
- Search: `https://api.anicrush.to/shared/v2/movie/list`
- Episodes: `https://api.anicrush.to/shared/v2/episode/list`
- Sources: `https://api.anicrush.to/shared/v2/episode/sources`
- MegaCloud: `https://megacloud.blog/ajax/embed-4/getSources`

### Version History
- **v1.3.0**: Enhanced MegaCloud extraction with multiple fallback patterns
- **v1.2.0**: Added MegaCloud stream extraction for direct video URLs
- **v1.1.1**: Reverted iframe type for compatibility testing
- **v1.1.0**: Changed iframe sources to m3u8 type for better compatibility
- **v1.0.9**: Added multi-server fallback system
- **v1.0.8**: Improved User-Agent headers and iframe handling
- **v1.0.7**: Fixed TypeScript to JavaScript conversion issues
- **v1.0.6**: Enhanced error handling and logging
- **v1.0.5**: Added numeric ID validation and error messages
- **v1.0.4**: Fixed syntax errors in provider code
- **v1.0.3**: Updated episode list handling for new API structure
- **v1.0.2**: Improved search results formatting
- **v1.0.1**: Added episode URL structure for server fallback
- **v1.0.0**: Initial release

### Support
If you encounter issues:
1. Check Seanime's logs for detailed error messages
2. Ensure you're using the latest version (v1.3.0)
3. Try clearing Seanime's cache
4. Open an issue on GitHub with log details

---
**Note**: This extension requires an active internet connection and relies on AniCrush's API availability.
