import { Audio } from "expo-av";

class SoundService {
  private static enabled = true;

  private static clickSound: Audio.Sound | null = null;
  private static dropSound: Audio.Sound | null = null;
  private static winSound: Audio.Sound | null = null;
  private static loseSound: Audio.Sound | null = null;
  private static drawSound: Audio.Sound | null = null;

  private static backgroundMusic: Audio.Sound | null = null;

  // ✅ Initialize everything
  static async initialize() {
    try {
      console.log("🔊 Loading sounds...");

      // ✅ Required audio mode setup
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true, // ✅ MOST IMPORTANT
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

      // ✅ Load Background Music
      this.backgroundMusic = (await Audio.Sound.createAsync(
        require("../../assets/sounds/background.mp3"),
        {
          isLooping: true,
          volume: 0.4,
        }
      )).sound;

      console.log("✅ Sounds loaded successfully");
    } catch (error) {
      console.log("❌ Sound load error:", error);
    }
  }

  // Enable/Disable sound
  static setEnabled(value: boolean) {
    this.enabled = value;

    // Stop music instantly if disabled
    if (!value) {
      this.stopBackground();
    }
  }

  // ✅ Background Music Start
  static async startBackground() {
    if (!this.enabled) return;
    if (!this.backgroundMusic) return;

    try {
      const status = await this.backgroundMusic.getStatusAsync();

      if (status.isLoaded && !status.isPlaying) {
        await this.backgroundMusic.playAsync();
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
        console.log("⏹ Background music stopped");
      }
    } catch (error) {
      console.log("❌ Background stop error:", error);
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
