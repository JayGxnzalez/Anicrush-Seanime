const fs = require('fs');

// Read the TypeScript provider
const tsCode = fs.readFileSync('provider.ts', 'utf8');

// More precise conversion that preserves the structure
let jsCode = tsCode;

// Remove the reference directive
jsCode = jsCode.replace(/\/\/\/ <reference path=".*?" \/>\s*\n/, '');

// Remove complex type annotations with union types
jsCode = jsCode.replace(/:\s*"[^"]+"\s*\|\s*"[^"]+"/g, '');
jsCode = jsCode.replace(/:\s*\([^)]+\)/g, '');

// Remove type annotations from function parameters (more comprehensive)
jsCode = jsCode.replace(/(\w+)\s*:\s*string/g, '$1');
jsCode = jsCode.replace(/(\w+)\s*:\s*number/g, '$1');
jsCode = jsCode.replace(/(\w+)\s*:\s*boolean/g, '$1');
jsCode = jsCode.replace(/(\w+)\s*:\s*any/g, '$1');
jsCode = jsCode.replace(/(\w+)\s*:\s*EpisodeDetails/g, '$1');
jsCode = jsCode.replace(/(\w+)\s*:\s*SearchOptions/g, '$1');
jsCode = jsCode.replace(/(\w+)\s*:\s*VideoSource/g, '$1');

// Remove type annotations from arrow function parameters
jsCode = jsCode.replace(/\((\w+):\s*any\)/g, '($1)');
jsCode = jsCode.replace(/\((\w+):\s*\w+\)/g, '($1)');

// Remove return type annotations
jsCode = jsCode.replace(/:\s*Promise<[^>]+>/g, '');
jsCode = jsCode.replace(/:\s*VideoSource\[\]/g, '');
jsCode = jsCode.replace(/:\s*EpisodeDetails\[\]/g, '');
jsCode = jsCode.replace(/:\s*SearchResult\[\]/g, '');
jsCode = jsCode.replace(/:\s*EpisodeServer/g, '');
jsCode = jsCode.replace(/:\s*Settings/g, '');

// Remove variable type annotations
jsCode = jsCode.replace(/:\s*SubOrDub/g, '');
jsCode = jsCode.replace(/:\s*SearchOptions/g, '');

// Remove access modifiers
jsCode = jsCode.replace(/\bprivate\s+/g, '');
jsCode = jsCode.replace(/\bpublic\s+/g, '');
jsCode = jsCode.replace(/\bprotected\s+/g, '');

// Remove type assertions (as keyword)
jsCode = jsCode.replace(/\s+as\s+any/g, '');
jsCode = jsCode.replace(/\s+as\s+\w+/g, '');

// Remove interface/type definitions - but be more careful
jsCode = jsCode.replace(/interface\s+\w+\s*\{[^}]*\}/gs, '');
jsCode = jsCode.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');

// Clean up extra whitespace
jsCode = jsCode.replace(/\n\s*\n\s*\n/g, '\n\n');

// Manually fix any remaining issues
jsCode = jsCode.replace(/const lang:\s*=/, 'const lang =');
jsCode = jsCode.replace(/let episodesArr:\s*=/, 'let episodesArr =');
jsCode = jsCode.replace(/const videoSources:\s*=/, 'const videoSources =');

// Fix array type annotations that leave brackets
jsCode = jsCode.replace(/let episodesArr\[\]\s*=/, 'let episodesArr =');
jsCode = jsCode.replace(/const videoSources\[\]\s*=/, 'const videoSources =');

// Fix more complex array syntax issues
jsCode = jsCode.replace(/const\s+(\w+)\[\]\s*=/, 'const $1 =');
jsCode = jsCode.replace(/let\s+(\w+)\[\]\s*=/, 'let $1 =');

// Fix remaining type annotations in variable declarations
jsCode = jsCode.replace(/:\s*VideoSource\[\]/g, '');
jsCode = jsCode.replace(/:\s*EpisodeDetails\[\]/g, '');
jsCode = jsCode.replace(/:\s*SearchResult\[\]/g, '');

console.log('TypeScript to JavaScript conversion completed!');
console.log('JavaScript code length:', jsCode.length);

// Update the inline manifest
const manifest = JSON.parse(fs.readFileSync('manifest-inline.json', 'utf8'));
manifest.payload = jsCode;

fs.writeFileSync('manifest-inline.json', JSON.stringify(manifest, null, 2));
console.log('Updated manifest-inline.json');