# AniCrush Seanime Extension

A streaming provider extension for [Seanime](https://seanime.rahim.app/) that provides access to AniCrush's anime catalog with both sub and dub options.

## Features

- **Multi-language Support**: Both subtitle and dubbed anime
- **Multi-server Fallback**: Automatically tries multiple AniCrush servers (4, 1, 3, 5, 6) for better reliability
- **Iframe Compatibility**: Returns iframe sources that work seamlessly with Seanime's proxy system
- **Quality Options**: Supports auto quality selection
- **Subtitle Support**: Automatic English subtitle detection when available
- **Robust Error Handling**: Comprehensive error handling and logging for debugging

## Installation

### Option 1: External Extension (Recommended)
1. In Seanime, go to **Extensions** → **Browse**
2. Add this repository URL: `https://raw.githubusercontent.com/JayGxnzalez/Anicrush-Seanime/main/AniCrush/manifest.json`
3. The extension will be loaded automatically

### Option 2: Inline Extension
1. In Seanime, go to **Extensions** → **Browse**
2. Add this repository URL: `https://raw.githubusercontent.com/JayGxnzalez/Anicrush-Seanime/main/AniCrush/manifest-inline.json`
3. This version contains the code directly in the manifest file

## Usage

1. After installation, AniCrush will appear as an available provider in Seanime
2. Select "AniCrush" as your streaming provider in the settings
3. Choose between sub or dub options when searching for anime
4. The extension will automatically handle server fallbacks if one server fails

## Troubleshooting

### Common Issues

**"Server not loading" or "Stream not playing"**
- The extension now uses a simplified approach that returns iframe URLs directly
- Seanime's proxy system handles the iframe playback automatically
- **v1.5.0+ includes anti-Cloudflare bot detection headers** to bypass security measures
- If issues persist, try switching between sub/dub options or wait a few minutes between attempts

**"No episodes found"**
- Make sure the anime title matches what's available on AniCrush
- Try searching with different title variations (English vs Romaji)

**"Extension failed to load"**
- Ensure you're using the correct manifest URL
- Check Seanime logs for specific error messages
- Try refreshing the extension or restarting Seanime

### Debug Information

The extension provides detailed logging that can be viewed in Seanime's console:
- `[search]` - Search operations and results
- `[findEpisodes]` - Episode discovery and parsing
- `[findEpisodeServer]` - Server selection and video source retrieval

## Technical Details

- **API Base**: `https://api.anicrush.to`
- **Website**: `https://anicrush.to`
- **Video Hosting**: MegaCloud (via iframe)
- **Server Priority**: 4 → 1 → 3 → 5 → 6

## Version History

- **v1.5.0** (Current): Enhanced anti-Cloudflare bot detection headers and request timing
- **v1.4.0**: Simplified iframe approach for better compatibility with Seanime proxy system
- **v1.3.0**: Full MegaCloud extraction implementation with comprehensive fallbacks
- **v1.2.0**: Enhanced MegaCloud source extraction with multiple API patterns
- **v1.1.1**: Improved multi-server fallback logic
- **v1.1.0**: Reverted to iframe type for MegaCloud compatibility
- **v1.0.9**: Added multi-server support with automatic fallback
- **v1.0.8**: Updated video type handling and User-Agent
- **v1.0.7**: Fixed TypeScript compilation issues for inline manifest

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this extension.

## License

This project is open source and available under the MIT License.
