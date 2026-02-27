import { Audio } from "expo-av";

class SoundService {
  private static enabled = true;
  private static initialized = false; // 🔥 Prevent double init
  private static backgroundStarted = false; // 🔥 Prevent duplicate play

  private static clickSound: Audio.Sound | null = null;
  private static dropSound: Audio.Sound | null = null;
  private static winSound: Audio.Sound | null = null;
  private static loseSound: Audio.Sound | null = null;
  private static drawSound: Audio.Sound | null = null;

  private static backgroundMusic: Audio.Sound | null = null;

  // ✅ Initialize everything safely (only once)
  static async initialize() {
    if (this.initialized) {
      console.log("🔁 SoundService already initialized — skipping.");
      return;
    }

    try {
      console.log("🔊 Loading sounds...");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      // Load sound effects
      this.clickSound = (await Audio.Sound.createAsync(
        require("../../assets/sounds/click.mp3")
      )).sound;

      this.dropSound = (await Audio.Sound.createAsync(
        require("../../assets/sounds/drop.mp3")
      )).sound;

      this.winSound = (await Audio.Sound.createAsync(
        require("../../assets/sounds/win.mp3")
      )).sound;

      this.loseSound = (await Audio.Sound.createAsync(
        require("../../assets/sounds/lose.mp3")
      )).sound;

      this.drawSound = (await Audio.Sound.createAsync(
        require("../../assets/sounds/draw.mp3")
      )).sound;

      // Load Background Music (only once)
      this.backgroundMusic = (await Audio.Sound.createAsync(
        require("../../assets/sounds/background.mp3"),
        {
          isLooping: true,
          volume: 0.4,
        }
      )).sound;

      this.initialized = true;

      console.log("✅ Sounds loaded successfully");
    } catch (error) {
      console.log("❌ Sound load error:", error);
    }
  }

  // Enable/Disable sound
  static setEnabled(value: boolean) {
    this.enabled = value;

    if (!value) {
      this.stopBackground();
    }
  }

  // ✅ Safe Background Start
  static async startBackground() {
    if (!this.enabled) return;
    if (!this.backgroundMusic) return;
    if (this.backgroundStarted) {
      console.log("🎵 Background already playing — skipping.");
      return;
    }

    try {
      const status = await this.backgroundMusic.getStatusAsync();

      if (status.isLoaded && !status.isPlaying) {
        await this.backgroundMusic.playAsync();
        this.backgroundStarted = true;
        console.log("🎵 Background music started");
      }
    } catch (error) {
      console.log("❌ Background play error:", error);
    }
  }

  // ✅ Stop Background Music
  static async stopBackground() {
    if (!this.backgroundMusic) return;

    try {
      const status = await this.backgroundMusic.getStatusAsync();

      if (status.isLoaded && status.isPlaying) {
        await this.backgroundMusic.stopAsync();
        this.backgroundStarted = false;
        console.log("⏹ Background music stopped");
      }
    } catch (error) {
      console.log("❌ Background stop error:", error);
    }
  }

  // Optional: unload if needed
  static async unloadAll() {
    try {
      await this.clickSound?.unloadAsync();
      await this.dropSound?.unloadAsync();
      await this.winSound?.unloadAsync();
      await this.loseSound?.unloadAsync();
      await this.drawSound?.unloadAsync();
      await this.backgroundMusic?.unloadAsync();

      this.initialized = false;
      this.backgroundStarted = false;
    } catch (error) {
      console.log("❌ Unload error:", error);
    }
  }

  // --- Sound Effects ---
  static async playClick() {
    if (!this.enabled || !this.clickSound) return;
    await this.clickSound.replayAsync();
  }

  static async playDrop() {
    if (!this.enabled || !this.dropSound) return;
    await this.dropSound.replayAsync();
  }

  static async playWin() {
    if (!this.enabled || !this.winSound) return;
    await this.winSound.replayAsync();
  }

  static async playLose() {
    if (!this.enabled || !this.loseSound) return;
    await this.loseSound.replayAsync();
  }

  static async playDraw() {
    if (!this.enabled || !this.drawSound) return;
    await this.drawSound.replayAsync();
  }
}

export default SoundService;