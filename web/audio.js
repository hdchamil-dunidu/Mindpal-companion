// All sounds are original synthesized cues. No third-party music recordings.
export class SoundEngine {
 constructor(settings){this.settings=settings;this.voices=new Set();this.musicNodes=new Set();this.track=null;this.step=0;document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stopMusic();});}
 async unlock(){try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')await this.ctx.resume();}catch{/* Text/visual controls remain available without an audio device. */}}
 apply(settings){this.settings=settings;if(settings.mute||!settings.music)this.stopMusic();if(settings.mute||!settings.sfx){for(const v of this.voices)try{v.stop();}catch{}this.voices.clear();}if(this.musicGain)this.musicGain.gain.value=settings.musicVolume*0.3;if(settings.mute||!settings.voice)window.speechSynthesis?.cancel();}
 tone(freq,time,duration,volume=1,type='sine',music=false){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(volume,time+.025);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(music?this.musicGain:this.ctx.destination);const set=music?this.musicNodes:this.voices;set.add(o);o.onended=()=>{set.delete(o);o.disconnect();g.disconnect();};o.start(time);o.stop(time+duration+.03);}
 cue(name){if(!this.ctx||this.settings.mute||!this.settings.sfx)return;const now=this.ctx.currentTime;if(this.lastCue&&now-this.lastCue<.09)return;this.lastCue=now;const notes={greeting:[523,659,784],tap:[300,420],mood:[440,554],send:[620],receive:[659,880],success:[523,659,784],celebrate:[523,659,784,1047],customize:[587,784],start:[392,523],done:[523,784,1047],error:[220,185]}[name]||[520];notes.forEach((n,i)=>this.tone(n,now+i*.1,.22,this.settings.sfxVolume*.14));}
 startMusic(kind){this.stopMusic();if(!this.ctx||this.settings.mute||!this.settings.music)return;this.track=kind;this.musicGain=this.ctx.createGain();this.musicGain.gain.value=this.settings.musicVolume*.3;this.musicGain.connect(this.ctx.destination);this.step=0;
  const play=()=>{if(!this.track||document.hidden)return;const t=this.ctx.currentTime;
   if(kind==='dance'){const notes=[261.63,329.63,392,329.63,293.66,349.23,440,392];this.tone(notes[this.step%8],t,.28,.35,'triangle',true);if(this.step%2===0)this.tone(65.4,t,.17,.5,'sine',true);}
   else {const notes=[130.81,164.81,196,246.94];this.tone(notes[this.step%4],t,2.8,.19,'sine',true);this.tone(notes[this.step%4]*2,t,2.7,.07,'sine',true);}
   this.step++;};play();this.interval=setInterval(play,kind==='dance'?400:1800);
 }
 stopMusic(){clearInterval(this.interval);this.track=null;for(const v of this.musicNodes)try{v.stop();}catch{}this.musicNodes.clear();this.musicGain?.disconnect();this.musicGain=null;}
 speak(text){if(!this.settings.mute&&this.settings.voice&&'speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.95;speechSynthesis.speak(u);}}
 dispose(){this.stopMusic();this.ctx?.close();window.speechSynthesis?.cancel();}
}
