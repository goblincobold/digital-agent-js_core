import {Object3D, AudioListener, Audio, PositionalAudio} from 'three';
import {HostObject} from '../../core/HostObject';
import {TextToSpeechFeature as CoreTextToSpeechFeature} from '../../core/awspack/TextToSpeechFeature';
import {Deferred} from '../../core/Deferred';

/**
 * Threejs PositionalAudio object
 * @external "THREE.AudioListener"
 * @see https://threejs.org/docs/#api/en/audio/AudioListener
 */

/**
 * Threejs Audio object
 * @external "THREE.Object3D"
 * @see https://threejs.org/docs/#api/en/core/Object3D
 */

/**
 * @extends core/TextToSpeechFeature
 * @alias three.js/TextToSpeechFeature
 *
 * @property {AudioListener} _listener - Three audio listener to use with audio..
 * @property {Object3D} _attachTo - Three audio listener to use with audio.
 */
export class TextToSpeechFeature extends CoreTextToSpeechFeature {
  private _listener: AudioListener;
  private _attachTo: Object3D;

  /**
   * @constructor
   *
   * @param {HostObject} host - Host object managing the feature.
   * @param {Object=} options - Options that will be sent to Polly for each speech.
   * @param {AudioListener} options.listener - Three audio listener to use with audio.
   * @param {Object3D=} options.attachTo - Optional object to attach the speech audio to.
   */
  constructor(host: any, {voice, engine, language, audioFormat = 'mp3', sampleRate, listener, attachTo}: any) {
    const options = {voice, engine, language, audioFormat, sampleRate, listener, attachTo};

    super(host, options);
    this._listener = options.listener;
    this._attachTo = options.attachTo || host.owner;
    this._setAudioContext();
    this._observeAudioContext();
  }

  /**
   * Set Audio Context.
   *
   * @private
   */
  _setAudioContext() {
    if (this._listener) {
      this.audioContext = this._listener.context;
    }
  }

  /**
   * Create an Audio object and Three.js audio object of speech audio for the given speech text.
   *
   * @private
   *
   * @param {Object} params - Parameters object compatible with Polly.synthesizeSpeech.
   *
   * @returns {Promise} Resolves with an object containing the audio URL and Audio objects.
   */
  _synthesizeAudio(params: any): Deferred | Promise<never> {
    // TODO: Validate
    return super._synthesizeAudio(params).then((result: any) => {
      if (this._attachTo !== undefined && !this.isGlobal) {
        // Create positional audio if there's an attach point
        result.threeAudio = new PositionalAudio(this._listener);
        this._attachTo.add(result.threeAudio);
      } else {
        // Create non-positional audio
        result.threeAudio = new Audio(this._listener);
      }

      // Set Audio object as the source
      result.threeAudio.setMediaElementSource(result.audio);

      return result as Deferred | Promise<never>;
    });
  }
}
