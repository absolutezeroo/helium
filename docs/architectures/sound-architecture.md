# Sound Architecture Documentation

This document categorizes all AS3 sound files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                               |
|----------|-------|-----------------------------------------------------------|
| ENGINE   | 28    | Sound management, playback, music system, TRAX sequencing |
| VIEW     | 0     | No UI components found in sound module                    |

---

## ENGINE FILES (We Need These)

### Core Sound System

| AS3 File                            | Purpose                                                                                                                                                                     | Status |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `sound/class_2240.as`               | `IHabboSoundManager` interface - Main sound manager API with volume controls, playSound/stopSound, music controller access                                                  | TODO   |
| `sound/class_3371.as`               | `IHabboSound` interface - Sound object interface with play/stop, volume, position, length, fade in/out properties                                                           | TODO   |
| `sound/class_3410.as`               | `IHabboMusicController` interface - Music controller API for playlists, song info, song playback by priority                                                                | TODO   |
| `sound/class_3609.as`               | `IPlayListController` interface - Playlist controller with priority, length, playPosition, nowPlayingSongId                                                                 | TODO   |
| `sound/HabboSoundManagerFlash10.as` | Main sound manager implementation - manages volume levels (generic/trax/furni), loads sounds by ID, creates TRAX instances, handles server communication for sound settings | TODO   |
| `sound/HabboSoundBase.as`           | Base sound class implementing `class_3371` - wraps Flash `Sound`/`SoundChannel` for basic playback with volume control                                                      | TODO   |
| `sound/HabboSoundWithPitch.as`      | Extended sound with pitch shifting - extracts mono samples, resamples with pitch multiplier using `loadPCMFromByteArray`                                                    | TODO   |
| `sound/HabboSoundTypesEnum.as`      | Sound type constants - identifiers for call_for_help, purchase, message_sent/received, respect, snowwar sounds, etc.                                                        | TODO   |
| `sound/HabboMusicPrioritiesEnum.as` | Music priority levels - ROOM_PLAYLIST=0, USER_PLAYLIST=1, SONG_PLAY=2, PURCHASE_PREVIEW=3                                                                                   | TODO   |
| `sound/ISongInfo.as`                | Song metadata interface - id, diskId, length, name, creator, songData string, soundObject                                                                                   | TODO   |

### Event System

| AS3 File                                         | Purpose                                                                                                            | Status |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|--------|
| `sound/events/NowPlayingEvent.as`                | Event for song changes - USER_PLAY_SONG, USER_STOP_SONG, NOW_PLAYING_SONG_CHANGED with song id, position, priority | TODO   |
| `sound/events/PlayListStatusEvent.as`            | Playlist events - PLAY_LIST_UPDATED, PLAY_LIST_FULL                                                                | TODO   |
| `sound/events/SongDiskInventoryReceivedEvent.as` | Event when user's song disk inventory is received from server                                                      | TODO   |
| `sound/events/SongInfoReceivedEvent.as`          | Event when TRAX song info is received - TRAX_SONG_INFO_RECEIVED with song id                                       | TODO   |
| `sound/events/SoundCompleteEvent.as`             | Event when TRAX song playback completes - TRAX_SONG_COMPLETE with song id                                          | TODO   |
| `sound/events/TraxSongLoadEvent.as`              | TRAX loading events - TRAX_LOAD_COMPLETE, TRAX_LOAD_FAILED with song id                                            | TODO   |

### Furniture Sound Playback

| AS3 File                                    | Purpose                                                                                                                                                               | Status |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `sound/furni/FurniSamplePlaybackManager.as` | Manages furniture sound playback - listens to room object events for sample init/dispose/play/pitch change, loads samples via URL, manages per-object sound instances | TODO   |

### Music Controller System

| AS3 File                                        | Purpose                                                                                                                                              | Status |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `sound/music/HabboMusicController.as`           | Central music controller - manages song playback by priority, song info requests/caching, disk inventory, jukebox/sound machine playlist controllers | TODO   |
| `sound/music/JukeboxPlayListController.as`      | Jukebox playlist controller - handles NOW_PLAYING messages, maintains playlist from server, manages song playback state                              | TODO   |
| `sound/music/SoundMachinePlayListController.as` | Sound machine (TRAX) playlist controller - handles PLAY_LIST messages, auto-plays next song, synchronizes with room state                            | TODO   |
| `sound/music/SongDataEntry.as`                  | Song data container implementing `ISongInfo` - stores id, length, name, creator, diskId, songData string, soundObject reference                      | TODO   |
| `sound/music/SongStartRequestData.as`           | Song start request parameters - songId, startPos (with time compensation), playLength, fadeIn/fadeOut seconds                                        | TODO   |
| `sound/music/TraxSampleManager.as`              | TRAX sample loader - downloads samples via URL, converts Flash Sound to TraxSample, manages memory with purge logic (25MB limit)                     | TODO   |

### TRAX Sequencer System

| AS3 File                          | Purpose                                                                                                                                                   | Status |
|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `sound/trax/TraxChannel.as`       | Single channel in TRAX song - array of TraxChannelItems                                                                                                   | TODO   |
| `sound/trax/TraxChannelItem.as`   | Single item in TRAX channel - sample id and length in bars                                                                                                | TODO   |
| `sound/trax/TraxChannelSample.as` | Runtime sample playback state - wraps TraxSample with playback offset, provides setSample/addSample for mixing                                            | TODO   |
| `sound/trax/TraxData.as`          | TRAX song data parser - parses channel:items string format, extracts sample IDs, handles metadata (cut mode, tempo)                                       | TODO   |
| `sound/trax/TraxSample.as`        | Compressed audio sample storage - converts 44kHz stereo float to packed 16-bit/8-bit mono, provides setSample/addSample for mixing with frequency scaling | TODO   |
| `sound/trax/TraxSequencer.as`     | Real-time TRAX audio sequencer - implements `class_3371`, generates audio via `sampleData` events, mixes channels, handles fade in/out, position seeking  | TODO   |

---

## VIEW FILES (We Ignore These)

| AS3 File | Purpose                                                |
|----------|--------------------------------------------------------|
| *(none)* | No VIEW files found - sound module is pure ENGINE code |

---

## Architecture Analysis

### Component Relationships

```
HabboSoundManagerFlash10 (main manager)
    |
    +-- HabboMusicController (music subsystem)
    |       |
    |       +-- JukeboxPlayListController (room jukebox)
    |       +-- SoundMachinePlayListController (room sound machine)
    |       +-- SongDataEntry[] (song cache)
    |
    +-- TraxSampleManager (sample loader)
    |       |
    |       +-- TraxSample[] (loaded samples)
    |
    +-- FurniSamplePlaybackManager (furniture sounds)
    |       |
    |       +-- HabboSoundWithPitch[] (per-object sounds)
    |
    +-- HabboSoundBase[] (generic sounds cache)
```

### TRAX Playback Flow

1. **Song Request**: `HabboMusicController.playSong()` called with songId and priority
2. **Song Info**: If not cached, requests song info from server via `GetSongInfoMessageComposer`
3. **Sample Loading**: `TraxSampleManager` downloads required samples via HTTP
4. **Sequencer Creation**: `TraxSequencer` created with `TraxData` parsed from song string
5. **Audio Generation**: `TraxSequencer.onSampleData()` mixes channels in real-time at 44.1kHz
6. **Completion**: `SoundCompleteEvent` dispatched, next song in playlist triggered

### Key Data Formats

**TRAX Song Data String**:
```
channelId:sampleId,length;sampleId,length;...:channelId:...:meta;c,1;t,120
```
- Channels separated by `:`
- Items within channel separated by `;`
- Sample and length separated by `,`
- Optional metadata at end with `meta` marker

**Sample Compression**:
- Input: 44.1kHz stereo float (-1.0 to 1.0)
- Storage: 16-bit or 8-bit packed integers
- Frequency options: 44kHz, 22kHz, 11kHz (subsampled)
- Fadeout: Last 32 samples faded to prevent clicks

### Server Messages

**Incoming**:
- `TraxSongInfoMessageEvent` - Song metadata (id, name, creator, data string)
- `UserSongDisksInventoryMessageEvent` - User's disk inventory
- `NowPlayingMessageEvent` - Current playing song (jukebox)
- `JukeboxSongDisksMessageEvent` - Jukebox playlist
- `PlayListMessageEvent` - Sound machine playlist
- `PlayListSongAddedMessageEvent` - Song added to playlist
- `AccountPreferencesEvent` - Volume settings

**Outgoing**:
- `GetSongInfoMessageComposer` - Request song info by IDs
- `GetUserSongDisksMessageComposer` - Request user's disk inventory
- `GetNowPlayingMessageComposer` - Request current playing state
- `GetJukeboxPlayListMessageComposer` - Request jukebox playlist
- `GetSoundMachinePlayListMessageComposer` - Request sound machine playlist
- `GetSoundSettingsComposer` - Request volume settings
- `SetSoundSettingsComposer` - Save volume settings

---

## Porting Considerations

### Required Subsystems
- Audio playback API (Web Audio API or similar)
- Real-time audio synthesis for TRAX
- HTTP sample downloading
- Server message handling

### Complexity Areas
- **TraxSequencer**: Real-time PCM mixing at 44.1kHz with fade effects
- **TraxSample**: Bit-packed sample storage with frequency scaling
- **Priority System**: Multiple sound priorities with interruption logic

### Simplification Options
- Could use server-side MP3 rendering instead of client TRAX synthesis
- Volume controls could be simplified to single master volume
- Furniture sounds could be preloaded rather than streamed
