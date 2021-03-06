

  Polymer({

    is: 'vaadin-upload',

    properties: {
      /**
       * Define whether the element supports dropping files on it for uploading.
       * By default it's enabled in desktop and disabled in touch devices
       * because mobile devices do not support drag events in general. Setting
       * it false means that drop is enabled even in touch-devices, and true
       * disables drop in all devices.
       *
       * @default true in touch-devices, false otherwise.
       */
      nodrop: {
        type: Boolean,
        reflectToAttribute: true,
        value: function() {
          try {
            return !!document.createEvent('TouchEvent');
          } catch (e) {
            return false;
          }
        },
      },

      /**
       * The server URL. The default value is an empty string, which means that
       * _window.location_ will be used.
       */
      target: {
        type: String,
        value: ''
      },

      /**
       * HTTP Method used to send the files. Only POST and PUT are allowed.
       */
      method: {
        type: String,
        value: 'POST'
      },

      /**
       * Key-Value map to send to the server. If you set this property as an
       * attribute, use a valid JSON string, for example:
       * ```
       * <vaadin-upload headers='{"X-Foo": "Bar"}'></vaadin-upload>
       * ```
       */
      headers: {
        type: Object,
        value: {}
      },

      /**
       * Max time in milliseconds for the entire upload process, if exceeded the
       * request will be aborted. Zero means that there is no timeout.
       *
       */
      timeout: {
        type: Number,
        value: 0
      },

      _dragover: {
        type: Boolean,
        value: false,
        observer: '_dragoverChanged'
      },

      /**
       * The array of files being processed, or already uploaded.
       *
       * Each element is a [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File)
       * object with a number of extra properties  to track the upload process:
       * - `uploadTarget`: The target URL used to upload this file.
       * - `elapsed`: Elapsed time since the upload started.
       * - `elapsedStr`: Human-readable elapsed time.
       * - `remaining`: Number of seconds remaining for the upload to finish.
       * - `remainingStr`: Human-readable remaining time for the upload to finish.
       * - `progress`: Percentage of the file already uploaded.
       * - `speed`: Upload speed in kB/s.
       * - `size`: File size in bytes.
       * - `totalStr`: Human-readable total size of the file.
       * - `loaded`: Bytes transferred so far.
       * - `loadedStr`: Human-readable uploaded size at the moment.
       * - `status`: Status of the upload process.
       * - `error`: Error message in case the upload failed.
       * - `abort`: True if the file was canceled by the user.
       * - `complete`: True when the file was transferred to the server.
       * - `uploading`: True while trasferring data to the server.
       */
      files: {
        type: Array,
        notify: true,
        value: function() {
          return [];
        }
      },

      /**
       * Limit of files to upload, by default it is unlimited. If the value is
       * set to one, native file browser will prevent selecting multiple files.
       */
      maxFiles: {
        type: Number,
        value: Infinity
      },

      /**
       * Specifies the types of files that the server accepts.
       * Syntax: a comma-separated list of MIME type patterns (wildcards are
       * allowed) or file extensions.
       * Notice that MIME types are widely supported, while file extensions
       * are only implemented in certain browsers, so avoid using it.
       * Example: accept="video/*,image/tiff" or accept=".pdf,audio/mp3"
       */
      accept: {
        type: String,
        value: ''
      },

      /**
       * Specifies the maximum file size in bytes allowed to upload.
       * Notice that it is a client-side constraint, which will be checked before
       * sending the request. Obviously you need to do the same validation in
       * the server-side and be sure that they are aligned.
       */
      maxFileSize: {
        type: Number,
        value: Infinity
      },

      /**
       * Specifies if the dragover is validated with maxFiles and
       * accept properties.
       */
      _dragoverValid: {
        type: Boolean,
        value: false,
        observer: '_dragoverValidChanged'
      },

      /**
       * Specifies the 'name' property at Content-Disposition
       */
      formDataName: {
        type: String,
        value: 'file'
      },

      /**
       * The object used to localize this component.
       * For changing the default localization, change the entire
       * _i18n_ object or just the property you want to modify.
       *
       * The object has the following JSON structure and default values:

    {
      dropFiles: {
       one: 'Drop file here...',
       many: 'Drop files here...'
      },
      addFiles: {
       one: 'Select File',
       many: 'Upload Files'
      },
      cancel: 'Cancel',
      error: {
       tooManyFiles: 'Too Many Files.',
       fileIsTooBig: 'File is Too Big.',
       incorrectFileType: 'Incorrect File Type.'
      },
      uploading: {
       status: {
         connecting: 'Connecting...',
         stalled: 'Stalled.',
         processing: 'Processing File...'
       },
       remainingTime: {
         prefix: 'remaining time: ',
         unknown: 'unknown remaining time'
       },
       error: {
         serverUnavailable: 'Server Unavailable',
         unexpectedServerError: 'Unexpected Server Error',
         forbidden: 'Forbidden'
       }
      },
      units: {
       size: ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      },
      formatSize: function(bytes) {
       // returns the size followed by the best suitable unit
      },
      formatTime: function(seconds, [secs, mins, hours]) {
       // returns a 'HH:MM:SS' string
      }
    }

       *
       * @default {English}
       */
      i18n: {
        type: Object,
        value: function() {
          return {
            dropFiles: {
              one: 'Drop file here...',
              many: 'Drop files here...'
            },
            addFiles: {
              one: 'Select File',
              many: 'Upload Files'
            },
            cancel: 'Cancel',
            error: {
              tooManyFiles: 'Too Many Files.',
              fileIsTooBig: 'File is Too Big.',
              incorrectFileType: 'Incorrect File Type.'
            },
            uploading: {
              status: {
                connecting: 'Connecting...',
                stalled: 'Stalled.',
                processing: 'Processing File...'
              },
              remainingTime: {
                prefix: 'remaining time: ',
                unknown: 'unknown remaining time'
              },
              error: {
                serverUnavailable: 'Server Unavailable',
                unexpectedServerError: 'Unexpected Server Error',
                forbidden: 'Forbidden'
              }
            },
            units: {
              size: ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            }
          };
        }
      }
    },

    listeners: {
      'dragover': '_onDragover',
      'dragleave': '_onDragleave',
      'drop': '_onDrop',
      'file-retry': '_onFileRetry',
      'file-abort': '_onFileAbort',
      'file-remove': '_onFileRemove',
    },

    _formatSize: function(bytes) {
      if (typeof this.i18n.formatSize === 'function') {
        return this.i18n.formatSize(bytes);
      }

      // https://wiki.ubuntu.com/UnitsPolicy
      var base = this.i18n.units.sizeBase || 1000;
      var unit = ~~(Math.log(bytes) / Math.log(base));
      var dec = Math.max(0, Math.min(3, unit - 1));
      var size = parseFloat((bytes / Math.pow(base, unit)).toFixed(dec));
      return size + ' ' + this.i18n.units.size[unit];
    },

    _splitTimeByUnits: function(time) {
      var unitSizes = [60, 60, 24, Infinity];
      var timeValues = [0];

      for (var i = 0; i < unitSizes.length && time > 0; i++) {
        timeValues[i] = time % unitSizes[i];
        time = Math.floor(time / unitSizes[i]);
      }

      return timeValues;
    },

    _formatTime: function(seconds, split) {
      if (typeof this.i18n.formatTime === 'function') {
        return this.i18n.formatTime(seconds, split);
      }

      // Fill HH:MM:SS with leading zeros
      while (split.length < 3) {
        split.push(0);
      }

      return split
          .reverse()
          .map(function(number) {
            return (number < 10 ? '0' : '') + number;
          })
          .join(':');
    },

    _formatFileProgress: function(file) {
      return file.totalStr + ': ' +
          file.progress + '% (' +
          (file.loaded > 0 ?
              this.i18n.uploading.remainingTime.prefix + file.remainingStr :
              this.i18n.uploading.remainingTime.unknown) +
          ')';
    },

    _maxFilesAdded: function() {
      return this.maxFiles >= 0 && this.files.length >= this.maxFiles;
    },

    _dragRippleAction: function(action, event) {
      var rippleActionEvent = {
        detail: {
          x: event.clientX,
          y: event.clientY
        }
      };

      if (action == 'down') {
        this.$.dragRipple.downAction(rippleActionEvent);

        // paper-ripple currently has hard Ripple.MAX_RADIUS limit of 300, and
        // doesn???t expose Ripple constructor or any other means to modify the
        // limit. Monkey-patching the radius calculation of just added Ripple
        // instance to disable the radius limit.
        //
        // Also fixes the default radius animation formula, which otherwise
        // tends to make the duration too small for large ripples that we have.
        //
        // FIXME: Remove this when the paper-ripple rewrite would be merged.
        // Issue: https://github.com/vaadin/vaadin-upload/issues/24
        //
        // See:
        // - https://github.com/PolymerElements/paper-ripple/issues/27
        // - https://github.com/PolymerElements/paper-ripple/pull/63
        //
        var lastRipple = this.$.dragRipple.ripples[this.$.dragRipple.ripples.length - 1];
        if (!lastRipple.hasOwnProperty('radius')) {
          Object.defineProperty(lastRipple, 'radius', {
            get: function() {
              var width2 = this.containerMetrics.width * this.containerMetrics.width;
              var height2 = this.containerMetrics.height * this.containerMetrics.height;
              var waveRadius = Math.sqrt(width2 + height2) * 1.1 + 5;

              var duration = 0.9 + 0.2 * (waveRadius / 300);
              var timeNow = this.mouseInteractionSeconds / duration;
              var size = waveRadius * (1 - Math.pow(80, -timeNow));
              return Math.abs(size);
            }
          });
        }
      } else {
        this.$.dragRipple.upAction(rippleActionEvent);
      }
    },

    _onDragover: function(event) {
      event.preventDefault();
      if (!this.nodrop && !this._dragover) {
        this._dragoverValid = !this._maxFilesAdded();
        if (this._dragoverValid) {
          this._dragRippleAction('down', event);
        }
        this._dragover = true;
      }
      event.dataTransfer.dropEffect = !this._dragoverValid || this.nodrop ? 'none' : 'copy';
    },

    _onDragleave: function(event) {
      // Dragleave sometimes fired on children, skipping them. Fixes flickeing
      // when quickly dragging over.
      if (Polymer.dom(event).rootTarget === this) {
        event.preventDefault();
        if (this._dragover && !this.nodrop) {
          this._dragRippleAction('up', event);
          this._dragover = this._dragoverValid = false;
        }
      }
    },

    _onDrop: function(event) {
      if (!this.nodrop) {
        event.preventDefault();
        this._dragRippleAction('up', event);
        this._dragover = this._dragoverValid = false;
        this._dragRippleAction('upAction', event);
        this._addFiles(event.dataTransfer.files);
      }
    },

    // Override for tests
    _createXhr: function() {
      return new XMLHttpRequest();
    },

    _configureXhr: function(xhr) {
      if (typeof this.headers == 'string') {
        try {
          this.headers = JSON.parse(this.headers);
        } catch (e) {
          this.headers = undefined;
        }
      }
      for (var key in this.headers) {
        xhr.setRequestHeader(key, this.headers[key]);
      }
      if (this.timeout) {
        xhr.timeout = this.timeout;
      }
    },

    _setStatus: function(file, total, loaded, elapsed) {
      file.elapsed = elapsed;
      file.elapsedStr = this._formatTime(file.elapsed, this._splitTimeByUnits(file.elapsed));
      file.remaining = Math.ceil(elapsed * (total / loaded - 1));
      file.remainingStr = this._formatTime(file.remaining, this._splitTimeByUnits(file.remaining));
      file.speed = ~~(total / elapsed / 1024);
      file.totalStr = this._formatSize(total);
      file.loadedStr = this._formatSize(loaded);
      file.status = this._formatFileProgress(file);
    },

    _uploadFile: function(file) {
      if (file.uploading) {
        return;
      }

      var ini = Date.now();
      var xhr = file.xhr = this._createXhr(file);

      var stalledId, last;
      // onprogress is called always after onreadystatechange
      xhr.upload.onprogress = function(e) {
        clearTimeout(stalledId);

        last = Date.now();
        var elapsed = (last - ini) / 1000;
        var loaded = e.loaded, total = e.total, progress = ~~(loaded / total * 100);

        file.loaded = loaded;
        file.progress = progress;
        file.indeterminate = loaded <= 0 || loaded >= total, true;
        if (file.error) {
          file.indeterminate = file.status = undefined;
        } else if (!file.abort) {
          if (progress < 100) {
            this._setStatus(file, total, loaded, elapsed, progress);
            stalledId = setTimeout(function() {
              file.status = this.i18n.uploading.status.stalled;
              this._notifyFileChanges(file);
            }.bind(this), 2000);
          } else {
            file.loadedStr = file.totalStr;
            file.status = this.i18n.uploading.status.processing;
            file.uploading = false;
          }
        }

        this._notifyFileChanges(file);
        this.fire('upload-progress', {file: file, xhr: xhr});
      }.bind(this);

      // More reliable than xhr.onload
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          clearTimeout(stalledId);
          file.indeterminate = file.uploading = false;
          if (file.abort) {
            this._notifyFileChanges(file);
            return;
          }
          file.status = '';
          // Custom listener can modify the default behavior either
          // preventing default, changing the xhr, or setting the file error
          var evt = this.fire('upload-response', {file: file, xhr: xhr}, {cancelable: true});
          if (evt.defaultPrevented) {
            return;
          }
          if (xhr.status === 0) {
            file.error = this.i18n.uploading.error.serverUnavailable;
          } else if (xhr.status >= 500) {
            file.error = this.i18n.uploading.error.unexpectedServerError;
          } else if (xhr.status >= 400) {
            file.error = this.i18n.uploading.error.forbidden;
          }

          file.complete = !file.error;
          this.fire('upload-' + (file.error ? 'error' : 'success'), {file: file, xhr: xhr});
          this._notifyFileChanges(file);
        }
      }.bind(this);

      var formData = new FormData();

      file.uploadTarget = this.target || '';
      file.formDataName = this.formDataName;
      var evt = this.fire('upload-before', {file: file, xhr: xhr}, {cancelable: true});
      if (evt.defaultPrevented) {
        return;
      }

      formData.append(file.formDataName, file, file.name);

      xhr.open(this.method, file.uploadTarget, true);
      this._configureXhr(xhr);

      file.status = this.i18n.uploading.status.connecting;
      file.uploading = file.indeterminate = true;
      file.complete = file.abort = file.error = false;

      xhr.upload.onloadstart = function() {
        this.fire('upload-start', {file: file, xhr: xhr});
        this._notifyFileChanges(file);
      }.bind(this);

      // Custom listener could modify the xhr just before sending it
      // preventing default
      evt = this.fire('upload-request', {file: file, xhr: xhr, formData: formData}, {cancelable: true});
      if (!evt.defaultPrevented) {
        xhr.send(formData);
      }
    },

    _retryFileUpload: function(file) {
      var evt = this.fire('upload-retry', {file: file, xhr: file.xhr}, {cancelable: true});
      if (!evt.defaultPrevented) {
        this.async(this._uploadFile.bind(this, file));
      }
    },

    _abortFileUpload: function(file) {
      var evt = this.fire('upload-abort', {file: file, xhr: file.xhr}, {cancelable: true});
      if (!evt.defaultPrevented) {
        file.abort = true;
        if (file.xhr) {
          file.xhr.abort();
        }
        this._notifyFileChanges(file);
      }
    },

    _notifyFileChanges: function(file) {
      var p = 'files.' + this.files.indexOf(file) + '.';
      for (var i in file) {
        if (file.hasOwnProperty(i)) {
          this.notifyPath(p + i, file[i]);
        }
      }
    },

    _addFiles: function(files) {
      Array.prototype.forEach.call(files, this._addFile.bind(this));
    },

    /**
     * Add the file for uploading. Called internally for each file after picking files from dialog or dropping files.
     *
     * @param {File} file File being added
     */
    _addFile: function(file) {
      if (this._maxFilesAdded()) {
        this.fire('file-reject', {file: file, error: this.i18n.error.tooManyFiles});
        return;
      }
      if (this.maxFileSize >= 0 && file.size > this.maxFileSize) {
        this.fire('file-reject', {file: file, error: this.i18n.error.fileIsTooBig});
        return;
      }
      var fileExt = file.name.match(/\.[^\.]*$|$/)[0];
      var re = new RegExp('^(' + this.accept.replace(/[, ]+/g, '|').replace(/\/\*/g, '/.*') + ')$', 'i');
      if (this.accept && !(re.test(file.type) || re.test(fileExt))) {
        this.fire('file-reject', {file: file, error: this.i18n.error.incorrectFileType});
        return;
      }
      file.loaded = 0;
      this.unshift('files', file);
      this._uploadFile(file);
    },

    /**
     * Remove file from upload list. Called internally if file upload was canceled.
     * @param {File} file File to remove
     */
    _removeFile: function(file) {
      this.splice('files', this.files.indexOf(file), 1);
    },

    _onAddFilesClick: function() {
      if (Polymer.Gestures.resetMouseCanceller) {
        /*
          With Polymer v1.7.1, the ghost-click prevention cancels the synthetic
          file input click in iOS Safari. This prevents the cancelling.

          See also: https://github.com/Polymer/polymer/issues/4242
        */
        Polymer.Gestures.resetMouseCanceller();
      }

      this.$.fileInput.value = '';
      this.$.fileInput.click();
    },

    _onFileInputChange: function(event) {
      this._addFiles(event.target.files);
    },

    _onFileRetry: function(event) {
      this._retryFileUpload(event.detail.file);
    },

    _onFileAbort: function(event) {
      this._abortFileUpload(event.detail.file);
    },

    _onFileRemove: function(event) {
      event.stopPropagation();
      this._removeFile(event.detail.file);
    },

    _dragoverChanged: function(dragover) {
      this.toggleAttribute('dragover', dragover);
    },

    _dragoverValidChanged: function(dragoverValid) {
      this.toggleAttribute('dragover-valid', dragoverValid);
    },

    _i18nPlural: function(value, plural) {
      return value == 1 ? plural.one : plural.many;
    },

    _isMultiple: function() {
      return this.maxFiles != 1;
    }
  });

  /**
   * Fired when a file cannot be added to the queue due to a constrain:
   *  file-size, file-type or maxFiles
   *
   * @event file-reject
   * @param {Object} detail
   *  @param {Object} detail.file the file added
   *  @param {Object} detail.error the cause
   */

  /**
   * Fired before the XHR is opened. Could be used for changing the request
   * URL. If the default is prevented, then XHR would not be opened.
   *
   * @event upload-before
   * @param {Object} detail
   *  @param {Object} detail.xhr the xhr
   *  @param {Object} detail.file the file being uploaded
   *   @param {Object} detail.file.uploadTarget the upload request URL, initialized with the value of vaadin-upload `target` property
   */

  /**
   * Fired when the XHR has been opened but not sent yet. Useful for appending
   * data keys to the FormData object, for changing some parameters like
   * headers, etc. If the event is preventDefault, `vaadin-upload` will not
   * send the request allowing the user to do something on his own.
   *
   * @event upload-request
   * @param {Object} detail
   *  @param {Object} detail.xhr the xhr
   *  @param {Object} detail.file the file being uploaded
   *  @param {Object} detail.formData the FormData object
   */

  /**
   * Fired when the XHR is sent.
   *
   * @event upload-start
   * @param {Object} detail
   *  @param {Object} detail.xhr the xhr
   *  @param {Object} detail.file the file being uploaded
   */

  /**
   * Fired as many times as the progress is updated.
   *
   * @event upload-progress
   * @param {Object} detail
   *  @param {Object} detail.xhr the xhr
   *  @param {Object} detail.file the file being uploaded with loaded info
   */

  /**
   * Fired when we have the actual server response, and before the component
   * analises it. It's useful for developers to make the upload fail depending
   * on the server response. If the event is preventDefault the vaadin-upload
   * will return allowing the user to do something on his own like retry the
   * upload, etc. since he has full access to the `xhr` and `file` objects.
   * Otherwise, if the event is not prevented default `vaadin-upload` continues
   * with the normal workflow checking the `xhr.status` and `file.error`
   * which also might be modified by the user to force a customised response.
   *
   * @event upload-response
   * @param {Object} detail
   *  @param {Object} detail.xhr the xhr
   *  @param {Object} detail.file the file being uploaded
   */

  /**
   * Fired in case the upload process succeed.
   *
   * @event upload-success
   * @param {Object} detail
   *  @param {Object} detail.xhr the xhr
   *  @param {Object} detail.file the file being uploaded with loaded info
   */

  /**
   * Fired in case the upload process failed.
   *
   * @event upload-error
   * @param {Object} detail
   *  @param {Object} detail.xhr the xhr
   *  @param {Object} detail.file the file being uploaded
   */

  /**
   * Fired when retry upload is requested. If the default is prevented, then
   * retry would not be performed.
   *
   * @event upload-retry
   * @param {Object} detail
   *  @param {Object} detail.xhr the previous upload xhr
   *  @param {Object} detail.file the file being uploaded
   */

  /**
   * Fired when retry abort is requested. If the default is prevented, then the
   * file upload would not be aborted.
   *
   * @event upload-abort
   * @param {Object} detail
   *  @param {Object} detail.xhr the xhr
   *  @param {Object} detail.file the file being uploaded
   */

