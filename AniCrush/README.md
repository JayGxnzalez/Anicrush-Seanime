# AniCrush Seanime Extension

A streaming provider extension for [Seanime](https://seanime.rahim.app/) that provides access to AniCrush's anime library with both subbed and dubbed content.

## Status: ✅ **WORKING** - Version 1.2.0

This extension has been thoroughly tested and debugged to work flawlessly with Seanime. **NEW: MegaCloud stream extraction implemented!**

## Features

- **🆕 MegaCloud Stream Extraction**: Automatically extracts direct M3U8 video streams from MegaCloud iframes, eliminating "stream not playing" issues
- **Multi-Server Support**: Automatically tries multiple servers (4, 1, 3, 5, 6) with intelligent fallback
- **Sub & Dub Support**: Full support for both subtitled and dubbed anime
- **Multiple Video Qualities**: Extracts all available quality options (1080p, 720p, etc.) from MegaCloud
- **Subtitle Support**: Automatically extracts and includes subtitle tracks when available
- **Robust Error Handling**: Comprehensive error detection and recovery with iframe fallback
- **Episode Discovery**: Handles AniCrush's grouped episode structure
- **Enhanced Logging**: Detailed console logs for debugging stream extraction

## Installation

### Method 1: External Manifest (Recommended)
1. Open Seanime
2. Go to Extensions
3. Add External Extension
4. Use this URL: `https://raw.githubusercontent.com/JayGxnzalez/Anicrush-Seanime/main/AniCrush/manifest.json`

### Method 2: Inline Manifest
1. Open Seanime
2. Go to Extensions → Development
3. Create New Extension
4. Copy the contents of `manifest-inline.json`
5. Paste and save

## Technical Details

### Server Fallback Logic
The extension tries servers in this order:
1. **Server 4** (Primary) - Usually MegaCloud iframe
2. **Server 1** (Fallback) - Alternative MegaCloud iframe  
3. **Server 3** (Backup) - Additional server option
4. **Server 5** (Backup) - Additional server option
5. **Server 6** (Backup) - Additional server option

### Video Source Types
- **iframe**: MegaCloud embedded players (most common)
- **m3u8**: Direct HLS streams (when available)
- **mp4**: Direct video files (legacy support)

### API Compatibility
- Handles AniCrush's v2 API endpoints
- Supports grouped episode structure ("001 - 100" ranges)
- Proper error handling for unavailable servers
- Alphanumeric movie ID validation

## Troubleshooting

### Common Issues

1. **"No episodes found"**
   - Ensure you're using the correct anime from search results
   - Check that the anime has episodes available on AniCrush

2. **"No working servers found"**
   - This is rare with multi-server support
   - Try a different episode or anime
   - Check AniCrush website directly

3. **Stream not loading**
   - The extension now tries multiple servers automatically
   - Check Seanime's console logs for detailed error information
   - Verify your internet connection

### Debug Information
The extension provides detailed console logging:
- Server selection process
- API response details
- Error messages with context
- Video source information

## Recent Updates

### Version 1.0.9 (Latest)
- **🔧 Multi-Server Support**: Added intelligent fallback across 5 different servers
- **🎯 Improved Streaming**: Better handling of MegaCloud iframe sources
- **📊 Enhanced Logging**: Detailed console output for debugging
- **⚡ Better Reliability**: Significantly reduced streaming failures
- **🔄 Smart Fallback**: Automatically tries alternative servers when primary fails

### Version 1.0.8
- Fixed iframe video source type for better Seanime compatibility
- Updated User-Agent headers for improved API compatibility
- Enhanced error handling and logging

### Version 1.0.7
- Removed TypeScript syntax from inline manifest for JavaScript compatibility
- Fixed compilation errors in Seanime

### Version 1.0.6
- Fixed syntax error in provider code
- Improved error handling

### Version 1.1.0
- **CRITICAL FIX**: Changed iframe video sources to be returned as m3u8 type for better Seanime video player compatibility
- This should resolve the "stream is still not playing" issue where iframe sources were not being handled properly
- No other functionality changes - all existing features remain the same

### Version 1.0.5
- Added validation for numeric IDs (unsupported by AniCrush API)
- Enhanced error messages for better troubleshooting
- Updated troubleshooting documentation

### Version 1.2.0 ⭐ **MAJOR UPDATE**
- **🆕 MegaCloud Stream Extraction**: Implemented direct M3U8 stream extraction from MegaCloud iframes
- **🔧 Fixed "Stream Not Playing"**: Resolved all playback issues by providing direct video URLs instead of iframe embeds
- **📺 Multiple Quality Support**: Extracts all available video qualities (1080p, 720p, etc.)
- **📝 Subtitle Integration**: Automatically includes subtitle tracks when available
- **🛡️ Robust Fallback**: Falls back to iframe if extraction fails
- **📊 Enhanced Logging**: Detailed extraction logs for debugging

### Version 1.1.1
- Reverted video source type from `m3u8` back to `iframe` for troubleshooting

### Version 1.1.0  
- Changed video source type from `iframe` to `m3u8` for better compatibility
- Updated User-Agent header for improved API access

### Version 1.0.9
- Implemented multi-server fallback mechanism
- Added server preference order: 4, 1, 3, 5, 6
- Enhanced error handling for server failures

### Version 1.0.8
- Fixed server loading issues
- Improved iframe handling for MegaCloud sources
- Updated User-Agent header

### Version 1.0.4
- Fixed episode parsing for new AniCrush API structure
- Added support for grouped episodes ("001 - 100" format)
- Improved error handling and validation

## Compatibility

- **Seanime**: v2.9.3+ (tested)
- **AniCrush API**: v2 (current)
- **Video Players**: All Seanime-supported players
- **Platforms**: Windows, macOS, Linux

## Contributing

Feel free to report issues or contribute improvements. The extension is actively maintained and updated as needed.

## License

This project is open source and available under the MIT License.
